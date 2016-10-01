namespace Tests {
    const assert = require('assert');

    export namespace GamePosition {
        export var stoneMarks: Models.GameMarks[] = [
            Models.GameMarks.WhiteStone,
            Models.GameMarks.BlackStone,
        ];

        export var decorativeMarks: Models.GameMarks[] = [
            Models.GameMarks.Dead,
            Models.GameMarks.WhiteTerritory,
            Models.GameMarks.BlackTerritory,
            Models.GameMarks.LastMove,
            Models.GameMarks.Ko,
            Models.GameMarks.Circle,
            Models.GameMarks.Triangle,
            Models.GameMarks.Square,
            Models.GameMarks.Cross
        ];

        export function gameMarksToString(gameMarks: Models.GameMarks): string {
            let marks: string[] = [];

            for (let j = 0; j < stoneMarks.length; ++j) {
                if ((gameMarks & stoneMarks[j]) != 0) {
                    switch (stoneMarks[j]) {
                        case Models.GameMarks.WhiteStone: marks.push("white stone"); break;
                        case Models.GameMarks.BlackStone: marks.push("black stone"); break;
                    }
                }
            }

            for (let j = 0; j < decorativeMarks.length; ++j) {
                if ((gameMarks & decorativeMarks[j]) != 0) {
                    switch (decorativeMarks[j]) {
                        case Models.GameMarks.Dead: marks.push("dead"); break;
                        case Models.GameMarks.WhiteTerritory: marks.push("white territory"); break;
                        case Models.GameMarks.BlackTerritory: marks.push("black territory"); break;
                        case Models.GameMarks.LastMove: marks.push("last move"); break;
                        case Models.GameMarks.Ko: marks.push("ko"); break;
                        case Models.GameMarks.Circle: marks.push("circle"); break;
                        case Models.GameMarks.Triangle: marks.push("triangle"); break;
                        case Models.GameMarks.Square: marks.push("square"); break;
                        case Models.GameMarks.Cross: marks.push("cross"); break;
                    }
                }
            }

            return marks.join(", ");
        }

        export function assertSchemaEquality(expected: number[], actual: number[]) {
            let messageLines: string[] = [];
            if ((expected == null) && (actual != null)) {
                messageLines.push("expected null-schema");
            }
            else if ((expected != null) && (actual == null)) {
                messageLines.push("expected non-null schema");
            }
            else {
                for (let k in expected) {
                    if (expected[k] != actual[k]) {
                        messageLines.push("[" + k.toString() + "]\t" + gameMarksToString(expected[k]) + "\t!=\t" + gameMarksToString(actual[k]));
                    }
                }

                for (let k in actual) {
                    if (!(k in expected)) {
                        messageLines.push("[" + k.toString() + "]\t" + gameMarksToString(expected[k]) + "\t!=\t" + gameMarksToString(actual[k]));
                    }
                }
            }

            if (messageLines.length > 0) assert(false, messageLines.join("\n"));
        }
    }
}

describe('Models.GamePosition', () => {
    const assert = require('assert');

    describe('constructor (from size)', () => {
        for (let sz: number = 2; sz <= 38; ++sz) {
            let schemaLength = sz * sz;

            it('should support size ' + sz.toString(), () => {
                let position: Models.GamePosition = new Models.GamePosition(sz);

                assert(position.size == sz, "position is not " + sz.toString() + " by " + sz.toString());

                assert(position.addStone(sz - 1, sz - 1, Models.GameStone.Black) == Models.GameMoveResult.Success, "failed to place black stone at (" + (sz - 1).toString() + ", " + (sz - 1).toString() + ")");
                assert(position.schema[schemaLength - 1] == (Models.GameMarks.BlackStone | Models.GameMarks.LastMove), "failed to find black stone at (" + (sz - 1).toString() + ", " + (sz - 1).toString() + ")");
            });
        }
    });

    interface TestCase {
        name: string,
        size: number;
        positionFactory: () => Models.GamePosition;
        schemaFactory: () => number[];
        empty: { x: number, y: number };
    };

    let testCases: TestCase[] = [
        {
            name: "test position 1 (9 by 9)",
            size: 9,
            positionFactory: () => {
                let position: Models.GamePosition = new Models.GamePosition(9);
                position.addStone(2, 2, Models.GameStone.White);
                position.addStone(2, 6, Models.GameStone.White);
                position.addStone(3, 6, Models.GameStone.White);
                position.addStone(5, 6, Models.GameStone.White);
                position.addStone(4, 5, Models.GameStone.White);
                position.addStone(4, 7, Models.GameStone.White);
                position.addStone(6, 2, Models.GameStone.Black);
                position.addStone(6, 6, Models.GameStone.Black);
                position.addStone(5, 5, Models.GameStone.Black);
                position.addStone(5, 7, Models.GameStone.Black);
                position.addStone(4, 4, Models.GameStone.Black);
                return position;
            },
            schemaFactory: () => {
                let schema: number[] = [];
                schema[2 * 9 + 2] = Models.GameMarks.WhiteStone;
                schema[2 * 9 + 6] = Models.GameMarks.WhiteStone;
                schema[3 * 9 + 6] = Models.GameMarks.WhiteStone;
                schema[5 * 9 + 6] = Models.GameMarks.WhiteStone;
                schema[4 * 9 + 5] = Models.GameMarks.WhiteStone;
                schema[4 * 9 + 7] = Models.GameMarks.WhiteStone;
                schema[6 * 9 + 2] = Models.GameMarks.BlackStone;
                schema[6 * 9 + 6] = Models.GameMarks.BlackStone;
                schema[5 * 9 + 5] = Models.GameMarks.BlackStone;
                schema[5 * 9 + 7] = Models.GameMarks.BlackStone;
                schema[4 * 9 + 4] = Models.GameMarks.BlackStone | Models.GameMarks.LastMove;
                return schema;
            },
            empty: { x: 4, y: 2 }
        }
    ];

    testCases.forEach((testCase: TestCase) => {
        describe(testCase.name, () => {
            let position: Models.GamePosition;
            before(() => {
                position = testCase.positionFactory();
            });

            it("should have the correct size", () => {
                assert(testCase.size == position.size, "position is not " + testCase.size.toString() + " by " + testCase.size.toString());
            });

            it("should have the correct schema", () => {
                let expected: number[] = testCase.schemaFactory();
                assert(Utils.arrayEquals(expected, position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
            });
        });
    });

    describe('constructor (cloning from original)', () => {
        testCases.forEach((testCase: TestCase) => {
            describe(testCase.name, () => {
                it("should yield identical positions", () => {
                    let original: Models.GamePosition = testCase.positionFactory();
                    let clone: Models.GamePosition = new Models.GamePosition(original);

                    assert(original !== clone, "clone is not a new instance");

                    assert(original.schema !== clone.schema, "clone's schema is not a new array instance");
                    assert(Utils.arrayEquals(original.schema, clone.schema, Utils.ComparisonFlags.Values), "cloned schema does not match original");

                    assert(original.white !== clone.white, "clone's white-score is not a new structure instance");
                    assert(Utils.valueEquals(original.white, clone.white, Utils.ComparisonFlags.Shallow), "cloned white-score does not match original");

                    assert(original.black !== clone.black, "clone's black-score is not a new structure instance");
                    assert(Utils.valueEquals(original.black, clone.black, Utils.ComparisonFlags.Shallow), "cloned black-score does not match original");

                    assert(Utils.valueEquals(original, clone, Utils.ComparisonFlags.Values), "clone is not identical to original");
                });

                it("should yield independent positions", () => {
                    let original: Models.GamePosition = testCase.positionFactory();
                    let clone: Models.GamePosition = new Models.GamePosition(original);

                    clone.addMarks(testCase.empty.x, testCase.empty.y, Models.GameMarks.Triangle);

                    assert(original.get(testCase.empty.x, testCase.empty.y) != clone.get(testCase.empty.x, testCase.empty.y));
                    assert(!Utils.arrayEquals(original.schema, clone.schema, Utils.ComparisonFlags.Values), "cloned schema should no longer match original");
                });
            });
        });
    });

    describe('stone-equality comparison', () => {
        testCases.forEach((testCase: TestCase) => {
            describe(testCase.name, () => {
                let original: Models.GamePosition;
                before(() => {
                    original = testCase.positionFactory();
                });

                for (let j = 0; j < Tests.GamePosition.stoneMarks.length; ++j) {
                    let mark: number = Tests.GamePosition.stoneMarks[j];
                    it("should not ignore mark '" + Tests.GamePosition.gameMarksToString(mark) + "'", () => {
                        let clone = new Models.GamePosition(original);
                        switch (mark) {
                            case Models.GameMarks.WhiteStone:
                                clone.addStone(testCase.empty.x, testCase.empty.y, Models.GameStone.White);
                                break;

                            case Models.GameMarks.BlackStone:
                                clone.addStone(testCase.empty.x, testCase.empty.y, Models.GameStone.Black);
                                break;

                            default:
                                assert(false, "unknown mark '" + Tests.GamePosition.gameMarksToString(mark) + "'");
                                break;
                        }

                        assert(clone.get(testCase.empty.x, testCase.empty.y) == (mark | Models.GameMarks.LastMove), "mark not added");
                        assert(!Utils.arrayEquals(original.schema, clone.schema, Utils.ComparisonFlags.Values), "cloned schema should no longer match original");
                        assert(!original.stoneEquality(clone), "stone-equality should not hold");
                    });
                }

                for (let j = 0; j < Tests.GamePosition.decorativeMarks.length; ++j) {
                    let mark: number = Tests.GamePosition.decorativeMarks[j];
                    it("should ignore decorative mark '" + Tests.GamePosition.gameMarksToString(mark) + "'", () => {
                        let clone = new Models.GamePosition(original);
                        clone.addMarks(testCase.empty.x, testCase.empty.y, mark);

                        assert(clone.get(testCase.empty.x, testCase.empty.y) == mark, "mark not added");
                        assert(!Utils.arrayEquals(original.schema, clone.schema, Utils.ComparisonFlags.Values), "cloned schema should no longer match original");
                        assert(original.stoneEquality(clone), "stone-equality should hold");
                    });
                }
            });
        });
    });

    describe('ko rule implementation', () => {
        let kos = [
            {
                name: "horizontal, black to capture",
                setup: (position: Models.GamePosition) => {
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(4, 2, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                    position.addStone(2, 2, Models.GameStone.White);
                },
                capture: { x: 3, y: 2, colour: Models.GameStone.Black },
                centre: { x: 2, y: 2, colour: Models.GameStone.White }
            },
            {
                name: "horizontal, white to capture",
                setup: (position: Models.GamePosition) => {
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 2, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(4, 2, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                },
                capture: { x: 2, y: 2, colour: Models.GameStone.White },
                centre: { x: 3, y: 2, colour: Models.GameStone.Black }
            },
            {
                name: "vertical, black to capture",
                setup: (position: Models.GamePosition) => {
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(3, 2, Models.GameStone.Black);
                    position.addStone(1, 3, Models.GameStone.White);
                    position.addStone(2, 4, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                    position.addStone(2, 2, Models.GameStone.White);
                },
                capture: { x: 2, y: 3, colour: Models.GameStone.Black },
                centre: { x: 2, y: 2, colour: Models.GameStone.White }
            },
            {
                name: "vertical, white to capture",
                setup: (position: Models.GamePosition) => {
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(3, 2, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(1, 3, Models.GameStone.White);
                    position.addStone(2, 4, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                },
                capture: { x: 2, y: 2, colour: Models.GameStone.White },
                centre: { x: 2, y: 3, colour: Models.GameStone.Black }
            }
        ];

        for (let k = 0; k < kos.length; ++k) {
            describe(kos[k].name, () => {
                let testCase = kos[k];
                let position: Models.GamePosition;
                beforeEach(() => {
                    position = new Models.GamePosition(19);
                    testCase.setup(position);
                });

                it("detects and marks ko", () => {
                    assert(Models.GameMoveResult.Success == position.play(testCase.capture.x, testCase.capture.y, testCase.capture.colour), "failed to capture ko");
                    assert(Models.GameMarks.Ko == position.get(testCase.centre.x, testCase.centre.y), "ko mark not placed correctly");
                    assert(testCase.centre.x == position.ko.x, "ko coordinates incorrect");
                    assert(testCase.centre.y == position.ko.y, "ko coordinates incorrect");

                    assert(Models.GameMoveResult.Ko == position.play(testCase.centre.x, testCase.centre.y, testCase.centre.colour), "illegal ko-move not rejected");
                });

                it("clears ko after move", () => {
                    assert(Models.GameMoveResult.Success == position.play(testCase.capture.x, testCase.capture.y, testCase.capture.colour), "failed to capture ko");

                    assert(Models.GameMoveResult.Success == position.play(17, 17, testCase.centre.colour), "failed to play elsewhere");
                    assert(0 == position.get(testCase.centre.x, testCase.centre.y), "ko mark not cleared correctly");
                    assert(null == position.ko, "ko mark not cleared correctly");

                    assert(Models.GameMoveResult.Success == position.play(18, 18, testCase.capture.colour), "failed to respond elsewhere");
                    assert(null == position.ko, "ko mark not cleared correctly");

                    assert(Models.GameMoveResult.Success == position.play(testCase.centre.x, testCase.centre.y, testCase.centre.colour), "failed to re-capture ko");

                    assert(Models.GameMarks.Ko == position.get(testCase.capture.x, testCase.capture.y), "ko mark not placed correctly");
                    assert(testCase.capture.x == position.ko.x, "ko coordinates incorrect");
                    assert(testCase.capture.y == position.ko.y, "ko coordinates incorrect");
                });

                it("clears ko after pass", () => {
                    assert(Models.GameMoveResult.Success == position.play(testCase.capture.x, testCase.capture.y, testCase.capture.colour), "failed to capture ko");

                    position.pass();

                    assert(0 == position.get(testCase.centre.x, testCase.centre.y), "ko mark not cleared correctly");
                    assert(null == position.ko);
                });
            });
        }

        let notKos = [
            {
                name: "captures no stones",
                setup: (position: Models.GamePosition) => {
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(4, 2, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                },
                capture: { x: 3, y: 2, colour: Models.GameStone.Black },
                centre: { x: 2, y: 2, colour: Models.GameStone.White, suicide: false }
            },
            {
                name: "played stone not in atari",
                setup: (position: Models.GamePosition) => {
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(1, 2, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                    position.addStone(2, 2, Models.GameStone.White);
                },
                capture: { x: 3, y: 2, colour: Models.GameStone.Black },
                centre: { x: 2, y: 2, colour: Models.GameStone.White, suicide: true }
            },
            {
                name: "captures more than one stone",
                setup: (position: Models.GamePosition) => {
                    position.addStone(1, 1, Models.GameStone.Black);
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(0, 2, Models.GameStone.Black);
                    position.addStone(1, 3, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(4, 2, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                    position.addStone(1, 2, Models.GameStone.White);
                    position.addStone(2, 2, Models.GameStone.White);
                },
                capture: { x: 3, y: 2, colour: Models.GameStone.Black },
                centre: { x: 2, y: 2, colour: Models.GameStone.White, suicide: false }
            },
            {
                name: "played stone attaches to an existing group",
                setup: (position: Models.GamePosition) => {
                    position.addStone(1, 1, Models.GameStone.Black);
                    position.addStone(2, 1, Models.GameStone.Black);
                    position.addStone(0, 2, Models.GameStone.Black);
                    position.addStone(3, 2, Models.GameStone.Black);
                    position.addStone(1, 3, Models.GameStone.Black);
                    position.addStone(2, 3, Models.GameStone.Black);
                    position.addStone(3, 1, Models.GameStone.White);
                    position.addStone(4, 2, Models.GameStone.White);
                    position.addStone(3, 3, Models.GameStone.White);
                    position.addStone(1, 2, Models.GameStone.White);
                },
                capture: { x: 2, y: 2, colour: Models.GameStone.White },
                centre: { x: 3, y: 2, colour: Models.GameStone.Black, suicide: false }
            }
        ];

        for (let k = 0; k < notKos.length; ++k) {
            describe(notKos[k].name, () => {
                let testCase = notKos[k];
                let position: Models.GamePosition;
                beforeEach(() => {
                    position = new Models.GamePosition(19);
                    testCase.setup(position);
                });

                it("does not detect ko erroneously", () => {
                    assert(Models.GameMoveResult.Success == position.play(testCase.capture.x, testCase.capture.y, testCase.capture.colour), "failed to play move");
                    assert(0 == position.get(testCase.centre.x, testCase.centre.y), "ko marked erroneously");
                    assert(null == position.ko, "ko marked erroneously");

                    if (!testCase.centre.suicide)
                        assert(Models.GameMoveResult.Success == position.play(testCase.centre.x, testCase.centre.y, testCase.centre.colour), "legal move not permitted");
                    else
                        assert(Models.GameMoveResult.Suicide == position.play(testCase.centre.x, testCase.centre.y, testCase.centre.colour), "suicide not rejected");
                });
            });
        }
    });
});
