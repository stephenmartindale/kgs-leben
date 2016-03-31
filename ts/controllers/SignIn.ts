namespace Controllers {
    export class SignIn {
        private _inputUsername: HTMLInputElement;
        private _inputPassword: HTMLInputElement;
        private _inputRememberMe: HTMLInputElement;
        private _inputRememberMeNotice: HTMLParagraphElement;
        private _submitButton: HTMLButtonElement;

        constructor () {
            var form = $('#lightbox .form-signin');
            var inputUsername = form.find('#inputUsername');
            var inputPassword = form.find('#inputPassword');
            var inputRememberMe = form.find('#inputRememberMe');
            var inputRememberMeNotice = form.find('#inputRememberMeNotice');
            var submitButton = form.find('button[type="submit"]');

            this._inputUsername = <HTMLInputElement>inputUsername[0];
            this._inputPassword = <HTMLInputElement>inputPassword[0];
            this._inputRememberMe = <HTMLInputElement>inputRememberMe[0];
            this._inputRememberMeNotice = <HTMLParagraphElement>inputRememberMeNotice[0];
            this._submitButton = <HTMLButtonElement>submitButton[0];

            inputRememberMe.click((e) => this.onRememberMeClick(e));
            form.submit((e) => this.onFormSubmit(e));
        }

        private onRememberMeClick(e: JQueryEventObject) {
            $(this._inputRememberMeNotice).collapse((this._inputRememberMe.checked)? "show" : "hide");
        }

        private onFormSubmit(e: JQueryEventObject) {
            this.beginLogin();
            e.preventDefault();
        }

        private disable(disable: boolean) {
            $([this._inputUsername, this._inputPassword, this._inputRememberMe, this._submitButton]).prop("disabled", disable);
        }

        private beginLogin() {
            if ((!this._inputUsername.checkValidity())
             || (!this._inputPassword.checkValidity())) return;
            
            console.log('login procedure starting...');
            this.disable(true);

            var username: string = <string>$(this._inputUsername).val();
            var password: string = <string>$(this._inputPassword).val();

            if ((typeof (Storage) !== "undefined") && (this._inputRememberMe.checked)) {
                localStorage.setItem("KGSUsername", username);
            }

            $app.KGSClient.loginAsync(username, password).done(() => this.loginSucceeded())
                                                         .fail(() => this.loginFailed());
        }

        private loginSucceeded() {
            console.log("SignIn Controller: login apparently succeeded");
            console.log("Client Connected: ", $app.KGSClient.connected);
        }

        private loginFailed() {
            console.log("SignIn Controller: login apparently failed");
            console.log("Client Connected: ", $app.KGSClient.connected);
        }

        public initialise() {
            var signInAutomatically = false;
            if (typeof (Storage) !== "undefined") {
                var lastUsername = localStorage.getItem("KGSUsername");
                if (lastUsername) {
                    if (($(this._inputUsername).val() == lastUsername) && ($(this._inputPassword).val())) {
                        $(this._inputRememberMe).prop('checked', true);
                        $(this._inputRememberMeNotice).removeClass('collapse');
                        signInAutomatically = true;
                    }
                }
            }

            if (signInAutomatically) this.beginLogin();
            else {
                localStorage.removeItem("KGSUsername");
                this.disable(false);
            }
        }
    }
}
