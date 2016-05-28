/// <reference path="ControllerBase.ts" />

namespace Controllers {
    export class ChannelController extends ControllerBase<Application> {
        private _channelList: Views.ChannelList;

        private _joinedChannelIds: number[];
        private _channelControllers: {
            [channelId: string]: Controllers.ChannelBase,
            [channelId: number]: Controllers.ChannelBase
        };
        private _homeController: Controllers.HomeController;
        private _activeChannel: Controllers.ViewControllerBase<ChannelController>;

        private _operationChannelId: number;

        constructor(parent: Application) {
            super(parent);
            this.reinitialise();
        }

        public reinitialise() {
            this.detachChildren();

            this._joinedChannelIds = [];
            this._channelControllers = {};
            this._activeChannel = null;
            this._operationChannelId = null;

            this._homeController = new Controllers.HomeController(this);

            if (this._channelList != null) {
                this._channelList.selectionCallback = null;
                this._channelList.closeCallback = null;
            }

            this._channelList = new Views.ChannelList();
            this._channelList.selectionCallback = this._onChannelListSelection;
            this._channelList.closeCallback = this._onChannelListClose;
            this.application.layout.sidebar.show(this._channelList);
        }

        protected digest(digest: KGS.DataDigest) {
            if ((this._operationChannelId == null) && (digest.notifyChannelId != null)) {
                this._operationChannelId = digest.notifyChannelId;
            }

            if ((digest.joinedChannelIds) || (!this._activeChannel)) {
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
                        if (this._activeChannel == controller) this._activeChannel = null;
                        controller.detach();
                    }
                }

                if (activateChannelId != null) {
                    this._onChannelListSelection(activateChannelId);
                }
                else if (this._activeChannel == null) {
                    this._onChannelListSelection((this._joinedChannelIds.length > 0)? this._joinedChannelIds[0] : Controllers.HomeController.channelId);
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
            let channel = this.database.channels[channelId];
            switch (channel.channelType) {
                case Models.ChannelType.Room:
                    return new Controllers.RoomChannel(this, channelId);

                case Models.ChannelType.Game:
                    if ((<Models.GameChannel>channel).gameType == Models.GameType.Challenge)
                        return new Controllers.ChallengeChannel(this, channelId);
                    else
                        return new Controllers.GameChannel(this, channelId);

                default:
                    throw "Channel " + channelId.toString() + " has unknown or unsupported channel type: " + this.database.channels[channelId].channelType.toString();
            }
        }

        private updateChannelList() {
            this._channelList.update(this.database.channels, this._joinedChannelIds, (this._activeChannel == this._homeController)? Controllers.HomeController.channelId : (<Controllers.ChannelBase>this._activeChannel).channelId);
        }

        private _onChannelListSelection = (channelId: number) => {
            let activate = (channelId == Controllers.HomeController.channelId)? this._homeController : this._channelControllers[channelId];

            if (this._activeChannel != activate) {
                if (this._activeChannel != null) {
                    this._activeChannel.deactivate();
                    this._activeChannel = null;
                }

                this._activeChannel = activate;
                this.updateChannelList();

                if (this._activeChannel != null) {
                    this._activeChannel.activate();
                }
            }
        }

        public get channelOperationInProgress(): boolean {
            return (this._operationChannelId != null);
        }

        public joinChannel(channelId: number) {
            if (this.channelOperationInProgress) throw 'Channel operation in progress';
            else if (this._joinedChannelIds.indexOf(channelId) >= 0) this._onChannelListSelection(channelId);
            else {
                this._operationChannelId = channelId;

                this.client.post(<KGS.Upstream.JOIN_REQUEST> {
                    type: KGS.Upstream._JOIN_REQUEST,
                    channelId: channelId
                });
            }
        }

        private _onChannelListClose = (channelId: number) => {
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
