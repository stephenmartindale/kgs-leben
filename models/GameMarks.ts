namespace Models {
    export const enum GameMarks {
        WhiteStone      = (1 << (16 + 0)),  //    65536
        BlackStone      = (1 << (16 + 1)),  //   131072

        WhiteTerritory  = (1 << (16 + 2)),  //   262144
        BlackTerritory  = (1 << (16 + 3)),  //   524288

        LastMove        = (1 << (16 + 4)),  //  1048576
        Ko              = (1 << (16 + 5)),  //  2097152

        Circle          = (1 << (16 + 6)),  //  4194304
        Triangle        = (1 << (16 + 7)),  //  8388608
        Square          = (1 << (16 + 8)),  // 16777216
        Cross           = (1 << (16 + 9)),  // 33554432
    }

    // White Stone, Black Territory:        589824
    // Black Stone, White Territory:        393216
}
