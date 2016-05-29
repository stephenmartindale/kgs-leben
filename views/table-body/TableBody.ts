/// <reference path="../DataBoundList.ts" />
namespace Views {
    export class TableBody extends Views.DataBoundList<string[], HTMLTableSectionElement, HTMLTableRowElement> {
        private _width: number;

        constructor() {
            super(document.createElement('tbody'));
        }

        public update(items: string[][]) {
            this._width = ((items) && (items.length > 0))? items[0].length : 1;
            this.bindArray(items);
        }

        protected createChild(key: string, datum: string[]): HTMLTableRowElement {
            let element = document.createElement('tr');
            for (let i = 0; i < this._width; ++i) {
                element.appendChild(document.createElement('td'));
            }

            this.updateChild(key, datum, element);
            return element;
        }

        protected updateChild(key: string, datum: string[], element: HTMLTableRowElement): void {
            for (let i = 0; i < element.childElementCount; ++i) {
                let d = (i < datum.length)? datum[i] : undefined;
                (<HTMLTableDataCellElement>element.children[i]).innerText = (d != null)? d : "";
            }
        }
    }
}
