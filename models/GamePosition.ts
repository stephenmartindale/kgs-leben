namespace Models {
    const _moveNumberMask: number  = 0x0000ffff;
    const _stoneMask: number       = GameMarks.WhiteStone | GameMarks.BlackStone;
    const _marksMask: number       = 0x7fffffff & ~(_moveNumberMask | _stoneMask);

    export interface GamePositionChange {
        x: number;
        y: number;
        unset: number;
        set: number;
        move: number;
    }

    interface GamePositionChangeInternal {
        idx: number;
        old: number;
    }

    export interface GamePrisonerCounts {
        black: number;  // The number of black stones captured by the white player
        white: number;  // The number of white stones captured by the black player
    }

    export class GamePosition {
        public size: number;
        public schema: number[];
        public prisoners: GamePrisonerCounts;
        public turn: GameStone;

        constructor(size?: number);
        constructor(original: GamePosition);
        constructor(arg?: number | GamePosition) {
            if (arg == null) arg = 19;
            if (Utils.isNumber(arg)) {
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

        private getIndex(x: number, y: number): number {
            return ((x >= 0) && (y >= 0) && (x < this.size) && (y < this.size))? ((x * this.size) + y) : -1;
        }

        private static getStoneColour(bits: number) {
            return (bits === undefined)? undefined
                 : (bits == null)? null
                 : ((bits & GameMarks.WhiteStone) == GameMarks.WhiteStone)? Models.GameStone.White
                 : ((bits & GameMarks.BlackStone) == GameMarks.BlackStone)? Models.GameStone.Black
                 : null;
        }
        private setBits(idx: number, bits: number, mask: number, add?: boolean): GamePositionChangeInternal {
            let old = this.schema[idx];
            if (old == null) old = 0;

            let value = ((add)? old : (old & ~mask))
                      | ((bits != null)? (bits & mask) : 0);

            if (value == 0) {
                delete this.schema[idx];
            }
            else {
                this.schema[idx] = value;
            }

            return { idx: idx, old: old };
        }
        private revertAll(changes: GamePositionChangeInternal[]) {
            for (let j = (changes.length - 1); j >= 0; --j) {
                if (changes[j].old == 0) {
                    delete this.schema[changes[j].idx];
                }
                else {
                    this.schema[changes[j].idx] = changes[j].old;
                }
            }
        }

        public static equals(left: GamePosition, right: GamePosition): boolean {
            if (left === right) return true;
            if ((left == null) || (right == null)) return false;
            if (left.size != right.size) return false;

            let sz = left.size;
            for (let x = 0; x < sz; ++x) {
                for (let y = 0; y < sz; ++y) {
                    let idx = (x * sz) + y;
                    if (left.schema[idx] != right.schema[idx]) return false;
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
                    let oldBits = (old != null)? old.schema[i] : null;
                    if (oldBits != this.schema[i]) {
                        if (oldBits == null) oldBits = 0;
                        let newBits: number = (this.schema[i] != null)? this.schema[i] : 0;
                        changes.push({
                            x: x,
                            y: y,
                            unset: (oldBits & ~newBits),
                            set: (newBits & ~oldBits),
                            move: (newBits & _moveNumberMask)
                        });
                    }
                }
            }

            return changes;
        }

        private removeGroup(x: number, y: number, changes: GamePositionChangeInternal[], colour?: GameStone): boolean {
            let idx = this.getIndex(x, y);
            if (idx >= 0) {
                let stone = GamePosition.getStoneColour(this.schema[idx]);
                if (stone != null) {
                    if ((colour == null) || (stone === colour)) {
                        switch (stone) {
                            case GameStone.Black: this.prisoners.black += 1; break;
                            case GameStone.White: this.prisoners.white += 1; break;
                        }

                        changes.push(this.setBits(idx, 0, _stoneMask));

                        this.removeGroup(x, y - 1, changes, stone);
                        this.removeGroup(x + 1, y, changes, stone);
                        this.removeGroup(x, y + 1, changes, stone);
                        this.removeGroup(x - 1, y, changes, stone);

                        return true;
                    }
                }
            }

            return false;
        }

        private hasLiberties(x: number, y: number, colour: GameStone, tested?: { [idx: number]: boolean }): boolean {
            let idx = this.getIndex(x, y);
            if (idx < 0) return false;
            let stone = GamePosition.getStoneColour(this.schema[idx]);
            if (stone == null) return true;
            else if (stone !== colour) return false;

            if (tested == null) tested = {};
            else if (tested[idx]) return false;

            tested[idx] = true;
            return this.hasLiberties(x, y - 1, stone, tested)
                || this.hasLiberties(x + 1, y, stone, tested)
                || this.hasLiberties(x, y + 1, stone, tested)
                || this.hasLiberties(x - 1, y, stone, tested);
        }

        private tryCapture(x: number, y: number, changes: GamePositionChangeInternal[], colour?: GameStone): boolean {
            let idx = this.getIndex(x, y);
            if (idx < 0) return false;

            let stone = GamePosition.getStoneColour(this.schema[idx]);
            if (stone == null) return false;
            else if ((colour != null) && (stone !== colour)) return false;

            if (this.hasLiberties(x, y, stone)) return false;
            else {
                this.removeGroup(x, y, changes, stone);
                return true;
            }
        }

        private tryPlay(x: number, y: number, colour?: GameStone, previous?: Models.GamePosition): GameMoveError | GamePositionChangeInternal[] {
            let idx = this.getIndex(x, y);
            if (idx < 0) return GameMoveError.InvalidLocation;
            let stone = GamePosition.getStoneColour(this.schema[idx]);

            if (stone != null) return GameMoveError.StonePresent;

            if (colour == null) colour = this.turn;
            let opponent: GameStone;
            let moveChange: GamePositionChangeInternal;
            if (colour == GameStone.White) {
                opponent = GameStone.Black;
                moveChange = this.setBits(idx, GameMarks.WhiteStone, _stoneMask);
            }
            else {
                opponent = GameStone.White;
                moveChange = this.setBits(idx, GameMarks.BlackStone, _stoneMask);
            }

            let changes: GamePositionChangeInternal[] = [];
            this.tryCapture(x, y - 1, changes, opponent);
            this.tryCapture(x + 1, y, changes, opponent);
            this.tryCapture(x, y + 1, changes, opponent);
            this.tryCapture(x - 1, y, changes, opponent);

            if ((changes.length == 0) && (!this.hasLiberties(x, y, colour))) {
                this.setBits(idx, 0, _stoneMask);
                return GameMoveError.Suicide;
            }

            changes.push(moveChange);

            if ((previous != null) && (GamePosition.equals(this, previous))) {
                this.revertAll(changes);
                return GameMoveError.Ko;
            }
            else {
                this.turn = opponent;
                return changes;
            }
        }

        public play(x: number, y: number, colour?: GameStone, previous?: Models.GamePosition): GameMoveError {
            let result = this.tryPlay(x, y, colour, previous);
            if (Utils.isArray(result)) {
                return GameMoveError.Success;
            }
            else {
                return <GameMoveError>result;
            }
        }

        public pass(colour?: GameStone) {
            if (colour == null) colour = this.turn;
            this.turn = (colour == GameStone.White)? GameStone.Black : GameStone.White;
        }

        public addStone(x: number, y: number, colour: GameStone): boolean {
            let result = this.tryPlay(x, y, colour);
            if (Utils.isArray(result)) {
                if ((<GamePositionChangeInternal[]>result).length == 1) return true;
                else {
                    this.revertAll(<GamePositionChangeInternal[]>result);
                }
            }

            return false;
        }

        public addMarks(x: number, y: number, marks: GameMarks) {
            let idx = this.getIndex(x, y);
            if (idx < 0) throw "Game coordinates are not on the game board";
            this.setBits(idx, marks, _marksMask, true);
        }

        public get(x: number, y: number): number {
            let idx = this.getIndex(x, y);
            return (idx >= 0)? this.schema[idx] : undefined;
        }
        public stone(x: number, y: number): Models.GameStone {
            return GamePosition.getStoneColour(this.get(x, y));
        }
    }
}
