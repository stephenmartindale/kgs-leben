namespace Framework {
    export namespace Elements {
        export abstract class DataBoundList<T extends Models.KeyedObject, E extends HTMLElement> extends HTMLUListElement {
            private _mutationObserver: MutationObserver;
            private _initialised: boolean = false;
            private _keys: (string | number)[];

            createdCallback() {
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
                this._keys = [];
                this._initialised = true;
            }

            private onMutation(mutations: MutationRecord[]) {
                this.disconnectObserver();
                this._initialised = false;
                log(LogSeverity.Warning, "Data Bound Element: child-list was modified externally; complete re-binding will occur on next bind");
            }

            attributeChangedCallback(name: string, oldValue: any, newValue: any) {
            }

            protected bind(data: T[]) {
                // Disconnect Mutation Observer
                this.disconnectObserver();

                // Initialise on first Bind or if incoming data is empty
                if ((!this._initialised) || (!data) || (data.length == 0)) this.initialise();

                // Short-circuit if no data was supplied
                if ((!data) || (data.length == 0)) {
                    this.connectObserver();
                    return;
                }

                // Pre-process data and remove duplicates
                let dataCount: number = data.length;
                let duplicates: number = 0;
                let dataIndex: any = {};
                for (let i = 0; i < dataCount; ++i) {
                    let datum: T = data[i];
                    if (undefined === dataIndex[datum.key]) {
                        dataIndex[datum.key] = null;
                        if (duplicates > 0) data[i - duplicates] = data[i];
                    }
                    else ++duplicates;
                }

                dataCount -= duplicates;

                // Process known keys and remove obsolete elements
                let oldKeys: (string | number)[] = [];
                for (let j = 0; j < this._keys.length; ++j) {
                    let key: string | number = this._keys[j];
                    let idx = oldKeys.length;

                    if (undefined !== dataIndex[key]) {
                        dataIndex[key] = idx;
                        oldKeys.push(key);
                    }
                    else $(this.children[idx]).remove();
                }

                // Process data
                this._keys.length = dataCount;
                let created: number = 0;
                for (let i = 0; i < dataCount; ++i) {
                    let datum: T = data[i];
                    this._keys[i] = datum.key;

                    let idx: number = dataIndex[datum.key];
                    if (null == idx) {
                        this.insertBefore(this.createChild(datum), this.children[i]);
                        ++created;
                    }
                    else {
                        let child: Element = this.children[idx + created];

                        if ((idx + created) > i) {
                            let right = child.nextSibling;
                            let left = this.children[i];
                            let leftKey = oldKeys[i - created];

                            this.insertBefore(child, left);
                            if ((idx + created) > (i + 1)) {
                                this.insertBefore(left, right);
                            }

                            oldKeys[idx] = leftKey;
                            dataIndex[leftKey] = idx;
                        }

                        this.updateChild(datum, child as E);
                    }
                }

                // Watch for Mutations!
                this.connectObserver();
            }

            protected abstract createChild(datum: T): E;
            protected abstract updateChild(datum: T, element: E): void;
        }
    }
}
