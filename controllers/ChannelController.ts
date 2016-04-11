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

        private _joiningChannelId: number;

        constructor(parent: Application) {
            super(parent);
            this._joinedChannelIds = [];
            this._channelControllers = {};
            this._activeChannelId = null;
            this._joiningChannelId = null;

            this._channelList = $('ul[is="channel-list"]')[0] as Views.ChannelList;

            // TODO: this.application.client.dispatcher.subscribe(() => this.reset(), KGS.Downstream._LOGOUT);
        }

        protected digest(digest: KGS.DataDigest) {
            if (digest.joinedChannelIds) {
                let detachControllers = this._channelControllers;
                this._joinedChannelIds = [];
                this._channelControllers = {};

                let channelIds = this.database.joinedChannelIds;
                let activateChannelId: number = null;
                for (let i = 0; i < channelIds.length; ++i) {
                    let cid = channelIds[i];
                    this._joinedChannelIds.push(cid);

                    if (cid == this._joiningChannelId) {
                        activateChannelId = cid;
                        this._joiningChannelId = null;
                    }

                    let oldController = detachControllers[cid];
                    if (oldController == null) {
                        this._channelControllers[cid] = this.initialiseChannelController(cid);
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

                if (activateChannelId != null) {
                    this.activateChannel(activateChannelId);
                }
                else if ((this._activeChannelId == null) && (this._joinedChannelIds.length > 0)) {
                    this.activateChannel(this._joinedChannelIds[0]);
                }
                else {
                    this.updateChannelList();
                }
            }

            super.digest(digest);
        }

        private initialiseChannelController(channelId: number): Controllers.ChannelBase {
            switch (this.database.channels[channelId].channelType) {
                case Models.ChannelType.Room: return new Controllers.RoomChannel(this, channelId);
                case Models.ChannelType.Game: return new Controllers.GameChannel(this, channelId);
                default: throw "Channel " + channelId.toString() + " has unknown or unsupported channel type: " + this.database.channels[channelId].channelType.toString();
            }
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

        public get joining(): boolean {
            return (this._joiningChannelId != null);
        }

        public joinChannel(channelId: number) {
            if (this.joining) throw 'Channel join in progress';
            else if (this._joinedChannelIds.indexOf(channelId) >= 0) this.activateChannel(channelId);
            else {
                this._joiningChannelId = channelId;

                this.client.post(<KGS.Upstream.JOIN_REQUEST> {
                    type: KGS.Upstream._JOIN_REQUEST,
                    channelId: channelId
                });
            }
        }
    }
}
