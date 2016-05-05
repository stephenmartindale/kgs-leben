namespace Views {
    export class GoBoardPlayer implements Views.View<HTMLDivElement> {
        private _div: HTMLDivElement;

        public clock: Views.GoClock;

        constructor() {
            this._div = document.createElement('div');
            this._div.className = 'go-board-player';

            this.clock = new Views.GoClock();
            this.clock.attach(this._div);
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this.clock.activate();
        }
        public deactivate(): void {
            this.clock.deactivate();
        }
    }
}
