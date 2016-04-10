/// <reference path="../ControllerBase.ts" />

namespace Controllers {
    export abstract class ChannelBase extends ControllerBase<ChannelController> {
        private _channelId: number;
        private _activated: boolean;

        private _chat: Views.ChatForm;

        constructor(parent: ChannelController, channelId: number) {
            super(parent);
            this._channelId = channelId;
            this._activated = false;
        }

        protected digest(digest: KGS.DataDigest) {
            if (this._activated) {
                if (digest.channelChat[this.channelId]) this.updateChatMessages();
                if (digest.channelUsers[this.channelId]) this.updateChatMembers();
            }
        }

        public get channelId(): number {
            return this._channelId;
        }

        public get channel(): Models.Channel {
            return this.database.channels[this._channelId];
        }

        public activate(): boolean {
            if (this._activated) return false;

            if (this._chat != null) {
                this.application.layout.showSidebar(this._chat);
            }

            this._activated = true;

            this.updateChatMessages();
            this.updateChatMembers();

            return true;
        }

        public deactivate(): boolean {
            if (!this._activated) return false;
            this._activated = false;
            return true;
        }

        public get activated(): boolean {
            return this._activated;
        }

        public get chat(): Views.ChatForm {
            return this._chat;
        }

        protected initialiseChat() {
            this._chat = document.createElement('chat-form') as Views.ChatForm;
            this._chat.submitCallback = (form) => this.submitChatMessage(form);
        }

        private updateChatMessages() {
            if ((!this._activated) || (this._chat == null)) return;
            this._chat.messageList.update(this.channel.chats);
        }
        private updateChatMembers() {
            if ((!this._activated) || (this._chat == null)) return;
            this._chat.memberList.update(this.database.users, this.channel.users);
        }

        private submitChatMessage(chatForm: Views.ChatForm) {
            let text = chatForm.message;
            if ((text) && (text.length > 0) && (text.length <= KGS.Upstream._CHAT_MaxLength)) {
                this.client.post(<KGS.Upstream.CHAT>{
                    type: KGS.Upstream._CHAT,
                    channelId: this._channelId,
                    text:text
                });

                chatForm.message = "";
                chatForm.focus();
            }
        }
    }
}
