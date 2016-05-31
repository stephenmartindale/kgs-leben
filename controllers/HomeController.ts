/// <reference path="ViewControllerBase.ts" />

namespace Controllers {
    export class HomeController extends ViewControllerBase<ChannelController> {
        public static channelId: number = 0;

        private _homeSidebar: Views.HomeSidebar;

        constructor(parent: ChannelController) {
            super(parent);

            this.initialiseMainView();
            this.initialiseSidebarView();
        }

        private get user(): Models.User {
            return this.database.users[this.database.username];
        }

        private initialiseMainView() {
            var view = new Views.HomeMain();

            this.registerView(view, LayoutZone.Main, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.users[this.database.username])) {
                    view.update(this.user);
                }
            });
        }

        private initialiseSidebarView() {
            this._homeSidebar = new Views.HomeSidebar();
            this._homeSidebar.automatchCallback = () => this.automatchCallback();
            this._homeSidebar.automatchPreferencesCallback = () => this.automatchPreferencesCallback();

            this.registerView(this._homeSidebar, LayoutZone.Sidebar, (digest?: KGS.DataDigest) => {});
        }

        private postAutomatchMessage(type: string) {
            let automatch = this.database.automatch;
            let message = <KGS.Message & KGS.AutomatchPreferences>{
                type: type,

                maxHandicap: automatch.maxHandicap,

                freeOk:     ((automatch.criteria & Models.AutomatchCriteria.FreeGames) != 0),
                rankedOk:   ((automatch.criteria & Models.AutomatchCriteria.RankedGames) != 0),

                robotOk:    ((automatch.criteria & Models.AutomatchCriteria.RobotPlayers) != 0),
                humanOk:    ((automatch.criteria & Models.AutomatchCriteria.HumanPlayers) != 0),
                unrankedOk: ((automatch.criteria & Models.AutomatchCriteria.UnrankedPlayers) != 0),

                blitzOk:    ((automatch.criteria & Models.AutomatchCriteria.BlitzSpeed) != 0),
                fastOk:     ((automatch.criteria & Models.AutomatchCriteria.FastSpeed) != 0),
                mediumOk:   ((automatch.criteria & Models.AutomatchCriteria.MediumSpeed) != 0)
            };

            if ((Models.User.estimateRating(this.user.rank) == null) && (Models.User.estimateRating(automatch.estimatedRank) != null)) {
                message.estimatedRank = automatch.estimatedRank;
            }

            console.log(automatch, message);
            this.client.post(message);
        }

        private automatchCallback() {
            if (this.database.automatch.seeking) {
                this.client.post(<KGS.Upstream.AUTOMATCH_CANCEL>{ type: KGS.Upstream._AUTOMATCH_CANCEL });
            }
            else {
                this.postAutomatchMessage(KGS.Upstream._AUTOMATCH_CREATE);
            }
        }

        private automatchPreferencesCallback() {
            this.postAutomatchMessage(KGS.Upstream._AUTOMATCH_SET_PREFS);
        }
    }
}
