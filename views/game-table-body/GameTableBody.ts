namespace Views {
    export class GameTableBody extends Framework.DataBoundTableSection<Models.GameChannel, HTMLTableRowElement> {
        public selectionCallback: (channelId: number) => void;

        createdCallback() {
            super.createdCallback();
        }

        public update(gameChannels: { [key: string]: Models.GameChannel }, keys: number[], selectionCallback: (channelId: number) => void) {
            this.selectionCallback = selectionCallback;
            this.bindDictionary(gameChannels, keys);
        }

        protected createChild(key: string, datum: Models.GameChannel): HTMLTableRowElement {
            let element = document.createElement('tr');
            element.onclick = () => { if (this.selectionCallback) this.selectionCallback(datum.channelId); };

            let gameTypeDomain = document.createElement('td');
            gameTypeDomain.appendChild(document.createElement('span'));
            gameTypeDomain.appendChild(document.createElement('span'));
            element.appendChild(gameTypeDomain);                // [0] Game Type & Sub-Type

            element.appendChild(document.createElement('td'));  // [1] White Player
            element.appendChild(document.createElement('td'));  // [2] Black Player
            element.appendChild(document.createElement('td'));  // [3] Board Size
            element.appendChild(document.createElement('td'));  // [4] Move Number
            element.appendChild(document.createElement('td'));  // [5] Comments et al.

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: Models.GameChannel, element: HTMLTableRowElement): void {
            let domains = element.getElementsByTagName('td');
            let typeSpans = domains[0].getElementsByTagName('span');
            typeSpans[0].innerText = datum.displayType;
            typeSpans[1].innerText = datum.displaySubType;

            domains[1].innerText = (datum.playerWhite != null)? datum.playerWhite : "";
            domains[2].innerText = (datum.playerBlack != null)? datum.playerBlack : "";
            domains[3].innerText = datum.displaySize;
            domains[4].innerText = (datum.moveNumber != null)? "move " + datum.moveNumber.toString() : "";
            domains[5].innerText = (datum.name != null)? datum.name : "";
        }
    }
}
