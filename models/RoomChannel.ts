namespace Models {
    export class RoomChannel extends Models.Channel {
        description: string;
        owners: string[] = [];
        games: number[] = [];

        private: boolean;
        tournamentOnly: boolean;
        globalGamesOnly: boolean;

        constructor(channelId: number) {
            super(channelId, ChannelType.Room);
        }
    }
}
