namespace Views {
    export class GoBoard implements Views.View<HTMLDivElement> {
        private _size: number;
        private _maxWidth: number;
        private _playerMinWidth: number;
        private _playerMinHeight: number;
        private _debounceWidth: number = 28;
        private _layoutPortrait: boolean;

        private _parent: HTMLElement;
        private _root: JQuery;
        private _goban: JQuery;

        private _activated: boolean;
        private _board: WGo.Board;
        private _position: Models.GamePosition;

        public playCallback: (x: number, y: number) => void;

        constructor(size?: number) {
            this._size = size || 19;

            this._root = $(Views.Templates.cloneTemplate('go-board'));
            this._root.addClass("go-" + this._size.toString());

            this._goban = this._root.find('.goban');
            this._board = new WGo.Board(this._goban[0], { size: this._size, background: '/img/wood.jpg' });
        }

        public attach(parent: HTMLElement): void {
            this._parent = parent;
            parent.appendChild(this._root[0]);
        }

        public activate(): void {
            this.optimiseBoard();
            window.addEventListener("resize", this._onResize);
            this._board.addEventListener("click", this._onBoardClick);
            this._activated = true;
        }
        public deactivate(): void {
            this._activated = false;
            this._board.removeEventListener("click", this._onBoardClick);
            window.removeEventListener("resize", this._onResize);
        }

        private optimiseBoard() {
            // Read Style Sheet defaults if necessary
            if (this._maxWidth == null) this._maxWidth = parseFloat(this._goban.css('max-width'));
            if (this._playerMinWidth == null) this._playerMinWidth = parseFloat(this._root.find('.player').css('min-width'));
            if (this._playerMinHeight == null) this._playerMinHeight = parseFloat(this._root.find('.player').css('min-height'));

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
                this._root.addClass('portrait');
                this._root.removeClass('landscape');
                this._root.css('height', "");
                this._root.css('width', boardWidth);
            }
            else {
                // Landscape
                boardWidth = landscapeWidth;
                this._root.removeClass('portrait');
                this._root.addClass('landscape');
                this._root.css('height', boardWidth);
                this._root.css('width', "");
            }

            this._goban.css('flex-basis', boardWidth);
            this._board.setWidth(boardWidth);
        }

        private calculateBoardWidth(portrait: boolean): number {
            let x = this._parent.offsetWidth;
            if (!portrait) x -= 2 * this._playerMinWidth;
            if (x > this._maxWidth) x = this._maxWidth;

            let y = this._parent.offsetHeight;
            if (portrait) y -= 2 * this._playerMinHeight;
            if (y > this._maxWidth) y = this._maxWidth;

            return (x < y)? x : y;
        }

        private _onResize = (e: UIEvent) => {
            if (this._activated) this.optimiseBoard();
        }

        private _onBoardClick = (x: number, y: number) => {
            if ((this._activated) && (this.playCallback)) this.playCallback(x, y);
        }

        public get size() {
            return this._size;
        }

        public clear() {
            this._board.removeAllObjects();
            this._position = null;
        }

        private updatePosition(oldPosition: Models.GamePosition, position: Models.GamePosition) {
            let changes = position.diff(oldPosition);
            for (let i = 0; i < changes.length; ++i) {
                if (changes[i].add != null)
                    this._board.addObject({ x: changes[i].x, y: changes[i].y, c: changes[i].add });
                else if (changes[i].remove != null)
                    this._board.removeObject({ x: changes[i].x, y: changes[i].y });
            }

            this._position = position;
        }

        public update(position: Models.GamePosition) {
            if (position != null) {
                if (this._size != position.size) {
                    this._size = position.size;
                    this._board.setSize(position.size);
                    if (this._activated) {
                        this.optimiseBoard();
                    }

                    this.updatePosition(null, position);
                }
                else this.updatePosition(this._position, new Models.GamePosition(position));
            }
            else this.clear();
        }
    }
}
