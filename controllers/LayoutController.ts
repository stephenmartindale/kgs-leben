/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export const enum LayoutZone {
        Main,
        Sidebar,
        Lightbox
    }

    export class LayoutController extends ControllerBase<Application> {
        private _lightbox: Views.LightboxContainer;
        private _mainContainer: HTMLDivElement;
        private _mainViews: Views.MainContainer[] = [];
        private _sidebar: HTMLDivElement;
        private _sidebarChannelList: Views.ChannelList;
        private _sidebarContainer: HTMLDivElement;
        private _sidebarView: Views.View<any>;

        constructor(parent: Application) {
            super(parent);
            $layout = this;

            this._mainContainer = document.querySelector('#main') as HTMLDivElement;

            this._sidebar = document.querySelector('#sidebar') as HTMLDivElement;
            this._sidebarChannelList = new Views.ChannelList();
            this._sidebarChannelList.attach(this._sidebar);
            this._sidebarChannelList.activate();
            this._sidebarContainer = document.createElement('div');
            this._sidebar.appendChild(this._sidebarContainer);

            this.clearMain();
            this.clearSidebar();
        }

        public showView(view: Views.View<any>, zone: LayoutZone) {
            switch (zone) {
                case LayoutZone.Main: this.showMain(view); break;
                case LayoutZone.Sidebar: this.showSidebar(view); break;
                case LayoutZone.Lightbox: this.showLightbox(view); break;
            }
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

        public showMain(view: Views.View<any>) {
            let idx: number = this._mainViews.length;
            this._mainViews.push(new Views.MainContainer(view));
            this._mainViews[idx].attach(this._mainContainer);
            this._mainViews[idx].activate();
        }

        public clearMain() {
            if (this._mainViews) {
                for (let j = 0; j < this._mainViews.length; ++j) {
                    this._mainViews[j].deactivate();
                }

                this._mainViews.length = 0;
            }

            $(this._mainContainer).children().detach();
        }

        public get channelList(): Views.ChannelList {
            return this._sidebarChannelList;
        }

        public showSidebar(view: Views.View<any>) {
            this.clearSidebar();

            this._sidebarView = view;
            this._sidebarView.attach(this._sidebarContainer);
            this._sidebarView.activate();
        }

        public clearSidebar() {
            if (this._sidebarView) {
                this._sidebarView.deactivate();
                this._sidebarView = null;
            }

            $(this._sidebarContainer).children().detach();
        }
    }
}

declare var $layout: Controllers.LayoutController;
