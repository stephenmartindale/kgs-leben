namespace Views {
    export class ChatMemberList extends Framework.DataBoundList<KGS.User, HTMLLIElement> {
        createdCallback() {
            super.createdCallback();
        }

        public update(users: { [name: string]: KGS.User }, memberNames: string[]) {
            this.bindDictionary(users, memberNames);
        }

        protected createChild(key: string, datum: KGS.User): HTMLLIElement {
            let element = document.createElement('li');
            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: KGS.User, element: HTMLLIElement): void {
            element.innerText = datum.name;
        }
    }
}
