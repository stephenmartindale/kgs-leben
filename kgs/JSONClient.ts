namespace KGS {
    export const enum JSONClientState {
        Disconnected,   // The client is not connected and no connection is currently being negotiated
        Connecting,     // The client is not connected yet but a LOGIN request has been sent (GET is polled)
        Connected,      // The client is connected; GET is polled and requests may be posted
        Errored,        // The client is broken because a GET or POST recieved an error response
        Unloading       // The client is aborting because the window sent an 'unload' event
    };

    export interface LogoutCallback {
        (message?: string): void
    }

    export interface DigestCallback {
        (data: KGS.DataDigest): void
    }

    export class JSONClient {
        private static _accessURI: string = "/jsonClient/access";

        private _state: JSONClientState;

        private _database: KGS._Database;
        private _databaseFacade: { [type: string]: ((digest: KGS.DataDigest, message: KGS.Message) => void) };

        private _logoutCallback: LogoutCallback;
        private _digestCallback: DigestCallback;

        private _username: string = null;
        private _loginDeferred: JQueryDeferred<void>;

        constructor(logoutCallback: LogoutCallback, digestCallback: DigestCallback) {
            $client = this;

            this._state = JSONClientState.Disconnected;

            this._database = new KGS._Database();
            this._databaseFacade = (<any>this._database);

            this._logoutCallback = logoutCallback;
            this._digestCallback = digestCallback;

            window.addEventListener('unload', () => this.unload());
        }

        public get username(): string {
            return this._username;
        }

        public get state(): JSONClientState {
            return this._state;
        }

        public get database(): KGS.Database {
            return this._database.database;
        }

        private kgsPOST(data: KGS.Message): JQueryXHR {
            return $.ajax({
                type: 'POST',
                url: JSONClient._accessURI,
                contentType: 'application/json',
                data: JSON.stringify(data),
                error: (jqXHR, textStatus, errorThrown) => this.kgsXHRError('POST', textStatus, jqXHR, errorThrown)
            });
        }

        public post(data: KGS.Message) {
            if (this._state != JSONClientState.Connected) throw "KGS JSON Client is not connected - requests may not be posted by third parties";
            let error = KGS.Upstream.validateMessage(data);
            if (error == null) {
                this.kgsPOST(data);
            }
            else {
                Utils.log(Utils.LogSeverity.Error, "Upstream Message Rejected", error, data);
            }
        }

        private kgsGET() {
            $.ajax({
                type: 'GET',
                url: JSONClient._accessURI,
                success: (data, textStatus, jqXHR) => this.kgsGETSuccess(data, textStatus, jqXHR),
                error: (jqXHR, textStatus, errorThrown) => this.kgsXHRError('GET', textStatus, jqXHR, errorThrown)
            });
        }

        private kgsGETSuccess(data: any, textStatus: string, jqXHR: JQueryXHR) {
            if ((this._state == JSONClientState.Errored) || (this._state == JSONClientState.Unloading)) return;
            switch (jqXHR.status) {
                case 200:
                    if ((data) && (data.messages) && (Utils.isArray(data.messages)) && ((<Array<any>>data.messages).length > 0)) {
                        let messages = (<KGS.Downstream.Response>data).messages;
                        let digest: KGS.DataDigest = new KGS.DataDigest();
                        for (let q = 0; q < messages.length; ++q) {
                            let message = messages[q];
                            if (this.filterMessage(message)) this.dispatchMessage(digest, message);
                        }

                        this._digestCallback(digest);
                    }

                    if ((this._state == JSONClientState.Connecting) || (this._state == JSONClientState.Connected)) {
                        this.kgsGET();
                    }
                    break;

                case 204:
                    this.logoutReceived("204 No Content");
                    break;

                default:
                    this.kgsXHRError('GET', textStatus, jqXHR, null);
                    break;
            }
        }

        private kgsXHRError(method: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string) {
            this._state = JSONClientState.Errored;
            Utils.log(Utils.LogSeverity.Error, 'KGS Client ' + method + ' error', textStatus, errorThrown);
            if (this._loginDeferred) this.loginFailed();
        }

        private filterMessage(message: Message): boolean {
            switch (message.type) {
                case KGS.Downstream._LOGIN_SUCCESS:
                    this.loginSuccess();
                    break;

                case KGS.Downstream._LOGIN_FAILED_BAD_PASSWORD:
                case KGS.Downstream._LOGIN_FAILED_NO_SUCH_USER:
                case KGS.Downstream._LOGIN_FAILED_USER_ALREADY_EXISTS:
                    return false;

                case KGS.Downstream._LOGOUT:
                    return this.logoutReceived();

                case KGS.Downstream._GAME_TIME_EXPIRED:
                    this.kgsPOST(message);
                    return false;
            }

            return true;
        }

        private dispatchMessage(digest: KGS.DataDigest, message: Message) {
            let filter = this._databaseFacade[message.type];
            if ((filter != null) && (Utils.isFunction(filter))) {
                filter(digest, message);
            }
            else Utils.log(Utils.LogSeverity.Info, "KGS Message not recognised:", message.type, message);
        }

        private logoutReceived(message?: string): boolean {
            if (this._state == JSONClientState.Connecting) {
                this.loginFailed();
                return false;
            }
            else if (this._state != JSONClientState.Connected) {
                return false;
            }
            else {
                this._state = JSONClientState.Disconnected;
                this._username = null;

                this._logoutCallback(message);
                Utils.log(Utils.LogSeverity.Info, 'KGS Client LOGOUT', message);
                return true;
            }
        }

        private loginSuccess() {
            let reject: boolean;
            if (this._state != JSONClientState.Connecting) {
                Utils.log(Utils.LogSeverity.Error, 'KGS Client LOGIN success received but client was not connecting');
                reject = true;
            }
            else {
                Utils.log(Utils.LogSeverity.Success, 'KGS Client LOGIN success');
                reject = false;
            }

            let loginDeferred: JQueryDeferred<void> = this._loginDeferred;
            this._loginDeferred = null;

            if (reject) {
                this._state = JSONClientState.Errored;
                this._username = null;
                loginDeferred.reject();
            }
            else {
                this._state = JSONClientState.Connected;
                loginDeferred.resolve();
            }
        }

        private loginFailed() {
            Utils.log((this._state == JSONClientState.Connecting)? Utils.LogSeverity.Warning : Utils.LogSeverity.Error, 'KGS Client LOGIN failure');

            this._state = (this._state == JSONClientState.Connecting)? JSONClientState.Disconnected : JSONClientState.Errored;
            this._username = null;

            let loginDeferred: JQueryDeferred<void> = this._loginDeferred;
            this._loginDeferred = null;
            loginDeferred.reject();
        }

        public loginAsync(username: string, password: string): JQueryPromise<void> {
            if (this._loginDeferred) throw "KGS JSON Client is already connecting!";
            else if (this._state != JSONClientState.Disconnected) throw "KGS JSON Client is not disconnected";

            this._state = JSONClientState.Connecting;
            this._username = username;
            this._loginDeferred = $.Deferred<void>();

            let m: Upstream.LOGIN = {
                "type": KGS.Upstream._LOGIN,
                "name": username,
                "password": password,
                "locale": "en_US"
            };
            this.kgsPOST(m).then((data: any, textStatus: string, jqXHR: JQueryXHR) => this.kgsGET(), (jqXHR, textStatus) => this.loginFailed());

            return this._loginDeferred.promise();
        }

        private postLogout() {
            if ((this._state == JSONClientState.Connecting) || (this._state == JSONClientState.Connected)) {
                this.kgsPOST({ type: KGS.Upstream._LOGOUT });
            }
        }

        public logoutAsync(): JQueryPromise<void> {
            throw 'Not Implemented'; // TODO: Implement logoutAsync()
        }

        private unload() {
            this.postLogout();
            this._state = JSONClientState.Unloading;
        }
    }
}

declare var $client: KGS.JSONClient;
