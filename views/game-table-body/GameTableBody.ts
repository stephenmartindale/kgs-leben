/// <reference path="../DataBoundList.ts" />
namespace Views {
    export class GameTableBody extends Views.DataBoundList<Models.GameChannel, HTMLTableSectionElement, HTMLTableRowElement> {
        public userDataSource: (name: string) => Models.User;
        public selectionCallback: (channelId: number) => void;

        constructor() {
            super(document.createElement('tbody'));
        }

        public update(gameChannels: { [key: string]: Models.GameChannel }, keys: number[]) {
            this.bindDictionary(gameChannels, keys);
        }

        protected createChild(key: string, datum: Models.GameChannel): HTMLTableRowElement {
            let element = document.createElement('tr');
            element.onclick = () => { if (this.selectionCallback) this.selectionCallback(datum.channelId); };

            let gameTypeDomain = document.createElement('td');
            gameTypeDomain.appendChild(document.createElement('span'));
            let gameSubTypeSpan = document.createElement('span');
            gameSubTypeSpan.className = 'secondary';
            gameTypeDomain.appendChild(gameSubTypeSpan);
            element.appendChild(gameTypeDomain);                // [0] Game Type & Sub-Type

            let strongerPlayerDomain = document.createElement('td');
            strongerPlayerDomain.appendChild(document.createElement('span'));
            let strongerPlayerRankSpan = document.createElement('span');
            strongerPlayerRankSpan.className = 'secondary';
            strongerPlayerDomain.appendChild(strongerPlayerRankSpan);
            element.appendChild(strongerPlayerDomain);          // [1] Stronger Player

            let weakerPlayerDomain = document.createElement('td');
            weakerPlayerDomain.appendChild(document.createElement('span'));
            let weakerPlayerRankSpan = document.createElement('span');
            weakerPlayerRankSpan.className = 'secondary';
            weakerPlayerDomain.appendChild(weakerPlayerRankSpan);
            element.appendChild(weakerPlayerDomain);            // [2] Weaker Player

            element.appendChild(document.createElement('td'));  // [3] Board Size

            let gamePhaseDomain = document.createElement('td');
            let gamePhaseSpan = document.createElement('span');
            gamePhaseSpan.className = 'secondary';
            gamePhaseDomain.appendChild(gamePhaseSpan);
            gamePhaseDomain.appendChild(document.createElement('span'));
            element.appendChild(gamePhaseDomain);               // [4] Move Number and Game Phase

            element.appendChild(document.createElement('td'));  // [5] Comments et al.

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: Models.GameChannel, element: HTMLTableRowElement): void {
            let domains = element.getElementsByTagName('td');
            let typeSpans = domains[0].getElementsByTagName('span');
            typeSpans[0].innerText = datum.displayType;
            typeSpans[1].innerText = datum.displaySubType;

            if (datum.restrictedPlus) typeSpans[1].className = 'secondary fa-plus';
            else if (datum.restrictedPrivate) typeSpans[1].className = 'secondary fa-lock';
            else typeSpans[1].className = 'secondary';

            let playersSwapped: boolean = false;
            let whitePlayer: Models.User = (datum.playerWhite != null)? this.userDataSource(datum.playerWhite) : null;
            let whitePlayerSpans = domains[1].getElementsByTagName('span');
            if (whitePlayer) {
                whitePlayerSpans[0].className = (!playersSwapped)? 'fa-circle' : 'fa-circle-o';
                whitePlayerSpans[0].innerText = whitePlayer.name;
                whitePlayerSpans[1].innerText = whitePlayer.rank;
            }
            else {
                whitePlayerSpans[0].className = '';
                whitePlayerSpans[0].innerText = '';
                whitePlayerSpans[1].innerText = '';
            }

            let blackPlayer: Models.User = (datum.playerBlack != null)? this.userDataSource(datum.playerBlack) : null;
            let blackPlayerSpans = domains[2].getElementsByTagName('span');
            if (blackPlayer) {
                blackPlayerSpans[0].className = (!playersSwapped)? 'fa-circle-o' : 'fa-circle';
                blackPlayerSpans[0].innerText = blackPlayer.name;
                blackPlayerSpans[1].innerText = blackPlayer.rank;
            }
            else {
                blackPlayerSpans[0].className = '';
                blackPlayerSpans[0].innerText = '';
                blackPlayerSpans[1].innerText = '';
            }

            domains[3].innerText = datum.displaySize;

            let gamePhaseSpans = domains[4].getElementsByTagName('span');
            if ((datum.phase == Models.GamePhase.Active) && (datum.moveNumber != null)) {
                gamePhaseSpans[0].innerText = "move";
                gamePhaseSpans[1].innerText = datum.moveNumber.toString();
            }
            else if (datum.phase == Models.GamePhase.Paused) {
                gamePhaseSpans[0].innerText = "paused";
                gamePhaseSpans[1].innerText = (datum.moveNumber != null)? datum.moveNumber.toString() : "";
            }
            else if (datum.phase == Models.GamePhase.Adjourned) {
                gamePhaseSpans[0].innerText = "adjourned";
                gamePhaseSpans[1].innerText = (datum.moveNumber != null)? datum.moveNumber.toString() : "";
            }
            else if (datum.phase == Models.GamePhase.Concluded) {
                gamePhaseSpans[0].innerText = "";
                gamePhaseSpans[1].innerText = (datum.result != null)? datum.result.getShortFormat() : "";
            }
            else {
                gamePhaseSpans[0].innerText = "";
                gamePhaseSpans[1].innerText = "";
            }
        }
    }
}
