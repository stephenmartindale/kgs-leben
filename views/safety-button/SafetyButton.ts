/// <reference path="../View.ts" />
namespace Views {
    export class SafetyButton extends Views.View<HTMLDivElement> {
        private _text: string;
        private _disabled: boolean;
        private _primed: boolean;

        private _primary: HTMLDivElement;
        private _confirm: HTMLDivElement;

        public callback: Function;

        constructor(text: string, danger?: boolean) {
            super(Templates.cloneTemplate<HTMLDivElement>('safety-button'));
            if (danger) {
                this.root.classList.add('danger');
            }

            this._text = text;
            this._disabled = false;
            this._primed = false;

            document.body.addEventListener('click', this._onClickCaptured, true);

            this._primary = <HTMLDivElement>this.root.children[0];
            this._primary.innerText = text;
            this._primary.title = text;
            this._primary.onclick = this._onPrimaryClick;

            this._confirm = <HTMLDivElement>this.root.children[1];
            this._confirm.title = text;
            this._confirm.onclick = this._onConfirmClick;
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

        public get primed(): boolean {
            return this._primed;
        }
        public set primed(value: boolean) {
            if (!value) {
                this._primed = false;
                this.root.classList.remove('primed');
                this._primary.title = this._text;
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
    }
}
