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

    interface BoardObject extends Coordinates {
        c: number
    }

    interface Board extends BoardConfig {
        setSize(size?: number): void;

        addEventListener(type: string, callback: (x: number, y: number, e: Event) => void): void;

        addObject(obj: BoardObject | BoardObject[]): void;
        removeObject(obj: Coordinates | Coordinates[]): void;
        removeAllObjects(): void;
    }
    var Board: {
        prototype: Board;
        new (elem: HTMLDivElement, config: BoardConfig): Board;
    }
}
