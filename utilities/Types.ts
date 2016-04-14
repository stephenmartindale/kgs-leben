namespace Utils {
    export function isObject(o: any): boolean {
        return (typeof o === 'object');
    }

    export function isString(o: any): boolean {
        return ((typeof o === 'string') || (o instanceof String));
    }

    export function isArray(o: any): boolean {
        return (o.constructor === Array);
    }
}
