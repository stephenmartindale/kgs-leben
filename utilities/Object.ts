namespace Utils {
    export const enum ComparisonFlags {
        Shallow = 0,
        Values = (1 << 0),
        ArraysAsSets = Values | (1 << 1)
    }

    export function valueClone<T>(data: T): T {
        if (isPrimitive(data)) return data;
        else if (Utils.isArray(data)) return <any>cloneArray(<any>data, false);
        else if (Utils.isFunction(data)) throw "Cloning functions is not supported";

        let clone: any = {};
        for (let k in data) {
            let v: any = (<any>data)[k];
            if (!Utils.isFunction(v)) {
                clone[k] = valueClone(v);
            }
        }

        return clone;
    }

    export function valueEquals<T>(left: T, right: T, comparisonFlags: ComparisonFlags): boolean {
        if (left == right) return true;
        else if ((left == null) || (right == null)) return false;

        let arraysAsSets: boolean = ((comparisonFlags & ComparisonFlags.ArraysAsSets) == ComparisonFlags.ArraysAsSets);
        if ((isArray(left)) && (isArray(right))) {
            return (arraysAsSets)? setEquals(<any>left, <any>right, comparisonFlags) : arrayEquals(<any>left, <any>right, comparisonFlags);
        }
        else if ((isObject(left)) && (isObject(right))) {
            let leftKeys = Object.keys(left);
            let rightKeys = Object.keys(right);
            if (leftKeys.length != rightKeys.length) return false;

            for (let j = 0; j < rightKeys.length; ++j) {
                let k = rightKeys[j];
                if ((leftKeys.indexOf(k) < 0) || (!valueEquals<any>((<any>left)[k], (<any>right)[k], comparisonFlags))) return false;
            }

            return true;
        }
        else return false;
    }
}
