namespace Views {
    export class ChannelList extends Framework.DataBoundList<Models.Channel, HTMLLIElement> {
        public activeChannelId: number;
        public selectionCallback: (channelId: number) => void;

        createdCallback() {
            super.createdCallback();

            this.activeChannelId = null;
        }

        public update(channels: { [key: string]: Models.Channel }, keys: number[], activeChannelId: number, selectionCallback: (channelId: number) => void) {
            this.activeChannelId = activeChannelId;
            this.selectionCallback = selectionCallback;
            this.bindDictionary(channels, keys);
        }

        private channelTypeToCSS(channelType?: Models.ChannelType): string {
            if (channelType != null) {
                switch (channelType) {
                    case Models.ChannelType.Room: return 'kgs-room';
                    case Models.ChannelType.List: return 'kgs-list';
                    case Models.ChannelType.Conversation: return 'kgs-conversation';
                    case Models.ChannelType.Game: return 'kgs-game';
                    default: return "";
                }
            }

            return "";
        }

        protected createChild(key: string, datum: Models.Channel): HTMLLIElement {
            let element = document.createElement('li');
            element.onclick = () => { if (this.selectionCallback) this.selectionCallback(datum.channelId); };
            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: Models.Channel, element: HTMLLIElement): void {
            element.innerText = datum.name;
            element.className = this.channelTypeToCSS(datum.channelType);

            if (datum.channelId == this.activeChannelId) {
                element.className += " active";
            }
        }
    }
}
