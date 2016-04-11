namespace Framework {
    export abstract class DataBoundTableSection<T, E extends HTMLTableRowElement> extends HTMLTableSectionElement {
        private _mutationObserver: MutationObserver;
        private _initialised: boolean;
        private _keys: string[];

        createdCallback() {
            this._initialised = false;
            this._keys = [];
        }

        private connectObserver() {
            if (!this._mutationObserver) this._mutationObserver = new MutationObserver((mutations) => this.onMutation(mutations));
            this._mutationObserver.observe(this, { childList: true, subtree: false });
        }

        attachedCallback() {
            this.connectObserver();
        }

        private disconnectObserver() {
            if (this._mutationObserver) this._mutationObserver.disconnect();
        }

        detachedCallback() {
            this.disconnectObserver();
        }

        private initialise() {
            if ((!this._initialised) && (this.childElementCount > 0)) {
                log(LogSeverity.Warning, "Data Bound List: " + this.childElementCount.toString() + " alien element(s) removed");
            }

            $(this).empty();
            this._initialised = true;
        }

        private onMutation(mutations: MutationRecord[]) {
            this.disconnectObserver();
            this._initialised = false;
            log(LogSeverity.Warning, "Data Bound Element: child-list was modified externally; complete re-binding will occur on next bind");
        }

        private beginBind(dataCount: number): boolean {
            // Disconnect Mutation Observer
            this.disconnectObserver();

            // Initialise on first Bind or if incoming data is empty
            if ((!this._initialised) || (dataCount == 0)) this.initialise();

            // Short-circuit if no data was supplied
            if (dataCount == 0) {
                this.endBind();
                return false;
            }
            else return true;
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
                else $(this.children[oldCount]).remove();
            }

            oldKeys.length = oldCount;

            // Process data
            let created: number = 0;
            for (let i = 0; i < dataCount; ++i) {
                let k: string = this._keys[i];
                let datum: T = data[k];
                let idx: number = oldIndex[k];
                if (null == idx) {
                    this.insertBefore(this.createChild(k, datum), this.children[i]);
                    ++created;
                }
                else {
                    let child: Element = this.children[idx + created];
                    if ((idx + created) > i) {
                        let right: Node = child.nextSibling;
                        let left: Node = this.children[i];
                        let leftKey: string = oldKeys[i - created];

                        this.insertBefore(child, left);
                        if ((idx + created) > (i + 1)) {
                            this.insertBefore(left, right);
                        }

                        oldKeys[idx] = leftKey;
                        oldIndex[leftKey] = idx;
                    }

                    this.updateChild(k, datum, child as E);
                }
            }

            // ... End of Binding
            this.endBind();
        }

        protected bindArray(data: T[]) {
            // Examine incoming data
            let dataCount: number = (data == null)? 0 : data.length;
            if (data) data

            // Begin Binding ...
            if (!this.beginBind(dataCount)) return;

            // Process data
            let oldCount: number = Math.min(this._keys.length, this.childElementCount);
            for (let i = 0; i < dataCount; ++i) {
                let k: string = i.toString();
                let datum: T = data[i];
                if (i < oldCount) {
                    let child: Element = this.children[i];
                    this.updateChild(k, datum, child as E);
                }
                else {
                    let child: Element = this.createChild(k, datum);
                    this.appendChild(child);
                    this._keys[i] = k;
                }
            }

            // Remove old elements
            for (let j = (oldCount - 1); j >= dataCount; --j) {
                $(this.children[j]).remove();
            }

            // Truncate key array
            this._keys.length = dataCount;

            // ... End of Binding
            this.endBind();
        }

        private endBind() {
            // Watch for Mutations!
            this.connectObserver();
        }

        protected abstract createChild(key: string, datum: T): E;
        protected abstract updateChild(key: string, datum: T, element: E): void;
    }
}
