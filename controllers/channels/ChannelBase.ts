/// <reference path="../ControllerBase.ts" />

namespace Controllers {
    export abstract class ChannelBase extends ControllerBase<ChannelController> {
        private _channelId: number;
        private _activated: boolean;

        private _views: { view: Views.View<any>, zone: Controllers.LayoutZone, update: (channelId: number, digest?: KGS.DataDigest) => void }[];

        constructor(parent: ChannelController, channelId: number) {
            super(parent);
            this._channelId = channelId;
            this._activated = false;
            this._views = [];
        }

        protected registerView(view: Views.View<any>, zone: Controllers.LayoutZone, update: (channelId: number, digest?: KGS.DataDigest) => void) {
            this._views.push({ view: view, zone: zone, update: update });
        }

        protected digest(digest: KGS.DataDigest) {
            if (this._activated) {
                for (let j = 0; j < this._views.length; ++j) {
                    this._views[j].update(this._channelId, digest);
                }
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

            for (let j = 0; j < this._views.length; ++j) {
                this.application.layout.showView(this._views[j].view, this._views[j].zone);
                this._views[j].update(this._channelId);
            }

            this._activated = true;
            return true;
        }

        public deactivate(): boolean {
            if (!this._activated) return false;

            this.application.layout.clearMain();
            this.application.layout.clearSidebar();

            this._activated = false;
            return true;
        }

        public detach() {
            this.deactivate();
            super.detach();
        }

        public get activated(): boolean {
            return this._activated;
        }

        protected initialiseGameList() {
            let gameList = new Views.GameList();
            gameList.tableBody.userDataSource = (name) => this.database.users[name];
            gameList.tableBody.selectionCallback = (cid) => this.parent.joinChannel(cid);

            this.registerView(gameList, LayoutZone.Main, (channelId: number, digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channelGames[channelId])) {
                    gameList.tableBody.update(this.database.channels as { [key: string]: Models.GameChannel }, (<Models.RoomChannel>this.channel).games);
                }
            });
        }

        protected initialiseChat() {
            let chat = new Views.ChatForm();
            chat.submitCallback = (form) => this.submitChatMessage(form);

            this.registerView(chat, LayoutZone.Sidebar, (channelId: number, digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channelChat[channelId])) {
                    chat.messageList.update(this.channel.chats);
                }
                if ((digest == null) || (digest.channelUsers[channelId])) {
                    chat.memberList.update(this.database.users, this.channel.users);
                }
            });
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
