/// <reference path="../View.ts" />
namespace Views {
    export class GoBoard extends Views.View<HTMLDivElement> {
        private static _defaultSize: number = 19;
        private _size: number;
        private _maxWidth: number;
        private _playerMinWidth: number;
        private _playerMinHeight: number;
        private _debounceWidth: number = 28;
        private _layoutPortrait: boolean;

        private _flexRoot: JQuery;
        private _goban: JQuery;

        private _board: WGo.Board;
        private _drawHandlers: GoBoardDrawHandlers = new GoBoardDrawHandlers();
        private _position: Models.GamePosition;

        public playerAway: Views.GoBoardPlayer;
        public playerHome: Views.GoBoardPlayer;

        public playCallback: (x: number, y: number) => void;

        private _resultOverlay: HTMLDivElement;
        private _resultHeading: HTMLHeadingElement;

        constructor(size?: number) {
            super(Templates.cloneTemplate<HTMLDivElement>('go-board'));

            this._size = (size || GoBoard._defaultSize);
            this.root.classList.add('go-' + this._size.toString());

            let flexRoot = this.root.querySelector('.flex-absolute');
            this._flexRoot = $(flexRoot);

            let teamAway = flexRoot.querySelector('.team-away') as HTMLElement;
            this.playerAway = new Views.GoBoardPlayer(Models.PlayerTeam.Away);
            this.playerAway.attach(teamAway);

            let goban = flexRoot.querySelector('.goban') as HTMLElement;
            this._goban = $(goban);
            this._board = new WGo.Board(goban, { size: this._size, background: '/img/wood.jpg' });

            let teamHome = flexRoot.querySelector('.team-home') as HTMLElement;
            this.playerHome = new Views.GoBoardPlayer(Models.PlayerTeam.Home);
            this.playerHome.attach(teamHome);

            this._resultOverlay = this.root.querySelector('.result-overlay') as HTMLDivElement;
            this._resultHeading = this._resultOverlay.querySelector('h3') as HTMLHeadingElement;
        }

        public activate(): void {
            this.optimiseBoard();
            window.addEventListener("resize", this._onResize);
            this._board.addEventListener("click", this._onBoardClick);

            this.playerHome.activate();
            this.playerAway.activate();
            super.activate();
        }
        public deactivate(): void {
            super.deactivate();
            this._board.removeEventListener("click", this._onBoardClick);
            window.removeEventListener("resize", this._onResize);

            this.playerAway.deactivate();
            this.playerHome.deactivate();
        }

        private optimiseBoard() {
            // Read Style Sheet defaults if necessary
            if (this._maxWidth == null) this._maxWidth = parseFloat(this._goban.css('max-width'));
            if (this._playerMinWidth == null) this._playerMinWidth = parseFloat(this._flexRoot.find('.go-board-player').css('min-width'));
            if (this._playerMinHeight == null) this._playerMinHeight = parseFloat(this._flexRoot.find('.go-board-player').css('min-height'));

            // Layout calculations
            let landscapeWidth: number = this.calculateBoardWidth(false);
            let portraitWidth: number = this.calculateBoardWidth(true);

            // Choose best layout
            if (this._layoutPortrait == null) {
                this._layoutPortrait = (portraitWidth > landscapeWidth);
            }
            else if ((this._layoutPortrait) && (landscapeWidth > (portraitWidth + this._debounceWidth))) {
                this._layoutPortrait = false;
            }
            else if ((!this._layoutPortrait) && (portraitWidth > (landscapeWidth + this._debounceWidth))) {
                this._layoutPortrait = true;
            }

            // Adjust the Flex-Box layout
            let boardWidth: number;
            if (this._layoutPortrait) {
                // Portrait
                boardWidth = portraitWidth;
                this.root.classList.add('portrait');
                this.root.classList.remove('landscape');
                this._flexRoot.css('height', "");
                this._flexRoot.css('width', boardWidth);
            }
            else {
                // Landscape
                boardWidth = landscapeWidth;
                this.root.classList.remove('portrait');
                this.root.classList.add('landscape');
                this._flexRoot.css('height', boardWidth);
                this._flexRoot.css('width', "");
            }

            this._goban.css('flex-basis', boardWidth);
            this._board.setWidth(boardWidth);
        }

        private calculateBoardWidth(portrait: boolean): number {
            let parent: HTMLElement = this.parent;
            let x = parent.offsetWidth;
            if (!portrait) x -= 2 * this._playerMinWidth;
            if (x > this._maxWidth) x = this._maxWidth;

            let y = parent.offsetHeight;
            if (portrait) y -= 2 * this._playerMinHeight;
            if (y > this._maxWidth) y = this._maxWidth;

            return (x < y)? x : y;
        }

        private _onResize = (e: UIEvent) => {
            this.optimiseBoard();
        }

        private _onBoardClick = (x: number, y: number) => {
            if (Utils.logEnabled(Utils.LogSeverity.Debug)) {
                let coordinateString = "(" + x.toString() + ", " + y.toString() + ")";
                let coordinateObject = { x: x, y: y };
                let stoneColour: string;
                if (this._position) {
                    let stone = this._position.stone(x, y);
                    if (stone == Models.GameStone.White) stoneColour = "white";
                    else if (stone == Models.GameStone.Black) stoneColour = "black";
                }

                Utils.log(Utils.LogSeverity.Debug, coordinateString, coordinateObject, stoneColour);
            }

            if (this.playCallback) this.playCallback(x, y);
        }

        public get size() {
            return this._size;
        }

        public clear() {
            this._board.removeAllObjects();
            this._position = null;
        }

        private applyPositionChange(change: Models.GamePositionChange, blackBit: number, whiteBit: number, type: WGo.BoardDrawHandler | string) {
            if ((change.set & blackBit) == blackBit) {
                this._board.addObject(<WGo.BoardObject>{ x: change.x, y: change.y, c: WGo.B, type: type });
            }
            else if ((change.set & whiteBit) == whiteBit) {
                this._board.addObject(<WGo.BoardObject>{ x: change.x, y: change.y, c: WGo.W, type: type });
            }
            else if ((change.unset & (blackBit | whiteBit)) != 0) {
                this._board.removeObject(<WGo.BoardRemoveObject>{ x: change.x, y: change.y, type: type });
            }
        }

        private updateBoardPosition(oldPosition: Models.GamePosition, position: Models.GamePosition) {
            let changes = position.diff(oldPosition);
            for (let i = 0; i < changes.length; ++i) {
                let change = changes[i];

                this.applyPositionChange(change, Models.GameMarks.BlackStone, Models.GameMarks.WhiteStone, "SHELL");
                this.applyPositionChange(change, Models.GameMarks.BlackTerritory, Models.GameMarks.WhiteTerritory, this._drawHandlers.moku);
            }

            this._position = position;
        }

        public updateBoard(position: Models.GamePosition) {
            if (position != null) {
                if (this._size != position.size) {
                    this._size = position.size;
                    this._board.setSize(position.size);
                    if (this.activated) {
                        this.optimiseBoard();
                    }

                    this.updateBoardPosition(null, position);
                }
                else this.updateBoardPosition(this._position, new Models.GamePosition(position));
            }
            else this.clear();
        }

        public updateOverlay(gameChannel: Models.GameChannel, userColour: Models.GameStone) {
            if (gameChannel.phase == Models.GamePhase.Active) {
                this._resultOverlay.classList.add('hidden');
            }
            else {
                let className = 'result-overlay';
                let headline: string;

                switch (gameChannel.phase) {
                    case Models.GamePhase.Adjourned: headline = "Adjourned"; break;
                    case Models.GamePhase.Paused: headline = "Paused"; break;
                    default:
                        if (gameChannel.result) {
                            headline = gameChannel.result.getHeadline(userColour, gameChannel.playerWhite, gameChannel.playerBlack);
                            if ((userColour != null) && (gameChannel.result.victor != null)) {
                                if (gameChannel.result.victor == userColour) {
                                    className += ' victory';
                                }
                                else {
                                    className += ' defeat';
                                }
                            }
                        }
                        else headline = "unknown result";
                        break;
                }

                this._resultOverlay.className = className;
                this._resultHeading.innerText = headline;
            }
        }
    }

    class GoBoardDrawHandlers {
        public moku: WGo.BoardDrawHandler = {
            stone: this.wrapDrawFunction((ctx: CanvasRenderingContext2D, args: WGo.BoardDrawHandlerArgs, board: WGo.Board) => {
                let xr = board.getX(args.x);
                let yr = board.getY(args.y);
                let sr = board.stoneRadius * 0.4;

                ctx.beginPath();

                if (args.c == WGo.W) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                }
                else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                }

                ctx.arc(xr - board.ls, yr - board.ls, Math.max(0, sr - 0.5), 0, 2 * Math.PI, true);
                ctx.fill();
            })
        };

        private wrapDrawFunction(handler: (ctx: CanvasRenderingContext2D, args: WGo.BoardDrawHandlerArgs, board: WGo.Board) => void): WGo.BoardDrawObject {
            return {
                draw: function (args: WGo.BoardDrawHandlerArgs, board: WGo.Board) {
                    handler((<CanvasRenderingContext2D>this), args, board);
                }
            }
        }
    }
}
