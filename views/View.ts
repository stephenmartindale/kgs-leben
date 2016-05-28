namespace Views {
    export abstract class View<RootElement extends HTMLElement> {
        protected root: RootElement;

        private _parent: HTMLElement;
        private _activated: boolean;

        constructor(root: RootElement) {
            this.root = root;
        }

        protected get parent(): HTMLElement {
            return this._parent;
        }

        // N.B.: Sub-classes should call super.attach() at the beginning of their attach routine
        public attach(parent: HTMLElement, insertBefore?: boolean | Element): void {
            if (parent == null) throw "Parent element may not be null";

            if (insertBefore) {
                parent.insertBefore(this.root, (Utils.isElement(insertBefore))? (<Element>insertBefore) : parent.firstElementChild);
            }
            else {
                parent.appendChild(this.root);
            }

            this._parent = parent;
        }

        protected get activated(): boolean {
            return this._activated;
        }

        // N.B.: Sub-classes should call super.activate() at the end of their activation routine
        public activate(): void {
            this._activated = true;
        }

        // N.B.: Sub-classes should call super.deactivate() at the beginning of their deactivation routine
        public deactivate(): void {
            this._activated = false;
        }

        public hide() {
            this.root.classList.add('hidden');
        }
        public show() {
            this.root.classList.remove('hidden');
        }
        public get hidden(): boolean {
            return this.root.classList.contains('hidden');
        }
        public set hidden(hide: boolean) {
            if (hide) this.hide();
            else this.show();
        }
    }
}
