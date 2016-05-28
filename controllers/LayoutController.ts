/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export const enum LayoutZone {
        Main,
        Sidebar,
        Lightbox
    }

    export class LayoutZoneController {
        private _container: HTMLElement;
        private _views: { wrapper: HTMLDivElement, view: Views.View<any> }[];

        constructor(container: HTMLElement) {
            this._container = container;
            this._views = [];
        }

        public show(view: Views.View<any>): HTMLDivElement {
            let wrapper = document.createElement('div');
            this._container.appendChild(wrapper);

            view.attach(wrapper);

            this._views.push({ wrapper: wrapper, view: view });

            view.activate();

            return wrapper;
        }

        public hide(view: Views.View<any>): boolean {
            for (let j = (this._views.length - 1); j >= 0; --j) {
                if (this._views[j].view == view) {
                    view.deactivate();
                    this._container.removeChild(this._views[j].wrapper);
                    this._views.splice(j, 1);
                    return true;
                }
            }

            return false;
        }

        public clear() {
            if (this._views) {
                for (let j = 0; j < this._views.length; ++j) {
                    this._views[j].view.deactivate();
                }

                this._views.length = 0;
            }

            $(this._container).children().detach();
        }
    }

    export class LayoutController extends ControllerBase<Application> {
        private _lightbox: Views.LightboxContainer;

        public main: LayoutZoneController;
        public sidebar: LayoutZoneController;

        constructor(parent: Application) {
            super(parent);
            $layout = this;

            let mainContainer = document.querySelector('#main') as HTMLDivElement;
            this.main = new LayoutZoneController(mainContainer);
            this.main.clear();

            let sidebarContainer = document.querySelector('#sidebar') as HTMLDivElement;
            this.sidebar = new LayoutZoneController(sidebarContainer);
            this.sidebar.clear();
        }

        public showView(view: Views.View<any>, zone: LayoutZone) {
            switch (zone) {
                case LayoutZone.Main: this.main.show(view); break;
                case LayoutZone.Sidebar: this.sidebar.show(view); break;
                case LayoutZone.Lightbox: this.showLightbox(view); break;
            }
        }

        public hideView(view: Views.View<any>, zone?: LayoutZone) {
            if (zone != null) {
                switch (zone) {
                    case LayoutZone.Main: this.main.hide(view); break;
                    case LayoutZone.Sidebar: this.sidebar.hide(view); break;
                    case LayoutZone.Lightbox: this.hideLightbox(); break;
                }
            }
            else throw "Not Implemented";
        }

        public showLightbox(view: Views.View<any>, suppressTransitions?: boolean) {
            this.hideLightbox();
            this._lightbox = Views.LightboxContainer.showLightbox(view, suppressTransitions);
        }

        public hideLightbox() {
            if (this._lightbox) {
                this._lightbox.hideLightbox();
                this._lightbox = null;
            }
        }
    }
}

declare var $layout: Controllers.LayoutController;
