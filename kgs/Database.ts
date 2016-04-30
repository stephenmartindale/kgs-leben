namespace KGS {
    export interface DatabaseDictionary<T> {
        [key: string]: T,
        [key: number]: T
    }

    export class Database {
        public username: string;
        public joinedChannelIds: number[];

        public channels: DatabaseDictionary<Models.Channel>;

        public users: { [name: string]: Models.User };
        public get userNames(): string[] { return Object.keys(this.users); }

        public games: DatabaseDictionary<Models.GameTree>;
        public gameActions: { [channelId: number]: Models.GameActions };
    }

    class DatabaseInternal extends KGS.Database {
        constructor() {
            super();
            this.reinitialise();
        }

        public reinitialise() {
            this.username = null;
            this.joinedChannelIds = [];

            this.channels = {};

            this.users = {};

            this.games = {};
            this.gameActions = {};
        }

        public _createChannel(digest: KGS.DataDigest, channelId: number, channelType: Models.ChannelType): Models.Channel {
            let channel = this.channels[channelId];
            if (!channel) {
                channel = Models.Channel.createChannel(channelId, channelType);
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

        public _updateUsers(digest: KGS.DataDigest, users: KGS.User[]) {
            for (let i = 0; i < users.length; ++i) {
                this._updateUser(digest, users[i]);
            }
        }

        public _updateGameChannel(digest: KGS.DataDigest, game: KGS.GameChannel | KGS.ChallengeChannel) {
            let parentChannel = this._requireChannel(game.roomId) as Models.RoomChannel;
            if (parentChannel.addGame(game.channelId)) digest.touchChannelGames(parentChannel.channelId);

            let gameChannel = this._createChannel(digest, game.channelId, Models.ChannelType.Game) as Models.GameChannel;
            if (gameChannel.mergeGameChannel(game)) digest.touchChannel(gameChannel.channelId);

            if (game.players) {
                if (game.players.owner) {
                    this._updateUser(digest, game.players.owner);

                    if (gameChannel.syncOwners([game.players.owner])) digest.touchChannelOwners(gameChannel.channelId);
                }

                if (game.players.white) this._updateUser(digest, game.players.white);
                if (game.players.black) this._updateUser(digest, game.players.black);
            }
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

        public _unjoinChannel(digest: KGS.DataDigest, channelId: number, closeChannel: boolean) {
            if (Utils.setRemove(this.joinedChannelIds, channelId)) {
                digest.joinedChannelIds = true;
            }

            if (closeChannel) {
                delete this.channels[channelId];
            }

            delete this.games[channelId];
            delete this.gameActions[channelId];
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

            this._database._updateUsers(digest, message.owners);
            if (channel.syncOwners(message.owners)) digest.touchChannelOwners(message.channelId);
        }

        public ROOM_JOIN = (digest: KGS.DataDigest, message: KGS.Downstream.ROOM_JOIN) => {
            let channel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Room);

            this._database._updateUsers(digest, message.users);
            if (channel.mergeUsers(message.users)) digest.touchChannelUsers(message.channelId);

            this.GAME_LIST(digest, message);
        }

        public GAME_JOIN = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_JOIN) => {
            let channel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Game);

            this._database._updateUsers(digest, message.users);
            if (channel.mergeUsers(message.users)) digest.touchChannelUsers(message.channelId);

            this.GAME_UPDATE(digest, message);
        }

        public CHALLENGE_JOIN = (digest: KGS.DataDigest, message: KGS.Downstream.CHALLENGE_JOIN) => {
            let channel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Game);

            this._database._updateUsers(digest, message.users);
            if (channel.mergeUsers(message.users)) digest.touchChannelUsers(message.channelId);
        }

        public JOIN_COMPLETE = (digest: KGS.DataDigest, message: KGS.Downstream.JOIN_COMPLETE) => {
            let channel = this._database._requireChannel(message.channelId);
            if (Utils.setAdd(this._database.joinedChannelIds, channel.channelId)) {
                digest.joinedChannelIds = true;
                digest.touchChannel(message.channelId);
            }
        }

        public UNJOIN = (digest: KGS.DataDigest, message: KGS.Downstream.UNJOIN) => {
            this._database._unjoinChannel(digest, message.channelId, false);
        }
        public CLOSE = (digest: KGS.DataDigest, message: KGS.Downstream.CLOSE) => {
            this._database._unjoinChannel(digest, message.channelId, true);
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
            if (message.games) {
                for (let i = 0; i < message.games.length; ++i) {
                    this._database._updateGameChannel(digest, message.games[i]);
                }
            }
        }
        public GAME_NOTIFY = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_NOTIFY) => {
            this._database._updateGameChannel(digest, message.game);
            if (digest.notifyChannelId == null) digest.notifyChannelId = message.game.channelId;
        }

        public GAME_CONTAINER_REMOVE_GAME = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_CONTAINER_REMOVE_GAME) => {
            let parentChannel = this._database._requireChannel(message.channelId) as Models.RoomChannel;
            if ((parentChannel) && (parentChannel.removeGame) && (parentChannel.removeGame(message.gameId))) {
                digest.touchChannelGames(parentChannel.channelId);
            }

            this._database._unjoinChannel(digest, message.gameId, true);
        }

        public GAME_STATE = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_STATE) => {
            let gameActions: Models.GameActions = 0;
            for (let i = 0; i < message.actions.length; ++i) {
                let user = this._database._updateUser(digest, message.actions[i].user);
                if (user.name == this._database.username) {
                    switch (message.actions[i].action) {
                        case "MOVE": gameActions |= Models.GameActions.Move; break;
                        case "EDIT": gameActions |= Models.GameActions.Edit; break;
                        case "SCORE": gameActions |= Models.GameActions.Score; break;
                        case "CHALLENGE_CREATE": gameActions |= Models.GameActions.ChallengeCreate; break;
                        case "CHALLENGE_SETUP": gameActions |= Models.GameActions.ChallengeSetup; break;
                        case "CHALLENGE_WAIT": gameActions |= Models.GameActions.ChallengeWait; break;
                        case "CHALLENGE_ACCEPT": gameActions |= Models.GameActions.ChallengeAccept; break;
                        case "CHALLENGE_SUBMITTED": gameActions |= Models.GameActions.ChallengeSubmitted; break;
                        case "EDIT_DELAY": gameActions |= Models.GameActions.EditDelay; break;
                    }
                }
            }

            if (this._database.gameActions[message.channelId] != gameActions) {
                this._database.gameActions[message.channelId] = gameActions;
                digest.touchGameActions(message.channelId);
            }
        }

        public GAME_UPDATE = (digest: KGS.DataDigest, message: KGS.Downstream.GAME_UPDATE) => {
            if ((message.sgfEvents) && (message.sgfEvents.length > 0)) {
                let gameTree = this._database._createGameTree(digest, message.channelId);
                gameTree.processEvents(...message.sgfEvents);
                digest.touchGameTree(message.channelId);
            }
        }

        public CHALLENGE_PROPOSAL = (digest: KGS.DataDigest, message: KGS.Downstream.CHALLENGE_PROPOSAL) => {
            for (let i = 0; i < message.proposal.players.length; ++i) {
                if (message.proposal.players[i].user != null) {
                    this._database._updateUser(digest, message.proposal.players[i].user);
                }
            }

            let gameChannel = this._database._createChannel(digest, message.channelId, Models.ChannelType.Game) as Models.GameChannel;
            if (gameChannel.mergeProposal(message.proposal)) digest.touchChannel(gameChannel.channelId);
        }
    }
}

declare var $db: KGS.Database;
