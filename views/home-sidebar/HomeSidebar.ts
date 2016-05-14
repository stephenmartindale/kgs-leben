/// <reference path="../View.ts" />
namespace Views {
    export class HomeSidebar extends Views.View<HTMLDivElement> {
        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('home-sidebar'));
        }
    }
}
