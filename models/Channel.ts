namespace Models {
    export abstract class Channel {
        channelId: number;
        channelType: Models.ChannelType;

        owners: string[] = [];
        users: string[] = [];
        chats: Models.Chat[] = [];

        name: string;

        constructor(channelId: number, channelType: Models.ChannelType) {
            this.channelId = channelId;
            this.channelType = channelType;
            this.name = "Channel #" + channelId.toString();
        }

        public static createChannel(channelId: number, channelType: Models.ChannelType): Channel {
            switch (channelType) {
                case ChannelType.Room: return new RoomChannel(channelId);
                case ChannelType.Game: return new GameChannel(channelId);
            }

            throw "Unknown or unsupported channel type: " + channelType.toString();
        }

        public syncOwners(owners: KGS.User[]): boolean {
            let ownerNames: string[] = new Array(owners.length);
            for (let i = 0; i < owners.length; ++i) {
                ownerNames[i] = owners[i].name;
            }

            return Utils.setSync(this.owners, ownerNames);
        }

        public mergeUsers(users: KGS.User[]): boolean {
            let touch: boolean = false;
            for (let i = 0; i < users.length; ++i) {
                if (Utils.setAdd(this.users, users[i].name)) touch = true;
            }
            return touch;
        }

        public appendChat(message: KGS.Downstream.CHAT, importance: Models.ChatImportance, timestamp: Date): boolean {
            this.chats.push({
                sender: message.user.name,
                text: message.text,
                importance: importance,
                received: timestamp
            });

            return true;
        }
    }
}
