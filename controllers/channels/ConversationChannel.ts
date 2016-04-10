/// <reference path="ChannelBase.ts" />

namespace Controllers {
    export class ConversationChannel extends ChannelBase {

        constructor(parent: ChannelController, channelId: number) {
            super(parent, channelId);
        }
    }
}
