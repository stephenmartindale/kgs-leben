/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class ChallengeChannel extends ChannelBase {

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);

            let gameChannel = this.channel as Models.GameChannel;
            if (gameChannel.gameType != Models.GameType.Challenge) {
                throw "Game Type is not challenge";
            }

            this.initialiseChat();
            this.initialiseBoard();
            this.initialiseProposal();
        }

        protected initialiseBoard() {
            var board = new Views.GoBoard();
            let gameChannel = this.channel as Models.GameChannel;
            if (gameChannel.size) board.defaultSize = gameChannel.size;

            this.registerView(board, LayoutZone.Main, (channelId: number, digest?: KGS.DataDigest) => {});
        }

        protected initialiseProposal() {
            var proposalForm = new Views.GameProposal();
            proposalForm.gameActions = 0;
            proposalForm.submitCallback = (form) => this.submitProposal(proposalForm);

            this.updateProposalForm(proposalForm);

            this.registerView(proposalForm, LayoutZone.Main, (channelId: number, digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channels[channelId]) || (digest.gameActions[channelId])) {
                    this.updateProposalForm(proposalForm);
                }
            });
        }

        private updateProposalForm(proposalForm: Views.GameProposal) {
            let gameChannel = this.channel as Models.GameChannel;
            proposalForm.description = (gameChannel.description)? gameChannel.description : "";
            proposalForm.boardSize = gameChannel.size;
            proposalForm.private = (gameChannel.restrictedPrivate || gameChannel.proposal.private);
            proposalForm.ruleSet = gameChannel.proposal.rules;

            proposalForm.setTimeSystem(gameChannel.proposal.timeSystem,
                               gameChannel.proposal.mainTime,
                               gameChannel.proposal.byoYomiTime,
                               gameChannel.proposal.byoYomiPeriods,
                               gameChannel.proposal.byoYomiStones);

            let challenger: Models.User = this.database.users[gameChannel.challengeCreator];
            let me: Models.User = this.database.users[this.database.username];
            proposalForm.setChallenger(challenger.name, challenger.rank);

            let player: KGS.DownstreamProposalPlayer = null;
            for (let i = 0; i < gameChannel.proposal.players.length; ++i) {
                if ((gameChannel.proposal.players[i].user) && (gameChannel.proposal.players[i].user.name == me.name)) {
                    player = gameChannel.proposal.players[i];
                }
            }

            if (player == null) {
                proposalForm.handicap = Models.User.estimateHandicap(challenger.rank, me.rank);
            }

            if (gameChannel.proposal.nigiri) {
                proposalForm.colour = 'nigiri';
                proposalForm.komi = (gameChannel.proposal.komi)? gameChannel.proposal.komi : KGS.Constants.DefaultKomi;
            }
            else if (player != null) {
                proposalForm.handicap = gameChannel.proposal.handicap;
                proposalForm.colour = (player.role == "white")? 'white' : 'black';
                proposalForm.komi = (gameChannel.proposal.komi)? gameChannel.proposal.komi : KGS.Constants.DefaultKomi;
            }

            proposalForm.gameActions = this.database.gameActions[this.channelId];
        }

        private submitProposal(proposalForm: Views.GameProposal) {
            let gameChannel = this.channel as Models.GameChannel;
            let actions: number = this.database.gameActions[this.channelId];
            let messageType: string;
            let nigiri: boolean;
            let handicap: number;
            let komi: number;
            let players: KGS.UpstreamProposalPlayer[];

            if ((actions & Models.GameActions.ChallengeAccept) == Models.GameActions.ChallengeAccept) {
                messageType = KGS.Upstream._CHALLENGE_ACCEPT;
                nigiri = gameChannel.proposal.nigiri;
                handicap = gameChannel.proposal.handicap;
                komi = gameChannel.proposal.komi;
                players = new Array(gameChannel.proposal.players.length);
                for (let i = 0; i < gameChannel.proposal.players.length; ++i) {
                    players[i] = {
                        role: gameChannel.proposal.players[i].role,
                        name: gameChannel.proposal.players[i].user.name
                    };
                }
            }
            else {
                messageType = KGS.Upstream._CHALLENGE_SUBMIT;
                nigiri = (proposalForm.colour == "nigiri");
                handicap = proposalForm.handicap;
                komi = proposalForm.komi;

                players = [
                    {
                        role: (proposalForm.colour == "white")? "black" : "white",
                        name: gameChannel.challengeCreator
                    },
                    {
                        role: (proposalForm.colour == "white")? "white" : "black",
                        name: this.database.username },
                ];
            }

            actions |= Models.GameActions.ChallengeSubmitted;
            this.database.gameActions[this.channelId] = actions;
            proposalForm.gameActions = actions;

            let response: KGS.Upstream.ChallengeResponse = {
                type: messageType,
                channelId: this.channelId,

                gameType: gameChannel.proposal.gameType,
                nigiri: nigiri,
                rules: {
                    size: gameChannel.proposal.size,
                    handicap: handicap,
                    komi: komi,

                    rules: gameChannel.proposal.rules,
                    timeSystem: gameChannel.proposal.timeSystem,
                    mainTime: gameChannel.proposal.mainTime,
                    byoYomiTime: gameChannel.proposal.byoYomiTime,
                    byoYomiPeriods: gameChannel.proposal.byoYomiPeriods,
                    byoYomiStones: gameChannel.proposal.byoYomiStones
                },

                players: players,

                over: gameChannel.proposal.over,
                adjourned: gameChannel.proposal.adjourned,
                private: gameChannel.proposal.private,
                subscribers: gameChannel.proposal.subscribers,
                event: gameChannel.proposal.event,
                uploaded: gameChannel.proposal.uploaded,
                audio: gameChannel.proposal.audio,
                paused: gameChannel.proposal.paused,
                named: gameChannel.proposal.named,
                saved: gameChannel.proposal.saved,
                global: gameChannel.proposal.global
            };

            this.client.post(response);
        }
    }
}
