namespace Utils {
    export function randomInteger(min: number, max: number, inclusive?: boolean): number {
        let w: number = Math.floor(max - min);
        if (inclusive)++w;
        if (w < 1) throw new Error("Random range may not be negative");
        return Math.floor((Math.random() * w) + min);
    }

    export function randomBoolean(p?: number): boolean {
        if (null == p) p = 0.5;
        return (Math.random() < p);
    }
}
