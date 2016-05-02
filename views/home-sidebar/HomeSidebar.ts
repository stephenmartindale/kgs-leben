namespace Views {
    export class HomeSidebar implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;

        constructor() {
            this._div = Views.Templates.cloneTemplate('home-sidebar') as HTMLDivElement;
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
        }
        public deactivate(): void {
        }
    }
}
