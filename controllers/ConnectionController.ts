/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class ConnectionController extends ControllerBase<Application> {
        private _signInForm: Views.SignInForm;

        constructor(parent: Application) {
            super(parent);

            this.beginSignIn(null, true);
            window.setTimeout(() => this.attemptAutomaticSignIn(), 80);
        }

        private beginSignIn(errorNotice?: string, suppressTransitions?: boolean) {
            if (!this._signInForm) {
                this._signInForm = new Views.SignInForm();
                this.application.layout.showLightbox(this._signInForm, suppressTransitions);
            }

            this._signInForm.errorNotice = errorNotice;
            this._signInForm.submitCallback = (form) => this.submitSignIn();
            this._signInForm.focus();
        }

        private attemptAutomaticSignIn() {
            if (null == Storage) return;

            if (this._signInForm) {
                let lastUsername = localStorage.getItem("KGSUsername");
                if ((lastUsername) && (this._signInForm.username == lastUsername) && (this._signInForm.password)) {
                    this._signInForm.rememberMe = true;
                    this.submitSignIn();
                    return;
                }
            }

            localStorage.removeItem("KGSUsername");
        }

        private submitSignIn() {
            this._signInForm.disabled = true;
            this._signInForm.errorNotice = null;

            let username: string = this._signInForm.username;
            if (Utils.isDefined(Storage)) {
                if (this._signInForm.rememberMe)
                    localStorage.setItem("KGSUsername", username);
                else
                    localStorage.removeItem("KGSUsername");
            }

            this.application.reinitialise();

            let password: string = this._signInForm.password;
            this.client.loginAsync(username, password).done(() => this.signInSuccess()).fail(() => this.signInFailed());
        }

        private signInSuccess() {
            this.application.layout.hideLightbox();
        }

        private signInFailed() {
            this._signInForm.errorNotice = "Invalid username or password.";
            this._signInForm.password = "";
            this._signInForm.disabled = false;
            this._signInForm.focus();
        }

        protected logout(message?: string) {
            this.beginSignIn("You have been disconnected.");
        }
    }
}
