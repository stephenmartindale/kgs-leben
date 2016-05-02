/// <reference path="../sidebar-menu/SidebarMenu.ts" />

namespace Views {
    export class ChannelList extends SidebarMenu {
        constructor() {
            super();
        }

        public update(channels: { [key: string]: Models.Channel }, keys: number[], activeChannelId: number) {
            let source: (key: string) => SidebarMenuItem = (key) => {
                let channelId: number;
                let className: string = "fa-minus";
                let name: string;
                let closeable: boolean;

                if (+key != Controllers.HomeController.channelId) {
                    let channel: Models.Channel = channels[key];
                    channelId = channel.channelId;

                    if (channel.channelType != null) {
                        switch (channel.channelType) {
                            case Models.ChannelType.Room: className = 'fa-users'; break;
                            case Models.ChannelType.List: className = 'fa-th'; break;
                            case Models.ChannelType.Conversation: className = 'fa-commenting'; break;
                            case Models.ChannelType.Game: className = 'fa-circle'; break;
                        }
                    }

                    name = channel.name;
                    closeable = true;
                }
                else {
                    channelId = Controllers.HomeController.channelId;
                    name = "Home";
                    className = "fa-home";
                    closeable = false;
                }

                if (activeChannelId == channelId) className += " active";

                return {
                    id: channelId,
                    name: name,
                    className: className,
                    closeable: closeable
                };
            }

            keys = keys.slice();
            keys.unshift(Controllers.HomeController.channelId);

            this.bind(source, keys, true);
        }
    }
}
