/// <reference path="../DataBoundList.ts" />

namespace Views {
    export interface SidebarMenuItem {
        id: number,
        name: string;
        className: string;
        closeable: boolean;
    }

    export class SidebarMenu extends Views.DataBoundList<SidebarMenuItem, HTMLUListElement, HTMLLIElement> {
        public selectionCallback: (id: number) => void;
        public closeCallback: (id: number) => void;

        constructor() {
            super(document.createElement('ul'));
            this.container.className = 'sidebar-menu';
        }

        protected createChild(key: string, datum: SidebarMenuItem): HTMLLIElement {
            let element = document.createElement('li');
            element.appendChild(document.createElement('span'));
            element.onclick = () => { if (this.selectionCallback) this.selectionCallback(datum.id); };

            if (datum.closeable) {
                let closeButton = document.createElement('span');
                closeButton.className = "btn-close fa-times";
                closeButton.onclick = (e) => { if (this.closeCallback) this.closeCallback(datum.id); e.stopPropagation(); e.preventDefault(); return false; };
                element.appendChild(closeButton);
            }

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: SidebarMenuItem, element: HTMLLIElement): void {
            element.getElementsByTagName('span')[0].innerText = datum.name;
            element.className = datum.className;
        }
    }
}
