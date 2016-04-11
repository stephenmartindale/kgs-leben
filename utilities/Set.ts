namespace Utils {
    export function setSync<T>(target: T[], source: T[]): boolean {
        let matched: { [index: number]: number } = {};
        let originalLength: number = target.length;
        let removed: number = 0;
        for (let j = 0; j < originalLength; ++j) {
            let idx: number = source.indexOf(target[j]);
            if (idx >= 0) {
                matched[idx] = j;
                if (removed > 0) target[j - removed] = target[j];
            }
            else ++removed;
        }

        if (removed > 0) target.length = (originalLength - removed);

        for (let i = 0; i < source.length; ++i) {
            if (matched[i] == null) {
                target.push(source[i]);
            }
        }

        return ((removed > 0) || (target.length != originalLength));
    }

    export function setAdd<T>(target: T[], value: T): boolean {
        if (target.lastIndexOf(value) < 0) {
            target.push(value);
            return true;
        }
        else return false;
    }

    export function setRemove<T>(target: T[], value: T): boolean {
        let index = target.lastIndexOf(value);
        if (index < 0) return false;
        else {
            target.splice(index, 1);
            return true;
        }
    }
}
