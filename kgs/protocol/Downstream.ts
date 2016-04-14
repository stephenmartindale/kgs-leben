namespace KGS {
    export namespace Downstream {
        export interface Response {
            messages?: KGS.Message[]
        }

        export const _HELLO: string = "HELLO";
        export interface HELLO extends Message {
            versionMajor?: number,
            versionMinor?: number,
            versionBugfix?: number,
            jsonClientBuild?: string
        }

        export const _LOGOUT: string = "LOGOUT";
        export interface LOGOUT extends Message {
            text?: string
        }

        export const _LOGIN_SUCCESS: string = "LOGIN_SUCCESS";
        export interface LOGIN_SUCCESS extends Message {
            you: User,
            rooms: {
                category: string,
                channelId: number
            }[],
            roomCategoryChannelIds: {
                [key: string]: number
            },
        }

        export interface LOGIN_FAILED extends Message {
        }
        export const _LOGIN_FAILED_BAD_PASSWORD: string = "LOGIN_FAILED_BAD_PASSWORD";
        export interface LOGIN_FAILED_BAD_PASSWORD extends LOGIN_FAILED {
        }
        export const _LOGIN_FAILED_NO_SUCH_USER: string = "LOGIN_FAILED_NO_SUCH_USER";
        export interface LOGIN_FAILED_NO_SUCH_USER extends LOGIN_FAILED {
        }
        export const _LOGIN_FAILED_USER_ALREADY_EXISTS: string = "LOGIN_FAILED_USER_ALREADY_EXISTS";
        export interface LOGIN_FAILED_USER_ALREADY_EXISTS extends LOGIN_FAILED {
        }

        export interface RoomName {
            channelId: number,
            name: string,
            private?: boolean,
            tournOnly?: boolean,
            globalGamesOnly?: boolean
        }

        export const _ROOM_NAMES: string = "ROOM_NAMES";
        export interface ROOM_NAMES extends Message {
            rooms: Downstream.RoomName[]
        }

        export const _ROOM_DESC: string = "LOGROOM_DESCOUT";
        export interface ROOM_DESC extends ChannelMessage {
            description: string,
            owners?: User[]
        }

        export const _JOIN: string = "JOIN";
        export interface JOIN extends ChannelMessage {
            users: User[]
        }
        export interface JOINRoom extends Downstream.JOIN, Downstream.GAME_LIST {
        }
        export interface JOINChallenge extends Downstream.JOIN, Downstream.GAME_STATE {
        }
        export interface JOINGame extends Downstream.JOIN, Downstream.GAME_UPDATE, Downstream.GAME_STATE {
            gameSummary: GameSummary,
        }

        export const _JOIN_COMPLETE: string = "JOIN_COMPLETE";
        export interface JOIN_COMPLETE extends ChannelMessage {
        }

        export const _AUTOMATCH_PREFS: string = "AUTOMATCH_PREFS";
        export interface AUTOMATCH_PREFS extends Message {
            maxHandicap?: number,
            estimatedRank?: string,
            fastOk?: boolean,
            unrankedOk?: boolean,
            humanOk?: boolean,
            mediumOk?: boolean,
            freeOk?: boolean,
            rankedOk?: boolean,
            blitzOk?: boolean,
            robotOk?: boolean
        }

        export const _PLAYBACK_ADD: string = "PLAYBACK_ADD";
        export interface PLAYBACK_ADD extends Message {
            playbacks: {
                dateStamp: string,
                gameSummary: GameSummary,
                subscribersOnly?: boolean
            }[]
        }

        export const _CHAT: string = "CHAT";
        export interface CHAT extends ChannelMessage {
            user: KGS.User,
            text: string
        }
        export const _ANNOUNCE: string = "ANNOUNCE";
        export interface ANNOUNCE extends CHAT {
        }
        export const _MODERATED_CHAT: string = "MODERATED_CHAT";
        export interface MODERATED_CHAT extends CHAT {
        }

        export const _USER_UPDATE: string = "USER_UPDATE";
        export interface USER_UPDATE extends Message {
            user: KGS.User
        }

        export const _USER_ADDED: string = "USER_ADDED";
        export interface USER_ADDED extends ChannelMessage {
            user: KGS.User
        }
        export const _USER_REMOVED: string = "USER_REMOVED";
        export interface USER_REMOVED extends ChannelMessage {
            user: KGS.User
        }

        export const _GAME_LIST: string = "GAME_LIST";
        export interface GAME_LIST extends ChannelMessage {
            games: GameChannel[]
        }

        export const _GAME_CONTAINER_REMOVE_GAME: string = "GAME_CONTAINER_REMOVE_GAME";
        export interface GAME_CONTAINER_REMOVE_GAME extends ChannelMessage {
            gameId: number
        }

        export const _GAME_STATE: string = "GAME_STATE";
        export interface GAME_STATE extends ChannelMessage, GameFlags {
        }

        export const _GAME_UPDATE: string = "GAME_UPDATE";
        export interface GAME_UPDATE extends ChannelMessage {
            sgfEvents: KGS.SGF.NodeEvent[]
        }
        export const _PLAYBACK_DATA: string = "PLAYBACK_DATA";
        export interface PLAYBACK_DATA extends GAME_UPDATE {
        }
    }
}
