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

        public get position(): Models.GamePosition {
            return (this._activeNodeId != null)? this._positions[this._activeNodeId] : null;
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
                        switch (properties[p].name) {
                            case KGS.SGF._MOVE:
                                let move = properties[p] as KGS.SGF.MOVE;
                                let colour = (move.color == "white")? GameStone.White : GameStone.Black;
                                if (move.loc == "PASS") {
                                    position.pass(colour);
                                }
                                else {
                                    let loc = move.loc as number[];
                                    position.play(loc[0], loc[1], colour);
                                }
                                break;
                        }
                    }
                }

                this._positions[activateId] = position;
                this._activeNodeId = activateId;
                previousPosition = position;
            }
        }

        public processEvents(...events: KGS.SGF.NodeEvent[]) {
            if ((events == null) || (events.length <= 0)) return;
            if (this._facade == null) this._facade = <any>(new GameTreeFacade());
            for (let i = 0; i < events.length; ++i) {
                let event: KGS.SGF.NodeEvent = events[i];
                let filter = this._facade[event.type];
                if ((filter != null) && (typeof filter === "function")) {
                    filter(this, event);
                }
                else Framework.log(Framework.LogSeverity.Info, "KGS SGF Event not recognised:", event.type, event);
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

        private locationsEqual(left: "PASS" | number[], right: "PASS" | number[]) {
            if ((left == null) || (right == null)) return (left == right);
            if (left === right) return true;
            else if ((Utils.isArray(left)) && (Utils.isArray(right))) return Utils.arrayEquals(left as number[], right as number[]);
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

    class GameTreeFacade {
        PROP_ADDED(tree: GameTree, event: KGS.SGF.PROP_ADDED) {
            tree.get(event.nodeId).addProperty(event.prop);
            tree.refreshPosition(event.nodeId);  // TODO: Only call refreshPosition() if the properties are position related.
                                                 // TODO: If 'adding' to the current active position, no need to refresh - just perform the add
        }
        PROP_REMOVED(tree: GameTree, event: KGS.SGF.PROP_REMOVED) {
            tree.get(event.nodeId).removeProperty(event.prop);
            tree.refreshPosition(event.nodeId);  // TODO: Only call refreshPosition() if the properties are position related.
        }
        PROP_CHANGED(tree: GameTree, event: KGS.SGF.PROP_CHANGED) {
            tree.get(event.nodeId).setProperty(event.prop);
            tree.refreshPosition(event.nodeId);  // TODO: Only call refreshPosition() if the properties are position related.
        }

        PROP_GROUP_ADDED(tree: GameTree, event: KGS.SGF.PROP_GROUP_ADDED) {
            let node = tree.get(event.nodeId);
            for (let i = 0; i < event.props.length; ++i) {
                node.addProperty(event.props[i]);
            }

            tree.refreshPosition(event.nodeId);  // TODO: Only call refreshPosition() if the properties are position related.
                                                 // TODO: If 'adding' to the current active position, no need to refresh - just perform the add
        }
        PROP_GROUP_REMOVED(tree: GameTree, event: KGS.SGF.PROP_GROUP_REMOVED) {
            let node = tree.get(event.nodeId);
            for (let i = 0; i < event.props.length; ++i) {
                node.removeProperty(event.props[i]);
            }

            tree.refreshPosition(event.nodeId);  // TODO: Only call refreshPosition() if the properties are position related.
        }

        CHILD_ADDED(tree: GameTree, event: KGS.SGF.CHILD_ADDED) {
            let parent = tree.get(event.nodeId);
            parent.addChild(event.childNodeId);
        }

        CHILDREN_REORDERED(tree: GameTree, event: KGS.SGF.CHILDREN_REORDERED) {
            let parent = tree.get(event.nodeId);
            if (Utils.setEquals(parent.children, event.children)) {
                parent.children = Utils.arrayClone(event.children);
            }
            else throw "Game Tree reordering children would alter the child set";
        }

        ACTIVATED(tree: GameTree, event: KGS.SGF.ACTIVATED) {
            tree.activate(event.nodeId);
        }
    }
}
