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
            this._homeSidebar.automatchForm.automatchPreferencesCallback = this._automatchPreferencesCallback;
            this._homeSidebar.automatchForm.automatchSeekCallback = this._automatchSeekCallback;
            this._homeSidebar.automatchForm.automatchCancelCallback = this._automatchCancelCallback;

            this.registerView(this._homeSidebar, LayoutZone.Sidebar, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.automatch) || (digest.users[this.database.username])) {
                    let denyRankEstimate = (this.user) && (Models.UserRank.validate(this.user.rank));
                    this._homeSidebar.automatchForm.update(this.database.automatch, denyRankEstimate);
                }
            });
        }

        private postAutomatchMessage(type: string, estimatedRank: Models.UserRank, maxHandicap: number, criteria: Models.AutomatchCriteria) {
            let message = <KGS.Message & KGS.AutomatchPreferences>{
                type: type,

                maxHandicap: ((maxHandicap != null)? maxHandicap : 9),

                freeOk:     ((criteria & Models.AutomatchCriteria.FreeGames) != 0),
                rankedOk:   ((criteria & Models.AutomatchCriteria.RankedGames) != 0),

                robotOk:    ((criteria & Models.AutomatchCriteria.RobotPlayers) != 0),
                humanOk:    ((criteria & Models.AutomatchCriteria.HumanPlayers) != 0),
                unrankedOk: ((criteria & Models.AutomatchCriteria.UnrankedPlayers) != 0),

                blitzOk:    ((criteria & Models.AutomatchCriteria.BlitzSpeed) != 0),
                fastOk:     ((criteria & Models.AutomatchCriteria.FastSpeed) != 0),
                mediumOk:   ((criteria & Models.AutomatchCriteria.MediumSpeed) != 0)
            };

            let denyRankEstimate = (this.user) && (Models.UserRank.validate(this.user.rank));
            if ((!denyRankEstimate) && (estimatedRank) && (estimatedRank.rank)) {
                message.estimatedRank = Models.UserRank.rankToString(estimatedRank, false);
            }

            this.client.post(message);
        }

        private _automatchPreferencesCallback = (estimatedRank: Models.UserRank, maxHandicap: number, criteria: Models.AutomatchCriteria) => {
            this.postAutomatchMessage(KGS.Upstream._AUTOMATCH_SET_PREFS, estimatedRank, maxHandicap, criteria);
        }

        private _automatchSeekCallback = (estimatedRank: Models.UserRank, maxHandicap: number, criteria: Models.AutomatchCriteria) => {
            if (!this.database.automatch.seeking) {
                this.postAutomatchMessage(KGS.Upstream._AUTOMATCH_CREATE, estimatedRank, maxHandicap, criteria);
            }
        }

        private _automatchCancelCallback = () => {
            if (this.database.automatch.seeking) {
            	this.client.post(<KGS.Upstream.AUTOMATCH_CANCEL>{ type: KGS.Upstream._AUTOMATCH_CANCEL });
            }
        }
    }
}
