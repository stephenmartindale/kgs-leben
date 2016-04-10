namespace Models {
    export class GameChannel extends Models.Channel {
        parentChannelId: number;
        gameType: string;
        score: string;
        moveNumber: number;

        constructor(channelId: number) {
            super(channelId, ChannelType.Game);
        }
    }
}
