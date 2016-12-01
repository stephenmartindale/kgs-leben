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

        private initialiseBoard() {
            let gameChannel = this.channel as Models.GameChannel;
            let board = (gameChannel.size)? new Views.GoBoard(gameChannel.size) : new Views.GoBoard();

            this.registerView(board, LayoutZone.Main, (digest?: KGS.DataDigest) => {});
        }

        private initialiseProposal() {
            var proposalForm = new Views.GameProposal();
            proposalForm.gameActions = 0;
            proposalForm.submitCallback = (form) => this.submitProposal(proposalForm);

            this.updateProposalForm(proposalForm);

            this.registerView(proposalForm, LayoutZone.Main, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channels[this.channelId]) || (digest.gameActions[this.channelId])) {
                    this.updateProposalForm(proposalForm);
                }
            });
        }

        private updateProposalForm(proposalForm: Views.GameProposal) {
            let gameChannel = this.channel as Models.GameChannel;
            proposalForm.description = (gameChannel.description)? gameChannel.description : "";
            proposalForm.boardSize = gameChannel.size;
            proposalForm.private = (gameChannel.restrictedPrivate || gameChannel.proposal.private);
            proposalForm.ruleSet = gameChannel.proposal.rules.rules;

            proposalForm.setTimeSystem(gameChannel.proposal.rules.timeSystem,
                               gameChannel.proposal.rules.mainTime,
                               gameChannel.proposal.rules.byoYomiTime,
                               gameChannel.proposal.rules.byoYomiPeriods,
                               gameChannel.proposal.rules.byoYomiStones);

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
                // TODO: Test what happens if this ends up being negative
                proposalForm.handicap = Models.User.estimateHandicap(me.rank, challenger.rank);
            }

            if (gameChannel.proposal.nigiri) {
                proposalForm.colour = 'nigiri';
                proposalForm.komi = (gameChannel.proposal.rules.komi)? gameChannel.proposal.rules.komi : KGS.Constants.DefaultKomi;
            }
            else if (player != null) {
                proposalForm.handicap = gameChannel.proposal.rules.handicap;
                proposalForm.colour = (player.role == "white")? 'white' : 'black';
                proposalForm.komi = (gameChannel.proposal.rules.komi)? gameChannel.proposal.rules.komi : KGS.Constants.DefaultKomi;
            }

            proposalForm.gameActions = gameChannel.actions;
        }

        private submitProposal(proposalForm: Views.GameProposal) {
            let gameChannel = this.channel as Models.GameChannel;
            let messageType: string;
            let nigiri: boolean;
            let handicap: number;
            let komi: number;
            let players: KGS.UpstreamProposalPlayer[];

            if (gameChannel.hasAction(Models.GameActions.ChallengeAccept)) {
                messageType = KGS.Upstream._CHALLENGE_ACCEPT;
                nigiri = gameChannel.proposal.nigiri;
                handicap = gameChannel.proposal.rules.handicap;
                komi = gameChannel.proposal.rules.komi;
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

            gameChannel.enableAction(Models.GameActions.ChallengeSubmitted);
            proposalForm.gameActions = gameChannel.actions;

            let response: KGS.Upstream.ChallengeResponse = {
                type: messageType,
                channelId: this.channelId,

                gameType: gameChannel.proposal.gameType,
                nigiri: nigiri,
                rules: {
                    size: gameChannel.proposal.rules.size,
                    handicap: handicap,
                    komi: komi,

                    rules: gameChannel.proposal.rules.rules,
                    timeSystem: gameChannel.proposal.rules.timeSystem,
                    mainTime: gameChannel.proposal.rules.mainTime,
                    byoYomiTime: gameChannel.proposal.rules.byoYomiTime,
                    byoYomiPeriods: gameChannel.proposal.rules.byoYomiPeriods,
                    byoYomiStones: gameChannel.proposal.rules.byoYomiStones
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
