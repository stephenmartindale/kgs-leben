/// <reference path="../View.ts" />
namespace Views {
    export class MainContainer extends Views.View<HTMLDivElement> {
        private _view: Views.View<any>;
        private _attached: boolean;

        constructor(view: Views.View<any>) {
            super(Templates.createDiv('main-container'));

            this._view = view;
        }

        public attach(parent: HTMLElement, insertBefore?: boolean | Element): void {
            super.attach(parent, insertBefore);

            if ((!this._attached) && (this._view != null)) {
                this._view.attach(this.root);
                this._attached = true;
            }
        }

        public activate(): void {
            if (this._view != null) this._view.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
            if (this._view != null) this._view.deactivate();
        }
    }
}
