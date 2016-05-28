/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class GameChannel extends ChannelBase {
        private _board: Views.GoBoard;
        private _userColour: Models.GameStone;

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);

            let gameChannel = this.channel as Models.GameChannel;
            if (gameChannel.gameType == Models.GameType.Challenge) {
                throw "Game Type may not be challenge";
            }

            this.initialiseChat();
            this.initialiseBoard();
        }

        private initialiseBoard() {
            let gameChannel = this.channel as Models.GameChannel;
            this._board = (gameChannel.size)? new Views.GoBoard(gameChannel.size) : new Views.GoBoard();
            this._board.playCallback = (x, y) => this.tryPlay(x, y);
            this.registerView(this._board, LayoutZone.Main, (digest?: KGS.DataDigest) => this.updateBoard(digest));
        }

        private updateBoard(digest?: KGS.DataDigest) {
            let updateOverlay: boolean = ((digest == null) || (digest.channels[this.channelId]));
            let updateBoard: boolean = ((updateOverlay) || (digest.gameTrees[this.channelId]));
            let updatePlayerPanels: boolean = ((updateBoard) || (digest.gameClocks[this.channelId]));
            if (updatePlayerPanels) {
                let gameState = this.database.games[this.channelId];
                let position: Models.GamePosition = ((gameState) && (gameState.tree) && (gameState.tree.position))? gameState.tree.position : null;

                if (updateBoard) {
                    if (!position) this._board.clear();
                    else this._board.updateBoard(position);
                }

                let gameChannel = this.channel as Models.GameChannel;
                if (gameChannel.playerWhite == this.database.username)
                    this._userColour = Models.GameStone.White;
                else if (gameChannel.playerBlack == this.database.username)
                    this._userColour = Models.GameStone.Black;
                else
                    this._userColour = null;

                if (updateOverlay) {
                    this._board.updateOverlay(gameChannel, this._userColour);
                }

                let splitKomi = gameState.rules.splitKomi();
                let home = {
                    colour: Models.GameStone.Black,
                    clock: gameState.clockBlack,
                    prisoners: (position)? position.prisoners.white : 0,
                    komi: splitKomi.black,
                    user: this.database.users[gameChannel.playerBlack]
                };
                let away = {
                    colour: Models.GameStone.White,
                    clock: gameState.clockWhite,
                    prisoners: (position)? position.prisoners.black : 0,
                    komi: splitKomi.white,
                    user: this.database.users[gameChannel.playerWhite]
                };

                if ((gameChannel.playerWhite == this.database.username) || (Models.User.compare(home.user, away.user) > 0)) {
                    let temp = away;
                    away = home;
                    home = temp;
                }

                let homeButtons: { text: string, callback: Function, dangerous?: boolean}[];
                if (this._userColour != null) {
                    homeButtons = [];

                    if (gameChannel.phase != Models.GamePhase.Concluded) {
                        if (gameChannel.phase == Models.GamePhase.Active) {
                            if (gameChannel.hasAction(Models.GameActions.Score)) {
                                homeButtons.push({ text: "done", callback: this._doneScoringCallback });
                            }
                            else {
                                homeButtons.push({ text: "pass", callback: ((gameChannel.hasAction(Models.GameActions.Move))? this._passCallback : null) });
                            }
                        }

                        homeButtons.push({ text: "resign", dangerous: true, callback: this._resignCallback });
                    }
                }

                this._board.playerHome.update(home.colour, home.clock, home.prisoners, home.komi, home.user, homeButtons);
                this._board.playerAway.update(away.colour, away.clock, away.prisoners, away.komi, away.user);
            }
        }

        private tryPlay(x: number, y: number): boolean {
            let gameChannel = this.channel as Models.GameChannel;
            let gameState = this.database.games[this.channelId];
            if ((!gameState) || (!gameState.tree)) return false;

            if (gameChannel.hasAction(Models.GameActions.Move)) {
                if ((x != null) && (y != null)) {
                    let r = gameState.tree.tryPlay(x, y);
                    switch (r as Models.GameMoveError) {
                        case Models.GameMoveError.Success:
                            gameChannel.disableAction(Models.GameActions.Move);
                            this.client.post(<KGS.Upstream.GAME_MOVE>{
                                type: KGS.Upstream._GAME_MOVE,
                                channelId: this.channelId,
                                loc: { x: x, y: y }
                            });
                            return true;

                        case Models.GameMoveError.InvalidLocation: console.log("given coordinates are not on board"); return false;
                        case Models.GameMoveError.StonePresent: console.log("on given coordinates already is a stone"); return false;
                        case Models.GameMoveError.Suicide: console.log("suicide (currently they are forbbiden)"); return false;
                        case Models.GameMoveError.Ko: console.log("ko ko ko"); return false;
                        default: console.log("unknown outcome"); return false;
                    }
                }
                else {
                    gameChannel.disableAction(Models.GameActions.Move);
                    this.client.post(<KGS.Upstream.GAME_MOVE>{
                        type: KGS.Upstream._GAME_MOVE,
                        channelId: this.channelId,
                        loc: "PASS"
                    });
                    return true;
                }
            }
            else if (gameChannel.hasAction(Models.GameActions.Score)) {
                let positionValue = gameState.tree.position.get(x, y);
                if ((positionValue != null) && ((positionValue & (Models.GameMarks.BlackStone | Models.GameMarks.WhiteStone)) != 0)) {
                    this.client.post(<KGS.Upstream.GAME_MARK_LIFE>{
                        type: KGS.Upstream._GAME_MARK_LIFE,
                        channelId: this.channelId,
                        x: x,
                        y: y,
                        alive: ((positionValue & Models.GameMarks.Dead) == Models.GameMarks.Dead)
                    });
                    return true;
                }
            }

            return false;
        }

        private _passCallback = () => {
            this.tryPlay(undefined, undefined);
        }
        private _doneScoringCallback = () => {
            let gameChannel = this.channel as Models.GameChannel;
            if ((gameChannel.hasAction(Models.GameActions.Score)) && (gameChannel.doneScoringId != null)) {
                this.client.post(<KGS.Upstream.GAME_SCORING_DONE>{
                    type: KGS.Upstream._GAME_SCORING_DONE,
                    channelId: this.channelId,
                    doneId: gameChannel.doneScoringId
                });
            }
        }
        private _resignCallback = () => {
            if (this._userColour != null) {
                let gameChannel = this.channel as Models.GameChannel;
                gameChannel.disableAction(Models.GameActions.Move);

                this.client.post(<KGS.Upstream.GAME_RESIGN>{
                    type: KGS.Upstream._GAME_RESIGN,
                    channelId: this.channelId,
                });
            }
        }
    }
}
