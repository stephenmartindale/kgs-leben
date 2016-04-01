namespace Services {
    export class Application {
        private _layout: Controllers.Layout;
        private _kgsClient: KGSClient;
        private _signInController: Controllers.SignIn;

        constructor() {
            this._layout = new Controllers.Layout();
            this._kgsClient = new KGSClient();
        }

        public initialise() {
            this._signInController = new Controllers.SignIn();
            this._signInController.initialise();

            // TODO: Remove this
            // this.Layout.hideLightbox();
        }

        public get Layout() {
            return this._layout;
        }

        public get KGSClient() {
            return this._kgsClient;
        }
    }
}

var $app: Services.Application;
