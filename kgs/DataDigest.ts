namespace KGS {
    export class DataDigest {
        public timestamp: Date = new Date();
        public perfstamp: number = performance.now();

        public username: boolean = false;
        public joinedChannelIds: boolean = false;
        public joinFailedChannelIds: number[];
        public notifyChannelId: number;

        public channels: { [channelId: number]: boolean } = {};
        public touchChannel(channelId: number) { this.channels[channelId] = true; }

        public channelOwners: { [channelId: number]: boolean } = {};
        public touchChannelOwners(channelId: number) { this.channelOwners[channelId] = true; }
        public channelUsers: { [channelId: number]: boolean } = {};
        public touchChannelUsers(channelId: number) { this.channelUsers[channelId] = true; }
        public channelGames: { [channelId: number]: boolean } = {};
        public touchChannelGames(channelId: number) { this.channelGames[channelId] = true; }

        public channelChat: { [channelId: number]: boolean } = {};
        public touchChannelChat(channelId: number) { this.channelChat[channelId] = true; }

        public users: { [name: string]: boolean } = {};
        public touchUser(name: string) { this.users[name] = true; }

        public gameTrees: { [channelId: number]: boolean } = {};
        public touchGameTree(channelId: number) { this.gameTrees[channelId] = true; }
        public gameClocks: { [channelId: number]: boolean } = {};
        public touchGameClocks(channelId: number) { this.gameClocks[channelId] = true; }
        public gameActions: { [channelId: number]: boolean } = {};
        public touchGameActions(channelId: number) { this.gameActions[channelId] = true; }

        public automatch: boolean = false;
    }
}
