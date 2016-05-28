namespace Models {
    export class GameChannel extends Models.Channel {
        gameType: Models.GameType;
        description: string;

        size: number;
        moveNumber: number;

        restrictedPrivate: boolean;     // Restricted by the Game Owner
        restrictedPlus: boolean;        // Restricted to KGS Plus users
        phase: GamePhase;
        proposal: KGS.DownstreamProposal;

        result: Models.GameResult;

        playerWhite: string;
        playerBlack: string;
        challengeCreator: string;

        actions: Models.GameActions;
        doneScoringId: number;

        constructor(channelId: number) {
            super(channelId, ChannelType.Game);
        }

        public mergeGameChannel(game: KGS.GameChannel | KGS.ChallengeChannel | KGS.GameSummary): boolean {
            let touch: boolean = false;

            let gameType: Models.GameType = GameChannel.getGameType(game.gameType);
            if (this.gameType != gameType) { this.gameType = gameType; touch = true; }

            if (((<KGS.GameChannel | KGS.ChallengeChannel>game).name !== undefined) && (this.description != (<KGS.GameChannel | KGS.ChallengeChannel>game).name)) {
                this.description = (<KGS.GameChannel | KGS.ChallengeChannel>game).name;
                touch = true;
            }

            let score: string | number;
            if (gameType != Models.GameType.Challenge) {
                let g = (<KGS.GameChannel>game);
                score = g.score;

                if (this.size != g.size) { this.size = g.size; touch = true; }
                if (this.moveNumber != g.moveNum) { this.moveNumber = g.moveNum; touch = true; }
                if (this.proposal != null) { this.proposal = null; touch = true; }
            }
            else {
                let c = (<KGS.ChallengeChannel>game);
                let sz = (c.initialProposal)? c.initialProposal.rules.size : null;
                if (this.size != sz) { this.size = sz; touch = true; }
                if (this.moveNumber != null) { this.moveNumber = null; touch = true; }
                if (this.mergeProposal(c.initialProposal)) touch = true;
            }

            if (this.mergeScore(score)) touch = true;
            if (this.mergeFlags(game)) touch = true;

            let playerWhite: string = ((game.players) && (game.players.white))? game.players.white.name : null;
            if (this.playerWhite != playerWhite) { this.playerWhite = playerWhite; touch = true; }

            let playerBlack: string = ((game.players) && (game.players.black))? game.players.black.name : null;
            if (this.playerBlack != playerBlack) { this.playerBlack = playerBlack; touch = true; }

            let challengeCreator: string = ((game.players) && (game.players.challengeCreator))? game.players.challengeCreator.name : null;
            if (this.challengeCreator != challengeCreator) { this.challengeCreator = challengeCreator; touch = true; }

            let name: string;
            if ((playerWhite != null) && (playerBlack != null)) {
                name = playerWhite + " vs. " + playerBlack;
            }
            else if (this.challengeCreator != null) {
                name = "Challenge from " + this.challengeCreator;
            }
            else {
                name = "Game #" + this.channelId.toString();
            }

            if (this.name != name) { this.name = name; touch = true; }

            return touch;
        }

        public mergeScore(score: string | number): boolean {
            let touch: boolean = false;
            if (GameResult.isKnownResult(score)) {
                if (this.result == null) {
                    this.result = new Models.GameResult();
                    touch = true;
                }

                if (this.result.mergeScore(score)) {
                    touch = true;
                }
            }
            else {
                if (this.result != null) {
                    this.result = null;
                    touch = true;
                }
            }

            return touch;
        }

        public mergeFlags(flags: KGS.GameFlags): boolean {
            let touch: boolean = false;

            let pvt: boolean = (flags.private)? true : false;
            if (this.restrictedPrivate != pvt) { this.restrictedPrivate = pvt; touch = true; }

            let plus: boolean = (flags.subscribers)? true : false;
            if (this.restrictedPlus != plus) { this.restrictedPlus = plus; touch = true; }

            let phase: GamePhase = GamePhase.Active;
            if (flags.paused) phase = GamePhase.Paused;
            if (flags.adjourned) phase = GamePhase.Adjourned;
            if (flags.over) phase = GamePhase.Concluded;
            if (this.phase != phase) { this.phase = phase; touch = true; }

            return touch;
        }

        public mergeProposal(proposal: KGS.DownstreamProposal): boolean {
            if (this.gameType != GameType.Challenge) throw "Game Type is not challenge";
            if ((null == this.proposal) || (!Utils.valueEquals(this.proposal, proposal, Utils.ComparisonFlags.ArraysAsSets))) {
                this.proposal = proposal;
                return true;
            }

            return false;
        }

        public static getGameType(s: string): Models.GameType {
            switch (s) {
                case "challenge": return Models.GameType.Challenge;
                case "demonstration": return Models.GameType.Demonstration;
                case "review": return Models.GameType.Review;
                case "rengo_review": return Models.GameType.ReviewRengo;
                case "teaching": return Models.GameType.Teaching;
                case "simul": return Models.GameType.Simultaneous;
                case "rengo": return Models.GameType.Rengo;
                case "free": return Models.GameType.Free;
                case "ranked": return Models.GameType.Ranked;
                case "tournament": return Models.GameType.Tournament;
            }
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

        public clearActions(): boolean {
            let touch: boolean = (this.actions)? true : false;
            this.actions = 0;
            return touch;
        }

        public enableAction(action: string | Models.GameActions) {
            if (!action) return false;

            let a: Models.GameActions = 0;
            if (Utils.isString(action)) {
                switch (<string>action) {
                    case "MOVE": a = Models.GameActions.Move; break;
                    case "EDIT": a = Models.GameActions.Edit; break;
                    case "SCORE": a = Models.GameActions.Score; break;
                    case "CHALLENGE_CREATE": a = Models.GameActions.ChallengeCreate; break;
                    case "CHALLENGE_SETUP": a = Models.GameActions.ChallengeSetup; break;
                    case "CHALLENGE_WAIT": a = Models.GameActions.ChallengeWait; break;
                    case "CHALLENGE_ACCEPT": a = Models.GameActions.ChallengeAccept; break;
                    case "CHALLENGE_SUBMITTED": a = Models.GameActions.ChallengeSubmitted; break;
                    case "EDIT_DELAY": a = Models.GameActions.EditDelay; break;
                    default: throw "Unknown or Unsupported Game Action: '" + action + "'";
                }
            }
            else {
                a = <Models.GameActions>action;
            }

            let union = ((this.actions)? this.actions : 0) | a;
            if (union != this.actions) {
                this.actions = union;
                return true;
            }
            else return false;
        }

        public disableAction(action: Models.GameActions) {
            if (!action) return false;
            let removed = ((this.actions)? this.actions : 0) & ~action;
            if (removed != this.actions) {
                this.actions = removed;
                return true;
            }
            else return false;
        }

        public hasAction(action: Models.GameActions): boolean {
            return (this.actions)? ((this.actions & action) == action) : false;
        }
    }
}
