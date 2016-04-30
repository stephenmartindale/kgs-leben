namespace Utils {
    export function htmlTimeToSeconds(time: string): number {
        if (!time) return null;
        else {
            let parts = time.split(":");
            return +parts[0] * 3600 + +parts[1] * 60 + +parts[2];
        }
    }

    export function htmlSecondsToTime(seconds: number): string {
        let h = ~~(seconds / 3600);
        seconds -= h * 3600;
        let m = ~~(seconds / 60);
        seconds -= m * 60;

        return ("00" + h.toString()).slice(-2) + ":"
             + ("00" + m.toString()).slice(-2) + ":"
             + ("00" + seconds.toString()).slice(-2);
    }
}
