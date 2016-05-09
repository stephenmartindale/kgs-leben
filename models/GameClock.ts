namespace Models {
    export class GameClock {
        public updated: number;
        public timeSystem: string;

        public mainTime: number;
        public maxPeriods: number;

        public running: boolean;
        public overtime: boolean;

        public time: number;
        public periods: number;

        constructor(perfstamp: number) {
            this.updated = perfstamp;
        }

        public setRules(perfstamp: number, rules: KGS.SGF.RULES) {
            this.timeSystem = rules.timeSystem;
            this.mainTime = rules.mainTime;

            switch (this.timeSystem) {
                case KGS.Constants.TimeSystems.Japanese: this.maxPeriods = rules.byoYomiPeriods; break;
                case KGS.Constants.TimeSystems.Canadian: this.maxPeriods = rules.byoYomiStones; break;
                default: this.maxPeriods = 0; break;
            }
        }

        public mergeClockState(perfstamp: number, clockState: KGS.Downstream.ClockState) {
            this.updated = perfstamp;

            this.running = (clockState.running)? true : false;

            this.time = clockState.time;

            let periods: number = 0;
            switch (this.timeSystem) {
                case KGS.Constants.TimeSystems.Japanese: periods = clockState.periodsLeft; break;
                case KGS.Constants.TimeSystems.Canadian: periods = clockState.stonesLeft; break;
            }

            if ((periods) && (periods > 0)) this.overtime = true;
            this.periods = periods;
        }
    }
}
