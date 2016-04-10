namespace Views {
    export class ChatMessageList extends Framework.DataBoundList<Models.Chat, HTMLLIElement> {
        private _updateDateTime: number;

        createdCallback() {
            super.createdCallback();
        }

        public update(chats: Models.Chat[]) {
            this._updateDateTime = new Date().getTime();

            this.bindArray(chats);
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
    }
}
