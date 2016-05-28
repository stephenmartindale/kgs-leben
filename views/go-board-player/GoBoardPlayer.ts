/// <reference path="../View.ts" />
namespace Views {
    export class GoBoardPlayer extends Views.View<HTMLDivElement> {
        private _clock: Views.GoClock;

        private _userAvatar: HTMLImageElement;
        private _userName: HTMLDivElement;
        private _userRank: HTMLDivElement;
        private _userStone: HTMLImageElement;

        private _captureCount: HTMLSpanElement;

        private _komiCaption: HTMLSpanElement;
        private _komiBase: HTMLSpanElement;
        private _komiHalf: HTMLSpanElement;

        private _buttonsDiv: HTMLDivElement;
        private _buttons: Views.SafetyButton[];

        constructor(playerTeam: Models.PlayerTeam) {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('go-board-player'));

            let playerInfo = this.root.querySelector('.player-info') as HTMLDivElement;
            let playerStats = this.root.querySelector('.player-stats') as HTMLDivElement;

            this._clock = new Views.GoClock();

            if (playerTeam == Models.PlayerTeam.Home) {
                this._clock.attach(playerStats, false);

                this._buttonsDiv = Templates.createDiv('player-buttons hidden');
                playerStats.insertBefore(this._buttonsDiv, playerStats.firstElementChild);
                this._buttons = new Array<Views.SafetyButton>(2);
                for (let u = 0; u < this._buttons.length; ++u) {
                    this._buttons[u] = new Views.SafetyButton();
                    this._buttons[u].attach(this._buttonsDiv);
                }
            }
            else {
                this.root.insertBefore(playerStats, playerInfo);
                this._clock.attach(playerStats, true);
            }

            this._userAvatar = playerInfo.querySelector('img.avatar') as HTMLImageElement;
            this._userName = playerInfo.querySelector('div.name') as HTMLDivElement;
            this._userRank = playerInfo.querySelector('div.secondary') as HTMLDivElement;
            this._userStone = playerInfo.querySelector('img.stone') as HTMLImageElement;

            this._captureCount = playerStats.querySelector('.capture-count') as HTMLSpanElement;

            this._komiCaption = playerStats.querySelector('.komi-caption') as HTMLSpanElement;
            this._komiBase = playerStats.querySelector('.komi-base') as HTMLSpanElement;
            this._komiHalf = playerStats.querySelector('.komi-half') as HTMLSpanElement;
        }

        public activate(): void {
            this._clock.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
            this._clock.deactivate();
        }

        public update(colour: Models.GameStone, clock: Models.GameClock, prisoners: number, komi: { base: number, half?: boolean }, user: Models.User, buttons?: { text: string, callback: Function, dangerous?: boolean}[]) {
            // Player Colour
            if (colour == Models.GameStone.White) {
                this._userStone.src = 'img/stone-white.png';
                this._userStone.title = 'white';
            }
            else {
                this._userStone.src = 'img/stone-black.png';
                this._userStone.title = 'black';
            }

            // Clock
            this._clock.update(clock);

            // Prisoners
            this._captureCount.innerText = (prisoners != null)? prisoners.toString() : "0";

            // Komi
            if ((!komi) || ((!komi.base) && (!komi.half))) {
                this._komiCaption.innerText = "";
                this._komiBase.innerText = "";
                this._komiHalf.innerText = "";
            }
            else {
                this._komiCaption.innerText = (colour == Models.GameStone.White)? "komi" : "reverse komi";
                this._komiBase.innerText = (komi.base)? komi.base.toString() : "0";
                this._komiHalf.innerText = (komi.half)? "½" : "";
            }

            // User Info.
            if (user) {
                if ((user.flags & Models.UserFlags.HasAvatar) == Models.UserFlags.HasAvatar) {
                    this._userAvatar.src = KGS.Constants.AvatarURIPrefix + user.name + KGS.Constants.AvatarURISuffix;
                    this._userAvatar.title = user.name;
                }
                else {
                    this._userAvatar.src = 'img/avatar-default.png';
                    this._userAvatar.title = "";
                }

                this._userName.innerText = user.name;
                this._userRank.innerText = user.rank;
            }
            else {
                this._userAvatar.src = 'img/avatar-default.png';
                this._userAvatar.title = "";
                this._userName.innerHTML = "&nbsp;";
                this._userRank.innerHTML = "&nbsp;";
            }

            // Player Buttons
            if (this._buttonsDiv) {
                if (buttons) {
                    this._buttonsDiv.classList.remove('hidden');

                    for (let u = 0; u < this._buttons.length; ++u) {
                        if (u < buttons.length) {
                            this._buttons[u].text = buttons[u].text;
                            this._buttons[u].dangerous = (buttons[u].dangerous)? true : false;
                            this._buttons[u].callback = buttons[u].callback;
                            this._buttons[u].disabled = (buttons[u].callback == null);
                            this._buttons[u].show();
                        }
                        else {
                            this._buttons[u].callback = null;
                            this._buttons[u].hide();
                        }
                    }
                }
                else this._buttonsDiv.classList.add('hidden');
            }
        }
    }
}
