/// <reference path="../View.ts" />
namespace Views {
    export class HomeSidebar extends Views.View<HTMLDivElement> {
        private _automatchButton: HTMLButtonElement;
        private _automatchPreferencesButton: HTMLButtonElement;

        public automatchCallback: Function;
        public automatchPreferencesCallback: Function;

        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('home-sidebar'));

            let automatchButtons = this.root.querySelectorAll('.automatch button');
            this._automatchButton = automatchButtons[0] as HTMLButtonElement;
            this._automatchPreferencesButton = automatchButtons[1] as HTMLButtonElement;
        }

        public activate(): void {
            this._automatchButton.addEventListener("click", this._onAutomatchClick);
            this._automatchPreferencesButton.addEventListener("click", this._onAutomatchPreferencesClick);

            super.activate();
        }

        public deactivate(): void {
            super.deactivate();

            this._automatchPreferencesButton.removeEventListener("click", this._onAutomatchPreferencesClick);
            this._automatchButton.removeEventListener("click", this._onAutomatchClick);
        }

        private _onAutomatchClick = () => {
            if (this.automatchCallback) this.automatchCallback();
        }

        private _onAutomatchPreferencesClick = () => {
            if (this.automatchPreferencesCallback) this.automatchPreferencesCallback();
        }
    }
}
