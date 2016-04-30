namespace Views {
    export class ChatMessageList extends Views.DataBoundList<Models.Chat, HTMLUListElement, HTMLLIElement> {
        private _updateDateTime: number;

        private _onResize: (e: UIEvent) => void;

        constructor() {
            super(document.createElement('ul'));
            this.container.className = 'chat-message-list';

            this._onResize = (e: UIEvent) => this.scrollToEnd();
        }

        public activate(): void {
            window.addEventListener("resize", this._onResize);
            super.activate();
        }
        public deactivate(): void {
            super.deactivate();
            window.removeEventListener("resize", this._onResize);
        }

        public update(chats: Models.Chat[]) {
            this._updateDateTime = new Date().getTime();

            this.bindArray(chats);
            this.scrollToEnd();
        }

        private updateInfoSpan(datum: Models.Chat, span: HTMLSpanElement) {
            let receivedTime = datum.received.getTime();

            let minutes: number = (this._updateDateTime - receivedTime) / 60000;
            if (minutes < 5)
                span.innerText = "minutes ago";
            else if (minutes < 60)
                span.innerText = "within the hour";
            else if (minutes < 1440)
                span.innerText = "today";
            else if (minutes < 2880)
                span.innerText = "yesterday";
            else
                span.innerText = "long ago";

            if (!span.title) span.title = new Date(receivedTime - datum.received.getTimezoneOffset() * 60000).toISOString().replace("T", " ").substring(0, 16);
        }

        private buildInfoTitle(datum: Models.Chat): string {
            return new Date(datum.received.getTime() - datum.received.getTimezoneOffset() * 60000).toISOString().replace("T", " ").substring(0, 16);
        }

        protected createChild(key: string, datum: Models.Chat): HTMLLIElement {
            let senderName = document.createElement('span');
            senderName.innerText = datum.sender;

            let messageInfo = document.createElement('span');
            messageInfo.className = 'secondary';
            this.updateInfoSpan(datum, messageInfo);

            let paragraph = document.createElement('p');
            paragraph.innerText = datum.text;

            let listItem = document.createElement('li');
            listItem.appendChild(senderName);
            listItem.appendChild(messageInfo);
            listItem.appendChild(paragraph);
            return listItem;
        }

        protected updateChild(key: string, datum: Models.Chat, element: HTMLLIElement): void {
            let spans = element.getElementsByTagName('span');
            this.updateInfoSpan(datum, spans[1]);
        }

        private scrollToEnd() {
            if (this.container.lastElementChild) (<HTMLElement>this.container.lastElementChild).scrollIntoView(false);
        }
    }
}
