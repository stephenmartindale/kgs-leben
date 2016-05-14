/// <reference path="../View.ts" />
namespace Views {
    export class LCDDisplay extends Views.View<HTMLDivElement> {
        private _precision: number;
        private _scale: number;
        private _signed: boolean;
        private _integer: boolean;
        private _pad: boolean;

        private _value: number;

        // Precision is the number of digits in a number.
        // Scale is the number of digits to the right of the decimal point in a number.
        // For example, the number 123.45 has a precision of 5 and a scale of 2.
        constructor(precision?: number, scale?: number, signed?: boolean, integer?: boolean, pad?: boolean) {
            super(Templates.createDiv('lcd-display'));

            this._precision = precision || 8;
            this._scale = (scale != null)? scale : 0;
            this._signed = signed;
            this._integer = integer;
            this._pad = pad;

            let childCount = (this._signed)? this._precision + 1 : this._precision;
            for (let j = 0; j < childCount; ++j) {
                this.root.appendChild(Views.Templates.cloneTemplate('lcd-display'));
            }

            this._value = 0;
        }

        public activate(): void {
            this.updateVectors();
            super.activate();
        }

        private _bitmaps: { [d: number]: number, [c: string]: number } = {
            0: 0x3f, 1: 0x06, 2: 0x5b, 3: 0x4f, 4: 0x66,
            5: 0x6d, 6: 0x7d, 7: 0x07, 8: 0x7f, 9: 0x6f,
            "-": 0x40,
            ".": 0x80
        };

        private updateVectors() {
            if (this._signed) {
                this.updateVector(this.root.children[0] as SVGElement, ~(this._bitmaps["-"]), (this._value < 0)? this._bitmaps["-"] : 0);
            }

            let characters = (this._value != null)? Math.abs(this._value).toString() : "";
            let decimalIndex = characters.indexOf('.');
            if (decimalIndex < 0) decimalIndex = characters.length;

            let childCount = this.root.childElementCount;
            let order = this._precision - this._scale - 1;
            for (let j = (!this._signed)? 0 : 1; j < childCount; ++j) {
                let digitIndex = (order >= 0)? decimalIndex - 1 - order : decimalIndex - order;

                let maskHidden: number = 0;
                let maskOn: number = ((digitIndex >= characters.length) || ((this._pad) && (digitIndex < 0)))? this._bitmaps[0]
                                   : (digitIndex < 0)? 0
                                   : this._bitmaps[characters[digitIndex]];

                if ((order != 0) || (this._integer)) {
                    maskHidden |= this._bitmaps["."];
                }
                else if ((this._scale > 0) || (digitIndex != characters.length - 1)) {
                    maskOn |= this._bitmaps["."];
                }

                let svg = this.root.children[j] as SVGElement;
                this.updateVector(svg, maskHidden, maskOn);

                --order;
            }
        }

        private updateVector(svg: SVGElement, maskHidden: number, maskOn: number) {
            for (let k = 0; k < svg.childNodes.length; ++k) {
                let child = svg.childNodes[k] as Element;
                if ((child.nodeType == 1) && (child.nodeName == 'g')) {
                    let mask: number = 1;
                    for (let i = 0; i < child.childNodes.length; ++i) {
                        let segment = child.childNodes[i] as Element;
                        if (segment.nodeType == 1) {
                            segment.setAttribute('class', (maskHidden & mask)? 'hidden' : (maskOn & mask)? 'segment-on' : '');
                            mask <<= 1;
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

        public set scale(scale: number) {
            this._scale = scale;
            this.updateVectors();
        }
        public set integer(integer: boolean) {
            this._integer = integer;
            this.updateVectors();
        }
        public set pad(pad: boolean) {
            this._pad = pad;
            this.updateVectors();
        }
    }
}
