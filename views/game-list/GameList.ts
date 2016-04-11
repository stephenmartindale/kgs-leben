namespace Views {
    export class GameList extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _tableBody: Views.GameTableBody;

        createdCallback() {
            this.appendChild(GameList._template.content.cloneNode(true));

            this._tableBody = this.querySelector('tbody') as Views.GameTableBody;
        }

        public update(gameChannels: { [key: string]: Models.GameChannel }, keys: number[], selectionCallback: (channelId: number) => void) {
            this._tableBody.update(gameChannels, keys, selectionCallback);
        }
    }
}
