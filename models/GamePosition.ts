namespace Models {
    const _moveNumberMask: number  = 0x0000ffff;
    const _stoneMask: number       = GameMarks.WhiteStone | GameMarks.BlackStone;
    const _marksMask: number       = 0x7fffffff & ~(_moveNumberMask | _stoneMask);

    const _coordinatesInvalidError: string = "Coordinates invalid or not specified";

    export interface GamePositionChange {
        x: number;
        y: number;
        unset: number;
        set: number;
        move: number;
    }

    export const enum GameMoveResult {
        Success = 0,            // The move was executed without problem
        StonePresent = 1,       // Another stone was already present at the given location
        Suicide = 2,            // The move would be suicide
        Ko = 3,                 // The move would result in a repeated position prohibited by the Ko rule
        Corrupt = 4             // The resulting position is not a valid game position
    }

    export const enum GamePositionEvent {
        Move = 1,
        Pass = 2,
        Scored = 3
    };

    export interface GamePositionScore {
        prisoners: number;      // The number of opponent's stones that the player has captured and holds prisoner
        captures: number;       // The number of dead opponent's stones that fall within the player's territory
        territory: number;      // The number of points of territory that the player has surrounded
    }

    export class GamePosition {
        public size: number;
        public schema: number[];
        public white: Models.GamePositionScore;
        public black: Models.GamePositionScore;
        public lastEvent: Models.GamePositionEvent;

        private _lastMoveIndex: number;
        private _koIndex: number;

        constructor(size?: number);
        constructor(original: GamePosition);
        constructor(arg?: number | GamePosition) {
            if (arg == null) arg = 19;
            if (Utils.isNumber(arg)) {
                let sz: number = <number>arg;
                if ((sz < 2) || (sz > 38)) throw "Game Size out of range";
                this.size = sz;
                this.schema = [];
                this.white = { prisoners: 0, captures: 0, territory: 0 };
                this.black = { prisoners: 0, captures: 0, territory: 0 };
                this.lastEvent = 0;

                this._lastMoveIndex = null;
                this._koIndex = null;
            }
            else {
                let original: GamePosition = <GamePosition>arg;
                this.size = original.size;
                this.schema = original.schema.slice();
                this.white = { prisoners: original.white.prisoners, captures: original.white.captures, territory: original.white.territory };
                this.black = { prisoners: original.black.prisoners, captures: original.black.captures, territory: original.black.territory };
                this.lastEvent = original.lastEvent;

                this._lastMoveIndex = original._lastMoveIndex;
                this._koIndex = original._koIndex;
            }
        }

        public stoneEquality(other: GamePosition): boolean {
            if (other == null) return false;
            else if (this.size != other.size) return false;

            let length = (this.size * this.size);
            for (let i = 0; i < length; ++i) {
                let a = (this.schema[i] != null)? (this.schema[i] & _stoneMask) : 0;
                let b = (other.schema[i] != null)? (other.schema[i] & _stoneMask) : 0;
                if (a != b) return false;
            }

            return true;
        }

        public diff(old: GamePosition): GamePositionChange[] {
            if (old === this) return [];
            if ((old != null) && (old.size != this.size)) throw 'Game Positions of different sizes cannot be compared';

            let length = (this.size * this.size);
            let changes: GamePositionChange[] = [];
            for (let i = 0; i < length; ++i) {
                let oldBits = (old != null)? old._get(i) : 0;
                let newBits = this._get(i);
                if (oldBits != newBits) {
                    let x = ~~(i / this.size);
                    let y = i - (x * this.size);
                    changes.push({
                        x: x,
                        y: y,
                        unset: (oldBits & ~newBits),
                        set: (newBits & ~oldBits),
                        move: (newBits & _moveNumberMask)
                    });
                }
            }

            return changes;
        }

        private index(x: number, y: number): number {
            return ((x >= 0) && (y >= 0) && (x < this.size) && (y < this.size))? ((x * this.size) + y) : -1;
        }

        public validate(x: number, y: number) {
            return (this.index(x, y) >= 0);
        }

        private _get(i: number): number {
            let bits = this.schema[i];
            return (null != bits)? bits : 0;
        }
        public get(x: number, y: number): number {
            let i = this.index(x, y);
            if (i < 0) throw _coordinatesInvalidError;
            return this._get(i);
        }

        private set(i: number, bits: number) {
            if (bits == 0) delete this.schema[i];
            else this.schema[i] = bits;
        }

        private unset(i: number, mask: number): boolean {
            let bits = this.schema[i];
            if ((null != bits) && ((bits & mask) != 0)) {
                this.set(i, bits & ~mask);
                return true;
            }
            else return false;
        }

        private coordinates(i: number): { x: number, y: number } {
            if ((null != i) && (i >= 0)) {
                return { x: ~~(i / this.size), y: (i % this.size) }
            }
            else return null;
        }

        public get lastMove(): { x: number, y: number } {
            return this.coordinates(this._lastMoveIndex);
        }
        public get ko(): { x: number, y: number } {
            return this.coordinates(this._koIndex);
        }

        private removeGroup(x: number, y: number, colourBit: GameMarks): number {
            let i = this.index(x, y);
            if (this.unset(i, colourBit)) {
                return 1 + this.removeGroup(x, y - 1, colourBit)
                         + this.removeGroup(x + 1, y, colourBit)
                         + this.removeGroup(x, y + 1, colourBit)
                         + this.removeGroup(x - 1, y, colourBit);
            }

            return 0;
        }

        private hasLiberties(x: number, y: number, colourBit: GameMarks, tested?: { [idx: number]: boolean }): boolean {
            let i = this.index(x, y);
            if (i < 0) return false;

            if (tested == null) tested = {};
            else if (tested[i]) return false;
            tested[i] = true;

            let bits = this.schema[i];
            if (bits == null) return true;

            switch (bits & _stoneMask) {
                case 0: return true;

                case colourBit: return this.hasLiberties(x, y - 1, colourBit, tested)
                                    || this.hasLiberties(x + 1, y, colourBit, tested)
                                    || this.hasLiberties(x, y + 1, colourBit, tested)
                                    || this.hasLiberties(x - 1, y, colourBit, tested);

                default: return false;
            }
        }

        private findKo(x: number, y: number, colourBit: GameMarks): number {
            let i = this.index(x, y);
            if (i < 0) return null;

            let bits = this.schema[i];
            if ((bits == null) || ((bits & _stoneMask) != colourBit)) return null;

            let neighbours: number[] = [
                this.index(x, y - 1),
                this.index(x + 1, y),
                this.index(x, y + 1),
                this.index(x - 1, y)
            ];

            let liberty: number = null;
            for (let j = 0; j < neighbours.length; ++j) {
                let b = this.schema[neighbours[j]];
                if ((b == null) || ((b & _stoneMask) == 0)) {
                    if (null == liberty) liberty = neighbours[j];
                    else return null;
                }
                else if ((b & _stoneMask) == colourBit) {
                    return null;
                }
            }

            return liberty;
        }

        private tryCapture(x: number, y: number, colourBit: GameMarks): number {
            let i = this.index(x, y);
            if (i < 0) return 0;

            let bits = this.schema[i];
            if ((bits == null) || ((bits & colourBit) != colourBit) || (this.hasLiberties(x, y, colourBit))) {
                return 0;
            }
            else {
                return this.removeGroup(x, y, colourBit);
            }
        }

        private static colourBit(colour: GameStone, opponent?: boolean): GameMarks {
            switch ((!opponent)? (colour) : (-1 * colour)) {
                case GameStone.White: return GameMarks.WhiteStone;
                case GameStone.Black: return GameMarks.BlackStone;
            }

            throw "Colour invalid or not specified"
        }

        private clearTransients() {
            if (this._koIndex != null) {
                this.unset(this._koIndex, Models.GameMarks.Ko);
                this._koIndex = null;
            }

            if (this._lastMoveIndex != null) {
                this.unset(this._lastMoveIndex, Models.GameMarks.LastMove);
                this._lastMoveIndex = null;
            }
        }

        public addStone(x: number, y: number, colour: GameStone, move?: boolean): GameMoveResult {
            let i = this.index(x, y);
            if (i < 0) throw _coordinatesInvalidError;

            let bits = this.schema[i];
            if (bits == null) bits = 0;
            else if ((bits & _stoneMask) != 0) return GameMoveResult.StonePresent;

            if ((move) && (this._koIndex == i)) return GameMoveResult.Ko;

            this.clearTransients();

            let colourBit: GameMarks = GamePosition.colourBit(colour);
            this.set(i, bits | colourBit | Models.GameMarks.LastMove);
            this._lastMoveIndex = i;

            if (move) {
                let opponentBit: GameMarks = GamePosition.colourBit(colour, true);
                let captured: number = this.tryCapture(x, y - 1, opponentBit)
                                     + this.tryCapture(x + 1, y, opponentBit)
                                     + this.tryCapture(x, y + 1, opponentBit)
                                     + this.tryCapture(x - 1, y, opponentBit);

                if (captured > 0) {
                    switch (colour) {
                        case GameStone.Black: this.black.prisoners += captured; break;
                        case GameStone.White: this.white.prisoners += captured; break;
                    }

                    if (captured == 1) {
                        this._koIndex = this.findKo(x, y, colourBit);
                        if (null != this._koIndex) {
                            this.set(this._koIndex, this._get(this._koIndex) | Models.GameMarks.Ko);
                        }
                    }
                }
                else if (!this.hasLiberties(x, y, colourBit)) {
                    return GameMoveResult.Suicide;
                }
            }
            else {
                if (!this.hasLiberties(x, y, colourBit)) {
                    return GameMoveResult.Corrupt;
                }
            }

            this.lastEvent = Models.GamePositionEvent.Move;
            return GameMoveResult.Success;
        }

        public play(x: number, y: number, colour: GameStone): GameMoveResult {
            return this.addStone(x, y, colour, true);
        }

        public pass() {
            this.clearTransients();
            this.lastEvent = Models.GamePositionEvent.Pass;
        }

        public addMarks(x: number, y: number, marks: GameMarks) {
            if ((marks) && ((marks & _marksMask) != 0)) {
                let oldBits = this.get(x, y);
                let newBits = oldBits | (marks & _marksMask);
                let setBits = newBits & ~oldBits;

                if (setBits != 0) {
                    this.set(this.index(x, y), newBits);

                    if ((setBits & GameMarks.WhiteTerritory) != 0) this.white.territory += 1;
                    if ((setBits & GameMarks.BlackTerritory) != 0) this.black.territory += 1;

                    let deadWhiteStone = (GameMarks.Dead | GameMarks.WhiteStone);
                    if (((setBits & deadWhiteStone) != 0) && ((newBits & deadWhiteStone) == deadWhiteStone)) this.black.captures += 1;

                    let deadBlackStone = (GameMarks.Dead | GameMarks.BlackStone);
                    if (((setBits & deadBlackStone) != 0) && ((newBits & deadBlackStone) == deadBlackStone)) this.white.captures += 1;
                }
            }
        }

        public static affectsPosition(p: KGS.SGF.Property) {
            if (null != p) {
                switch (p.name) {
                    case KGS.SGF._MOVE:
                    case KGS.SGF._ADDSTONE:
                    case KGS.SGF._TERRITORY:
                    case KGS.SGF._DEAD:
                    case KGS.SGF._CIRCLE:
                    case KGS.SGF._TRIANGLE:
                    case KGS.SGF._SQUARE:
                    case KGS.SGF._CROSS:
                        return true;
                }
            }

            return false;
        }

        public effectEvent(properties: KGS.SGF.Property[]): void {
            if (!properties) return null;

            this.lastEvent = 0;
            for (let p = 0; p < properties.length; ++p) {
                let pass: boolean = null;
                let loc: KGS.Coordinates = null;
                if ((<KGS.SGF.LocationProperty>properties[p]).loc) {
                    if ((<KGS.SGF.LocationProperty>properties[p]).loc == "PASS") {
                        pass = true;
                    }
                    else if (Utils.isObject((<KGS.SGF.LocationProperty>properties[p]).loc)) {
                        pass = false;
                        loc = (<KGS.SGF.LocationProperty>properties[p]).loc as KGS.Coordinates;
                    }
                }

                let colour: Models.GameStone = null;
                if ((<KGS.SGF.ColourProperty>properties[p]).color) colour = ((<KGS.SGF.ColourProperty>properties[p]).color == "white")? GameStone.White : GameStone.Black;

                let malformed: boolean = false;
                let moveResult: Models.GameMoveResult;
                switch (properties[p].name) {
                    case KGS.SGF._MOVE:
                        if ((loc) && (colour)) moveResult = this.play(loc.x, loc.y, colour);
                        else if (pass) this.pass();
                        else malformed = true;
                        break;

                    case KGS.SGF._ADDSTONE:
                        if ((loc) && (colour)) moveResult = this.addStone(loc.x, loc.y, colour);
                        else malformed = true;
                        break;

                    case KGS.SGF._TERRITORY:
                        if ((loc) && (colour)) {
                            this.addMarks(loc.x, loc.y, (colour == Models.GameStone.White)? Models.GameMarks.WhiteTerritory : Models.GameMarks.BlackTerritory);
                            this.clearTransients();
                            this.lastEvent = Models.GamePositionEvent.Scored;
                        }
                        else malformed = true;
                        break;

                    case KGS.SGF._DEAD:
                        if (loc) {
                            this.addMarks(loc.x, loc.y, Models.GameMarks.Dead);
                            this.clearTransients();
                            this.lastEvent = Models.GamePositionEvent.Scored;
                        }
                        else malformed = true;
                        break;

                    case KGS.SGF._CIRCLE:
                        if (loc) this.addMarks(loc.x, loc.y, Models.GameMarks.Circle);
                        else malformed = true;
                        break;
                    case KGS.SGF._TRIANGLE:
                        if (loc) this.addMarks(loc.x, loc.y, Models.GameMarks.Triangle);
                        else malformed = true;
                        break;
                    case KGS.SGF._SQUARE:
                        if (loc) this.addMarks(loc.x, loc.y, Models.GameMarks.Square);
                        else malformed = true;
                        break;
                    case KGS.SGF._CROSS:
                        if (loc) this.addMarks(loc.x, loc.y, Models.GameMarks.Cross);
                        else malformed = true;
                        break;

                    default:
                        Utils.log(Utils.LogSeverity.Debug, "SGF property '" + properties[p].name + "' unknown or unsupported");
                        break;
                }

                if (malformed) {
                    Utils.log(Utils.LogSeverity.Warning, "SGF property '" + properties[p].name + "' was malformed and could not be effected", properties[p]);
                }

                if ((moveResult != undefined) && (moveResult != GameMoveResult.Success)) {
                    Utils.log(Utils.LogSeverity.Error, "Error when applying SGF property '" + properties[p].name + "' to game position: " + GamePosition.moveResultToString(moveResult), properties[p], moveResult);
                }
            }
        }

        public static moveResultToString(moveResult: GameMoveResult): string {
            switch (moveResult) {
                case GameMoveResult.Success:           return "Move played successfully";
                case GameMoveResult.StonePresent:      return "A stone is already present at the given coordinates";
                case GameMoveResult.Suicide:           return "The move would be suicide and was forbidden by the Suicide rule";
                case GameMoveResult.Ko:                return "The move would result in a repeated position and was forbidden by the Ko rule";
                case GameMoveResult.Corrupt:           return "The game position has been corrupted";
                default:                               return "The move failed for an unknown reason";
            }
        }
    }
}
