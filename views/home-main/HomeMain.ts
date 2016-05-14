/// <reference path="../View.ts" />
namespace Views {
    export class HomeMain extends Views.View<HTMLDivElement> {
        private _avatar: HTMLImageElement;
        private _username: HTMLSpanElement;
        private _rank: HTMLSpanElement;

        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('home-main'));

            this._avatar = this.root.querySelector('img.avatar') as HTMLImageElement;

            let nameSpans = this.root.querySelectorAll('p.name span');
            this._username = nameSpans[0] as HTMLSpanElement;
            this._rank = nameSpans[1] as HTMLSpanElement;
        }

        public update(user: Models.User) {
            if (user) {
                if ((user.flags & Models.UserFlags.HasAvatar) == Models.UserFlags.HasAvatar) {
                    this._avatar.src = KGS.Constants.AvatarURIPrefix + user.name + KGS.Constants.AvatarURISuffix;
                    this._avatar.title = user.name;
                }
                else {
                    this._avatar.src = 'img/avatar-default.png';
                    this._avatar.title = "";
                }

                this._username.innerText = user.name;
                this._rank.innerText = user.rank;
            }
            else {
                this._avatar.src = 'img/avatar-default.png';
                this._avatar.title = "";
                this._username.innerText = "";
                this._rank.innerText = "";
            }
        }
    }
}
