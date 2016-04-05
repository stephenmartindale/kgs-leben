namespace Views {
    export class SidebarContainer extends HTMLElement {
        static _template: HTMLTemplateElement;

        private _sidebar: HTMLDivElement;

        createdCallback() {
            let children = $(this).children().detach();
            this.appendChild(SidebarContainer._template.content.cloneNode(true));

            this._sidebar = this.querySelector('.sidebar') as HTMLDivElement;

            $(this._sidebar).append(children);
        }

        attachedCallback() {
        }
        detachedCallback() {
        }
        attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        }
    }
}
