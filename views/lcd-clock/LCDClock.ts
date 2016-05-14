/// <reference path="../View.ts" />
namespace Views {
    export class LCDClock extends Views.View<HTMLDivElement> {
        private _minutes: Views.LCDDisplay;
        private _seconds: Views.LCDDisplay;

        private _value: number;
        private _running: boolean;

        constructor() {
            super(Templates.createDiv('lcd-clock'));

            this._minutes = new Views.LCDDisplay(2, 0, false, true);
            this._minutes.attach(this.root);

            this.root.appendChild(Views.Templates.cloneTemplate('lcd-clock'));

            this._seconds = new Views.LCDDisplay(2, 0, false, true, true);
            this._seconds.attach(this.root);
        }

        public activate(): void {
            this._minutes.activate();
            this._seconds.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
            this._seconds.deactivate();
            this._minutes.deactivate();
        }

        public update(seconds: number, running?: boolean): void {
            seconds = (seconds == null)? null : (seconds >= 0)? seconds : 0;
            if (this._value != seconds) {
                if (seconds != null) {
                    let minutes = ~~(seconds / 60);
                    seconds -= minutes * 60;

                    this._minutes.value = minutes;
                    this._seconds.value = seconds;
                }
                else {
                    this._minutes.value = null;
                    this._seconds.value = null;
                }

                this._value = seconds;
            }

            running = (running)? true : false;
            if (this._running != running) {
                if (running) this.root.classList.add('running');
                else this.root.classList.remove('running');

                this._running = running;
            }
        }
    }
}
