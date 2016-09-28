/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class Application extends ControllerBase<any> {
        private _layoutController: Controllers.LayoutController;
        private _connectionController: Controllers.ConnectionController;
        private _channelController: Controllers.ChannelController;
        private _soundController: Controllers.SoundController;

        constructor() {
            super(null);

            this.application = this;
            this.client = new KGS.JSONClient((m?: string) => this.logout(m),
                                             (d: KGS.DataDigest) => this.digest(d));
            this.database = this.client.database;

            this._layoutController = new Controllers.LayoutController(this);
            this._connectionController = new Controllers.ConnectionController(this);
            this._channelController = new Controllers.ChannelController(this);
            this._soundController = SoundController.initialise(this);
        }

        private static initialise() {
            $app = new Controllers.Application();
        }

        public get layout(): Controllers.LayoutController {
            return this._layoutController;
        }

        public get sounds(): Controllers.SoundController {
            return this._soundController;
        }

        public reinitialise() {
            this.layout.main.clear();
            this.layout.sidebar.clear();
            this._channelController.reinitialise();
        }
    }
}

declare var $app: Controllers.Application;
