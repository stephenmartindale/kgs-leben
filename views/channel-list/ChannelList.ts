namespace Views {
    export class ChannelList extends Framework.DataBoundList<Models.Channel, HTMLLIElement> {
        public activeChannelId: number;
        public selectionCallback: (channelId: number) => void;
        public closeCallback: (channelId: number) => void;

        createdCallback() {
            super.createdCallback();

            this.activeChannelId = null;
        }

        public update(channels: { [key: string]: Models.Channel }, keys: number[], activeChannelId: number) {
            this.activeChannelId = activeChannelId;
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
            element.appendChild(document.createElement('span'));
            element.onclick = () => { if (this.selectionCallback) this.selectionCallback(datum.channelId); };

            let closeButton = document.createElement('span');
            closeButton.className = "btn-close";
            closeButton.onclick = (e) => { if (this.closeCallback) this.closeCallback(datum.channelId); e.stopPropagation(); e.preventDefault(); return false; };
            element.appendChild(closeButton);

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: Models.Channel, element: HTMLLIElement): void {
            element.getElementsByTagName('span')[0].innerText = datum.name;
            element.className = this.channelTypeToCSS(datum.channelType);

            if (datum.channelId == this.activeChannelId) {
                element.className += " active";
            }
        }
    }
}
