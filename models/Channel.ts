namespace Models {
    export abstract class Channel {
        channelId: number;
        channelType: Models.ChannelType;
        joined: boolean = false;

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
    }
}
