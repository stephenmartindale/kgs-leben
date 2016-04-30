namespace Views {
    export class GameList implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _table: HTMLTableElement;

        public tableBody: Views.GameTableBody;

        constructor() {
            this._div = document.createElement('div');
            this._div.className = 'game-list';

            this._table = document.createElement('table');
            this._div.appendChild(this._table);

            this.tableBody = new Views.GameTableBody();
            this.tableBody.attach(this._table);
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this.tableBody.activate();
        }
        public deactivate(): void {
            this.tableBody.deactivate();
        }
    }
}
