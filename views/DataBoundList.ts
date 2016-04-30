namespace Views {
    export abstract class DataBoundList<T, C extends HTMLElement, E extends HTMLElement> implements Views.View<C> {
        protected container: C;

        private _initialised: boolean;
        private _keys: string[];

        constructor(container: C) {
            this.container = container;
            this._initialised = false;
            this._keys = [];
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this.container);
        }

        public activate(): void {
        }

        public deactivate(): void {
        }

        private initialise() {
            if ((!this._initialised) && (this.container.childElementCount > 0)) {
                Utils.log(Utils.LogSeverity.Warning, "Data Bound List: " + this.container.childElementCount.toString() + " alien element(s) removed");
            }

            $(this.container).empty();
            this._initialised = true;
        }

        private beginBind(dataCount: number): boolean {
            // Initialise on first Bind or if incoming data is empty
            if ((!this._initialised) || (dataCount == 0)) this.initialise();

            // Short-circuit if no data was supplied
            return (dataCount > 0);
        }

        protected bindDictionary(data: { [key: string]: T }, keys?: (number | string)[]) {
            // Examine incoming data
            let oldKeys: string[] = this._keys;
            let dataMap: { [key: string]: boolean } = {};
            let dataCount: number = 0;
            if (data != null) {
                this._keys = (keys == null)? Object.keys(data) : <any>(keys.slice());
                for (let i = 0; i < this._keys.length; ++i) {
                    let k: string = this._keys[i];
                    if (data[k]) {
                        if (dataCount != i) this._keys[dataCount] = k;
                        dataMap[k] = true;
                        ++dataCount;
                    }
                }

                this._keys.length = dataCount;
            }

            // Begin Binding ...
            if (!this.beginBind(dataCount)) return;

            // Process known keys and remove obsolete elements
            let oldIndex: { [key: string]: number } = {};
            let oldCount: number = 0;
            for (let j = 0; j < oldKeys.length; ++j) {
                let k: string = oldKeys[j];
                if (dataMap[k]) {
                    oldIndex[k] = oldCount;
                    if (oldCount != j) {
                        oldKeys[oldCount] = k;
                    }

                    ++oldCount;
                }
                else $(this.container.children[oldCount]).remove();
            }

            oldKeys.length = oldCount;

            // Process data
            let created: number = 0;
            for (let i = 0; i < dataCount; ++i) {
                let k: string = this._keys[i];
                let datum: T = data[k];
                let idx: number = oldIndex[k];
                if (null == idx) {
                    this.container.insertBefore(this.createChild(k, datum), this.container.children[i]);
                    ++created;
                }
                else {
                    let child: Element = this.container.children[idx + created];
                    if ((idx + created) > i) {
                        let right: Node = child.nextSibling;
                        let left: Node = this.container.children[i];
                        let leftKey: string = oldKeys[i - created];

                        this.container.insertBefore(child, left);
                        if ((idx + created) > (i + 1)) {
                            this.container.insertBefore(left, right);
                        }

                        oldKeys[idx] = leftKey;
                        oldIndex[leftKey] = idx;
                    }

                    this.updateChild(k, datum, child as E);
                }
            }
        }

        protected bindArray(data: T[]) {
            // Examine incoming data
            let dataCount: number = (data == null)? 0 : data.length;
            if (data) data

            // Begin Binding ...
            if (!this.beginBind(dataCount)) return;

            // Process data
            let oldCount: number = Math.min(this._keys.length, this.container.childElementCount);
            for (let i = 0; i < dataCount; ++i) {
                let k: string = i.toString();
                let datum: T = data[i];
                if (i < oldCount) {
                    let child: Element = this.container.children[i];
                    this.updateChild(k, datum, child as E);
                }
                else {
                    let child: Element = this.createChild(k, datum);
                    this.container.appendChild(child);
                    this._keys[i] = k;
                }
            }

            // Remove old elements
            for (let j = (oldCount - 1); j >= dataCount; --j) {
                $(this.container.children[j]).remove();
            }

            // Truncate key array
            this._keys.length = dataCount;
        }

        protected abstract createChild(key: string, datum: T): E;
        protected abstract updateChild(key: string, datum: T, element: E): void;
    }
}
