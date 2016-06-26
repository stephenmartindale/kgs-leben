/// <reference path="ViewControllerBase.ts" />

namespace Controllers {
    export class AmbientStatusController extends ViewControllerBase<ChannelController> {
        private _view: Views.AmbientStatusPanel;

        constructor(parent: ChannelController) {
            super(parent);

            this.initialisePanel();
        }

        private initialisePanel() {
            this._view = new Views.AmbientStatusPanel();
            this._view.automatchCancelCallback = this._automatchCancelCallback;

            this.registerView(this._view, LayoutZone.Sidebar, (digest?: KGS.DataDigest) => {
                if ((digest == null) || (digest.automatch)) {
                    this._view.automatchSeeking = this.database.automatch.seeking;
                }
            });
        }

        private _automatchCancelCallback = () => {
            if (this.database.automatch.seeking) {
            	this.client.post(<KGS.Upstream.AUTOMATCH_CANCEL>{ type: KGS.Upstream._AUTOMATCH_CANCEL });
            }
        }
    }
}
