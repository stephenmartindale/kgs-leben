/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class GameChannel extends ChannelBase {

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);

            this.initialiseChat();
        }
    }
}
