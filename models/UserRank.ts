namespace Models {
    export interface UserRank {
        rank: number;
        dan: boolean;
    }

    export class UserRank implements UserRank {
        private static _rankRegex = /(\d+)\s*([kKdD])[yYuUaAnN]*\s*(\??)/;
        private static _ratingHalfStone = 50;

        public static validate(s: string): boolean {
            if (!s) return undefined;
            else return UserRank._rankRegex.test(s);
        }

        public static parse(s: string): UserRank {
            if (!s) return undefined;
            let parts = UserRank._rankRegex.exec(s);
            if (!parts) return undefined;

            return {
                rank: (+parts[1]),
                dan: ((parts[2] == 'd') || (parts[2] == 'D'))? true : false
            };
        }

        public static rankToString(rank: UserRank, longFormat?: boolean) {
            if (longFormat) {
                if (!rank) return "unknown";
                else return rank.rank.toString() + ((rank.dan)? " dan" : " kyu");
            }
            else {
                if (!rank) return "?";
                else return rank.rank.toString() + ((rank.dan)? "d" : "k");
            }
        }

        public static ratingToRank(rating: number): UserRank {
            if (rating == null) return null;
            if (rating >= 3000) {
                return { rank: (~~(rating / 100) - 29), dan: true };
            }
            else {
                return { rank: (30 - ~~(rating / 100)), dan: false };
            }
        }

        public static rankToRating(rank: UserRank): number {
            if (!rank) return null;
            if (rank.dan) {
                return 2900 + (rank.rank * 100);
            }
            else {
                return 3000 - (rank.rank * 100);
            }
        }

        public static estimateHandicap(left: (number | string | UserRank), right: (number | string | UserRank)) {
            let leftRating: number = (Utils.isNumber(left))? <number>left
                                   : (Utils.isString(left))? UserRank.rankToRating(UserRank.parse(<string>left))
                                   : UserRank.rankToRating(<UserRank>left);

            if (leftRating == null) return 0;

            let rightRating: number = (Utils.isNumber(right))? <number>right
                                    : (Utils.isString(right))? UserRank.rankToRating(UserRank.parse(<string>right))
                                    : UserRank.rankToRating(<UserRank>right);

            if (rightRating == null) return 0;

            return ~~(leftRating / 100) - ~~(rightRating / 100);
        }
    }
}
