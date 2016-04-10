/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class ListChannel extends ChannelBase {

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);
        }
    }
}
