namespace Views {
    export class SidebarContextList extends Framework.Elements.DataBoundList<Models.ContextDescriptor, HTMLLIElement> {
        createdCallback() {
            super.createdCallback();

            this.bind([{ key: 1, name: "English Game Room", contextClass: Models.ContextClass.Room },
                       { key: 2, name: "Active Games", contextClass: Models.ContextClass.List },
                       { key: 3, name: "Open Games", contextClass: Models.ContextClass.List },
                       { key: 4, name: "Sue", contextClass: Models.ContextClass.Conversation },
                       { key: 5, name: "Bob", contextClass: Models.ContextClass.Conversation },
                       { key: 6, name: "Fred", contextClass: Models.ContextClass.Game }]);
        }

        public static contextClassToCSS(contextClass: Models.ContextClass): string {
            switch (contextClass) {
                case Models.ContextClass.Room: return 'kgs-room';
                case Models.ContextClass.List: return 'kgs-list';
                case Models.ContextClass.Conversation: return 'kgs-conversation';
                case Models.ContextClass.Game: return 'kgs-game';
                default: return "";
            }
        }

        protected createChild(datum: Models.ContextDescriptor): HTMLLIElement {
            let element = document.createElement('li');
            element.setAttribute("data-kgs-channel-id", datum.key.toString());
            this.updateChild(datum, element);
            return element;
        }

        protected updateChild(datum: Models.ContextDescriptor, element: HTMLLIElement): void {
            element.innerText = datum.name;
            element.className = SidebarContextList.contextClassToCSS(datum.contextClass);
        }
    }
}
