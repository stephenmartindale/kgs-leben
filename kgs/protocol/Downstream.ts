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

        export const _ROOM_JOIN: string = "ROOM_JOIN";
        export interface ROOM_JOIN extends ChannelMessage, Downstream.GAME_LIST {
            users: User[]
        }
        export const _GAME_JOIN: string = "GAME_JOIN";
        export interface GAME_JOIN extends ChannelMessage, Downstream.GAME_UPDATE, Downstream.GAME_STATE {
            users: User[]
        }
        export const _CHALLENGE_JOIN: string = "CHALLENGE_JOIN";
        export interface CHALLENGE_JOIN extends ChannelMessage, Downstream.GAME_STATE {
            users: User[],
            gameSummary: GameSummary
        }

        export const _JOIN_COMPLETE: string = "JOIN_COMPLETE";
        export interface JOIN_COMPLETE extends ChannelMessage {
        }

        export const _UNJOIN: string = "UNJOIN";
        export interface UNJOIN extends ChannelMessage {
        }
        export const _CLOSE: string = "CLOSE";
        export interface CLOSE extends ChannelMessage {
        }

        export const _PRIVATE_KEEP_OUT: string = "PRIVATE_KEEP_OUT";
        export interface PRIVATE_KEEP_OUT extends ChannelMessage {
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
            games: (GameChannel | ChallengeChannel)[]
        }

        export const _GAME_NOTIFY: string = "GAME_NOTIFY";
        export interface GAME_NOTIFY extends Message {
            game: GameChannel
        }

        export const _GAME_CONTAINER_REMOVE_GAME: string = "GAME_CONTAINER_REMOVE_GAME";
        export interface GAME_CONTAINER_REMOVE_GAME extends ChannelMessage {
            gameId: number
        }

        export interface ClockState {
            paused?: boolean;       // If present, the clock has been paused, e.g. because the player has left the game.
            running?: boolean;      // If present, the clock is running. A clock is only running when it is the turn of the player who owns this clock.
            time: number;           // The seconds left in the current period of the clock.
            periodsLeft?: number;   // Only present for Japanese byo-yomi clocks. The number of periods left on the clock.
            stonesLeft?: number;    // Only present for Canadian clocks. The number of stones left in the current period.
        }

        export const _GAME_STATE: string = "GAME_STATE";
        export interface GAME_STATE extends ChannelMessage, GameFlags, GameScore {
            clocks?: {
                black?: ClockState,
                white?: ClockState
            },
            actions: {
                user: KGS.User,
                action: "MOVE" | "EDIT" | "SCORE" | "CHALLENGE_CREATE" | "CHALLENGE_SETUP" | "CHALLENGE_WAIT" | "CHALLENGE_ACCEPT" | "CHALLENGE_SUBMITTED" | "EDIT_DELAY"
            }[]
        }

        export const _GAME_UPDATE: string = "GAME_UPDATE";
        export interface GAME_UPDATE extends ChannelMessage {
            sgfEvents: KGS.SGF.NodeEvent[]
        }
        export const _PLAYBACK_DATA: string = "PLAYBACK_DATA";
        export interface PLAYBACK_DATA extends GAME_UPDATE {
        }

        export const _GAME_OVER: string = "GAME_OVER";
        export interface GAME_OVER extends ChannelMessage, GameScore {
        }

        export const _GAME_TIME_EXPIRED: string = "GAME_TIME_EXPIRED";
        export interface GAME_TIME_EXPIRED extends ChannelMessage {
        }

        export const _CHALLENGE_PROPOSAL: string = "CHALLENGE_PROPOSAL";
        export interface CHALLENGE_PROPOSAL extends ChannelMessage {
            proposal: KGS.DownstreamProposal
        }
        export const _CHALLENGE_FINAL: string = "CHALLENGE_FINAL";
        export interface CHALLENGE_FINAL extends CHALLENGE_PROPOSAL {
            gameChannelId: number
        }
    }
}
