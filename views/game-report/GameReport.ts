/// <reference path="../View.ts" />
namespace Views {
    export class GameReport extends Views.View<HTMLDivElement> {
        private _headline: HTMLHeadingElement;
        private _whitePlayerName: HTMLTableHeaderCellElement;
        private _blackPlayerName: HTMLTableHeaderCellElement;
        private _table: HTMLTableElement;
        private _tableBody: Views.TableBody;

        constructor() {
            super(Views.Templates.cloneTemplate<HTMLDivElement>('game-report'));

            this._headline = this.root.querySelector('h3') as HTMLHeadingElement;

            let tableHeaderCells = this.root.querySelectorAll('th');
            this._whitePlayerName = <HTMLTableHeaderCellElement>tableHeaderCells[0];
            this._blackPlayerName = <HTMLTableHeaderCellElement>tableHeaderCells[1];

            this._table = this.root.querySelector('table') as HTMLTableElement;
            this._tableBody = new Views.TableBody();
            this._tableBody.attach(this._table);
        }

        public update(headline: string, whitePlayer: string, blackPlayer: string, komiSplit?: Models.KomiSplit, whiteScore?: Models.GamePositionScore, blackScore?: Models.GamePositionScore) {
            if (whitePlayer == null) whitePlayer = "white";
            this._whitePlayerName.innerText = whitePlayer;

            if (blackPlayer == null) blackPlayer = "black";
            this._blackPlayerName.innerText = blackPlayer;

            this._headline.innerText = headline || (whitePlayer + " vs. " + blackPlayer);

            let tableRows: string[][] = [];

            let whiteBase: number = 0;
            let whiteHalf: string = "";
            let blackBase: number = 0;

            if (komiSplit) {
                whiteBase = komiSplit.white.base;
                whiteHalf = (komiSplit.white.half)? '½' : '';

                let komiRow = [ "komi", komiSplit.white.base.toString(), whiteHalf, "", "" ];
                if ((komiSplit.black) && (komiSplit.black.base > 0)) {
                    blackBase = komiSplit.black.base;

                    komiRow[3] = "reverse komi";
                    komiRow[4] = komiSplit.black.base.toString();
                }

                tableRows.push(komiRow);
            }

            if ((whiteScore) || (blackScore)) {
                tableRows.push([ "prisoners", ((whiteScore)? whiteScore.prisoners.toString() : ""), "", "", ((blackScore)? blackScore.prisoners.toString() : "") ]);
                tableRows.push([ "captures", ((whiteScore)? whiteScore.captures.toString() : ""), "", "", ((blackScore)? blackScore.captures.toString() : "") ]);
                tableRows.push([ "territory", ((whiteScore)? whiteScore.territory.toString() : ""), "", "", ((blackScore)? blackScore.territory.toString() : "") ]);

                if (whiteScore) {
                    whiteBase += whiteScore.prisoners + whiteScore.captures + whiteScore.territory;
                }

                if (blackScore) {
                    blackBase += blackScore.prisoners + blackScore.captures + blackScore.territory;
                }
            }

            if (tableRows.length > 0) {
                tableRows.push([ "total", whiteBase.toString(), whiteHalf, "", blackBase.toString() ]);

                this._tableBody.update(tableRows);
                this._table.classList.remove('hidden');
            }
            else this._table.classList.add('hidden');
        }
    }
}
