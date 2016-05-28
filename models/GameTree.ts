namespace Models {
    const RootNodeId: number = 0;

    export class GameTree {
        public size: number;
        public root: GameTreeNode;
        public nodes: GameTreeNode[];

        private _positions: { [nodeId: number]: Models.GamePosition };
        private _activeNodeId: number;

        private _facade: { [type: string]: ((tree: GameTree, event: KGS.SGF.NodeEvent) => void) }

        constructor(size?: number) {
            this.size = size;
            this.root = new GameTreeNode(this, RootNodeId);
            this.nodes = [this.root];
            this._positions = {};
            this._activeNodeId = null;
        }

        public get(nodeId: number): GameTreeNode {
            if (nodeId < this.nodes.length) {
                let node = this.nodes[nodeId];
                if (node != null) return node;
            }

            throw "Game Tree Node [" + nodeId.toString() + "] not found";
        }

        public create(nodeId: number): GameTreeNode {
            let node: GameTreeNode;
            if (nodeId < this.nodes.length) {
                node = this.nodes[nodeId];
                if (node != null) return node;
            }

            node = new GameTreeNode(this, nodeId);
            this.nodes[nodeId] = node;
            return node;
        }

        private revertPosition(nodeId: number) {
            if ((nodeId == null) || (nodeId < RootNodeId)) {
                this._positions = {};
                this._activeNodeId = null;
            }

            while (this._activeNodeId != nodeId) {
                delete this._positions[this._activeNodeId];
                this._activeNodeId = this.nodes[this._activeNodeId].parent;
            }
        }

        public refreshPosition(nodeId: number) {
            if (this._positions[nodeId]) {
                let reactivateNodeId: number = this._activeNodeId;
                this.revertPosition(this.nodes[nodeId].parent);
                this.activate(reactivateNodeId);
            }
        }

        public get previousPosition(): Models.GamePosition {
            if (this._activeNodeId != null) {
                let node = this.nodes[this._activeNodeId];
                if (node.parent != null) {
                    return this._positions[node.parent];
                }
            }

            return null;
        }

        public get position(): Models.GamePosition {
            return (this._activeNodeId != null)? this._positions[this._activeNodeId] : null;
        }

        public tryPlay(x: number, y: number): GameMoveError {
            let position = this.position;
            if (!position) throw "Moves may not be played without a pre-existing game Position";

            let clone = new Models.GamePosition(position);
            let previousPosition = this.previousPosition;

            return clone.play(x, y, position.turn, previousPosition);
        }

        public activate(nodeId: number) {
            if ((nodeId == null) || (nodeId < RootNodeId)) {
                this.revertPosition(null);
                return;
            }

            let node = this.get(nodeId);

            // Path of nodes to activate (in reverse order)
            let activate: number[] = [];

            // Traverse up the tree until you find a node on the active path...
            let seekId: number = nodeId;
            while (!this._positions[seekId]) {
                activate.push(seekId);
                seekId = this.nodes[seekId].parent;
                if (seekId == null) break;
            }

            // Truncate the active path
            this.revertPosition(seekId);

            // Activate the new path...
            let previousPosition: Models.GamePosition = (this._activeNodeId != null)? this._positions[this._activeNodeId] : null;
            for (let j = (activate.length - 1); j >= 0; --j) {
                let activateId: number = activate[j];
                let node = this.nodes[activateId];
                let position: Models.GamePosition;
                if (previousPosition) {
                    position = new Models.GamePosition(previousPosition);
                }
                else if (this.size) {
                    position = new Models.GamePosition(this.size);
                }
                else {
                    let rules = node.getProperty(KGS.SGF._RULES) as KGS.SGF.RULES;
                    let size: number = 19;
                    if ((rules) && (rules.size)) size = rules.size;
                    position = new Models.GamePosition(size);
                }

                let properties = node.properties;
                if (properties) {
                    for (let p = 0; p < properties.length; ++p) {
                        let pass: boolean = null;
                        let loc: KGS.Coordinates = null;
                        if ((<KGS.SGF.LocationProperty>properties[p]).loc) {
                            if ((<KGS.SGF.LocationProperty>properties[p]).loc == "PASS") {
                                pass = true;
                            }
                            else if (Utils.isObject((<KGS.SGF.LocationProperty>properties[p]).loc)) {
                                pass = false;
                                loc = (<KGS.SGF.LocationProperty>properties[p]).loc as KGS.Coordinates;
                            }
                        }

                        let colour: Models.GameStone = null;
                        if ((<KGS.SGF.ColourProperty>properties[p]).color) colour = ((<KGS.SGF.ColourProperty>properties[p]).color == "white")? GameStone.White : GameStone.Black;

                        switch (properties[p].name) {
                            case KGS.SGF._MOVE:
                                if (pass) position.pass(colour);
                                else if (loc) position.play(loc.x, loc.y, colour);
                                else Utils.log(Utils.LogSeverity.Warning, "KGS SGF MOVE property could not be effected");
                                break;

                            case KGS.SGF._ADDSTONE:
                                if (loc) position.addStone(loc.x, loc.y, colour);
                                else Utils.log(Utils.LogSeverity.Warning, "KGS SGF ADDSTONE property could not be effected");
                                break;

                            case KGS.SGF._TERRITORY:
                                if (loc) position.addMarks(loc.x, loc.y, (colour == Models.GameStone.White)? Models.GameMarks.WhiteTerritory : Models.GameMarks.BlackTerritory);
                                else Utils.log(Utils.LogSeverity.Warning, "KGS SGF TERRITORY property could not be effected");
                                break;

                            case KGS.SGF._DEAD:
                                if (loc) position.addMarks(loc.x, loc.y, Models.GameMarks.Dead);
                                else Utils.log(Utils.LogSeverity.Warning, "KGS SGF DEAD property could not be effected");
                                break;
                        }
                    }
                }

                this._positions[activateId] = position;
                this._activeNodeId = activateId;
                previousPosition = position;
            }
        }
    }
}
