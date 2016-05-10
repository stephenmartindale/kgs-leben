namespace Models {
    export class GameState {
        public tree: Models.GameTree;
        public clockWhite: Models.GameClock;
        public clockBlack: Models.GameClock;

        constructor(perfstamp: number, size?: number) {
            this.tree = new Models.GameTree(size);
            this.clockWhite = new Models.GameClock(perfstamp);
            this.clockBlack = new Models.GameClock(perfstamp);
        }

        public processSGFEvents(perfstamp: number, ...events: KGS.SGF.NodeEvent[]) {
            if ((events == null) || (events.length <= 0)) return;
            for (let i = 0; i < events.length; ++i) {
                let event: KGS.SGF.NodeEvent = events[i];
                switch (event.type) {
                    case "PROP_ADDED": this.sgfPropAdded(perfstamp, <KGS.SGF.PROP_ADDED>event); break;
                    case "PROP_REMOVED": this.sgfPropRemoved(perfstamp, <KGS.SGF.PROP_REMOVED>event); break;
                    case "PROP_CHANGED": this.sgfPropChanged(perfstamp, <KGS.SGF.PROP_CHANGED>event); break;
                    case "PROP_GROUP_ADDED": this.sgfPropGroupAdded(perfstamp, <KGS.SGF.PROP_GROUP_ADDED>event); break;
                    case "PROP_GROUP_REMOVED": this.sgfPropGroupRemoved(perfstamp, <KGS.SGF.PROP_GROUP_REMOVED>event); break;
                    case "CHILD_ADDED": this.sgfChildAdded(perfstamp, <KGS.SGF.CHILD_ADDED>event); break;
                    case "CHILDREN_REORDERED": this.sgfChildrenReordered(perfstamp, <KGS.SGF.CHILDREN_REORDERED>event); break;
                    case "ACTIVATED": this.sgfActivated(perfstamp, <KGS.SGF.ACTIVATED>event); break;
                    default: Utils.log(Utils.LogSeverity.Info, "KGS SGF Event not recognised:", event.type, event);
                }
            }
        }

        private sgfSetRules(perfstamp: number, rules: KGS.SGF.RULES) {
            this.clockWhite.rules = rules;
            this.clockBlack.rules = rules;
        }

        private sgfAffectsPosition(propName: string): boolean {
            // TODO: Only call refreshPosition() if the properties are position related.
            // TODO: If 'adding' to the current active position, no need to refresh - just perform the add
            return true;
        }
        private sgfPropAdded(perfstamp: number, event: KGS.SGF.PROP_ADDED) {
            let node = this.tree.get(event.nodeId);
            node.addProperty(event.prop);
            if (event.prop.name == KGS.SGF._RULES) this.sgfSetRules(perfstamp, event.prop as KGS.SGF.RULES);
            if (this.sgfAffectsPosition(event.prop.name)) this.tree.refreshPosition(event.nodeId);
        }
        private sgfPropRemoved(perfstamp: number, event: KGS.SGF.PROP_REMOVED) {
            this.tree.get(event.nodeId).removeProperty(event.prop);
            if (this.sgfAffectsPosition(event.prop.name)) this.tree.refreshPosition(event.nodeId);
        }
        private sgfPropChanged(perfstamp: number, event: KGS.SGF.PROP_CHANGED) {
            let node = this.tree.get(event.nodeId);
            node.setProperty(event.prop);
            if (event.prop.name == KGS.SGF._RULES) this.sgfSetRules(perfstamp, event.prop as KGS.SGF.RULES);
            if (this.sgfAffectsPosition(event.prop.name)) this.tree.refreshPosition(event.nodeId);
        }
        private sgfPropGroupAdded(perfstamp: number, event: KGS.SGF.PROP_GROUP_ADDED) {
            let node = this.tree.get(event.nodeId);
            let refreshPosition: boolean = false;
            for (let i = 0; i < event.props.length; ++i) {
                node.addProperty(event.props[i]);
                if (event.props[i].name == KGS.SGF._RULES) this.sgfSetRules(perfstamp, event.props[i] as KGS.SGF.RULES);
                if (this.sgfAffectsPosition(event.props[i].name)) refreshPosition = true;
            }

            if (refreshPosition) this.tree.refreshPosition(event.nodeId);
        }
        private sgfPropGroupRemoved(perfstamp: number, event: KGS.SGF.PROP_GROUP_REMOVED) {
            let node = this.tree.get(event.nodeId);
            let refreshPosition: boolean = false;
            for (let i = 0; i < event.props.length; ++i) {
                node.removeProperty(event.props[i]);
                if (this.sgfAffectsPosition(event.props[i].name)) refreshPosition = true;
            }

            if (refreshPosition) this.tree.refreshPosition(event.nodeId);
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
        private sgfActivated(perfstamp: number, event: KGS.SGF.ACTIVATED) {
            this.tree.activate(event.nodeId);
        }

        public mergeClockStates(perfstamp: number, whiteClock: KGS.Downstream.ClockState, blackClock: KGS.Downstream.ClockState) {
            if (whiteClock) this.clockWhite.mergeClockState(perfstamp, whiteClock);
            if (blackClock) this.clockBlack.mergeClockState(perfstamp, blackClock);
        }
    }
}
