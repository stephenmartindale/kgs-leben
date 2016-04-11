namespace Models {
    export class RoomChannel extends Models.Channel {
        description: string;
        games: number[] = [];

        private: boolean;
        tournamentOnly: boolean;
        globalGamesOnly: boolean;

        constructor(channelId: number) {
            super(channelId, ChannelType.Room);
        }

        public mergeRoomName(room: KGS.Downstream.RoomName): boolean {
            let touch: boolean = false;
            if (this.name != room.name) { this.name = room.name; touch = true; }
            if (this.private != room.private) { this.private = room.private; touch = true; }
            if (this.tournamentOnly != room.tournOnly) { this.tournamentOnly = room.tournOnly; touch = true; }
            if (this.globalGamesOnly != room.globalGamesOnly) { this.globalGamesOnly = room.globalGamesOnly; touch = true; }
            return touch;
        }

        public mergeRoomDescription(description: string): boolean {
            if (this.description != description) {
                this.description = description;
                return true;
            }
            else return false;
        }

        public addGame(gameChannelId: number): boolean {
            return Utils.setAdd(this.games, gameChannelId);
        }
        public removeGame(gameChannelId: number): boolean {
            return Utils.setRemove(this.games, gameChannelId);
        }
    }
}
