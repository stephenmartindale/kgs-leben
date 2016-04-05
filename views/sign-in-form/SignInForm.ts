namespace Views {
    export class SignInForm extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _initialised: boolean;
        private _defaultDisabled: boolean;
        private _disabled: boolean;

        private _form: HTMLFormElement;
        private _inputUsername: HTMLInputElement;
        private _inputPassword: HTMLInputElement;
        private _inputRememberMe: HTMLInputElement;
        private _inputRememberMeNotice: HTMLParagraphElement;
        private _submitButton: HTMLButtonElement;

        createdCallback() {
            this.appendChild(SignInForm._template.content.cloneNode(true));

            this._initialised = false;
            this._defaultDisabled = (this.getAttribute('disabled'))? true : false;

            this._form = this.querySelector('form') as HTMLFormElement;
            this._inputUsername = this._form.querySelector('input[name="username"]') as HTMLInputElement;
            this._inputPassword = this._form.querySelector('input[name="password"]') as HTMLInputElement;
            this._inputRememberMe = this._form.querySelector('input[name="remember-me"]') as HTMLInputElement;
            this._inputRememberMeNotice = this._form.querySelector('p.text-warning') as HTMLParagraphElement;
            this._submitButton = this._form.querySelector('button[type="submit"]') as HTMLButtonElement;

            $(this._inputRememberMe).click((e) => this.onRememberMeClick(e));
            $(this._form).submit((e) => this.onFormSubmit(e));

            this._disabled = false;
            this.disabled = this._defaultDisabled;
        }

        attachedCallback() {
        }
        detachedCallback() {
        }
        attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        }

        get defaultDisabled(): boolean {
            return this._defaultDisabled;
        }
        get disabled(): boolean {
            return this._disabled;
        }
        set disabled(value: boolean) {
            if (value != this._disabled) {
                $([this._inputUsername, this._inputPassword, this._inputRememberMe]).prop("disabled", value);
                $(this._submitButton).prop("disabled", (value || !this._initialised));
                this._disabled = value;
            }
        }

        private onKGSClientReady() {
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

            this._initialised = true;

            if (signInAutomatically) this.beginLogin();
            else {
                localStorage.removeItem("KGSUsername");
                if (!this._disabled) $(this._submitButton).prop("disabled", false);
            }
        }

        private onRememberMeClick(e: JQueryEventObject) {
            if (this._inputRememberMe.checked)
                $(this._inputRememberMeNotice).slideDown(160);
            else
                $(this._inputRememberMeNotice).slideUp(160);
        }

        private onFormSubmit(e: JQueryEventObject) {
            this.beginLogin();
            e.preventDefault();
        }

        private beginLogin() {
            if ((!this._inputUsername.checkValidity())
             || (!this._inputPassword.checkValidity())) return;

            console.log('login procedure starting...');
            this.disabled = true;

            var username: string = <string>$(this._inputUsername).val();
            var password: string = <string>$(this._inputPassword).val();

            if ((typeof (Storage) !== "undefined") && (this._inputRememberMe.checked)) {
                localStorage.setItem("KGSUsername", username);
            }

            // TODO: Call login here!
            // $app.client.loginAsync(username, password).done(() => this.loginSucceeded())
                                                        //  .fail(() => this.loginFailed());
        }

        private loginSucceeded() {
            console.log("SignIn Controller: login apparently succeeded");
            // console.log("Client Connected: ", $app.client.connected);
        }

        private loginFailed() {
            console.log("SignIn Controller: login apparently failed");
            // console.log("Client Connected: ", $app.client.connected);
        }
    }
}
