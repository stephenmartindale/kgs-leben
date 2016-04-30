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

        protected initialiseBoard() {
            var board = new Views.GoBoard();
            let gameChannel = this.channel as Models.GameChannel;
            if (gameChannel.size) board.defaultSize = gameChannel.size;

            board.playCallback = (x, y) => this.tryPlay(board, x, y);

            this.registerView(board, LayoutZone.Main, (channelId: number, digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.gameTrees[channelId])) {
                    let gameTree = this.database.games[channelId];
                    if (!gameTree) {
                        board.clear();
                    }
                    else {
                        board.update(gameTree.position);
                    }
                }
            });
        }

        private tryPlay(board: Views.GoBoard, x: number, y: number): boolean {
            let actions = this.database.gameActions[this.channelId];
            if ((actions & Models.GameActions.Move) != Models.GameActions.Move) {
                console.log("move action not available");
                return false;
            }

            let gameTree = this.database.games[this.channelId];
            if (!gameTree) return;

            let r = gameTree.tryPlay(x, y);
            switch (r as Models.GameMoveError) {
                case Models.GameMoveError.Success:
                    actions &= ~Models.GameActions.Move;
                    this.database.gameActions[this.channelId] = actions;
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
