/// <reference path="../View.ts" />
namespace Views {
    export class AmbientStatusPanel extends Views.View<HTMLDivElement> {
        private _automatchSeekingDiv: HTMLDivElement;

        public automatchCancelCallback: Function;

        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('ambient-status-panel'));
            this._automatchSeekingDiv = this.root.querySelector('div.automatch-seeking') as HTMLDivElement;
        }

        public activate(): void {
            this._automatchSeekingDiv.querySelector('button').addEventListener('click', this._onAutomatchCancelClick);

            super.activate();
        }

        public deactivate(): void {
            super.deactivate();

            this._automatchSeekingDiv.querySelector('button').removeEventListener('click', this._onAutomatchCancelClick);
        }

        public set automatchSeeking(seeking: boolean) {
            if (seeking) {
                this._automatchSeekingDiv.classList.remove('hidden');
            }
            else {
                this._automatchSeekingDiv.classList.add('hidden');
            }
        }

        private _onAutomatchCancelClick = () => {
            if (this.automatchCancelCallback) this.automatchCancelCallback();
        }
    }
}
