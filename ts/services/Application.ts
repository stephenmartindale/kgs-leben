namespace Services {
    export class Application {
        private _kgsClient: KGSClient;
        private _signInController: Controllers.SignIn;
        
        constructor() {
            this._kgsClient = new KGSClient();
        }
        
        public initialise() {
            this._signInController = new Controllers.SignIn();
            this._signInController.initialise();
        }
        
        get KGSClient() {
            return this._kgsClient;
        }
    }
}

var $app: Services.Application;
