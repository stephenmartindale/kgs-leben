/// <reference path="ViewControllerBase.ts" />

namespace Controllers {
    export class HomeController extends ViewControllerBase<ChannelController> {
        public static channelId: number = 0;

        constructor(parent: ChannelController) {
            super(parent);

            this.initialiseMainView();
            this.initialiseSidebarView();
        }

        private initialiseMainView() {
            var view = new Views.HomeMain();

            this.registerView(view, LayoutZone.Main, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.users[this.database.username])) {
                    view.update(this.database.users[this.database.username]);
                }
            });
        }

        private initialiseSidebarView() {
            var view = new Views.HomeSidebar();

            this.registerView(view, LayoutZone.Sidebar, (digest?: KGS.DataDigest) => {
            });
        }
    }
}
