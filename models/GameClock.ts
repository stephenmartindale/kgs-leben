namespace Models {
    export interface GameClockState {
        running?: boolean;
        overtime?: boolean;
        expired?: boolean;

        time?: number;
        periods?: number;
        stones?: number;
    }

    export class GameClock {
        public updated: number;
        public timeSystem: string;

        public rules: Models.GameRules;

        public running: boolean;
        public overtime: boolean;

        public time: number;
        public periods: number;
        public stones: number;

        constructor(perfstamp: number) {
            this.updated = perfstamp;
        }

        public mergeClockState(perfstamp: number, gamePhase: Models.GamePhase, clockState: KGS.Downstream.ClockState) {
            this.updated = perfstamp;

            this.running = ((gamePhase == GamePhase.Active) && (!clockState.paused) && (clockState.running))? true : false;

            this.time = clockState.time;

            switch (this.rules.timeSystem) {
                case Models.TimeSystem.Japanese:
                    this.periods = clockState.periodsLeft;
                    if ((this.periods) && (this.periods > 0)) this.overtime = true;
                    break;

                case Models.TimeSystem.Canadian:
                    this.stones = clockState.stonesLeft;
                    if ((this.stones) && (this.stones > 0)) this.overtime = true;
                    break;
            }
        }

        public now(perfstamp?: number): Models.GameClockState {
            if (this.rules.timeSystem == Models.TimeSystem.None) return null;

            let expired: boolean = (this.time <= 0);
            if ((expired) || (!this.running)) {
                return {
                    running: false,
                    overtime: this.overtime,
                    expired: expired,
                    time: Math.round(this.time),
                    periods: this.periods,
                    stones: this.stones
                };
            }

            let seconds: number = this.time;
            perfstamp = (perfstamp != null)? perfstamp : performance.now();
            seconds -= (perfstamp - this.updated) / 1000.0;
            seconds = Math.round(seconds);

            let japaneseByoYomi: boolean = (this.rules.timeSystem == Models.TimeSystem.Japanese);
            let canadianByoYomi: boolean = (this.rules.timeSystem == Models.TimeSystem.Canadian);

            let overtime: boolean = (this.overtime)? true : false;
            let periods: number;
            if (seconds <= 0) {
                if ((japaneseByoYomi) || (canadianByoYomi)) {
                    let periodLength: number = this.rules.byoYomiTime;
                    let periodsAvailable: number;
                    if (japaneseByoYomi) {
                        periodsAvailable = (!overtime)? this.rules.byoYomiPeriods : (this.periods - 1);
                    }
                    else if (canadianByoYomi) {
                        periodsAvailable = (!overtime)? 1 : 0;
                    }

                    periods = - Math.ceil(seconds / periodLength);
                    overtime = true;

                    if (periods < periodsAvailable) {
                        seconds += (periods + 1) * periodLength;
                        periods = periodsAvailable - periods;
                    }
                    else expired = true;
                }
                else expired = true;
            }
            else periods = this.periods;

            if (!expired) {
                if (japaneseByoYomi) {
                    return {
                        running: true,
                        overtime: overtime,
                        time: seconds,
                        periods: (overtime)? periods : null
                    };
                }
                else if (canadianByoYomi) {
                    return {
                        running: true,
                        overtime: overtime,
                        time: seconds,
                        stones: (!overtime)? null : (this.stones)? this.stones : this.rules.byoYomiStones
                    };
                }
                else {
                    return {
                        running: true,
                        time: seconds
                    };
                }
            }

            if (this.rules.timeSystem == Models.TimeSystem.Canadian) {
                return { expired: true, stones: (this.stones) ? this.stones : this.rules.byoYomiStones };
            }
            else {
                return { expired: true };
            }
        }
    }
}
