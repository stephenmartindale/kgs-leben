namespace Views {
    export class LCDCounter implements Views.View<HTMLDivElement> {
        private _dots: number = 5;
        private _maximum: number;
        private _rows: number;

        private _div: HTMLDivElement;
        private _value: number;

        constructor(maximum?: number, rows?: number) {
            this._div = document.createElement('div');
            this._div.className = 'lcd-counter';

            this.setMaximum(maximum || 10, rows || 2, true);
            this._value = 0;
        }

        public attach(parent: HTMLElement): void {
            parent.appendChild(this._div);
        }

        public activate(): void {
            this.updateVectors();
        }
        public deactivate(): void {
        }

        public hide() {
            this._div.classList.add('hidden');
        }
        public show() {
            this._div.classList.remove('hidden');
        }

        public setMaximum(maximum: number, rows?: number, suppressUpdate?: boolean) {
            rows = (rows != null)? rows : this._rows;
            if ((this._maximum != maximum) || (this._rows != rows)) {
                $(this._div).empty();

                this._maximum = maximum;
                this._rows = rows;

                let rowModulus = rows * this._dots;
                let group: HTMLDivElement;
                for (let j = 0; j < this._maximum; j += this._dots) {
                    if ((j % rowModulus) == 0) {
                        group = document.createElement('div');
                        this._div.appendChild(group);
                    }

                    group.appendChild(Views.Templates.cloneTemplate('lcd-counter'));
                }

                if (!suppressUpdate) this.updateVectors();
            }
        }

        private updateVectors() {
            let value: number = (this._value != null)? this._value : 0;
            let childCount = this._div.childElementCount;
            let offset = 0;
            for (let j = 0; j < childCount; ++j) {
                let div = this._div.children[j] as HTMLDivElement;
                let grandchildCount = div.childElementCount;
                for (let i = 0; i < grandchildCount; ++i) {
                    let svg = div.children[i] as SVGElement;
                    this.updateVector(svg, value, offset);

                    offset += this._dots;
                }
            }
        }

        private updateVector(svg: SVGElement, value: number, offset: number) {
            for (let k = 0; k < svg.childNodes.length; ++k) {
                let child = svg.childNodes[k] as Element;
                if ((child.nodeType == 1) && (child.nodeName == 'g')) {
                    let x: number = offset + 1;
                    for (let i = 0; i < child.childNodes.length; ++i) {
                        let segment = child.childNodes[i] as Element;
                        if (segment.nodeType == 1) {
                            segment.setAttribute('class', (x > this._maximum)? 'hidden' : (x <= this._value)? 'segment-on' : '');
                            ++x;
                        }
                    }

                    return;
                }
            }
        }

        public get value() {
            return this._value;
        }
        public set value(value: number) {
            this._value = value;
            this.updateVectors();
        }
    }
}
