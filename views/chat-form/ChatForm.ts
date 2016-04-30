namespace Views {
    export class ChatForm implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _messageList: Views.ChatMessageList;
        private _memberList: Views.ChatMemberList;
        private _form: HTMLFormElement;
        private _inputMessage: HTMLInputElement;

        public submitCallback: (form: ChatForm) => void;

        constructor() {
            this._div = document.createElement('div');
            this._div.className = 'chat-form';

            let wrapper = document.createElement('div');
            this._div.appendChild(wrapper);

            this._messageList = new Views.ChatMessageList();
            this._messageList.attach(wrapper);

            this._memberList = new Views.ChatMemberList();
            this._memberList.attach(wrapper);

            this._form = document.createElement('form');
            this._inputMessage = document.createElement('input');
            this._inputMessage.type = 'text';
            this._inputMessage.placeholder = 'send a message...';
            this._inputMessage.autocomplete = 'off';
            this._form.appendChild(this._inputMessage);

            this._div.appendChild(this._form);
            $(this._form).submit((e) => this.onFormSubmit(e));
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this._messageList.activate();
            this._memberList.activate();
        }
        public deactivate(): void {
            this._messageList.deactivate();
            this._memberList.deactivate();
        }

        public get message() { return this._inputMessage.value; }
        public set message(value: string) { this._inputMessage.value = value; }

        public get messageList(): Views.ChatMessageList {
            return this._messageList;
        }

        public get memberList(): Views.ChatMemberList {
            return this._memberList;
        }

        public focus() {
            $(this._inputMessage).focus();
        }

        private onFormSubmit(e: JQueryEventObject) {
            e.preventDefault();
            if (this.message.length == 0) return;
            if (this.submitCallback) this.submitCallback(this);
        }
    }
}
