namespace Views {
    export class ChatMemberList extends Framework.Elements.DataBoundList<Models.UserInfo, HTMLLIElement> {
        createdCallback() {
            super.createdCallback();

            this.bind([ { key: "Bobby", name: "Bobby" },
                        { key: "Fred", name: "Fred" },
                        { key: "Grunt", name: "Grunt" },
                        { key: "Loopy", name: "Loopy" },
                        { key: "Dude", name: "Dude" } ]);

            this.bind([ { key: "Dude", name: "Dude" },
                        { key: "NEUE", name: "NEUE" },
                        { key: "Bobby", name: "Bobby" },
                        { key: "Fred", name: "Fred" },
                        { key: "Fred", name: "Fred2" },
                        { key: "GRUNT", name: "Grunt" },
                        { key: "Loopy", name: "Loopy" } ]);
        }

        protected createChild(datum: Models.UserInfo): HTMLLIElement {
            let element = document.createElement('li');
            element.setAttribute("data-kgs-user", datum.name);
            this.updateChild(datum, element);
            return element;
        }

        protected updateChild(datum: Models.UserInfo, element: HTMLLIElement): void {
            element.innerText = datum.name;
        }
    }
}
