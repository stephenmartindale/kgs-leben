namespace Models {
    // Scores may be a floating point number, or a string. Numbers indicate the
    // score difference (positive a black win, negative a white win). Strings
    // may be UNKNOWN, UNFINISHED, NO_RESULT, B+RESIGN, W+RESIGN, B+FORFEIT,
    // W+FORFEIT, B+TIME, or W+TIME.
    export const enum GameResultType {
        Unknown,        // The game has not yet finished or the result is not known
        Scored,         // The game was concluded and points were tallied
        Timeout,        // One of the players ran out of time before the game ended
        Resignation,    // One of the players resigned
        Anulled,        // The game was resolved without result by an edge-case such as Japanese Super-Ko
        Forfeit         // One of the players was forced to forfeit the game
    }

    export class GameResult {
        private _score: string | number;

        public resultType: Models.GameResultType;
        public victor: Models.GameStone;
        public points: number;

        constructor() {
            this.resultType = GameResultType.Unknown;
        }

        public mergeScore(score: string | number): boolean {
            if (this._score == score) return false;

            if (GameResult.isKnownResult(score)) {
                this._score = score;
                if (Utils.isNumber(score)) {
                    if (score > 0) {
                        this.resultType = GameResultType.Scored;
                        this.victor = Models.GameStone.Black;
                        this.points = +score;
                    }
                    else if (score < 0) {
                        this.resultType = GameResultType.Scored;
                        this.victor = Models.GameStone.White;
                        this.points = -(+score);
                    }
                    else {
                        this.resultType = GameResultType.Scored;
                        this.victor = null;
                        this.points = 0;
                    }
                }
                else if (score == "NO_RESULT") {
                    this.resultType = GameResultType.Anulled;
                    this.victor = null;
                    this.points = null;
                }
                else {
                    let v = (<string>score).substr(0, 1);
                    this.victor = (v == "B")? Models.GameStone.Black : (v == "W")? Models.GameStone.White : null;
                    this.points = null;

                    let w = (<string>score).substr(2);
                    switch (w) {
                        case "TIME": this.resultType = GameResultType.Timeout; break;
                        case "RESIGN": this.resultType = GameResultType.Resignation; break;
                        case "FORFEIT": this.resultType = GameResultType.Forfeit; break;
                    }
                }

                return true;
            }
            else {
                if (this.resultType == GameResultType.Unknown) return false;

                this._score = null;

                this.resultType = GameResultType.Unknown;
                this.victor = null;
                this.points = null;

                return true;
            }
        }

        public static isKnownResult(score: string | number): boolean {
            return ((score != null) && (score != "UNKNOWN") && (score != "UNFINISHED"));
        }

        public getHeadline(userColour?: Models.GameStone, whiteName?: string, blackName?: string): string {
            if (this.resultType == GameResultType.Anulled) {
                return "no result";
            }
            else if ((this.resultType == GameResultType.Scored) && (this.points == 0)) {
                return "jigo";
            }

            let byLine: string;
            switch (this.resultType) {
                case GameResultType.Scored: byLine = " by " + this.points.toString() + " points"; break;
                case GameResultType.Timeout: byLine = " by time"; break;
                case GameResultType.Resignation: byLine = " by resignation"; break;
                case GameResultType.Forfeit: byLine = " by forfeiture"; break;
            }

            if (byLine) {
                if (userColour != null)
                    return ((this.victor == userColour)? "Victory" : "Defeat") + byLine;
                else
                    return ((this.victor == Models.GameStone.White)? (whiteName || "White") : (blackName || "Black")) + " won" + byLine;
            }

            return "unknown result";
        }

        public getShortFormat() {
            if (this.resultType == GameResultType.Anulled) {
                return "";
            }
            else if ((this.resultType == GameResultType.Scored) && (this.points == 0)) {
                return "JIGO";
            }

            let byLine: string;
            switch (this.resultType) {
                case GameResultType.Scored: byLine = this.points.toString(); break;
                case GameResultType.Timeout: byLine = "TIME"; break;
                case GameResultType.Resignation: byLine = "RESIGN"; break;
                case GameResultType.Forfeit: byLine = "FORFEIT"; break;
            }

            if (byLine) {
                return ((this.victor == Models.GameStone.White)? "W+" : "B+") + byLine;
            }

            return "??";
        }
    }
}
