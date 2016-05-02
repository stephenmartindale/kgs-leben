/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export abstract class ViewControllerBase<ParentType extends ControllerBase<any>> extends ControllerBase<ParentType> {
        private _activated: boolean;
        private _views: { view: Views.View<any>, zone: Controllers.LayoutZone, update: (digest?: KGS.DataDigest) => void }[];

        constructor(parent: ParentType) {
            super(parent);
            this._activated = false;
            this._views = [];
        }

        protected digest(digest: KGS.DataDigest) {
            if (this._activated) {
                for (let j = 0; j < this._views.length; ++j) {
                    this._views[j].update(digest);
                }
            }

            super.digest(digest);
        }

        protected registerView(view: Views.View<any>, zone: Controllers.LayoutZone, update: (digest?: KGS.DataDigest) => void) {
            this._views.push({ view: view, zone: zone, update: update });
        }

        public activate(): boolean {
            if (this._activated) return false;

            for (let j = 0; j < this._views.length; ++j) {
                this.application.layout.showView(this._views[j].view, this._views[j].zone);
                this._views[j].update();
            }

            this._activated = true;
            return true;
        }

        public deactivate(): boolean {
            if (!this._activated) return false;

            this.application.layout.clearMain();
            this.application.layout.clearSidebar();

            this._activated = false;
            return true;
        }

        public detach() {
            this.deactivate();
            super.detach();
        }

        public get activated(): boolean {
            return this._activated;
        }
    }
}
