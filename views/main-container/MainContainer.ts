namespace Views {
    export class MainContainer implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;
        private _view: Views.View<any>;

        constructor(view: Views.View<any>) {
            this._view = view;
        }

        public attach(parent: HTMLElement): void {
            if (!this._div) {
                this._div = document.createElement('div');
                this._div.className = 'main-container';
                parent.appendChild(this._div);

                this._view.attach(this._div);
            }
            else parent.appendChild(this._div);
        }

        public activate(): void {
            this._view.activate();
        }
        public deactivate(): void {
            this._view.deactivate();
        }
    }
}
