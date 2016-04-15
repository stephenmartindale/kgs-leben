namespace Models {
    export const enum GamePhase {
        Active,
        Paused,
        Adjourned,
        Concluded
    }

    export class GameChannel extends Models.Channel {
        parentChannelId: number;
        gameType: Models.GameType;

        size: number;
        score: string;
        moveNumber: number;

        restrictedPrivate: boolean;     // Restricted by the Game Owner
        restrictedPlus: boolean;        // Restricted to KGS Plus users
        phase: GamePhase;

        playerWhite: string;
        playerBlack: string;

        constructor(channelId: number) {
            super(channelId, ChannelType.Game);
        }

        public mergeGameChannel(game: KGS.GameChannel): boolean {
            let touch: boolean = false;
            if (this.parentChannelId != game.roomId) { this.parentChannelId = game.roomId; touch = true; }

            let gameType: Models.GameType;
            switch (game.gameType) {
                case "challenge": gameType = Models.GameType.Challenge; break;
                case "demonstration": gameType = Models.GameType.Demonstration; break;
                case "review": gameType = Models.GameType.Review; break;
                case "rengo_review": gameType = Models.GameType.ReviewRengo; break;
                case "teaching": gameType = Models.GameType.Teaching; break;
                case "simul": gameType = Models.GameType.Simultaneous; break;
                case "rengo": gameType = Models.GameType.Rengo; break;
                case "free": gameType = Models.GameType.Free; break;
                case "ranked": gameType = Models.GameType.Ranked; break;
                case "tournament": gameType = Models.GameType.Tournament; break;
            }

            if (this.gameType != gameType) { this.gameType = gameType; touch = true; }

            if (this.size != game.size) { this.size = game.size; touch = true; }
            if (this.score != game.score) { this.score = game.score; touch = true; }
            if (this.moveNumber != game.moveNum) { this.moveNumber = game.moveNum; touch = true; }

            let pvt: boolean = (game.private)? true : false;
            if (this.restrictedPrivate != pvt) { this.restrictedPrivate = pvt; touch = true; }

            let plus: boolean = (game.subscribers)? true : false;
            if (this.restrictedPlus != plus) { this.restrictedPlus = plus; touch = true; }

            let phase: GamePhase = GamePhase.Active;
            if (game.paused) phase = GamePhase.Paused;
            if (game.adjourned) phase = GamePhase.Adjourned;
            if (game.over) phase = GamePhase.Concluded;
            if (this.phase != phase) { this.phase = phase; touch = true; }

            let playerWhite: string = ((game.players) && (game.players.white))? game.players.white.name : null;
            if (this.playerWhite != playerWhite) { this.playerWhite = playerWhite; touch = true; }

            let playerBlack: string = ((game.players) && (game.players.black))? game.players.black.name : null;
            if (this.playerBlack != playerWhite) { this.playerBlack = playerBlack; touch = true; }

            let name: string;
            if ((playerWhite != null) && (playerBlack != null)) {
                name = playerWhite + " vs. " + playerBlack;
                if (game.name != null) {
                    name += "  " + game.name;
                }
            }
            else if (game.name != null) {
                name = game.name;
            }
            // else if (this.challengeCreator != null) {
            //     return this.challengeCreator;
            // }
            else {
                name = "Game Channel #" + this.channelId.toString();
            }

            if (this.name != name) { this.name = name; touch = true; }

            return touch;
        }

        public get displayType(): string {
            switch (this.gameType) {
                case Models.GameType.Challenge:
                    return "Challenge";

                case Models.GameType.Demonstration:
                    return "Demo";

                case Models.GameType.Review:
                case Models.GameType.ReviewRengo:
                    return "Review";

                default:
                    return "Game";
            }
        }

        public get displaySubType(): string {
            switch (this.gameType) {
                case Models.GameType.ReviewRengo:
                case Models.GameType.Rengo:
                    return "rengo";

                case Models.GameType.Teaching: return "teaching";
                case Models.GameType.Simultaneous: return "simultaneous";
                case Models.GameType.Free: return "free";
                case Models.GameType.Tournament: return "tournament";
                default: return "";
            }
        }

        public get displaySize(): string {
            if (this.size == null) return "";
            let sz: string = this.size.toString();
            return sz + "×" + sz;
        }
    }
}
