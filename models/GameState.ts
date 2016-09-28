namespace Models {
    export class GameState {
        public tree: Models.GameTree;
        public rules: Models.GameRules;
        public clockWhite: Models.GameClock;
        public clockBlack: Models.GameClock;

        constructor(perfstamp: number, size?: number) {
            this.tree = new Models.GameTree(size);
            this.clockWhite = new Models.GameClock(perfstamp);
            this.clockBlack = new Models.GameClock(perfstamp);
        }

        public processSGFEvents(perfstamp: number, ...events: KGS.SGF.NodeEvent[]) {
            if ((events == null) || (events.length <= 0)) return;

            let changedNodes: { [nodeId: number]: boolean } = {};
            let activateNodeId: number = undefined;

            for (let i = 0; i < events.length; ++i) {
                let event: KGS.SGF.NodeEvent = events[i];
                switch (event.type) {
                    case "PROP_ADDED":
                        this.sgfPropAdded(perfstamp, <KGS.SGF.PROP_ADDED>event, changedNodes);
                        break;
                    case "PROP_REMOVED":
                        this.sgfPropRemoved(perfstamp, <KGS.SGF.PROP_REMOVED>event, changedNodes);
                        break;
                    case "PROP_CHANGED":
                        this.sgfPropChanged(perfstamp, <KGS.SGF.PROP_CHANGED>event, changedNodes);
                        break;
                    case "PROP_GROUP_ADDED":
                        this.sgfPropGroupAdded(perfstamp, <KGS.SGF.PROP_GROUP_ADDED>event, changedNodes);
                        break;
                    case "PROP_GROUP_REMOVED":
                        this.sgfPropGroupRemoved(perfstamp, <KGS.SGF.PROP_GROUP_REMOVED>event, changedNodes);
                        break;

                    case "CHILD_ADDED":
                        this.sgfChildAdded(perfstamp, <KGS.SGF.CHILD_ADDED>event);
                        break;
                    case "CHILDREN_REORDERED":
                        this.sgfChildrenReordered(perfstamp, <KGS.SGF.CHILDREN_REORDERED>event);
                        break;

                    case "ACTIVATED":
                        activateNodeId = event.nodeId;
                        break;

                    default:
                        Utils.log(Utils.LogSeverity.Info, "KGS SGF Event not recognised:", event.type, event);
                        break;
                }
            }

            let changedNodeKeys = Object.keys(changedNodes);
            if ((changedNodeKeys.length > 0) || (activateNodeId !== undefined)) {
                this.tree.activate(changedNodes, activateNodeId);
            }
        }

        private setRules(rules: KGS.SGF.RULES) {
            if (!this.rules) this.rules = new Models.GameRules(rules);
            else this.rules.setRules(rules);

            this.clockWhite.rules = this.rules;
            this.clockBlack.rules = this.rules;
        }

        private sgfPropAdded(perfstamp: number, event: KGS.SGF.PROP_ADDED, changedNodes: { [nodeId: number]: boolean }) {
            let node = this.tree.get(event.nodeId);
            if ((node.addProperty(event.prop)) && (null != node.position) && (Models.GamePosition.affectsPosition(event.prop))) {
                changedNodes[node.nodeId] = true;
            }

            if (event.prop.name == KGS.SGF._RULES) this.setRules(event.prop as KGS.SGF.RULES);
        }
        private sgfPropRemoved(perfstamp: number, event: KGS.SGF.PROP_REMOVED, changedNodes: { [nodeId: number]: boolean }) {
            let node = this.tree.get(event.nodeId);
            if ((node.removeProperty(event.prop)) && (null != node.position) && (Models.GamePosition.affectsPosition(event.prop))) {
                changedNodes[node.nodeId] = true;
            }
        }
        private sgfPropChanged(perfstamp: number, event: KGS.SGF.PROP_CHANGED, changedNodes: { [nodeId: number]: boolean }) {
            let node = this.tree.get(event.nodeId);
            if ((node.setProperty(event.prop)) && (null != node.position) && (Models.GamePosition.affectsPosition(event.prop))) {
                changedNodes[node.nodeId] = true;
            }

            if (event.prop.name == KGS.SGF._RULES) this.setRules(event.prop as KGS.SGF.RULES);
        }

        private sgfPropGroupAdded(perfstamp: number, event: KGS.SGF.PROP_GROUP_ADDED, changedNodes: { [nodeId: number]: boolean }) {
            let node = this.tree.get(event.nodeId);
            let positionAffected: boolean = false;
            for (let i = 0; i < event.props.length; ++i) {
                let prop = event.props[i];
                if ((node.addProperty(prop)) && (Models.GamePosition.affectsPosition(prop))) {
                    positionAffected = true;
                }

                if (event.props[i].name == KGS.SGF._RULES) this.setRules(event.props[i] as KGS.SGF.RULES);
            }

            if ((positionAffected) && (null != node.position)) {
                changedNodes[node.nodeId] = true;
            }
        }
        private sgfPropGroupRemoved(perfstamp: number, event: KGS.SGF.PROP_GROUP_REMOVED, changedNodes: { [nodeId: number]: boolean }) {
            let node = this.tree.get(event.nodeId);
            let positionAffected: boolean = false;
            for (let i = 0; i < event.props.length; ++i) {
                let prop = event.props[i];
                if ((node.removeProperty(event.props[i])) && (Models.GamePosition.affectsPosition(prop))) {
                    positionAffected = true;
                }
            }

            if ((positionAffected) && (null != node.position)) {
                changedNodes[node.nodeId] = true;
            }
        }

        private sgfChildAdded(perfstamp: number, event: KGS.SGF.CHILD_ADDED) {
            let parent = this.tree.get(event.nodeId);
            parent.addChild(event.childNodeId);
        }
        private sgfChildrenReordered(perfstamp: number, event: KGS.SGF.CHILDREN_REORDERED) {
            let parent = this.tree.get(event.nodeId);
            if (Utils.setEquals(parent.children, event.children, Utils.ComparisonFlags.Shallow)) {
                parent.children = Utils.cloneArray(event.children, true);
            }
            else throw "Game Tree reordering children would alter the child set";
        }

        public mergeClockStates(perfstamp: number, gamePhase: Models.GamePhase, whiteClock: KGS.Downstream.ClockState, blackClock: KGS.Downstream.ClockState) {
            if (whiteClock) this.clockWhite.mergeClockState(perfstamp, gamePhase, whiteClock);
            if (blackClock) this.clockBlack.mergeClockState(perfstamp, gamePhase, blackClock);
        }
    }
}
