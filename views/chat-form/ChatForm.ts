/// <reference path="../View.ts" />
namespace Views {
    export class ChatForm extends Views.View<HTMLDivElement> {
        private _messageList: Views.ChatMessageList;
        private _memberList: Views.ChatMemberList;
        private _form: HTMLFormElement;
        private _inputMessage: HTMLInputElement;

        public submitCallback: (form: ChatForm) => void;

        constructor() {
            super(Templates.createDiv('chat-form'));

            let wrapper = document.createElement('div');
            this.root.appendChild(wrapper);

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

            this.root.appendChild(this._form);
            $(this._form).submit((e) => this.onFormSubmit(e));
        }

        public activate(): void {
            this._messageList.activate();
            this._memberList.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
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
