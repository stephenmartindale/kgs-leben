namespace Services {
    export class KGSClient {
        private static _accessURI: string = "/jsonClient/access";
        private static _disabled: boolean = true;

        private _username: string = null;

        private _messageReceived: JQueryCallback;
        private _loginDeferred: JQueryDeferred<void>;

        constructor() {
            this._messageReceived = $.Callbacks();
        }

        get username(): string {
            return this._username;
        }

        get connected(): boolean {
            return ((this._username) && (!this._loginDeferred))? true : false;
        }

        public subscribe(callback: (message: KGSMessage) => void) {
            this._messageReceived.add(callback);
        }

        public unsubscribe(callback: (message: KGSMessage) => void) {
            this._messageReceived.remove(callback);
        }

        private kgsPOST(data: any): JQueryXHR {
            if (KGSClient._disabled) throw "KGS Client disabled";
            return $.ajax({
                type: 'POST',
                url: KGSClient._accessURI,
                data: JSON.stringify(data)
            });
        }

        private kgsGET(poll: boolean = true) {
            if (KGSClient._disabled) throw "KGS Client disabled";
            $.ajax({
                type: 'GET',
                url: KGSClient._accessURI,
                success: (data, textStatus, jqXHR) => this.kgsGETCallback(data, textStatus, jqXHR, null, poll),
                error: (jqXHR, textStatus, errorThrown) => this.kgsGETCallback(null, textStatus, jqXHR, errorThrown, poll)
            });
        }

        private kgsGETCallback(data: any, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, poll: boolean) {
            switch (jqXHR.status) {
                case 200:
                    if ((data) && (data.messages)) {
                        (<KGSResponse>data).messages.forEach(message => {
                            console.log("KGS Message received:", message.type);
                            this._messageReceived.fire(message);
                        });
                    }

                    if (poll) this.kgsGET(poll);

                    break;

                default:
                    this.kgsGETError(textStatus, jqXHR, errorThrown);
                    break;
            }
        }

        private kgsGETError(textStatus: string, jqXHR: JQueryXHR, errorThrown: string) {
            console.log('KGS Client GET error', textStatus, errorThrown);
            if (this._loginDeferred) this.loginFailed();
        }

        private _loginMessageCallback = (message: KGSMessage) => {
            console.log(this);

            switch (message.type) {
                case "LOGIN_SUCCESS":
                    this.loginSucceeded();
                    break;

                case "LOGIN_FAILED_BAD_PASSWORD":
                case "LOGIN_FAILED_NO_SUCH_USER":
                    this.loginFailed();
                    break;
            }
        }

        private loginSucceeded() {
            console.log('KGS Client LOGIN success');

            this.unsubscribe(this._loginMessageCallback);

            var loginDeferred: JQueryDeferred<void> = this._loginDeferred;
            this._loginDeferred = null;
            loginDeferred.resolve();
        }

        private loginFailed() {
            console.log('KGS Client LOGIN failure');

            this.unsubscribe(this._loginMessageCallback);

            this._username = null;

            var loginDeferred: JQueryDeferred<void> = this._loginDeferred;
            this._loginDeferred = null;
            loginDeferred.reject();
        }

        public loginAsync(username: string, password: string): JQueryPromise<void> {
            if (this._loginDeferred) throw "Another login operation is currently in progress!";

            this._username = username;
            this._loginDeferred = $.Deferred<void>();

            this.kgsPOST({
                "type": "LOGIN",
                "name": username,
                "password": password,
                "locale": "en_US"
            }).then((data, textStatus, jqXHR) => { this.subscribe(this._loginMessageCallback); this.kgsGET(true); },
                    (jqXHR, textStatus) => this.loginFailed());

            return this._loginDeferred.promise();
        }
    }
}
