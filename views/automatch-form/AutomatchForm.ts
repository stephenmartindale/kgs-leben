/// <reference path="../View.ts" />
namespace Views {
    export class AutomatchForm extends Views.View<HTMLDivElement> {
        private _updating: boolean;
        private _denyRankEstimates: boolean;
        private _estimatedRank: HTMLInputElement;

        private _maxHandicap: HTMLInputElement;
        private _opponentRankedOnly: HTMLInputElement;

        private _rankBoth: HTMLInputElement;
        private _rankRanked: HTMLInputElement;
        private _rankFree: HTMLInputElement;

        private _opponentTypeEither: HTMLInputElement;
        private _opponentTypeHumans: HTMLInputElement;
        private _opponentTypeRobots: HTMLInputElement;

        private _speedMedium: HTMLInputElement;
        private _speedFast: HTMLInputElement;
        private _speedBlitz: HTMLInputElement;

        private _cancelButton: HTMLButtonElement;
        private _automatchButton: Views.SafetyButton;

        public automatchPreferencesCallback: (estimatedRank: string, maxHandicap: number, criteria: Models.AutomatchCriteria) => void;
        public automatchSeekCallback: (estimatedRank: string, maxHandicap: number, criteria: Models.AutomatchCriteria) => void;
        public automatchCancelCallback: Function;

        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('automatch-form'));

            this._denyRankEstimates = false;
            this._estimatedRank = this.root.querySelector('#automatchEstimatedRank') as HTMLInputElement;

            this._maxHandicap = this.root.querySelector('#automatchMaxHandicap') as HTMLInputElement;
            this._opponentRankedOnly = this.root.querySelector('#automatchOpponentRankedOnly') as HTMLInputElement;

            this._rankBoth = this.root.querySelector('#automatchRankBoth') as HTMLInputElement;
            this._rankRanked = this.root.querySelector('#automatchRankRanked') as HTMLInputElement;
            this._rankFree = this.root.querySelector('#automatchRankFree') as HTMLInputElement;

            this._opponentTypeEither = this.root.querySelector('#automatchOpponentTypeEither') as HTMLInputElement;
            this._opponentTypeHumans = this.root.querySelector('#automatchOpponentTypeHumans') as HTMLInputElement;
            this._opponentTypeRobots = this.root.querySelector('#automatchOpponentTypeRobots') as HTMLInputElement;

            this._speedMedium = this.root.querySelector('#automatchSpeedMedium') as HTMLInputElement;
            this._speedFast = this.root.querySelector('#automatchSpeedFast') as HTMLInputElement;
            this._speedBlitz = this.root.querySelector('#automatchSpeedBlitz') as HTMLInputElement;

            this._cancelButton = this.root.querySelector('button.automatchCancelButton') as HTMLButtonElement;

            this._automatchButton = new Views.SafetyButton("find auto-match");
            this._automatchButton.attach(this.root.querySelector('.automatch') as HTMLDivElement);
            this._automatchButton.callback = this._onAutomatchClick;
        }

        public activate(): void {
            let inputs = this.root.querySelectorAll('input');
            for (let j = 0; j < inputs.length; ++j) {
                (<HTMLInputElement>inputs[j]).addEventListener('change', this._onAutomatchPreferencesChanged);
            }

            this._cancelButton.addEventListener('click', this._onCancelClick);

            super.activate();
        }

        public deactivate(): void {
            super.deactivate();

            this._cancelButton.removeEventListener('click', this._onCancelClick);

            let inputs = this.root.querySelectorAll('input');
            for (let j = 0; j < inputs.length; ++j) {
                (<HTMLInputElement>inputs[j]).removeEventListener('change', this._onAutomatchPreferencesChanged);
            }
        }

        public update(state: Models.AutomatchState, denyRankEstimates: boolean) {
            this._updating = true;

            if (denyRankEstimates) {
                this.root.querySelector('.estimated-rank').classList.add('hidden');
                this._denyRankEstimates = true;
            }
            else {
                this.root.querySelector('.estimated-rank').classList.remove('hidden');
                this._denyRankEstimates = false;

                let rating: number = Models.User.rankToRating(state.estimatedRank);
                if ((null != rating) && (rating < KGS.Constants.RatingShodan)) {
                    this._estimatedRank.value = Models.User.ratingToRank(rating, false, Models.UserRankFormat.Numeric);
                }
                else {
                    this._estimatedRank.value = null;
                }
            }

            if ((state.maxHandicap != null) && (state.maxHandicap >= 0) && (state.maxHandicap <= 9)) {
                this._maxHandicap.value = state.maxHandicap.toString();
            }
            else {
                this._maxHandicap.value = null;
            }

            this._opponentRankedOnly.checked = ((state.criteria & Models.AutomatchCriteria.UnrankedPlayers) != 0);

            let rankedGames: boolean = ((state.criteria & Models.AutomatchCriteria.RankedGames) != 0);
            let freeGames: boolean = ((state.criteria & Models.AutomatchCriteria.FreeGames) != 0);
            if (rankedGames == freeGames) this._rankBoth.checked = true;
            else if (rankedGames) this._rankRanked.checked = true;
            else if (freeGames) this._rankFree.checked = true;

            let humans: boolean = ((state.criteria & Models.AutomatchCriteria.HumanPlayers) != 0);
            let robots: boolean = ((state.criteria & Models.AutomatchCriteria.RobotPlayers) != 0);
            if (humans == robots) this._opponentTypeEither.checked = true;
            else if (humans) this._opponentTypeHumans.checked = true;
            else if (robots) this._opponentTypeRobots.checked = true;

            this._speedMedium.checked = ((state.criteria & Models.AutomatchCriteria.MediumSpeed) != 0);
            this._speedFast.checked = ((state.criteria & Models.AutomatchCriteria.FastSpeed) != 0);
            this._speedBlitz.checked = ((state.criteria & Models.AutomatchCriteria.BlitzSpeed) != 0);

            if (state.seeking) {
                this._cancelButton.classList.remove('hidden');
                this._automatchButton.hide();

                this.root.classList.add('disabled');
                let inputs = this.root.querySelectorAll('input');
                for (let j = 0; j < inputs.length; ++j) {
                    (<HTMLInputElement>inputs[j]).disabled = true;
                }
            }
            else {
                this._cancelButton.classList.add('hidden');
                this._automatchButton.show();

                this.root.classList.remove('disabled');
                let inputs = this.root.querySelectorAll('input');
                for (let j = 0; j < inputs.length; ++j) {
                    (<HTMLInputElement>inputs[j]).disabled = false;
                }
            }

            this._updating = false;
        }

        public get estimatedRank(): string {
            if (this._denyRankEstimates) return null;

            let rankString = this._estimatedRank.value;
            if (!rankString) rankString = this._estimatedRank.placeholder;

            return rankString + "k";
        }

        public get maxHandicap(): number {
            let stones: number = null;
            if ((this._maxHandicap.value != null) && (this._maxHandicap.value.length > 0)) {
                stones = (+this._maxHandicap.value);
                if ((stones < 0) || (stones > 9)) stones = null;
            }

            return stones;
        }

        public get criteria(): Models.AutomatchCriteria {
            let c: Models.AutomatchCriteria = 0;

            if (this._opponentRankedOnly.checked) c |= Models.AutomatchCriteria.UnrankedPlayers;

            if (this._rankBoth.checked) c |= Models.AutomatchCriteria.RankedGames | Models.AutomatchCriteria.FreeGames;
            else if (this._rankRanked.checked) c |= Models.AutomatchCriteria.RankedGames;
            else if (this._rankFree.checked) c |= Models.AutomatchCriteria.FreeGames;

            if (this._opponentTypeEither.checked) c |= Models.AutomatchCriteria.HumanPlayers | Models.AutomatchCriteria.RobotPlayers;
            else if (this._opponentTypeHumans.checked) c |= Models.AutomatchCriteria.HumanPlayers;
            else if (this._opponentTypeRobots.checked) c |= Models.AutomatchCriteria.RobotPlayers;

            if (this._speedMedium.checked) c |= Models.AutomatchCriteria.MediumSpeed;
            if (this._speedFast.checked) c |= Models.AutomatchCriteria.FastSpeed;
            if (this._speedBlitz.checked) c |= Models.AutomatchCriteria.BlitzSpeed;

            return c;
        }

        private _onAutomatchPreferencesChanged = () => {
            if (this._updating) return;
            if (this.automatchPreferencesCallback) {
                this.automatchPreferencesCallback(this.estimatedRank, this.maxHandicap, this.criteria);
            }
        }

        private _onAutomatchClick = () => {
            if (this._updating) return;
            if (this.automatchSeekCallback) {
                this.automatchSeekCallback(this.estimatedRank, this.maxHandicap, this.criteria);
            }
        }

        private _onCancelClick = () => {
            if (this._updating) return;
            if (this.automatchCancelCallback) this.automatchCancelCallback();
        }
    }
}
