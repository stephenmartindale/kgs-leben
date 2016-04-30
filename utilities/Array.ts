namespace Utils {
    export function arrayEquals<T>(left: T[], right: T[], comparisonFlags: ComparisonFlags): boolean {
        if (left === right) return true;
        if ((left == null) || (right == null)) return false;
        if (left.length != right.length) return false;

        if (comparisonFlags == ComparisonFlags.Shallow) {
            for (let i = 0; i < left.length; ++i) {
                if (left[i] !== right[i]) return false;
            }
        }
        else {
            for (let i = 0; i < left.length; ++i) {
                if (!valueEquals(left[i], right[i], comparisonFlags)) return false;
            }
        }

        return true;
    }

    export function cloneArray<T>(o: T[], shallow?: boolean): T[] {
        if (shallow) {
            return o.slice();
        }
        else {
            let clone: T[] = new Array(o.length);
            for (let j = 0; j < o.length; ++j) {
                clone[j] = valueClone(o[j]);
            }
            return clone;
        }
    }
}
