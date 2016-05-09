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

            let changes = clone.play(x, y, position.turn, previousPosition);
            if (Utils.isNumber(changes)) return <number>changes;
            else return GameMoveError.Success;
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
                        let loc: KGS.SGF.LocationObject = null;
                        if ((<KGS.SGF.LocationProperty>properties[p]).loc) {
                            if ((<KGS.SGF.LocationProperty>properties[p]).loc == "PASS") {
                                pass = true;
                            }
                            else if (Utils.isObject((<KGS.SGF.LocationProperty>properties[p]).loc)) {
                                pass = false;
                                loc = (<KGS.SGF.LocationProperty>properties[p]).loc as KGS.SGF.LocationObject;
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
                                if (loc) position.add(loc.x, loc.y, colour);
                                else Utils.log(Utils.LogSeverity.Warning, "KGS SGF ADDSTONE property could not be effected");
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

    export class GameTreeNode {
        public tree: GameTree;
        public nodeId: number;
        public parent: number;
        public children: number[];

        private _properties: KGS.SGF.Property[];

        constructor(tree: GameTree, nodeId: number) {
            this.tree = tree;
            this.nodeId = nodeId;
        }

        public addChild(childNodeId: number) {
            let child = this.tree.create(childNodeId);
            child.parent = this.nodeId;

            if (this.children == null)
                this.children = [childNodeId];
            else
                this.children.push(childNodeId);
        }

        public get properties(): KGS.SGF.Property[] {
            return this._properties;
        }

        public addProperty(property: KGS.SGF.Property) {
            if (this._properties == null)
                this._properties = [property];
            else
                this._properties.push(property);
        }

        private locationsEqual(left: "PASS" | KGS.SGF.LocationObject, right: "PASS" | KGS.SGF.LocationObject) {
            if ((left == null) || (right == null)) return (left == right);
            if (left === right) return true;
            else if ((Utils.isObject(left)) && (Utils.isObject(right))) {
                let l = left as KGS.SGF.LocationObject;
                let r = right as KGS.SGF.LocationObject;
                return ((l.x == r.x) && (l.y == r.y));
            }
            return false;
        }

        private findProperty(property: string | KGS.SGF.Property): number {
            if (property != null) {
                const notFound: number = -1;
                if (this._properties == null) {
                    return notFound;
                }
                else if (Utils.isString(property)) {
                    for (let i = 0; i < this._properties.length; ++i) {
                        if (this._properties[i].name == property) return i;
                    }

                    return notFound;
                }
                else if ((<KGS.SGF.Property>property).name) {
                    let propertyName: string = (<KGS.SGF.Property>property).name;
                    if ((<KGS.SGF.LocationProperty>property).loc == null) return this.findProperty(propertyName);
                    else {
                        let location = (<KGS.SGF.LocationProperty>property).loc;
                        let firstProperty: number = notFound;
                        for (let i = 0; i < this._properties.length; ++i) {
                            if (this._properties[i].name == propertyName) {
                                if (this.locationsEqual((<KGS.SGF.LocationProperty>this._properties[i]).loc, location)) return i;
                                else if (firstProperty == notFound) firstProperty = i;
                            }
                        }

                        return firstProperty;
                    }
                }
            }

            throw 'Argument was not a valid SGF Property';
        }

        public setProperty(property: KGS.SGF.Property) {
            let i: number = this.findProperty(property);
            if (i >= 0) {
                this._properties[i] = property;
            }
            else {
                this.addProperty(property);
            }
        }

        public removeProperty(property: string | KGS.SGF.Property): boolean {
            let i: number = this.findProperty(property);
            if (i >= 0) {
                this._properties.splice(i, 1);
                return true;
            }
            else return false;
        }

        public getProperty(name: string): KGS.SGF.Property {
            let i: number = this.findProperty(name);
            if (i >= 0) {
                return this._properties[i];
            }
            else return undefined;
        }
    }
}
