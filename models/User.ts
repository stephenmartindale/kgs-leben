namespace Models {
    export const enum UserFlags {
        Guest              = (1 << 00), // g 	Guest
        Connected          = (1 << 01), // c 	Connected (logged in right now)
        Deleted            = (1 << 02), // d 	Account has been deleted
        Idle               = (1 << 03), // s 	User is sleeping (more than 10 minutes since last interaction)
        HasAvatar          = (1 << 04), // a 	User has an avatar.
        Robot              = (1 << 05), // r 	User is a robot.
        TournamentWinner   = (1 << 06), // T 	User has won a KGS tournament.
        TournamentRunnerUp = (1 << 07), // t 	User has been runner up in a KGS tournament.
        Playing            = (1 << 08), // p 	User is currently playing in a game.
        PlayingTournament  = (1 << 09), // P 	User is currently playing in a KGS tournament game.
        KGSPlus            = (1 << 10), // * 	User is a KGS Plus subscriber.
        KGSMeijin          = (1 << 11), // ! 	User is KGS Meijin
        Ranked             = (1 << 12), // = 	User can play ranked games.
        Biased             = (1 << 13)  // ~ 	User plays stronger players far more often that weaker ones.
    }

    export const enum UserRankFormat {
        Default,
        Long,
        Numeric
    };

    export class User {
        public name: string;
        public rank: string;

        private _flags: string;
        public flags: UserFlags;

        constructor(user: KGS.User) {
            this.name = user.name;
            this.rank = user.rank;

            this.mergeFlags(user.flags);
        }

        public mergeUser(user: KGS.User): boolean {
            let touch: boolean = false;
            if (this.name != user.name) { this.name = user.name; touch = true; }
            if (this.rank != user.rank) { this.rank = user.rank; touch = true; }

            return ((touch) || (this.mergeFlags(user.flags)));
        }

        private mergeFlags(flags: string): boolean {
            if (this._flags != flags) {
                let bits: number = 0;
                if (flags) {
                    for (let i = 0; i < flags.length; ++i) {
                        switch (flags.charAt(i)) {
                            case "g": bits |= UserFlags.Guest;              break; // Guest
                            case "c": bits |= UserFlags.Connected;          break; // Connected (logged in right now)
                            case "d": bits |= UserFlags.Deleted;            break; // Account has been deleted
                            case "s": bits |= UserFlags.Idle;               break; // User is sleeping (more than 10 minutes since last interaction)
                            case "a": bits |= UserFlags.HasAvatar;          break; // User has an avatar.
                            case "r": bits |= UserFlags.Robot;              break; // User is a robot.
                            case "T": bits |= UserFlags.TournamentWinner;   break; // User has won a KGS tournament.
                            case "t": bits |= UserFlags.TournamentRunnerUp; break; // User has been runner up in a KGS tournament.
                            case "p": bits |= UserFlags.Playing;            break; // User is currently playing in a game.
                            case "P": bits |= UserFlags.PlayingTournament;  break; // User is currently playing in a KGS tournament game.
                            case "*": bits |= UserFlags.KGSPlus;            break; // User is a KGS Plus subscriber.
                            case "!": bits |= UserFlags.KGSMeijin;          break; // User is KGS Meijin
                            case "=": bits |= UserFlags.Ranked;             break; // User can play ranked games.
                            case "~": bits |= UserFlags.Biased;             break; // User plays stronger players far more often that weaker ones.
                        }
                    }
                }

                if (this.flags != bits) {
                    this._flags = flags;
                    this.flags = bits;
                    return true;
                }
            }

            return false;
        }

        public hasFlag(flags: UserFlags): boolean {
            return ((this.flags & flags) == flags);
        }

        private static unifyRating(rating: number): number {
            if ((rating == null) || (rating < 0) || (rating == KGS.Constants.RatingNull)) return null;
            else if (rating > KGS.Constants.Rating9Dan) return KGS.Constants.Rating9Dan;
            else return rating;
        }

        public static ratingToRank(rating: number, unsettled?: boolean, format?: UserRankFormat): string {
            // See the documentation for downstream message: DETAILS_RANK_GRAPH
            // 30k is 0..99, 29k is 100..199, etc. 0x7fff indicates "no rank for this day."

            rating = User.unifyRating(rating);
            if (rating == null) return (format != UserRankFormat.Numeric)? "?" : null;


            let dan: boolean = (rating >= KGS.Constants.RatingShodan);
            let r: number = (dan)? (~~(rating / 100) - 29) : (30 - ~~(rating / 100));

            let rank: string = r.toString();
            if (format != UserRankFormat.Numeric) {
                if (format == UserRankFormat.Long)
                    rank += (dan)? " dan" : " kyu";
                else
                    rank += (dan)? "d" : "k";

                if (unsettled) rank += "?";
            }

            return rank;
        }

        public static rankToRating(rank: string): number {
            if (null == rank) return null;

            let parts = KGS.Constants.RegularExpressions.Rank.exec(rank);
            if ((!parts) || (!parts[1])) return null;

            if (parts[3] == 'd') {
                return 2900 + ((+parts[2]) * 100);
            }
            else {
                return KGS.Constants.RatingShodan - ((+parts[2]) * 100);
            }
        }

        public static estimateHandicap(player: (number | string), opponent: (number | string)) {
            let playerRating: number = (Utils.isNumber(player))? User.unifyRating(<number>player) : User.rankToRating(<string>player);
            if (playerRating == null) return null;

            let opponentRating: number = (Utils.isNumber(opponent))? User.unifyRating(<number>opponent) : User.rankToRating(<string>opponent);
            if (opponentRating == null) return null;

            return ~~(opponentRating / 100) - ~~(playerRating / 100);
        }
    }
}
