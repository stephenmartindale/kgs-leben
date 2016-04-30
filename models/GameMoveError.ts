namespace Models {
    export const enum GameMoveError {
        Success = 0,
        InvalidLocation = 2,
        StonePresent = 3,
        Suicide = 4,
        Ko = 5
    }
}
