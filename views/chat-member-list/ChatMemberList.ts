namespace Views {
    export class ChatMemberList extends Framework.DataBoundList<Models.User, HTMLLIElement> {
        createdCallback() {
            super.createdCallback();
        }

        public update(users: { [name: string]: Models.User }, memberNames: string[]) {
            this.bindDictionary(users, memberNames);
        }

        protected createChild(key: string, datum: Models.User): HTMLLIElement {
            let element = document.createElement('li');
            element.appendChild(document.createElement('span'));

            let rankSpan = document.createElement('span');
            rankSpan.className = 'secondary';
            element.appendChild(rankSpan);

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: Models.User, element: HTMLLIElement): void {
            let spans = element.getElementsByTagName('span');
            spans[0].innerText = datum.name;
            spans[1].innerText = (datum.rank)? datum.rank : "";
        }
    }
}
