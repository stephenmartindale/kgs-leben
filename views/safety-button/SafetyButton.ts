/// <reference path="../View.ts" />
namespace Views {
    export class SafetyButton extends Views.View<HTMLDivElement> {
        private _disabled: boolean;
        private _primed: boolean;

        private _primary: HTMLDivElement;
        private _confirm: HTMLDivElement;

        public callback: Function;

        constructor(text?: string, dangerous?: boolean) {
            super(Templates.cloneTemplate<HTMLDivElement>('safety-button'));
            this._disabled = false;
            this._primed = false;

            this._primary = <HTMLDivElement>this.root.children[0];
            this._primary.onclick = this._onPrimaryClick;
            this._confirm = <HTMLDivElement>this.root.children[1];
            this._confirm.onclick = this._onConfirmClick;

            if (text) this.text = text;
            if (dangerous) this.dangerous = dangerous;

            document.body.addEventListener('click', this._onClickCaptured, true);
        }

        private _onClickCaptured = (event: MouseEvent) => {
            if ((this._primed) && (event.target != this._primary) && (event.target != this._confirm)) {
                this.primed = false;
            }
        }

        private _onPrimaryClick = () => {
            if (!this._disabled) {
                this.primed = (!this._primed);
            }
        }

        private _onConfirmClick = () => {
            if (this._primed) {
                this.primed = false;

                if ((!this._disabled) && (this.callback)) {
                    this.callback();
                }
            }
        }

        public get text(): string {
            return this._primary.innerText;
        }
        public set text(text: string) {
            this._primary.innerText = text;
            this._confirm.title = text;
            if (!this._primed) this._primary.title = text;
        }

        public get primed(): boolean {
            return this._primed;
        }
        public set primed(value: boolean) {
            if (!value) {
                this._primed = false;
                this.root.classList.remove('primed');
                this._primary.title = this._primary.innerText;
            }
            else {
                this.root.classList.add('primed');
                this._primed = true;
                this._primary.title = "cancel";
            }
        }

        public get disabled(): boolean {
            return this._disabled;
        }
        public set disabled(value: boolean) {
            if (!value) {
                this._disabled = false;
                this.root.classList.remove('disabled');
            }
            else {
                this.primed = false;
                this._disabled = true;
                this.root.classList.add('disabled');
            }
        }

        public get dangerous(): boolean {
            return this.root.classList.contains('danger');
        }
        public set dangerous(dangerous: boolean) {
            if (dangerous) this.root.classList.add('danger');
            else this.root.classList.remove('danger');
        }
    }
}
