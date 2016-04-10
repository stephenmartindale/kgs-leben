namespace KGS {
    export interface DatabaseDictionary<T> {
        [key: string]: T,
        [key: number]: T
    }

    export class Database {
        public username: string;
        public joinedChannelIds: number[] = [];

        public channelIds: number[] = [];
        public channels: DatabaseDictionary<Models.Channel> = {};

        public users: { [name: string]: KGS.User } = {};
        public get userNames(): string[] { return Object.keys(this.users); }
    }

    class DatabaseInternal extends KGS.Database {
        constructor() {
            super();
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

        public _receiveChat(digest: KGS.DataDigest, message: KGS.Downstream.CHAT, importance: Models.ChatImportance) {
            if (!message.user) return;
            let user = this._updateUser(digest, message.user);
            let channel = this._requireChannel(message.channelId);

            channel.chats.push({
                sender: user.name,
                text: message.text,
                importance: importance,
                received: digest.timestamp
            });
            digest.touchChannelChat(message.channelId);
        }

        public _updateUser(digest: KGS.DataDigest, user: KGS.User): KGS.User {
            let record = this.users[user.name];
            let touchUser: boolean = false;
            if (!record) {
                this.users[user.name] = user;
                touchUser = true;
            }
            else {
                if (record.name != user.name) { record.name = user.name; touchUser = true; }
                if (record.flags != user.flags) { record.flags = user.flags; touchUser = true; }
                if (record.rank != user.rank) { record.rank = user.rank; touchUser = true; }
            }

            if (touchUser) digest.touchUser(user.name);
            return user;
        }

        public static addUnique<T>(target: T[], value: T): boolean {
            if (target.lastIndexOf(value) < 0) {
                target.push(value);
                return true;
            }
            else return false;
        }
        public static removeFrom<T>(target: T[], value: T): boolean {
            let index = target.lastIndexOf(value);
            if (index < 0) return false;
            else {
                target.splice(index, 1);
                return true;
            }
        }
    }

    export class _Database {
        private _database: DatabaseInternal;
        public database: KGS.Database;

        constructor() {
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
            $db = this.database = this._database = new DatabaseInternal();
        };

        public ROOM_NAMES = (digest: KGS.DataDigest, message: KGS.Downstream.ROOM_NAMES) => {
            if (!message.rooms) return;
            for (let i = 0; i < message.rooms.length; ++i) {
                let room = message.rooms[i];
                let channel = this._database._createChannel(digest, room.channelId, Models.ChannelType.Room) as Models.RoomChannel;

                let touchChannel: boolean = false;
                if (channel.name != room.name) { channel.name = room.name; touchChannel = true; }
                if (channel.private != room.private) { channel.private = room.private; touchChannel = true; }
                if (channel.tournamentOnly != room.tournOnly) { channel.tournamentOnly = room.tournOnly; touchChannel = true; }
                if (channel.globalGamesOnly != room.globalGamesOnly) { channel.globalGamesOnly = room.globalGamesOnly; touchChannel = true; }
                if (touchChannel) digest.touchChannel(room.channelId);
            }
        }

        public ROOM_DESC = (digest: KGS.DataDigest, message: KGS.Downstream.ROOM_DESC) => {
            let channel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Room) as Models.RoomChannel;

            let touchChannel: boolean = false;
            if (channel.description != message.description) { channel.description = message.description; touchChannel = true; }
            if (touchChannel) digest.touchChannel(message.channelId);

            let touchChannelOwners: boolean = false;
            for (let i = 0; i < message.owners.length; ++i) {
                let user = this._database._updateUser(digest, message.owners[i]);
                if (DatabaseInternal.addUnique(channel.owners, user.name)) touchChannelOwners = true;
            }
            if (touchChannelOwners) digest.touchChannelOwners(message.channelId);

        }

        public JOIN = (digest: KGS.DataDigest, message: KGS.Downstream.JOIN) => {
            let channelType = Models.ChannelType.Room;
            if ((<Downstream.JOINRoom>message).games) {
                channelType = Models.ChannelType.Room;
            }
            else if (((<Downstream.JOINGame>message).gameSummary) || ((<Downstream.JOINGame>message).sgfEvents)) {
                channelType = Models.ChannelType.Game;
            }

            let channel = this._database._createChannel(digest, message.channelId, channelType);

            let touchChannelUsers: boolean = false;
            for (let i = 0; i < message.users.length; ++i) {
                let user = this._database._updateUser(digest, message.users[i]);
                if (DatabaseInternal.addUnique(channel.users, user.name)) touchChannelUsers = true;
            }
            if (touchChannelUsers) digest.touchChannelUsers(message.channelId);

            if ((<Downstream.JOINRoom>message).games) {
                this.GAME_LIST(digest, <Downstream.JOINRoom>message);
            }
        }

        public JOIN_COMPLETE = (digest: KGS.DataDigest, message: KGS.Downstream.JOIN_COMPLETE) => {
            let channel = this._database._requireChannel(message.channelId);
            if (!channel.joined) {
                channel.joined = true;
                this._database.joinedChannelIds.push(channel.channelId);

                digest.joinedChannelIds = true;
                digest.touchChannel(message.channelId);
            }
        }

        public CHAT = (digest: KGS.DataDigest, message: KGS.Downstream.CHAT) => {
            this._database._receiveChat(digest, message, Models.ChatImportance.Chat);
        }
        public ANNOUNCE = (digest: KGS.DataDigest, message: KGS.Downstream.ANNOUNCE) => {
            this._database._receiveChat(digest, message, Models.ChatImportance.Announcement);
        }
        public MODERATED_CHAT = (digest: KGS.DataDigest, message: KGS.Downstream.MODERATED_CHAT) => {
            this._database._receiveChat(digest, message, Models.ChatImportance.Moderated);
        }

        public USER_UPDATE = (digest: KGS.DataDigest, message: KGS.Downstream.USER_UPDATE) => {
            this._database._updateUser(digest, message.user);
        }

        public USER_ADDED = (digest: KGS.DataDigest, message: KGS.Downstream.USER_ADDED) => {
            let channel = this._database._requireChannel(message.channelId);
            let user = this._database._updateUser(digest, message.user);
            if (DatabaseInternal.addUnique(channel.users, user.name)) digest.touchChannelUsers(message.channelId);
        }
        public USER_REMOVED = (digest: KGS.DataDigest, message: KGS.Downstream.USER_REMOVED) => {
            let channel = this._database._requireChannel(message.channelId);
            let user = this._database._updateUser(digest, message.user);
            if (DatabaseInternal.removeFrom(channel.users, user.name)) digest.touchChannelUsers(message.channelId);
        }

        public GAME_LIST = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_LIST) => {
            for (let i = 0; i < message.games.length; ++i) {
                let game = message.games[i];
                let gameChannel = this._database._createChannel(digest, game.channelId, Models.ChannelType.Game) as Models.GameChannel;

                let parentChannel = this._database._requireChannel(game.roomId) as Models.RoomChannel;
                if (DatabaseInternal.addUnique(parentChannel.games, game.channelId)) digest.touchChannelGames(parentChannel.channelId);

                let touchChannel: boolean = false;
                if (gameChannel.name != game.name) { gameChannel.name = game.name; touchChannel = true; }
                if (gameChannel.parentChannelId != game.roomId) { gameChannel.parentChannelId = game.roomId; touchChannel = true; }
                if (gameChannel.gameType != game.gameType) { gameChannel.gameType = game.gameType; touchChannel = true; }
                if (gameChannel.score != game.score) { gameChannel.score = game.score; touchChannel = true; }
                if (gameChannel.moveNumber != game.moveNum) { gameChannel.moveNumber = game.moveNum; touchChannel = true; }
                if (touchChannel) digest.touchChannel(game.channelId);
            }
        }

        public GAME_CONTAINER_REMOVE_GAME = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_CONTAINER_REMOVE_GAME) => {
            let parentChannel = this._database._requireChannel(message.channelId) as Models.RoomChannel;
            if (DatabaseInternal.removeFrom(parentChannel.games, message.gameId)) digest.touchChannelGames(parentChannel.channelId);

            if (this._database.joinedChannelIds.indexOf(message.gameId) < 0) {
                DatabaseInternal.removeFrom(this._database.channelIds, message.gameId);
                delete this._database.channels[message.gameId];
            }
        }
    }
}

declare var $db: KGS.Database;
