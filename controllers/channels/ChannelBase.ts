/// <reference path="../ViewControllerBase.ts" />

namespace Controllers {
    export abstract class ChannelBase extends ViewControllerBase<ChannelController> {
        public channelId: number;

        constructor(parent: ChannelController, channelId: number) {
            super(parent);
            this.channelId = channelId;
        }

        public get channel(): Models.Channel {
            return this.database.channels[this.channelId];
        }

        protected initialiseGameList() {
            let gameList = new Views.GameList();
            gameList.tableBody.userDataSource = (name) => this.database.users[name];
            gameList.tableBody.selectionCallback = (cid) => this.parent.joinChannel(cid);

            this.registerView(gameList, LayoutZone.Main, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channelGames[this.channelId])) {
                    gameList.tableBody.update(this.database.channels as { [key: string]: Models.GameChannel }, (<Models.RoomChannel>this.channel).games);
                }
            });
        }

        protected initialiseChat() {
            let chat = new Views.ChatForm();
            chat.submitCallback = (form) => this.submitChatMessage(form);

            this.registerView(chat, LayoutZone.Sidebar, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.channelChat[this.channelId])) {
                    chat.messageList.update(this.channel.chats);
                }
                if ((digest == null) || (digest.channelUsers[this.channelId])) {
                    chat.memberList.update(this.database.users, this.channel.users);
                }
            });
        }

        private submitChatMessage(chatForm: Views.ChatForm) {
            let text = chatForm.message;
            if ((text) && (text.length > 0) && (text.length <= KGS.Upstream._CHAT_MaxLength)) {
                this.client.post(<KGS.Upstream.CHAT>{
                    type: KGS.Upstream._CHAT,
                    channelId: this.channelId,
                    text:text
                });

                chatForm.message = "";
                chatForm.focus();
            }
        }
    }
}
