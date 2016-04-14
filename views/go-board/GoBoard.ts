namespace Views {
    export class GoBoard extends HTMLElement {
        private _div: HTMLDivElement;
        private _board: WGo.Board;
        private _size: number;
        private _position: Models.GamePosition;

        createdCallback() {
            this._div = document.createElement('div');
            this.appendChild(this._div);
        }

        attachedCallback() {
            if (null == this._board) {
                if (!this._size) this._size = 19;
                this._board = new WGo.Board(this._div, {
                    size: this._size,
                    width: 800,
                    background: '/images/wood.jpg'
                });

                if (this._position != null) this.updatePosition(null, this._position);
            }
        }

        public get size(): number {
            return this._size;
        }
        public set size(value: number) {
            if (!Models.GamePosition.validateSize(value)) throw "Board Size out of range";
            if (value != this._size) {
                this._size = value;
                this._position = null;

                if (this._board) {
                    this._board.setSize(value);
                }
            }
        }

        public clear() {
            if (this._board != null) {
                this._board.removeAllObjects();
            }
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
                if (this._board != null) {
                    if (this._board.size != position.size) {
                        this._board.setSize(position.size);
                        this.updatePosition(null, position);
                    }
                    else this.updatePosition(this._position, new Models.GamePosition(position));
                }
            }
            else {
                this.clear();
                this._position = null;
            }
        }
    }
}
