/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class GameChannel extends ChannelBase {
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
            let whiteUser = this.database.users[gameChannel.playerWhite];
            let blackUser = this.database.users[gameChannel.playerBlack];

            let awayUser: Models.User;
            let homeUser: Models.User;
            let homeColour: Models.GameStone;
            if (gameChannel.playerWhite == this.database.username) {
                homeColour = Models.GameStone.White;
            }
            else if (gameChannel.playerBlack == this.database.username) {
                homeColour = Models.GameStone.Black;
            }
            else {
                awayUser = this.database.users[gameChannel.playerWhite];
                homeUser = this.database.users[gameChannel.playerBlack];
                homeColour = Models.GameStone.Black;

                if (Models.User.compare(homeUser, awayUser) > 0) {
                    let temp = awayUser;
                    awayUser = homeUser;
                    homeUser = temp;
                    homeColour = Models.GameStone.White;
                }
            }

            let board = (gameChannel.size)? new Views.GoBoard(gameChannel.size) : new Views.GoBoard();
            board.playCallback = (x, y) => this.tryPlay(board, x, y);

            this.registerView(board, LayoutZone.Main, (digest?: KGS.DataDigest) => {
                let gameState = this.database.games[this.channelId];
                if ((digest == null) || (digest.gameTrees[this.channelId])) {
                    if ((!gameState) || (!gameState.tree)) {
                        board.clear();
                    }
                    else {
                        board.update(gameState.tree.position);
                    }
                }

                if ((digest == null) || (digest.gameClocks[this.channelId])) {
                    if (homeColour == Models.GameStone.White) {
                        board.playerHome.clock.update(gameState.clockWhite);
                        board.playerAway.clock.update(gameState.clockBlack);
                    }
                    else {
                        board.playerHome.clock.update(gameState.clockBlack);
                        board.playerAway.clock.update(gameState.clockWhite);
                    }
                }
            });
        }

        private tryPlay(board: Views.GoBoard, x: number, y: number): boolean {
            let gameChannel = this.channel as Models.GameChannel;
            if (!gameChannel.hasAction(Models.GameActions.Move)) {
                console.log("move action not available");
                return false;
            }

            let gameState = this.database.games[this.channelId];
            if ((!gameState) || (!gameState.tree)) return;

            let r = gameState.tree.tryPlay(x, y);
            switch (r as Models.GameMoveError) {
                case Models.GameMoveError.Success:
                    gameChannel.disableAction(Models.GameActions.Move);
                    this.client.post(<KGS.Upstream.GAME_MOVE>{
                        type: KGS.Upstream._GAME_MOVE,
                        channelId: this.channelId,
                        x: x,
                        y: y
                    });
                    return true;

                case Models.GameMoveError.InvalidLocation: console.log("given coordinates are not on board"); return false;
                case Models.GameMoveError.StonePresent: console.log("on given coordinates already is a stone"); return false;
                case Models.GameMoveError.Suicide: console.log("suicide (currently they are forbbiden)"); return false;
                case Models.GameMoveError.Ko: console.log("ko ko ko"); return false;
                default: console.log("unknown outcome"); return false;
            }
        }
    }
}
