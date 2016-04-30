namespace Models {
    export const enum GameActions {
        Move                = (1 << 0),
        Edit                = (1 << 1),
        Score               = (1 << 2),
        ChallengeCreate     = (1 << 3),
        ChallengeSetup      = (1 << 4),
        ChallengeWait       = (1 << 5),
        ChallengeAccept     = (1 << 6),
        ChallengeSubmitted  = (1 << 7),
        EditDelay           = (1 << 8)
    }
}
