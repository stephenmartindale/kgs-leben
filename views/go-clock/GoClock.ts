namespace Views {
    export class GoClock implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _clock: Views.LCDClock;
        private _periodNumber: Views.LCDDisplay;
        private _periodCounter: Views.LCDCounter;

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

        public updateRules(rules: KGS.GameRules) {
            this._clock.value = rules.mainTime;

            let periods: number;
            switch (rules.timeSystem) {
                case KGS.Constants.TimeSystems.Japanese: periods = rules.byoYomiPeriods; break;
                case KGS.Constants.TimeSystems.Canadian: periods = rules.byoYomiStones; break;
                default: periods = 0;
            }

            if ((periods > 0) && (periods <= 30)) {
                this._periodCounter.setMaximum(periods, (periods <= 15)? 1 : 2);
                this._periodCounter.value = null;
                this._periodCounter.show();
            }
            else {
                this._periodCounter.hide();
            }

            if (periods > 0) {
                this._periodNumber.value = null;
                this._periodNumber.show();
            }
            else {
                this._periodNumber.hide();
            }
        }

        public set time(seconds: number) {
            this._clock.value = (seconds >= 0)? seconds : 0;
        }

        public set periods(periods: number) {
            periods = (periods >= 0)? periods : 0;
            this._periodCounter.value = periods;
            this._periodNumber.value = periods;
        }

        public get running() {
            return this._clock.running;
        }
        public start() {
            this._clock.start();
        }
        public stop() {
            this._clock.stop();
        }
    }
}
