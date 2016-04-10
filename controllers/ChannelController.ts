/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class ChannelController extends ControllerBase<Application> {
        private _channelList: Views.ChannelList;

        private _joinedChannelIds: number[];
        private _channelControllers: {
            [channelId: string]: Controllers.ChannelBase,
            [channelId: number]: Controllers.ChannelBase
        };
        private _activeChannelId: number;

        constructor(parent: Application) {
            super(parent);
            this._joinedChannelIds = [];
            this._channelControllers = {};
            this._activeChannelId = null;

            this._channelList = $('ul[is="channel-list"]')[0] as Views.ChannelList;

            // TODO: this.application.client.dispatcher.subscribe(() => this.reset(), KGS.Downstream._LOGOUT);
        }

        protected digest(digest: KGS.DataDigest) {
            if (digest.joinedChannelIds) {
                let detachControllers = this._channelControllers;
                this._joinedChannelIds = [];
                this._channelControllers = {};

                let channelIds = this.database.joinedChannelIds;
                for (let i = 0; i < channelIds.length; ++i) {
                    let cid = channelIds[i];
                    this._joinedChannelIds.push(cid);

                    let oldController = detachControllers[cid];
                    if (oldController == null) {
                        this._channelControllers[cid] = new Controllers.RoomChannel(this, cid);
                    }
                    else {
                        this._channelControllers[cid] = oldController;
                        delete detachControllers[cid];
                    }
                }

                let detachChannelIds = Object.keys(detachControllers);
                for (let j = 0; j < detachChannelIds.length; ++j) {
                    let controller = detachControllers[detachChannelIds[j]];
                    if (controller) {
                        if (this._activeChannelId == controller.channelId) this._activeChannelId = null;
                        controller.detach();
                    }
                }

                if ((this._activeChannelId == null) && (this._joinedChannelIds.length > 0))
                    this.activateChannel(this._joinedChannelIds[0]);
                else
                    this.updateChannelList();
            }

            super.digest(digest);
        }

        private updateChannelList() {
            this._channelList.update(this.database.channels, this._joinedChannelIds, this._activeChannelId, (channelId: number) => this.activateChannel(channelId));
        }

        public get activeChannel(): Controllers.ChannelBase {
            return (this._activeChannelId != null)? this._channelControllers[this._activeChannelId] : null;
        }

        private activateChannel(channelId: number) {
            if (this._activeChannelId != channelId) {
                let controller = this.activeChannel;
                if (controller != null) controller.deactivate();

                this._activeChannelId = channelId;
                this.updateChannelList();

                this.activeChannel.activate();
            }
        }
    }
}
