/// <reference path="../View.ts" />
namespace Views {
    export class HomeSidebar extends Views.View<HTMLDivElement> {
        public automatchForm: Views.AutomatchForm;

        constructor() {
            super(Views.Templates.createDiv('home-sidebar'));

            this.automatchForm = new Views.AutomatchForm();
            this.automatchForm.attach(this.root);
        }

        public activate(): void {
            this.automatchForm.activate();
            super.activate();
        }

        public deactivate(): void {
            super.deactivate();
            this.automatchForm.deactivate();
        }
    }
}
