namespace KGS {
    export class DataDigest {
        public timestamp: Date = new Date();

        public username: boolean = false;
        public joinedChannelIds: boolean = false;

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

        private static hasKeys(obj: any): boolean {
            return ((obj != null) && (Object.keys(obj).length > 0));
        }
    }
}
