namespace Views {
    export class GameProposal implements Views.View<HTMLFormElement> {
        private _disabled: boolean;
        private _gameActions: Models.GameActions;

        private _form: HTMLFormElement;

        private _timeSystem: string;
        private _japaneseByoYomi: number;
        private _japanesePeriods: number;
        private _canadianByoYomi: number;
        private _canadianStones: number;

        private _onTimeSystemChanged: (event: JQueryInputEventObject) => void;
        private _onHandicapChanged: (event: JQueryInputEventObject) => void;

        public submitCallback: (form: GameProposal) => void;

        constructor() {
            this._form = Views.Templates.cloneTemplate('game-proposal') as HTMLFormElement;

            this._onTimeSystemChanged = (event: JQueryInputEventObject) => { if (!$(event.target).prop('disabled')) this.onTimeSystemChanged(); }
            this._onHandicapChanged = (event: JQueryInputEventObject) => { if (!$(event.target).prop('disabled')) this.onHandicapChanged(); }

            this._disabled = false;

            this._timeSystem = null;
            this._japaneseByoYomi = KGS.Constants.DefaultJapaneseByoYomi;
            this._japanesePeriods = KGS.Constants.DefaultJapanesePeriods;
            this._canadianByoYomi = KGS.Constants.DefaultCanadianByoYomi;
            this._canadianStones = KGS.Constants.DefaultCanadianStones;

            $(this._form).submit((e) => this.onFormSubmit(e));
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._form);
        }

        public activate(): void {
            $(this._form).find('input[name="proposalTimeSystem"]').on('change', this._onTimeSystemChanged);
            $(this._form).find('input[name="proposalColour"]').on('change', this._onHandicapChanged);
            $(this._form).find('input[name="proposalHandicap"]').on('change', this._onHandicapChanged);

            this.disabledChanged();
        }
        public deactivate(): void {
            $(this._form).find('input[name="proposalTimeSystem"]').off('change', this._onTimeSystemChanged);
            $(this._form).find('input[name="proposalColour"]').off('change', this._onHandicapChanged);
            $(this._form).find('input[name="proposalHandicap"]').off('change', this._onHandicapChanged);
        }

        get gameActions(): Models.GameActions {
            return this._gameActions;
        }
        set gameActions(value: Models.GameActions) {
            if (value != this._gameActions) {
                this._gameActions = value;
                this.disabledChanged();
            }
        }

        get disabled(): boolean {
            return this._disabled;
        }
        set disabled(value: boolean) {
            if (value != this._disabled) {
                this._disabled = value;
                this.disabledChanged();
            }
        }

        private disabledChanged() {
            let form = $(this._form);
            if ((this._disabled) || ((this._gameActions & Models.GameActions.ChallengeSubmitted) != 0)) {
                form.find('input').prop('disabled', true);
                form.find('button').prop('disabled', true);
            }
            else if ((this._gameActions & Models.GameActions.ChallengeAccept) != 0) {
                form.find('input').prop('disabled', true);
                form.find('button').prop('disabled', false);
            }
            else {
                let disableCreatorFields = ((this._gameActions & Models.GameActions.ChallengeSetup) == 0);
                form.find('input[name="proposalSize"]').prop('disabled', disableCreatorFields);
                form.find('input[name="proposalOpen"]').prop('disabled', disableCreatorFields);
                form.find('input[name="proposalRuleSet"]').prop('disabled', disableCreatorFields);
                form.find('input[name="proposalTimeSystem"]').prop('disabled', disableCreatorFields);
                form.find('#proposalTimeMain').prop('disabled', disableCreatorFields);
                form.find('#proposalTimeByoYomi').prop('disabled', disableCreatorFields);
                form.find('#proposalTimePeriods').prop('disabled', disableCreatorFields);

                let disableHandicap = (this.colour == 'nigiri');
                form.find('input[name="proposalHandicap"]').prop('disabled', disableHandicap);

                let disableKomi = ((!disableHandicap) && (this.handicap != 0));
                form.find('input[name="proposalKomi"]').prop('disabled', disableKomi);
            }
        }

        private onFormSubmit(e: JQueryEventObject) {
            e.preventDefault();
            if (this.submitCallback) this.submitCallback(this);
        }

        public get description(): string {
            return $(this._form).find('#proposalDescription').text();
        }
        public set description(value: string) {
            $(this._form).find('#proposalDescription').text(value);
        }

        public get boardSize(): number {
            switch ($(this._form).find('input[name="proposalSize"]:checked').val()) {
                case "13": return 13;
                case "9": return 9;
                default: return 19;
            }
        }
        public set boardSize(value: number) {
            $(this._form).find('input[name="proposalSize"]').each((index: number, element: Element) => {
                let radio = $(element);
                radio.prop('checked', (radio.val() == value));
            });
        }

        public get private(): boolean {
            return $(this._form).find('#proposalPrivate').prop('checked');
        }
        public set private(value: boolean) {
            $(this._form).find('#proposalPrivate').prop('checked', value);
            $(this._form).find('#proposalOpen').prop('checked', !value);
        }

        public get ruleSet(): string {
            return $(this._form).find('input[name="proposalRuleSet"]:checked').val();
        }
        public set ruleSet(value: string) {
            $(this._form).find('input[name="proposalRuleSet"]').each((index: number, element: Element) => {
                let radio = $(element);
                radio.prop('checked', (radio.val() == value));
            });
        }

        public get byoYomi(): { time: number, periods?: number, stones?: number } {
            let time: number = Utils.htmlTimeToSeconds($(this._form).find('#proposalTimeByoYomi').val());
            let num: number = $(this._form).find('#proposalTimePeriods').val();

            switch (this._timeSystem) {
                case "byo_yomi":
                    return { time: time, periods: num };

                case "canadian":
                    return { time: time, stones: num };

                default: return null;
            }
        }

        private onTimeSystemChanged() {
            if (this._timeSystem == "byo_yomi") {
                let byoYomi = this.byoYomi;
                this._japaneseByoYomi = byoYomi.time;
                this._japanesePeriods = byoYomi.periods;
            }
            else if (this._timeSystem == "canadian") {
                let byoYomi = this.byoYomi;
                this._canadianByoYomi = byoYomi.time;
                this._canadianStones = byoYomi.stones;
            }

            let showMainTime: boolean = false;
            let showOvertime: boolean = false;
            let overtimeValue: string;
            let periodCaption: string = "";
            let periodValue: number;

            this._timeSystem = $(this._form).find('input[name="proposalTimeSystem"]:checked').val();
            switch (this._timeSystem) {
                case "byo_yomi":
                    showMainTime = true;
                    showOvertime = true;
                    overtimeValue = Utils.htmlSecondsToTime(this._japaneseByoYomi);
                    periodCaption = "Periods";
                    periodValue = this._japanesePeriods;
                    break;

                case "canadian":
                    showMainTime = true;
                    showOvertime = true;
                    overtimeValue = Utils.htmlSecondsToTime(this._canadianByoYomi);
                    periodCaption = "Stones";
                    periodValue = this._canadianStones;
                    break;

                case "absolute":
                    showMainTime = true;
                    showOvertime = false;
                    periodCaption = "Stones";
                    break;
            }

            if (showMainTime)
                $(this._form).find('#proposalTimeMainGroup').removeClass('hidden');
            else
                $(this._form).find('#proposalTimeMainGroup').addClass('hidden');

            if (showOvertime) {
                $(this._form).find('#proposalTimeByoYomiGroup').removeClass('hidden');
                $(this._form).find('#proposalTimeByoYomi').val(overtimeValue);

                $(this._form).find('#proposalTimePeriodsGroup').removeClass('hidden');
                $(this._form).find('#proposalTimePeriodsLabel').text(periodCaption + ":");

                let periodsInput = $(this._form).find('#proposalTimePeriods');
                periodsInput.attr('placeholder', periodCaption);
                periodsInput.val(periodValue);
            }
            else {
                $(this._form).find('#proposalTimeByoYomiGroup').addClass('hidden');
                $(this._form).find('#proposalTimePeriodsGroup').addClass('hidden');
            }
        }

        public setTimeSystem(timeSystem: string, mainTime?: number, byoYomiTime?: number, byoYomiPeriods?: number, byoYomiStones?: number) {
            $(this._form).find('input[name="proposalTimeSystem"]').each((index: number, element: Element) => {
                let radio = $(element);
                radio.prop('checked', (radio.val() == timeSystem));
            });

            this.onTimeSystemChanged();

            if ((mainTime) && (mainTime >= 0)) $(this._form).find('#proposalTimeMain').val(Utils.htmlSecondsToTime(mainTime));
            if ((byoYomiTime) && (byoYomiTime >= 0)) $(this._form).find('#proposalTimeByoYomi').val(Utils.htmlSecondsToTime(byoYomiTime));
            if ((byoYomiPeriods) && (byoYomiPeriods >= 0) && (this._timeSystem == 'byo_yomi')) $(this._form).find('#proposalTimePeriods').val(byoYomiPeriods);
            else if ((byoYomiStones) && (byoYomiStones >= 0) && (this._timeSystem == 'canadian')) $(this._form).find('#proposalTimePeriods').val(byoYomiStones);
        }

        public get colour(): string {
            return $(this._form).find('input[name="proposalColour"]:checked').val();
        }
        public set colour(value: string) {
            $(this._form).find('input[name="proposalColour"]').each((index: number, element: Element) => {
                let radio = $(element);
                radio.prop('checked', (radio.val() == value));
            });

            this.onHandicapChanged();
        }

        public get handicap(): number {
            return $(this._form).find('input[name="proposalHandicap"]:checked').val();
        }
        public set handicap(value: number) {
            if (value == 0) {
                this.colour = "nigiri";
            }
            else if (value > 0) {
                this.colour = "black";
            }
            else {
                this.colour = "white";
                value *= -1;
            }

            if (value > 9) value = 9;

            $(this._form).find('input[name="proposalHandicap"]').each((index: number, element: Element) => {
                let radio = $(element);
                radio.prop('checked', (radio.val() == value));
            });

            this.onHandicapChanged();
        }

        private onHandicapChanged() {
            if (this.colour == "nigiri") {
                $(this._form).find('input[name="proposalHandicap"]').each((index: number, element: Element) => {
                    let radio = $(element);
                    radio.prop('checked', (radio.val() == 0));
                });
            }

            let komiInput = $(this._form).find('input[name="proposalKomi"]');
            if (this.handicap != 0) {
                komiInput.val(KGS.Constants.HandicapKomi);
            }
            else if (komiInput.prop('disabled')) {
                komiInput.val(KGS.Constants.DefaultKomi);
            }

            this.disabledChanged();
        }

        public get komi(): number {
            return $(this._form).find('input[name="proposalKomi"]').val();
        }
        public set komi(value: number) {
            $(this._form).find('input[name="proposalKomi"]').val(value);
        }

        public setChallenger(name: string, rank: string) {
            let challengerSpans = $(this._form).find('#playerChallenger span');
            challengerSpans[0].innerText = name;
            challengerSpans[1].innerText = rank;
        }
    }
}
