namespace Views {
    export class ChatForm extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _defaultDisabled: boolean;
        private _disabled: boolean;

        private _form: HTMLFormElement;
        private _inputMessage: HTMLInputElement;
        private _messageList: Views.ChatMessageList;
        private _memberList: Views.ChatMemberList;

        public submitCallback: (form: ChatForm) => void;

        createdCallback() {
            this.appendChild(ChatForm._template.content.cloneNode(true));

            this._defaultDisabled = (this.getAttribute('disabled'))? true : false;

            this._form = this.querySelector('form') as HTMLFormElement;
            this._inputMessage = this._form.querySelector('input') as HTMLInputElement;
            this._messageList = this.querySelector("ul[is='chat-message-list']") as Views.ChatMessageList;
            this._memberList = this.querySelector("ul[is='chat-member-list']") as Views.ChatMemberList;



            $(this._form).submit((e) => this.onFormSubmit(e));

            this._disabled = false;
            this.disabled = this._defaultDisabled;
        }

        get defaultDisabled(): boolean {
            return this._defaultDisabled;
        }
        get disabled(): boolean {
            return this._disabled;
        }
        set disabled(value: boolean) {
            if (value != this._disabled) {
                $(this._inputMessage).prop("disabled", value);
                this._disabled = value;
            }
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
            if ((this._disabled) || (this.message.length == 0)) return;
            if (this.submitCallback) this.submitCallback(this);
        }
    }
}
