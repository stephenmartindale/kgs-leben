/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class ConnectionController extends ControllerBase<Application> {
        constructor(parent: Application) {
            super(parent);

            this.beginSignIn();
            window.setTimeout(() => this.attemptAutomaticSignIn(), 80);
        }

        private beginSignIn(errorNotice?: string) {
            let signInForm = <Views.SignInForm>document.querySelector('sign-in-form');
            if (!signInForm) {
                signInForm = <Views.SignInForm>document.createElement('sign-in-form');
                this.application.layout.showLightbox(signInForm);
            }

            signInForm.errorNotice = errorNotice;
            signInForm.submitCallback = (form) => this.submitSignIn(form);
            signInForm.focus();
        }

        private attemptAutomaticSignIn() {
            if (null == Storage) return;

            let signInForm = <Views.SignInForm>document.querySelector('sign-in-form');
            if (signInForm) {
                let lastUsername = localStorage.getItem("KGSUsername");
                if ((lastUsername) && (signInForm.username == lastUsername) && (signInForm.password)) {
                    signInForm.rememberMe = true;
                    this.submitSignIn(signInForm);
                    return;
                }
            }

            localStorage.removeItem("KGSUsername");
        }

        private submitSignIn(signInForm: Views.SignInForm) {
            signInForm.disabled = true;
            signInForm.errorNotice = null;

            let username: string = signInForm.username;
            if (typeof (Storage) !== "undefined") {
                if (signInForm.rememberMe)
                    localStorage.setItem("KGSUsername", username);
                else
                    localStorage.removeItem("KGSUsername");
            }

            this.application.reinitialise();

            let password: string = signInForm.password;
            this.client.loginAsync(username, password).done(() => this.signInSuccess(signInForm)).fail(() => this.signInFailed(signInForm));
        }

        private signInSuccess(signInForm: Views.SignInForm) {
            this.application.layout.hideLightbox(signInForm);
        }

        private signInFailed(signInForm: Views.SignInForm) {
            signInForm.errorNotice = "Invalid username or password.";
            signInForm.password = "";
            signInForm.disabled = false;
            signInForm.focus();
        }

        protected logout(message?: string) {
            this.beginSignIn("You have been disconnected.");
        }
    }
}
