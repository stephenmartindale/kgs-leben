namespace Models {
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

        private locationsEqual(left: KGS.Location, right: KGS.Location) {
            if (left.loc == right.loc) return true;

            if ((left.loc != null) && (Utils.isObject(left.loc))
             && (right.loc != null) && (Utils.isObject(right.loc))) {
                let l = left.loc as KGS.Coordinates;
                let r = right.loc as KGS.Coordinates;
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
                        let location = <KGS.SGF.LocationProperty>property;
                        let firstProperty: number = notFound;
                        for (let i = 0; i < this._properties.length; ++i) {
                            if (this._properties[i].name == propertyName) {
                                if (this.locationsEqual((<KGS.SGF.LocationProperty>this._properties[i]), location)) return i;
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
