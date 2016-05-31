namespace Models {
    export const enum AutomatchCriteria {
        FreeGames           = (1 << 0),	    // If set, free (unrated) games are OK.
        RankedGames         = (1 << 1),     // If set, rated games are OK.

        RobotPlayers        = (1 << 2),     // If set, games against robots are OK.
        HumanPlayers        = (1 << 3),     // If set, games against humans are OK.
        UnrankedPlayers     = (1 << 4),     // If set, playing against unranked players are OK.

        BlitzSpeed          = (1 << 5),	    // If set, blitz games are OK.
        FastSpeed           = (1 << 6),	    // If set, fast games are OK.
        MediumSpeed         = (1 << 7)      // If set, medium speed games are OK.
    }

    export class AutomatchState {
        public maxHandicap: number;
        public estimatedRank: string;
        public criteria: AutomatchCriteria;
        public seeking: boolean;

        constructor() {
            this.seeking = false;
        }

        public mergePreferences(preferences: KGS.AutomatchPreferences): boolean {
            let touch: boolean = false;

            if (this.maxHandicap != preferences.maxHandicap) { this.maxHandicap = preferences.maxHandicap; touch = true; }
            if (this.estimatedRank != preferences.estimatedRank) { this.estimatedRank = preferences.estimatedRank; touch = true; }

            let criteria: number = 0;

            if (preferences.freeOk) criteria |= AutomatchCriteria.FreeGames;
            if (preferences.rankedOk) criteria |= AutomatchCriteria.RankedGames;

            if (preferences.robotOk) criteria |= AutomatchCriteria.RobotPlayers;
            if (preferences.humanOk) criteria |= AutomatchCriteria.HumanPlayers;
            if (preferences.unrankedOk) criteria |= AutomatchCriteria.UnrankedPlayers;

            if (preferences.blitzOk) criteria |= AutomatchCriteria.BlitzSpeed;
            if (preferences.fastOk) criteria |= AutomatchCriteria.FastSpeed;
            if (preferences.mediumOk) criteria |= AutomatchCriteria.MediumSpeed;

            if (this.criteria != criteria) { this.criteria = criteria; touch = true; }

            return touch;
        }
    }
}
