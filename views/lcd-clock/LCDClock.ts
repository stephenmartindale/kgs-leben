namespace Views {
    export class LCDClock implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _minutes: Views.LCDDisplay;
        private _seconds: Views.LCDDisplay;

        private _value: number;

        private _resolution: number = 500;
        private _startTime: number;
        private _timeoutHandle: number;

        constructor() {
            this._div = document.createElement('div');
            this._div.className = 'lcd-clock';

            this._minutes = new Views.LCDDisplay(2, 0, false, true);
            this._minutes.attach(this._div);

            this._div.appendChild(Views.Templates.cloneTemplate('lcd-clock'));

            this._seconds = new Views.LCDDisplay(2, 0, false, true, true);
            this._seconds.attach(this._div);

            this._value = 0;
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this._minutes.activate();
            this._seconds.activate();

            if ((this._startTime != null) && (this._timeoutHandle == null)) {
                this._timeoutHandle = window.setTimeout(this._onTimeout, this._resolution);
            }

            this.update();
        }
        public deactivate(): void {
            this._seconds.deactivate();
            this._minutes.deactivate();

            if (this._timeoutHandle != null) {
                window.clearTimeout(this._timeoutHandle);
                this._timeoutHandle = null;
            }
        }

        private update(): void {
            let seconds = this.value;
            let minutes = ~~(seconds / 60);
            seconds -= minutes * 60;

            this._minutes.value = minutes;
            this._seconds.value = seconds;

            if (this._startTime != null) this._div.classList.add('running');
            else this._div.classList.remove('running');
        }

        public get value() {
            let seconds = this._value;
            if (this._startTime != null) {
                seconds -= (performance.now() - this._startTime) / 1000.0;
            }

            return (seconds >= 0)? Math.round(seconds) : 0;
        }
        public set value(seconds: number) {
            if (this._startTime != null) {
                this._startTime = performance.now();
            }

            this._value = seconds;
            this.update();
        }

        public get running() {
            return (this._startTime != null);
        }

        public start(value?: number, startTime?: number) {
            if ((value) && (value > 0)) {
                this._value = value;
            }

            this._startTime = startTime;
            if ((this._startTime == null) || (this._startTime <= 0)) {
                this._startTime = performance.now();
            }

            if (this._timeoutHandle == null) {
                this._timeoutHandle = window.setTimeout(this._onTimeout, this._resolution);
            }

            this.update();
        }

        public stop(value?: number) {
            if (this._timeoutHandle != null) {
                window.clearTimeout(this._timeoutHandle);
                this._timeoutHandle = null;
            }

            if ((value) && (value > 0)) {
                this._value = value;
            }
            else if (this._startTime != null) {
                this._value = this.value;
            }

            this._startTime = null;
            this.update();
        }

        private _onTimeout = (e: UIEvent) => {
            this._timeoutHandle = window.setTimeout(this._onTimeout, this._resolution);
            this.update();
        }
    }
}
