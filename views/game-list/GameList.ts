namespace Views {
    export class GameList extends HTMLElement {
        static _template: HTMLTemplateElement;

        public tableBody: Views.GameTableBody;

        createdCallback() {
            this.appendChild(GameList._template.content.cloneNode(true));

            this.tableBody = this.querySelector('tbody') as Views.GameTableBody;
        }
    }
}
