describe('Models.User', () => {
    const assert = require('assert');

    const iterations = 4000;

    // See the documentation for downstream message: DETAILS_RANK_GRAPH
    // 30k is 0..99, 29k is 100..199, etc. 0x7fff indicates "no rank for this day."
    let ranks = [
        { rank: "30", dan: false, ratingMin: 0, ratingMax: 99 },
        { rank: "29", dan: false, ratingMin: 100, ratingMax: 199 },
        { rank: "28", dan: false, ratingMin: 200, ratingMax: 299 },
        { rank: "27", dan: false, ratingMin: 300, ratingMax: 399 },
        { rank: "26", dan: false, ratingMin: 400, ratingMax: 499 },
        { rank: "25", dan: false, ratingMin: 500, ratingMax: 599 },
        { rank: "24", dan: false, ratingMin: 600, ratingMax: 699 },
        { rank: "23", dan: false, ratingMin: 700, ratingMax: 799 },
        { rank: "22", dan: false, ratingMin: 800, ratingMax: 899 },
        { rank: "21", dan: false, ratingMin: 900, ratingMax: 999 },
        { rank: "20", dan: false, ratingMin: 1000, ratingMax: 1099 },
        { rank: "19", dan: false, ratingMin: 1100, ratingMax: 1199 },
        { rank: "18", dan: false, ratingMin: 1200, ratingMax: 1299 },
        { rank: "17", dan: false, ratingMin: 1300, ratingMax: 1399 },
        { rank: "16", dan: false, ratingMin: 1400, ratingMax: 1499 },
        { rank: "15", dan: false, ratingMin: 1500, ratingMax: 1599 },
        { rank: "14", dan: false, ratingMin: 1600, ratingMax: 1699 },
        { rank: "13", dan: false, ratingMin: 1700, ratingMax: 1799 },
        { rank: "12", dan: false, ratingMin: 1800, ratingMax: 1899 },
        { rank: "11", dan: false, ratingMin: 1900, ratingMax: 1999 },
        { rank: "10", dan: false, ratingMin: 2000, ratingMax: 2099 },
        { rank: "9", dan: false, ratingMin: 2100, ratingMax: 2199 },
        { rank: "8", dan: false, ratingMin: 2200, ratingMax: 2299 },
        { rank: "7", dan: false, ratingMin: 2300, ratingMax: 2399 },
        { rank: "6", dan: false, ratingMin: 2400, ratingMax: 2499 },
        { rank: "5", dan: false, ratingMin: 2500, ratingMax: 2599 },
        { rank: "4", dan: false, ratingMin: 2600, ratingMax: 2699 },
        { rank: "3", dan: false, ratingMin: 2700, ratingMax: 2799 },
        { rank: "2", dan: false, ratingMin: 2800, ratingMax: 2899 },
        { rank: "1", dan: false, ratingMin: 2900, ratingMax: 2999 },
        { rank: "1", dan: true, ratingMin: 3000, ratingMax: 3099 },
        { rank: "2", dan: true, ratingMin: 3100, ratingMax: 3199 },
        { rank: "3", dan: true, ratingMin: 3200, ratingMax: 3299 },
        { rank: "4", dan: true, ratingMin: 3300, ratingMax: 3399 },
        { rank: "5", dan: true, ratingMin: 3400, ratingMax: 3499 },
        { rank: "6", dan: true, ratingMin: 3500, ratingMax: 3599 },
        { rank: "7", dan: true, ratingMin: 3600, ratingMax: 3699 },
        { rank: "8", dan: true, ratingMin: 3700, ratingMax: 3799 },
        { rank: "9", dan: true, ratingMin: 3800, ratingMax: (KGS.Constants.RatingNull - 1) }
    ];

    describe('ratingToRank', () => {
        for (let j = 0; j < ranks.length; ++j) {
            let testCase = ranks[j];
            let shortRank = testCase.rank.toString() + ((testCase.dan)? "d" : "k");

            it('yields rank ' + shortRank, () => {
                let shortRankUnsettled = shortRank + "?";
                let longRank = testCase.rank.toString() + ((testCase.dan)? " dan" : " kyu");
                let longRankUnsettled = longRank + "?";
                let numericRank = testCase.rank.toString();

                let t = (rating: number) => {
                    assert(shortRank === Models.User.ratingToRank(rating));
                    assert(longRank === Models.User.ratingToRank(rating, false, Models.UserRankFormat.Long));
                    assert(shortRankUnsettled === Models.User.ratingToRank(rating, true));
                    assert(longRankUnsettled === Models.User.ratingToRank(rating, true, Models.UserRankFormat.Long));

                    assert(numericRank === Models.User.ratingToRank(rating, true, Models.UserRankFormat.Numeric));
                    assert(numericRank === Models.User.ratingToRank(rating, false, Models.UserRankFormat.Numeric));
                };

                t(testCase.ratingMin);
                t(testCase.ratingMax);

                for (let i = 0; i < iterations; ++i) {
                    t(Utils.randomInteger(testCase.ratingMin, testCase.ratingMax, true));
                }
            });
        }

        it('handles null-rating', () => {
            assert("?" === Models.User.ratingToRank(undefined));
            assert("?" === Models.User.ratingToRank(null));
            assert("?" === Models.User.ratingToRank(0x7fff));
            assert("?" === Models.User.ratingToRank(-1));

            assert("?" === Models.User.ratingToRank(undefined, false, Models.UserRankFormat.Default));
            assert("?" === Models.User.ratingToRank(null, false, Models.UserRankFormat.Default));
            assert("?" === Models.User.ratingToRank(0x7fff, false, Models.UserRankFormat.Default));
            assert("?" === Models.User.ratingToRank(-1, false, Models.UserRankFormat.Default));

            assert("?" === Models.User.ratingToRank(undefined, false, Models.UserRankFormat.Long));
            assert("?" === Models.User.ratingToRank(null, false, Models.UserRankFormat.Long));
            assert("?" === Models.User.ratingToRank(0x7fff, false, Models.UserRankFormat.Long));
            assert("?" === Models.User.ratingToRank(-1, false, Models.UserRankFormat.Long));

            assert(null === Models.User.ratingToRank(undefined, false, Models.UserRankFormat.Numeric));
            assert(null === Models.User.ratingToRank(null, false, Models.UserRankFormat.Numeric));
            assert(null === Models.User.ratingToRank(0x7fff, false, Models.UserRankFormat.Numeric));
            assert(null === Models.User.ratingToRank(-1, false, Models.UserRankFormat.Numeric));
        });
    });

    describe('rankToRating', () => {
        for (let j = 0; j < ranks.length; ++j) {
            let testCase = ranks[j];
            let shortRank = testCase.rank.toString() + ((testCase.dan)? "d" : "k");

            it('parses rank ' + shortRank, () => {
                let shortRankUnsettled = shortRank + "?";
                let longRank = testCase.rank.toString() + ((testCase.dan)? " dan" : " kyu");
                let longRankUnsettled = longRank + "?";

                assert(testCase.ratingMin === Models.User.rankToRating(shortRank));
                assert(testCase.ratingMin === Models.User.rankToRating(shortRankUnsettled));
                assert(testCase.ratingMin === Models.User.rankToRating(longRank));
                assert(testCase.ratingMin === Models.User.rankToRating(longRankUnsettled));

                for (let i = 0; i < iterations; ++i) {
                    let randomRank: string = Models.User.ratingToRank(Utils.randomInteger(testCase.ratingMin, testCase.ratingMax, true), Utils.randomBoolean(), (Utils.randomBoolean()? Models.UserRankFormat.Default : Models.UserRankFormat.Long));
                    assert(testCase.ratingMin === Models.User.rankToRating(randomRank));
                }
            });
        }

        it('yields null-rating', () => {
            assert(null === Models.User.rankToRating(undefined));
            assert(null === Models.User.rankToRating(null));
            assert(null === Models.User.rankToRating(""));
            assert(null === Models.User.rankToRating("?"));
            assert(null === Models.User.rankToRating("??"));
            assert(null === Models.User.rankToRating("rubbish"));
            assert(null === Models.User.rankToRating("?k3"));

            assert(null === Models.User.rankToRating(Models.User.ratingToRank(0x7fff)));
            assert(null === Models.User.rankToRating(Models.User.ratingToRank(KGS.Constants.RatingNull)));
        });
    });

    describe('estimateHandicap', () => {
        it('calculates correct handicap (rating, rating)', () => {
            for (let i = 0; i < iterations; ++i) {
                let playerIndex = Utils.randomInteger(0, ranks.length);
                let playerCase = ranks[playerIndex];
                let playerRating: number = Utils.randomInteger(playerCase.ratingMin, playerCase.ratingMax, true);

                let opponentIndex = Utils.randomInteger(0, ranks.length);
                let opponentCase = ranks[opponentIndex];
                let opponentRating: number = Utils.randomInteger(opponentCase.ratingMin, opponentCase.ratingMax, true);

                assert((opponentIndex - playerIndex) === Models.User.estimateHandicap(playerRating, opponentRating));
                assert((playerIndex - opponentIndex) === Models.User.estimateHandicap(opponentRating, playerRating));
            }
        });

        it('calculates correct handicap (rank, rank)', () => {
            for (let i = 0; i < iterations; ++i) {
                let playerIndex = Utils.randomInteger(0, ranks.length);
                let playerCase = ranks[playerIndex];
                let playerRank: string = Models.User.ratingToRank(Utils.randomInteger(playerCase.ratingMin, playerCase.ratingMax, true), Utils.randomBoolean(), (Utils.randomBoolean()? Models.UserRankFormat.Default : Models.UserRankFormat.Long));

                let opponentIndex = Utils.randomInteger(0, ranks.length);
                let opponentCase = ranks[opponentIndex];
                let opponentRank: string = Models.User.ratingToRank(Utils.randomInteger(opponentCase.ratingMin, opponentCase.ratingMax, true), Utils.randomBoolean(), (Utils.randomBoolean()? Models.UserRankFormat.Default : Models.UserRankFormat.Long))

                assert((opponentIndex - playerIndex) === Models.User.estimateHandicap(playerRank, opponentRank));
                assert((playerIndex - opponentIndex) === Models.User.estimateHandicap(opponentRank, playerRank));
            }
        });

        it('calculates correct handicap (rating, rank)', () => {
            for (let i = 0; i < iterations; ++i) {
                let playerIndex = Utils.randomInteger(0, ranks.length);
                let playerCase = ranks[playerIndex];
                let playerRating: number = Utils.randomInteger(playerCase.ratingMin, playerCase.ratingMax, true);

                let opponentIndex = Utils.randomInteger(0, ranks.length);
                let opponentCase = ranks[opponentIndex];
                let opponentRank: string = Models.User.ratingToRank(Utils.randomInteger(opponentCase.ratingMin, opponentCase.ratingMax, true), Utils.randomBoolean(), (Utils.randomBoolean()? Models.UserRankFormat.Default : Models.UserRankFormat.Long))

                assert((opponentIndex - playerIndex) === Models.User.estimateHandicap(playerRating, opponentRank));
                assert((playerIndex - opponentIndex) === Models.User.estimateHandicap(opponentRank, playerRating));
            }
        });

        it('handles null parameters', () => {
            for (let i = 0; i < iterations; ++i) {
                let playerIndex = Utils.randomInteger(0, ranks.length);
                let playerCase = ranks[playerIndex];
                let playerRating: number = Utils.randomInteger(playerCase.ratingMin, playerCase.ratingMax, true);

                let opponentIndex = Utils.randomInteger(0, ranks.length);
                let opponentCase = ranks[opponentIndex];
                let opponentRank: string = Models.User.ratingToRank(Utils.randomInteger(opponentCase.ratingMin, opponentCase.ratingMax, true), Utils.randomBoolean(), (Utils.randomBoolean()? Models.UserRankFormat.Default : Models.UserRankFormat.Long))

                assert(null === Models.User.estimateHandicap(undefined, null));

                assert(null === Models.User.estimateHandicap(playerRating, null));
                assert(null === Models.User.estimateHandicap(null, playerRating));
                assert(null === Models.User.estimateHandicap(null, opponentRank));
                assert(null === Models.User.estimateHandicap(opponentRank, null));

                assert(null === Models.User.estimateHandicap(playerRating, "?"));
                assert(null === Models.User.estimateHandicap("", playerRating));
                assert(null === Models.User.estimateHandicap(0x7fff, opponentRank));
                assert(null === Models.User.estimateHandicap(opponentRank, KGS.Constants.RatingNull));
            }
        });
    });
});
