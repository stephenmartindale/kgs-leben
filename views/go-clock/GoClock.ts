namespace Views {
    export class GoClock implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _clock: Views.LCDClock;
        private _periodNumber: Views.LCDDisplay;
        private _periodCounter: Views.LCDCounter;

        private _maxPeriods: number;

        constructor() {
            this._div = document.createElement('div');
            this._div.className = 'go-clock';

            this._clock = new Views.LCDClock();
            this._clock.attach(this._div);

            this._periodNumber = new Views.LCDDisplay(2, 0, false, true);
            this._periodNumber.attach(this._div);

            this._periodCounter = new Views.LCDCounter(25);
            this._periodCounter.attach(this._div);
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this._clock.activate();
            this._periodNumber.activate();
            this._periodCounter.activate();
        }
        public deactivate(): void {
            this._periodCounter.deactivate();
            this._periodNumber.deactivate();
            this._clock.deactivate();
        }

        public hide() {
            this._div.classList.add('hidden');
        }
        public show() {
            this._div.classList.remove('hidden');
        }

        public update(clock: Models.GameClock) {
            if ((clock) && (clock.timeSystem) && (clock.timeSystem != KGS.Constants.TimeSystems.None)) {
                if (this._maxPeriods != clock.maxPeriods) {
                    this._maxPeriods = clock.maxPeriods;

                    if ((this._maxPeriods) && (this._maxPeriods > 0) && (this._maxPeriods <= 30)) {
                        this._periodCounter.setMaximum(this._maxPeriods, (this._maxPeriods <= 15)? 1 : 2);
                        this._periodCounter.show();
                    }
                    else {
                        this._periodCounter.hide();
                    }

                    if ((this._maxPeriods) && (this._maxPeriods > 0)) {
                        this._periodNumber.show();
                    }
                    else {
                        this._periodNumber.hide();
                    }
                }

                let periods = (clock.overtime)? clock.periods : null;
                this._periodCounter.value = periods;
                this._periodNumber.value = periods;

                if (clock.running) this._clock.start(clock.time, clock.updated);
                else this._clock.stop(clock.time);

                this.show();
            }
            else {
                this._clock.stop();
                this.hide();
            }
        }
    }
}
