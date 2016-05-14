/// <reference path="../View.ts" />
namespace Views {
    export class GameList extends Views.View<HTMLDivElement> {
        private _table: HTMLTableElement;
        public tableBody: Views.GameTableBody;

        constructor() {
            super(Templates.createDiv('game-list'));

            this._table = document.createElement('table');
            this.root.appendChild(this._table);

            this.tableBody = new Views.GameTableBody();
            this.tableBody.attach(this._table);
        }

        public activate(): void {
            this.tableBody.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
            this.tableBody.deactivate();
        }
    }
}
