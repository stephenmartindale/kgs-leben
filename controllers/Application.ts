/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class Application extends ControllerBase<any> {
        private _layoutController: Controllers.LayoutController;
        private _connectionController: Controllers.ConnectionController;
        private _channelController: Controllers.ChannelController;

        constructor() {
            super(null);

            this.application = this;
            this.client = new KGS.JSONClient((m?: string) => this.logout(m),
                                             (d: KGS.DataDigest) => this.digest(d));
            this.database = this.client.database;

            this._layoutController = new Controllers.LayoutController(this);
            this._connectionController = new Controllers.ConnectionController(this);
            this._channelController = new Controllers.ChannelController(this);
        }

        private static initialise() {
            const webComponentsReady: string = 'WebComponentsReady'; // HTML Imports and Web Components are ready - begin the application
            let onWebComponentsReady: () => void;
            onWebComponentsReady = function() {
                $app = new Controllers.Application();
                window.removeEventListener(webComponentsReady, onWebComponentsReady);
            };

            window.addEventListener(webComponentsReady, onWebComponentsReady);
        }

        public get layout() {
            return this._layoutController;
        }

        public reinitialise() {
            this._channelController.reinitialise();
            this.layout.clearMain();
            this.layout.clearSidebar();
        }
    }
}

declare var $app: Controllers.Application;
