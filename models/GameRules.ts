namespace Models {
    export const enum RuleSet {
        Japanese,   // "japanese"
        Chinese,    // "chinese"
        AGA,        // "aga"
        NewZealand  // "new_zealand"
    }

    export const enum TimeSystem {
        None,       // "none"
        Absolute,   // "absolute"
        Japanese,   // "byo_yomi"
        Canadian    // "canadian"
    }

    export interface KomiSplit {
        white: { base: number, half?: boolean };
        black?: { base: number, half?: boolean };
    }

    export class GameRules {
        public ruleSet: Models.RuleSet;

        public timeSystem: Models.TimeSystem;
        public mainTime: number;
        public byoYomiTime: number;
        public byoYomiPeriods: number;
        public byoYomiStones: number;
        public byoYomiMaximum: number;

        public komi: number;

        constructor(rules: KGS.GameRules) {
            this.setRules(rules);
        }

        public setRules(rules: KGS.GameRules) {
            if (rules) {
                switch (rules.rules) {
                    case "chinese": this.ruleSet = Models.RuleSet.Chinese; break;
                    case "aga": this.ruleSet = Models.RuleSet.AGA; break;
                    case "new_zealand": this.ruleSet = Models.RuleSet.NewZealand; break;
                    default: this.ruleSet = Models.RuleSet.Japanese; break;
                }

                switch (rules.timeSystem) {
                    case "absolute": this.timeSystem = Models.TimeSystem.Absolute; break;
                    case "byo_yomi": this.timeSystem = Models.TimeSystem.Japanese; break;
                    case "canadian": this.timeSystem = Models.TimeSystem.Canadian; break;
                    default: this.timeSystem = Models.TimeSystem.None; break;
                }

                if (this.timeSystem != Models.TimeSystem.None) {
                    this.mainTime = rules.mainTime;
                    this.byoYomiTime = (this.timeSystem != Models.TimeSystem.Absolute)? rules.byoYomiTime : null;
                    this.byoYomiPeriods = (this.timeSystem == Models.TimeSystem.Japanese)? rules.byoYomiPeriods : null;
                    this.byoYomiStones = (this.timeSystem == Models.TimeSystem.Canadian)? rules.byoYomiStones : null;
                    this.byoYomiMaximum = (this.timeSystem != Models.TimeSystem.Absolute)? (this.byoYomiPeriods || this.byoYomiStones) : null;
                }
                else {
                    this.mainTime = null;
                    this.byoYomiTime = null;
                    this.byoYomiPeriods = null;
                    this.byoYomiStones = null;
                    this.byoYomiMaximum = null;
                }

                this.komi = rules.komi;
            }
            else {
                this.ruleSet = Models.RuleSet.Japanese;

                this.timeSystem = Models.TimeSystem.None;
                this.mainTime = null;
                this.byoYomiTime = null;
                this.byoYomiPeriods = null;
                this.byoYomiStones = null;
                this.byoYomiMaximum = null;

                this.komi = null;
            }
        }

        public static splitKomi(komi: number): KomiSplit {
            let reverse: boolean = false;
            let base: number = 0;
            let half: boolean = false;

            if (komi) {
                reverse = (komi < 0);
                base = Math.floor(komi);
                half = (komi != base);
            }

            if (!reverse) {
                return { white: { base: base, half: half }};
            }
            else {
                return {
                    white: { base: 0, half: half },
                    black: { base: Math.abs(base) }
                };
            }
        }
    }
}
