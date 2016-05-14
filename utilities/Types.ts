namespace Utils {
    const _undefined: string = 'undefined';
    const _object: string = 'object';
    const _function: string = 'function';
    const _string: string = 'string';
    const _number: string = 'number';
    const _boolean: string = 'boolean';

    // Returns true if and only if the parameter is a primitive value type or an immutable wrapper
    export function isPrimitive(o: any, excludeWrappers?: boolean): boolean {
        switch (typeof o) {
            case _undefined:
            case _string:
            case _number:
            case _boolean:
                return true;

            case _object:
                return ((o == null) || ((!excludeWrappers) && (isWrapper(o))));

            default: return false;
        }
    }

    // Returns true if and only if the parameter is an instance of an immutable primitive wrapper
    export function isWrapper(o: any): boolean {
        return ((o instanceof String)
             || (o instanceof Number)
             || (o instanceof Boolean));
    }

    export function isDefined(o: any): boolean {
        return (typeof o !== _undefined);
    }

    export function isObject(o: any, includeWrappers?: boolean): boolean {
        return ((typeof o === _object) && ((includeWrappers) || (!isWrapper(o))));
    }

    export function isFunction(o: any): boolean {
        return (typeof o === _function);
    }

    export function isString(o: any): boolean {
        return ((typeof o === _string) || (o instanceof String));
    }

    export function isNumber(o: any): boolean {
        return ((typeof o === _number) || (o instanceof Number));
    }

    export function isBoolean(o: any): boolean {
        return ((typeof o === _boolean) || (o instanceof Boolean));
    }

    export function isArray(o: any): boolean {
        return (o.constructor === Array);
    }

    export function isNode(o: any, nodeType?: number): boolean {
        if ((typeof o !== _object) || ((<Node>o).nodeName === undefined)) return false;
        return (nodeType == null)? (typeof (<Node>o).nodeType === _number) : ((<Node>o).nodeType === nodeType);
    }

    export function isElement(o: any): boolean {
        return isNode(o, 1);
    }
}
