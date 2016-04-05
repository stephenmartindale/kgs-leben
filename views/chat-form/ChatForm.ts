namespace Views {
    export class ChatForm extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _messageList: HTMLUListElement;

        private _onResize: (e: UIEvent) => void;

        createdCallback() {
            this.appendChild(ChatForm._template.content.cloneNode(true));

            this._messageList = this.querySelector("ul.chat-messages") as HTMLUListElement;

            this._onResize = (e: UIEvent) => this.onResize(e);
        }

        private onResize(e: UIEvent) {
            if (this._messageList.lastElementChild) (<HTMLElement>this._messageList.lastElementChild).scrollIntoView(false);
        }

        attachedCallback() {
            window.addEventListener("resize", this._onResize);
        }

        detachedCallback() {
            window.removeEventListener("resize", this._onResize);
        }
    }
}
