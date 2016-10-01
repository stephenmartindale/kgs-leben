declare namespace WGo {
    const B: number;    // +1
    const W: number;    // -1

    interface BoardConfig {
        size?: number;
        width?: number;
        background?: string;
    }

    interface Coordinates {
        x: number,
        y: number
    }
    interface ColourCoordinates extends Coordinates {
        c: number
    }

    interface BoardObject extends ColourCoordinates {
        // type can be WGo.Board.DrawHandler or name of predefined handler
        type?: BoardDrawHandler | string
    }
    interface BoardRemoveObject extends Coordinates {
        // type can be WGo.Board.DrawHandler or name of predefined handler
        type?: BoardDrawHandler | string
    }

    interface Board extends BoardConfig {
        element: HTMLElement;

        setWidth(width: number): void;
        setSize(size?: number): void;

        addEventListener(type: string, callback: (x: number, y: number, e: Event) => void): void;
        removeEventListener(type: string, callback: Function): boolean;

        addObject(obj: BoardObject | BoardObject[]): void;
        removeObject(obj: BoardRemoveObject | BoardRemoveObject[]): void;
        removeAllObjects(): void;

        stoneRadius: number;                   // Size of stone radius in pixels. (read only)
        ls: number;                            // Line-Shift (defined in wgo.js line 1050)
        obj_arr: ColourCoordinates[][][];      // Object Structure

        getX(x: number): number;    // Returns absolute x-coordinate of file or column x
        getY(y: number): number;    // Returns absolute y-coordinate of rank or row y
    }
    var Board: {
        prototype: Board;
        new (elem: HTMLElement, config: BoardConfig): Board;
    }

    export interface BoardDrawHandlerArgs extends ColourCoordinates {
    }
    export interface BoardDrawObject {
        // Both functions are called in "CanvasRenderingContext2D" context of given layer
        draw: (this: CanvasRenderingContext2D, args: BoardDrawHandlerArgs, board: Board) => void;    // this function should make drawing on the layer
        clear?: (this: CanvasRenderingContext2D, args: BoardDrawHandlerArgs, board: Board) => void;  // this function should clear drawing produced by draw function (if this function is ommited, default clearing function is used instead)
    }
    interface BoardDrawHandler {    // WGo.Board.DrawHandler
        stone?: BoardDrawObject;    // Highest default Canvas layer
        shadow?: BoardDrawObject;   // Middle default Canvas layer
        grid?: BoardDrawObject;     // Lowest default Canvas layer
    }
}
