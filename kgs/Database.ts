namespace KGS {
    export interface DatabaseDictionary<T> {
        [key: string]: T,
        [key: number]: T
    }

    export class Database {
        public username: string;
        public joinedChannelIds: number[];

        public channelIds: number[];
        public channels: DatabaseDictionary<Models.Channel>;

        public users: { [name: string]: Models.User };
        public get userNames(): string[] { return Object.keys(this.users); }

        public games: DatabaseDictionary<Models.GameTree>;
    }

    class DatabaseInternal extends KGS.Database {
        constructor() {
            super();
            this.reinitialise();
        }

        public reinitialise() {
            this.username = null;
            this.joinedChannelIds = [];

            this.channelIds = [];
            this.channels = {};

            this.users = {};

            this.games = {};
        }

        public _createChannel(digest: KGS.DataDigest, channelId: number, channelType: Models.ChannelType): Models.Channel {
            let channel = this.channels[channelId];
            if (!channel) {
                channel = Models.Channel.createChannel(channelId, channelType);
                this.channelIds.push(channelId);
                this.channels[channelId] = channel;
                digest.touchChannel(channelId);
            }
            else if (channel.channelType != channelType) {
                throw "KGS Database: channel " + channelId.toString() + " has unexpected channel type: " + channel.channelType.toString() + " (expected: " + channelType.toString() + ")";
            }

            return channel;
        }

        public _requireChannel(channelId: number, channelType?: Models.ChannelType): Models.Channel {
            let channel = this.channels[channelId];
            if (!channel)
                throw "KGS Database: channel " + channelId.toString() + " not found";
            else if ((channelType != null) && (channel.channelType != channelType)) {
                throw "KGS Database: channel " + channelId.toString() + " has unexpected channel type: " + channel.channelType.toString() + " (expected: " + channelType.toString() + ")";
            }

            return channel;
        }

        public _updateUser(digest: KGS.DataDigest, user: KGS.User): Models.User {
            let record: Models.User = this.users[user.name];
            let touchUser: boolean = false;
            if (!record) {
                this.users[user.name] = record = new Models.User(user);
                touchUser = true;
            }
            else touchUser = record.mergeUser(user);

            if (touchUser) digest.touchUser(user.name);
            return record;
        }

        public _createGameTree(digest: KGS.DataDigest, channelId: number): Models.GameTree {
            let gameTree = this.games[channelId];
            if (!gameTree) {
                let gameChannel = this._requireChannel(channelId, Models.ChannelType.Game) as Models.GameChannel;
                if (gameChannel.size) gameTree = new Models.GameTree(gameChannel.size);
                else gameTree = new Models.GameTree();

                this.games[channelId] = gameTree;
                digest.touchGameTree(channelId);
            }

            return gameTree;
        }
    }

    export class _Database {
        private _database: DatabaseInternal;
        public database: KGS.Database;

        constructor() {
            $db = this.database = this._database = new DatabaseInternal();
            this.LOGOUT(null, null);
        }

        public LOGIN_SUCCESS = (digest: KGS.DataDigest, message: KGS.Downstream.LOGIN_SUCCESS) => {
            let you = this._database._updateUser(digest, message.you);
            if (you.name != this._database.username) {
                this._database.username = you.name;
                digest.username = true;
            }
        };

        public LOGOUT = (digest: KGS.DataDigest, message: KGS.Downstream.LOGOUT) => {
            this._database.reinitialise();
        };

        public ROOM_NAMES = (digest: KGS.DataDigest, message: KGS.Downstream.ROOM_NAMES) => {
            if (!message.rooms) return;
            for (let i = 0; i < message.rooms.length; ++i) {
                let room = message.rooms[i];
                let channel = this._database._createChannel(digest, room.channelId, Models.ChannelType.Room) as Models.RoomChannel;
                if (channel.mergeRoomName(room)) digest.touchChannel(room.channelId);
            }
        }

        public ROOM_DESC = (digest: KGS.DataDigest, message: KGS.Downstream.ROOM_DESC) => {
            let channel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Room) as Models.RoomChannel;

            if (channel.mergeRoomDescription(message.description)) digest.touchChannel(message.channelId);

            for (let i = 0; i < message.owners.length; ++i) {
                this._database._updateUser(digest, message.owners[i]);
            }

            if (channel.syncOwners(message.owners)) digest.touchChannelOwners(message.channelId);
        }

        public JOIN = (digest: KGS.DataDigest, message: KGS.Downstream.JOIN) => {
            let channelType = Models.Channel.predictChannelType(message);
            let channel = this._database._createChannel(digest, message.channelId, channelType);

            for (let i = 0; i < message.users.length; ++i) {
                let user = this._database._updateUser(digest, message.users[i]);
            }

            if (channel.mergeUsers(message.users)) digest.touchChannelUsers(message.channelId);

            if ((<Downstream.JOINRoom>message).games) {
                this.GAME_LIST(digest, <Downstream.JOINRoom>message);
            }

            if ((<Downstream.JOINGame>message).sgfEvents) {
                this.GAME_UPDATE(digest, <Downstream.JOINGame>message);
            }
        }

        public JOIN_COMPLETE = (digest: KGS.DataDigest, message: KGS.Downstream.JOIN_COMPLETE) => {
            let channel = this._database._requireChannel(message.channelId);
            if (Utils.setAdd(this._database.joinedChannelIds, channel.channelId)) {
                digest.joinedChannelIds = true;
                digest.touchChannel(message.channelId);
            }
        }

        public UNJOIN = (digest: KGS.DataDigest, message: KGS.Downstream.UNJOIN) => {
            if (Utils.setRemove(this._database.joinedChannelIds, message.channelId)) {
                delete this._database.games[message.channelId];
                digest.joinedChannelIds = true;
            }
        }

        public PRIVATE_KEEP_OUT = (digest: KGS.DataDigest, message: KGS.Downstream.PRIVATE_KEEP_OUT) => {
            if (!digest.joinFailedChannelIds) {
                digest.joinFailedChannelIds = [message.channelId];
            }
            else {
                digest.joinFailedChannelIds.push(message.channelId);
            }
        }

        public CHAT = (digest: KGS.DataDigest, message: KGS.Downstream.CHAT) => {
            this._database._updateUser(digest, message.user);
            let channel = this._database._requireChannel(message.channelId);
            if (channel.appendChat(message, Models.ChatImportance.Chat, digest.timestamp)) digest.touchChannelChat(message.channelId);
        }
        public ANNOUNCE = (digest: KGS.DataDigest, message: KGS.Downstream.ANNOUNCE) => {
            this._database._updateUser(digest, message.user);
            let channel = this._database._requireChannel(message.channelId);
            if (channel.appendChat(message, Models.ChatImportance.Announcement, digest.timestamp)) digest.touchChannelChat(message.channelId);
        }
        public MODERATED_CHAT = (digest: KGS.DataDigest, message: KGS.Downstream.MODERATED_CHAT) => {
            this._database._updateUser(digest, message.user);
            let channel = this._database._requireChannel(message.channelId);
            if (channel.appendChat(message, Models.ChatImportance.Moderated, digest.timestamp)) digest.touchChannelChat(message.channelId);
        }

        public USER_UPDATE = (digest: KGS.DataDigest, message: KGS.Downstream.USER_UPDATE) => {
            this._database._updateUser(digest, message.user);
        }

        public USER_ADDED = (digest: KGS.DataDigest, message: KGS.Downstream.USER_ADDED) => {
            let channel = this._database._requireChannel(message.channelId);
            let user = this._database._updateUser(digest, message.user);
            if (Utils.setAdd(channel.users, user.name)) digest.touchChannelUsers(message.channelId);
        }
        public USER_REMOVED = (digest: KGS.DataDigest, message: KGS.Downstream.USER_REMOVED) => {
            let channel = this._database._requireChannel(message.channelId);
            let user = this._database._updateUser(digest, message.user);
            if (Utils.setRemove(channel.users, user.name)) digest.touchChannelUsers(message.channelId);
        }

        public GAME_LIST = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_LIST) => {
            for (let i = 0; i < message.games.length; ++i) {
                let game = message.games[i];
                let parentChannel = this._database._requireChannel(game.roomId) as Models.RoomChannel;
                if (parentChannel.addGame(game.channelId)) digest.touchChannelGames(parentChannel.channelId);

                let gameChannel = this._database._createChannel(digest, game.channelId, Models.ChannelType.Game) as Models.GameChannel;
                if (gameChannel.mergeGameChannel(game)) digest.touchChannel(gameChannel.channelId);

                if (game.players) {
                    if (game.players.owner) {
                        this._database._updateUser(digest, game.players.owner);

                        if (gameChannel.syncOwners([game.players.owner])) digest.touchChannelOwners(gameChannel.channelId);
                    }

                    if (game.players.white) this._database._updateUser(digest, game.players.white);
                    if (game.players.black) this._database._updateUser(digest, game.players.black);
                }
            }
        }

        public GAME_CONTAINER_REMOVE_GAME = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_CONTAINER_REMOVE_GAME) => {
            let parentChannel = this._database._requireChannel(message.channelId) as Models.RoomChannel;
            if (parentChannel.removeGame(message.gameId)) digest.touchChannelGames(parentChannel.channelId);

            if (this._database.joinedChannelIds.indexOf(message.gameId) < 0) {
                Utils.setRemove(this._database.channelIds, message.gameId);
                delete this._database.channels[message.gameId];
            }
        }

        public GAME_UPDATE = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_UPDATE) => {
            if ((message.sgfEvents) && (message.sgfEvents.length > 0)) {
                let gameTree = this._database._createGameTree(digest, message.channelId);
                gameTree.processEvents(...message.sgfEvents);
                digest.touchGameTree(message.channelId);
            }
        }
    }
}

declare var $db: KGS.Database;
