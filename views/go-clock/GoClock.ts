/// <reference path="../View.ts" />
namespace Views {
    export class GoClock extends Views.View<HTMLDivElement> {
        private _clock: Views.LCDClock;
        private _overtimeNumber: Views.LCDDisplay;
        private _overtimeCounter: Views.LCDCounter;

        private _data: Models.GameClock;
        private _rules: Models.GameRules;
        private _expired: boolean;
        private _hidden: boolean;

        private _resolution: number = 500;
        private _timeoutHandler: Function;
        private _timeoutHandle: number;

        constructor() {
            super(Templates.createDiv('go-clock'));

            this._clock = new Views.LCDClock();
            this._clock.attach(this.root);

            this._overtimeNumber = new Views.LCDDisplay(2, 0, false, true);
            this._overtimeNumber.attach(this.root);

            this._overtimeCounter = new Views.LCDCounter(25);
            this._overtimeCounter.attach(this.root);
        }

        public activate(): void {
            this._clock.activate();
            this._overtimeNumber.activate();
            this._overtimeCounter.activate();

            if (this._timeoutHandle == null) {
                this.restoreTimeout();
            }

            super.activate();
        }
        public deactivate(): void {
            super.deactivate();

            this.clearTimeout();

            this._overtimeCounter.deactivate();
            this._overtimeNumber.deactivate();
            this._clock.deactivate();
        }

        private restoreTimeout() {
            if (this._timeoutHandler != null) {
                this._timeoutHandle = window.setTimeout(this._timeoutHandler, this._resolution);
            }
        }

        private clearTimeout() {
            if (this._timeoutHandle != null) {
                window.clearTimeout(this._timeoutHandle);
                this._timeoutHandle = null;
            }
        }

        public update(data: Models.GameClock) {
            if ((data) && (data.rules) && (data.rules.timeSystem != Models.TimeSystem.None)) {
                // Register a Timeout of the clock is running
                let clockState = data.now();
                if (clockState.running) {
                    if (this._data != data) {
                        this._data = data;
                        this._timeoutHandler = this.update.bind(this, data);
                    }

                    this.restoreTimeout();
                }

                if (this._rules != data.rules) {
                    // Show or hide the Overtime Counters
                    if ((data.rules.byoYomiMaximum) && (data.rules.byoYomiMaximum <= 30)) {
                        this._overtimeCounter.setMaximum(data.rules.byoYomiMaximum, (data.rules.byoYomiMaximum <= 15)? 1 : 2);
                        this._overtimeCounter.show();
                    }
                    else {
                        this._overtimeCounter.hide();
                    }

                    if (data.rules.byoYomiMaximum) {
                        this._overtimeNumber.show();
                    }
                    else {
                        this._overtimeNumber.hide();
                    }
                }

                if (!clockState.expired) {
                    let overtimeValue: number = (clockState.overtime)? (clockState.periods || clockState.stones) : null;
                    this._overtimeCounter.value = overtimeValue;
                    this._overtimeNumber.value = overtimeValue;

                    this._clock.update(clockState.time, clockState.running);

                    if (this._expired) {
                        this.root.classList.remove('expired');
                        this._expired = false;
                    }
                }
                else {
                    let overtimeValue: number = (clockState.stones)? clockState.stones : 0;
                    this._overtimeCounter.value = overtimeValue;
                    this._overtimeNumber.value = overtimeValue;
                    this._clock.update(0, false);
                    if (!this._expired) {
                        this.root.classList.add('expired');
                        this._expired = true;
                    }
                }

                // Show the clock if it was previously hidden
                if (this._hidden) {
                    this.root.classList.remove('hidden');
                    this._hidden = false;
                }
            }
            else {
                // Clear Timeout and Hide the clock
                this.clearTimeout();
                if (!this._hidden) this.root.classList.add('hidden');
                this._data = null;
                this._hidden = true;
            }
        }
    }
}
