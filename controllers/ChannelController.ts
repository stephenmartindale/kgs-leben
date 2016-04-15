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

        private _operationChannelId: number;

        constructor(parent: Application) {
            super(parent);
            this._joinedChannelIds = [];
            this._channelControllers = {};
            this._activeChannelId = null;
            this._operationChannelId = null;

            this._channelList = $('ul[is="channel-list"]')[0] as Views.ChannelList;
            this._channelList.selectionCallback = (channelId: number) => this.activateChannel(channelId);
            this._channelList.closeCallback = (channelId: number) => this.unjoinChannel(channelId);
        }

        public reinitialise() {
            this._joinedChannelIds = [];
            this._channelControllers = {};
            this._activeChannelId = null;
            this._operationChannelId = null;

            this.detachChildren();
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

                    if (cid == this._operationChannelId) {
                        activateChannelId = cid;
                        this._operationChannelId = null;
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
                    if (<any>detachChannelIds[j] == this._operationChannelId) {
                        this._operationChannelId = null;
                    }

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

            if ((this._operationChannelId != null) && (digest.joinFailedChannelIds) && (digest.joinFailedChannelIds.indexOf(this._operationChannelId) >= 0)) {
                this._operationChannelId = null;
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
            this._channelList.update(this.database.channels, this._joinedChannelIds, this._activeChannelId);
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

        public get channelOperationInProgress(): boolean {
            return (this._operationChannelId != null);
        }

        public joinChannel(channelId: number) {
            if (this.channelOperationInProgress) throw 'Channel operation in progress';
            else if (this._joinedChannelIds.indexOf(channelId) >= 0) this.activateChannel(channelId);
            else {
                this._operationChannelId = channelId;

                this.client.post(<KGS.Upstream.JOIN_REQUEST> {
                    type: KGS.Upstream._JOIN_REQUEST,
                    channelId: channelId
                });
            }
        }

        public unjoinChannel(channelId: number) {
            if (this.channelOperationInProgress) throw 'Channel operation in progress';
            else if (this._joinedChannelIds.indexOf(channelId) >= 0) {
                this._operationChannelId = channelId;

                this.client.post(<KGS.Upstream.UNJOIN_REQUEST> {
                    type: KGS.Upstream._UNJOIN_REQUEST,
                    channelId: channelId
                });
            }
        }
    }
}
