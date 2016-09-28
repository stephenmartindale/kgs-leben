namespace Models {
    const RootNodeId: number = 0;

    export class GameTree {
        public size: number;
        public root: GameTreeNode;
        public nodes: GameTreeNode[];

        private _activeNode: GameTreeNode;

        private _facade: { [type: string]: ((tree: GameTree, event: KGS.SGF.NodeEvent) => void) }

        constructor(size?: number) {
            this.size = size;
            this.root = new GameTreeNode(this, RootNodeId);
            this.nodes = [this.root];

            this._activeNode = null;
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

        public get activeNode(): Models.GameTreeNode {
            return this._activeNode;
        }

        public get position(): Models.GamePosition {
            return (null != this._activeNode)? this._activeNode.position : null;
        }

        public activate(changedNodes: { [nodeId: number]: boolean }, activateNodeId: number) {
            // Path of nodes to activate (in reverse order)
            let activate: number[] = [];

            if (null == activateNodeId) {
                if (null != this._activeNode) {
                    activateNodeId = this._activeNode.nodeId;
                }
                else return;
            }

            // Count of nodes to deactivate
            let changedCount: number = Object.keys(changedNodes).length;

            // Traverse up the tree until you find a node on the active path...
            let currentNode: GameTreeNode = this.nodes[activateNodeId];
            while ((null != currentNode) && (null == currentNode.position)) {
                let currentNodeId: number = currentNode.nodeId;
                activate.push(currentNodeId);
                if (changedNodes[currentNodeId]) -- changedCount;
                currentNode = currentNode.parent;
            }

            // Deactivate obsolete nodes on the active path...
            let deactivateNode: GameTreeNode = this._activeNode;
            while ((null != deactivateNode) && (currentNode !== deactivateNode)) {
                deactivateNode.position = null;
                if (changedNodes[deactivateNode.nodeId]) -- changedCount;
                deactivateNode = deactivateNode.parent;
            }

            // Continue deactivating the active path untill all changed nodes have been deactivated...
            while ((null != currentNode) && (changedCount > 0)) {
                let currentNodeId: number = currentNode.nodeId;
                currentNode.position = null;
                activate.push(currentNodeId);
                if (changedNodes[currentNodeId]) -- changedCount;
                currentNode = currentNode.parent;
            }

            // Activate the new path...
            for (let j = (activate.length - 1); j >= 0; --j) {
                let activateNode = this.nodes[activate[j]];

                // ASSERT
                if ((null != currentNode) && (currentNode.nodeId != activateNode.parentId)) throw new Error("Attempted to activate off a path");
                if (null != activateNode.position) throw new Error("Attempted to activate an activenode");

                let previousPosition: Models.GamePosition = (null != currentNode)? currentNode.position : null;

                if (previousPosition) {
                    activateNode.position = new Models.GamePosition(previousPosition);
                }
                else if (this.size) {
                    activateNode.position = new Models.GamePosition(this.size);
                }
                else {
                    let rules = activateNode.getProperty(KGS.SGF._RULES) as KGS.SGF.RULES;
                    let size: number = 19;
                    if ((rules) && (rules.size)) size = rules.size;
                    activateNode.position = new Models.GamePosition(size);
                }

                activateNode.position.effectEvent(activateNode.properties);
                currentNode = activateNode;
            }

            // The node is activated
            this._activeNode = currentNode;
        }

        public testMove(x: number, y: number, colour: GameStone): GameMoveResult {
            if (null == this._activeNode) {
                Utils.log(Utils.LogSeverity.Warning, "The game tree does not have an active path");
                return null;
            }
            else if (null == this._activeNode.position) {
                Utils.log(Utils.LogSeverity.Warning, "The game tree does not have an active position");
                return null;
            }

            let position: Models.GamePosition = this._activeNode.position;
            let parentPosition: Models.GamePosition = (null != this._activeNode.parentId)? this.get(this._activeNode.parentId).position : null;

            let clone = new Models.GamePosition(position);
            return clone.play(x, y, colour, parentPosition);
        }
    }
}
