namespace Models {
    export interface GamePositionChange {
        x: number;
        y: number;
        remove?: GameStone;
        add?: GameStone;
    }

    export interface GamePrisonerCounts {
        black: number;  // The number of black stones captured by the white player
        white: number;  // The number of white stones captured by the black player
    }

    export class GamePosition {
        public size: number;
        public schema: GameStone[];
        public prisoners: GamePrisonerCounts;
        public turn: GameStone;

        constructor(size?: number);
        constructor(original: GamePosition);
        constructor(arg?: number | GamePosition) {
            if (arg == null) arg = 19;
            if (!Utils.isObject(arg)) {     // TODO: Use isNumber rather
                let sz: number = <number>arg;
                if (GamePosition.validateSize(sz)) {
                    this.size = sz;
                    this.schema = [];
                    this.prisoners = { black: 0, white: 0 };
                    this.turn = GameStone.Black;
                }
                else throw "Game Size out of range";
            }
            else {
                this.size = (<GamePosition>arg).size;
                this.schema = Utils.cloneArray((<GamePosition>arg).schema, true);
                this.prisoners = {
                    black: (<GamePosition>arg).prisoners.black,
                    white: (<GamePosition>arg).prisoners.white
                };
                this.turn = (<GamePosition>arg).turn;
            }
        }

        public static validateSize(size: number): boolean {
            return ((size) && (size >= 2) && (size <= 38));
        }

        public isOnBoard(x: number, y: number): boolean {
            return ((x >= 0) && (y >= 0) && (x < this.size) && (y < this.size));
        }

        public get(x: number, y: number): GameStone {
            if (!this.isOnBoard(x, y)) return undefined;
            return this.schema[x * this.size + y];
        }

        private set(x: number, y: number, stone?: GameStone) {
            let i = (x * this.size) + y;
            if (stone == null)
                delete this.schema[i];
            else
                this.schema[i] = stone;
        }

        public static equals(left: GamePosition, right: GamePosition): boolean {
            if (left === right) return true;
            if ((left == null) || (right == null)) return false;
            if (left.size != right.size) return false;

            let sz = left.size;
            for (let x = 0; x < sz; ++x) {
                for (let y = 0; y < sz; ++y) {
                    let i = (x * sz) + y;
                    if (left.schema[i] != right.schema[i]) return false;
                }
            }

            return true;
        }

        public diff(old: GamePosition): GamePositionChange[] {
            if (old === this) return [];
            if ((old != null) && (old.size != this.size)) throw 'Game Positions of different sizes cannot be compared';

            let changes: GamePositionChange[] = [];
            let sz = this.size;
            for (let x = 0; x < sz; ++x) {
                for (let y = 0; y < sz; ++y) {
                    let i = (x * sz) + y;
                    let oldStone = (old != null)? old.schema[i] : null;
                    if (oldStone != this.schema[i]) {
                        let change: GamePositionChange = { x: x, y: y };
                        if (oldStone != null) change.remove = oldStone;
                        if (this.schema[i] != null) change.add = this.schema[i];
                        changes.push(change);
                    }
                }
            }

            return changes;
        }

        private removeGroup(x: number, y: number, changes: GamePositionChange[], colour?: GameStone): boolean {
            let stone = this.get(x, y);
            if (stone != null) {
                if ((colour == null) || (stone === colour)) {
                    this.set(x, y, undefined);
                    switch (stone) {
                        case GameStone.Black: this.prisoners.black += 1; break;
                        case GameStone.White: this.prisoners.white += 1; break;
                    }

                    changes.push(<GamePositionChange>{ x: x, y: y, remove: stone });

                    this.removeGroup(x, y - 1, changes, stone);
                    this.removeGroup(x + 1, y, changes, stone);
                    this.removeGroup(x, y + 1, changes, stone);
                    this.removeGroup(x - 1, y, changes, stone);

                    return true;
                }
            }

            return false;
        }

        private hasLiberties(x: number, y: number, colour: GameStone, tested?: { [idx: number]: boolean }): boolean {
            if (!this.isOnBoard(x, y)) return false;
            let i = (x * this.size) + y;
            let stone = this.schema[i];
            if (stone == null) return true;
            else if (stone !== colour) return false;

            if (tested == null) tested = {};
            else if (tested[i]) return false;

            tested[i] = true;
            return this.hasLiberties(x, y - 1, stone, tested)
                || this.hasLiberties(x + 1, y, stone, tested)
                || this.hasLiberties(x, y + 1, stone, tested)
                || this.hasLiberties(x - 1, y, stone, tested);
        }

        private tryCapture(x: number, y: number, changes: GamePositionChange[], colour?: GameStone): boolean {
            let stone = this.get(x, y);
            if (stone == null) return false;
            else if ((colour != null) && (stone !== colour)) return false;

            if (this.hasLiberties(x, y, stone)) return false;
            else {
                this.removeGroup(x, y, changes, stone);
                return true;
            }
        }

        public undo(changes: GamePositionChange[]) {
            for (let j = (changes.length - 1); j >= 0; --j) {
                this.set(changes[j].x, changes[j].y, (changes[j].remove != null)? changes[j].remove : undefined);
            }
        }

        public play(x: number, y: number, colour?: GameStone, previous?: Models.GamePosition): GameMoveError | GamePositionChange[] {
            if (!this.isOnBoard(x, y)) return GameMoveError.InvalidLocation;
            let i = (x * this.size) + y;
            let stone = this.schema[i];

            if (stone != null) return GameMoveError.StonePresent;

            if (colour == null) colour = this.turn;
            this.set(x, y, colour);

            let opponent: GameStone = (colour == GameStone.White)? GameStone.Black : GameStone.White;
            let changes: GamePositionChange[] = [];
            this.tryCapture(x, y - 1, changes, opponent);
            this.tryCapture(x + 1, y, changes, opponent);
            this.tryCapture(x, y + 1, changes, opponent);
            this.tryCapture(x - 1, y, changes, opponent);

            if ((changes.length == 0) && (!this.hasLiberties(x, y, colour))) {
                this.set(x, y, undefined);
                return GameMoveError.Suicide;
            }

            changes.push(<GamePositionChange>{ x: x, y: y, add: colour });

            if ((previous != null) && (GamePosition.equals(this, previous))) {
                this.undo(changes);
                return GameMoveError.Ko;
            }
            else {
                this.turn = opponent;
                return changes;
            }
        }

        public pass(colour?: GameStone) {
            if (colour == null) colour = this.turn;
            this.turn = (colour == GameStone.White)? GameStone.Black : GameStone.White;
        }

        public add(x: number, y: number, colour: GameStone): boolean {
            let result = this.play(x, y, colour);
            if (Utils.isArray(result)) {
                if ((<GamePositionChange[]>result).length == 1) return true;
                else {
                    this.undo(<GamePositionChange[]>result);
                }
            }

            return false;
        }
    }
}
