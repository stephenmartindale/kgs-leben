/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class RoomChannel extends ChannelBase {

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);

            this.initialiseChat();
        }
    }
}
