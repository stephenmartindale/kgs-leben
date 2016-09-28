describe('Models.GameState', () => {
    const assert = require('assert');

    function testGameStateFromSGFEvents(): Models.GameState {
        let gameState: Models.GameState = new Models.GameState(0);
        gameState.processSGFEvents(0,
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 0,
                "props": [
                    {
                        "komi": 6.5,
                        "timeSystem": "none",
                        "size": 9,
                        "name": "RULES",
                        "rules": "japanese"
                    },
                    <KGS.SGF.DATE>{
                        "name": "DATE",
                        "text": "2016-09-27"
                    },
                    {
                        "name": "PLACE",
                        "text": "The KGS Go Server at http://www.gokgs.com/"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 1,
                "type": "CHILD_ADDED",
                "nodeId": 0
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 1,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 6,
                            "y": 2
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 2,
                "type": "CHILD_ADDED",
                "nodeId": 1
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 2,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 2,
                            "y": 6
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 3,
                "type": "CHILD_ADDED",
                "nodeId": 2
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 3,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 6,
                            "y": 6
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 4,
                "type": "CHILD_ADDED",
                "nodeId": 3
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 4,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 2,
                            "y": 2
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 5,
                "type": "CHILD_ADDED",
                "nodeId": 4
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 5,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 5,
                            "y": 5
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 6,
                "type": "CHILD_ADDED",
                "nodeId": 5
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 6,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 5
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 7,
                "type": "CHILD_ADDED",
                "nodeId": 6
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 7,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 5,
                            "y": 7
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 8,
                "type": "CHILD_ADDED",
                "nodeId": 7
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 8,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 7
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 9,
                "type": "CHILD_ADDED",
                "nodeId": 8
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 9,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 6
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 10,
                "type": "CHILD_ADDED",
                "nodeId": 9
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 10,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 3,
                            "y": 6
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 11,
                "type": "CHILD_ADDED",
                "nodeId": 10
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 11,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 4
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 12,
                "type": "CHILD_ADDED",
                "nodeId": 11
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 12,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 5,
                            "y": 6
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 13,
                "position": 1,
                "type": "CHILD_ADDED",
                "nodeId": 4
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 13,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 7
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 14,
                "type": "CHILD_ADDED",
                "nodeId": 13
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 14,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 4,
                            "y": 1
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 15,
                "type": "CHILD_ADDED",
                "nodeId": 14
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 15,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 2,
                            "y": 7
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 16,
                "type": "CHILD_ADDED",
                "nodeId": 15
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 16,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 1,
                            "y": 7
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 17,
                "type": "CHILD_ADDED",
                "nodeId": 16
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 17,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 3,
                            "y": 6
                        },
                        "color": "black",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.CHILD_ADDED>{
                "childNodeId": 18,
                "type": "CHILD_ADDED",
                "nodeId": 17
            },
            <KGS.SGF.PROP_GROUP_ADDED>{
                "type": "PROP_GROUP_ADDED",
                "nodeId": 18,
                "props": [
                    <KGS.SGF.MOVE>{
                        "loc": {
                            "x": 2,
                            "y": 5
                        },
                        "color": "white",
                        "name": "MOVE"
                    }
                ]
            },
            <KGS.SGF.ACTIVATED>{
                "prevNodeId": -1,
                "type": "ACTIVATED",
                "nodeId": 18
            });

        return gameState;
    }

    function testPositionSchemaAt11(modified: boolean): number[] {
        let schema: number[] = [];
        schema[2 * 9 + 2] = Models.GameMarks.WhiteStone;
        schema[2 * 9 + 6] = Models.GameMarks.WhiteStone;
        schema[3 * 9 + 6] = Models.GameMarks.WhiteStone;
        schema[4 * 9 + 5] = Models.GameMarks.WhiteStone;
        schema[4 * 9 + 7] = Models.GameMarks.WhiteStone;
        schema[4 * 9 + 6] = Models.GameMarks.BlackStone;
        schema[6 * 9 + 2] = Models.GameMarks.BlackStone;
        schema[6 * 9 + 6] = Models.GameMarks.BlackStone;
        schema[5 * 9 + 5] = Models.GameMarks.BlackStone;
        schema[5 * 9 + 7] = Models.GameMarks.BlackStone;

        if (!modified) {
            schema[4 * 9 + 4] = Models.GameMarks.BlackStone;
        }
        else {
            schema[3 * 9 + 3] = Models.GameMarks.BlackStone | Models.GameMarks.Triangle;
        }

        return schema;
    }

    function testPositionSchemaAt12(modified: boolean): number[] {
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

        if (!modified) {
            schema[4 * 9 + 4] = Models.GameMarks.BlackStone;
        }
        else {
            schema[3 * 9 + 3] = Models.GameMarks.BlackStone | Models.GameMarks.Triangle;
        }

        return schema;
    }

    function testPositionSchemaAt18(modified: boolean): number[] {
        let schema: number[] = [];
        schema[20] = Models.GameMarks.WhiteStone;
        schema[37] = Models.GameMarks.WhiteStone;
        schema[23] = Models.GameMarks.WhiteStone;
        schema[24] = Models.GameMarks.WhiteStone;
        schema[16] = Models.GameMarks.WhiteStone;
        schema[25] = Models.GameMarks.BlackStone;
        schema[33] = Models.GameMarks.BlackStone;
        schema[43] = Models.GameMarks.BlackStone;
        schema[56] = Models.GameMarks.BlackStone;
        schema[60] = Models.GameMarks.BlackStone;
        return schema;
    }

    function testPositionSchema(nodeId: number, modified: boolean): number[] {
        switch (nodeId) {
            case 11: return testPositionSchemaAt11(modified);
            case 12: return testPositionSchemaAt12(modified);
            case 18: return testPositionSchemaAt18(modified);
        }
    }

    function modifyNode11(gameState: Models.GameState) {
        gameState.processSGFEvents(0, <KGS.SGF.PROP_CHANGED>{
                                          type: KGS.SGF._PROP_CHANGED,
                                          nodeId: 11,
                                          prop: <KGS.SGF.MOVE>{
                                              "loc": {
                                                  "x": 3,
                                                  "y": 3
                                              },
                                              "color": "black",
                                              "name": KGS.SGF._MOVE
                                          }
                                      },
                                      <KGS.SGF.PROP_ADDED>{
                                          type: KGS.SGF._PROP_ADDED,
                                          nodeId: 11,
                                          prop: <KGS.SGF.TRIANGLE>{
                                              "loc": {
                                                  "x": 3,
                                                  "y": 3
                                              },
                                              "name": KGS.SGF._TRIANGLE
                                          }
                                      });
    }

    describe('processSGFEvents: basic behaviour', () => {
        let gameState: Models.GameState;
        before(() => {
            gameState = testGameStateFromSGFEvents();
        });

        it("should have an active path at node #18", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(18 == gameState.tree.activeNode.nodeId, "activeNode is not node #18");
        });

        it("should have a game-position (9 by 9)", () => {
            assert(null != gameState.tree.activeNode.position, "position is null");
            assert(9 == gameState.tree.activeNode.position.size, "position is not 9 by 9");
        });

        it("position should be correct", () => {
            let expected: number[] = testPositionSchemaAt18(false);
            assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });
    });

    let activateSequence: number[] = [ 12, 11, 12, 11, 12, 18, 12, 11, 18, 11, 12, 18, 11, 18, 12, 12, 11, 11, 18, 18 ];

    describe('processSGFEvents: activation of alternate paths', () => {
        let gameState: Models.GameState;
        let schemaAt18: number[];
        before(() => {
            gameState = testGameStateFromSGFEvents();
            schemaAt18 = testPositionSchemaAt18(false);
        });

        it("should have an active path at node #18", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(18 == gameState.tree.activeNode.nodeId, "activeNode is not node #18");
            assert(Utils.arrayEquals(schemaAt18, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        for (let k = 0; k < activateSequence.length; ++k) {
            let nodeId = activateSequence[k];
            it("can activate node #" + nodeId.toString(), () => {
                gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: nodeId });

                assert(null != gameState.tree.activeNode, "activeNode is null");
                assert(nodeId == gameState.tree.activeNode.nodeId, "activeNode is not node #" + nodeId.toString());

                assert(null != gameState.tree.activeNode.position, "position is null");
                assert(9 == gameState.tree.activeNode.position.size, "position is not 9 by 9");

                let expected: number[] = testPositionSchema(nodeId, false);
                assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
            });

            if (nodeId == 12) {
                it("position should detect ko", () => {
                    assert(gameState.tree.testMove(4, 6, Models.GameStone.Black) == Models.GameMoveResult.Ko, "illegal ko-move not rejected");
                });
            }
        }
    });

    describe('processSGFEvents: change inactive node', () => {
        let gameState: Models.GameState;
        let schemaAt18: number[];
        before(() => {
            gameState = testGameStateFromSGFEvents();
            schemaAt18 = testPositionSchemaAt18(false);
        });

        it("should have an active path at node #18", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(18 == gameState.tree.activeNode.nodeId, "activeNode is not node #18");
            assert(Utils.arrayEquals(schemaAt18, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        it("can update inactive nodes with SGF events", () => {
            modifyNode11(gameState);
        });

        it("should have an active path at node #18", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(18 == gameState.tree.activeNode.nodeId, "activeNode is not node #18");
            assert(Utils.arrayEquals(schemaAt18, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        for (let k = 0; k < activateSequence.length; ++k) {
            let nodeId = activateSequence[k];
            it("can activate node #" + nodeId.toString(), () => {
                gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: nodeId });

                assert(null != gameState.tree.activeNode, "activeNode is null");
                assert(nodeId == gameState.tree.activeNode.nodeId, "activeNode is not node #" + nodeId.toString());

                assert(null != gameState.tree.activeNode.position, "position is null");
                assert(9 == gameState.tree.activeNode.position.size, "position is not 9 by 9");

                let expected: number[] = testPositionSchema(nodeId, true);
                assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
            });

            if (nodeId == 12) {
                it("position should detect ko", () => {
                    assert(gameState.tree.testMove(4, 6, Models.GameStone.Black) == Models.GameMoveResult.Ko, "illegal ko-move not rejected");
                });
            }
        }
    });

    describe('processSGFEvents: change active node', () => {
        let gameState: Models.GameState;
        before(() => {
            gameState = testGameStateFromSGFEvents();
            gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: 11 });
        });

        it("should have an active path at node #11", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(11 == gameState.tree.activeNode.nodeId, "activeNode is not node #11");

            let expected: number[] = testPositionSchemaAt11(false);
            assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        it("can update active node with SGF events", () => {
            modifyNode11(gameState);
        });

        it("should have an active path at node #11", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(11 == gameState.tree.activeNode.nodeId, "activeNode is not node #11");

            let expected: number[] = testPositionSchemaAt11(true);
            assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        for (let k = 0; k < activateSequence.length; ++k) {
            let nodeId = activateSequence[k];
            it("can activate node #" + nodeId.toString(), () => {
                gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: nodeId });

                assert(null != gameState.tree.activeNode, "activeNode is null");
                assert(nodeId == gameState.tree.activeNode.nodeId, "activeNode is not node #" + nodeId.toString());

                assert(null != gameState.tree.activeNode.position, "position is null");
                assert(9 == gameState.tree.activeNode.position.size, "position is not 9 by 9");

                let expected: number[] = testPositionSchema(nodeId, true);
                assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
            });

            if (nodeId == 12) {
                it("position should detect ko", () => {
                    assert(gameState.tree.testMove(4, 6, Models.GameStone.Black) == Models.GameMoveResult.Ko, "illegal ko-move not rejected");
                });
            }
        }
    });

    describe('processSGFEvents: change node on active path', () => {
        let gameState: Models.GameState;
        before(() => {
            gameState = testGameStateFromSGFEvents();
            gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: 12 });
        });

        it("should have an active path at node #12", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(12 == gameState.tree.activeNode.nodeId, "activeNode is not node #12");

            let expected: number[] = testPositionSchemaAt12(false);
            assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        it("can update node on active path with SGF events", () => {
            modifyNode11(gameState);
        });

        it("should have an active path at node #12", () => {
            assert(null != gameState.tree.activeNode, "activeNode is null");
            assert(12 == gameState.tree.activeNode.nodeId, "activeNode is not node #12");

            let expected: number[] = testPositionSchemaAt12(true);
            assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
        });

        for (let k = 0; k < activateSequence.length; ++k) {
            let nodeId = activateSequence[k];
            it("can activate node #" + nodeId.toString(), () => {
                gameState.processSGFEvents(0, <KGS.SGF.ACTIVATED>{ type: KGS.SGF._ACTIVATED, nodeId: nodeId });

                assert(null != gameState.tree.activeNode, "activeNode is null");
                assert(nodeId == gameState.tree.activeNode.nodeId, "activeNode is not node #" + nodeId.toString());

                assert(null != gameState.tree.activeNode.position, "position is null");
                assert(9 == gameState.tree.activeNode.position.size, "position is not 9 by 9");

                let expected: number[] = testPositionSchema(nodeId, true);
                assert(Utils.arrayEquals(expected, gameState.tree.activeNode.position.schema, Utils.ComparisonFlags.Values), "position-schema does not match");
            });

            if (nodeId == 12) {
                it("position should detect ko", () => {
                    assert(gameState.tree.testMove(4, 6, Models.GameStone.Black) == Models.GameMoveResult.Ko, "illegal ko-move not rejected");
                });
            }
        }
    });
});
