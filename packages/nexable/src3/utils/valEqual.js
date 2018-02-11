import { isFunc, isVoid, isObject, isArray } from 'nxutils/es/index';

function toPrimitiveValue(obj) {
    return obj instanceof Number ||
    obj instanceof String ||
    obj instanceof Boolean
        ? obj.valueOf() : obj;
}

export default function valEqual(oValue, nValue, update) {
    let oldValue = toPrimitiveValue(oValue),
        newValue = toPrimitiveValue(nValue);

    if (isVoid(oldValue) !== isVoid(newValue))
        return false;

    if (oldValue === newValue)
        return oldValue !== 0 || 1 / oldValue === 1 / newValue;

    if (!update || !isObject(oldValue) || isFunc(newValue))
        return oldValue !== oldValue && newValue !== newValue;

    if (isFunc(oldValue.isEqualTo))
        return oldValue.isEqualTo(newValue);

    if (oldValue instanceof RegExp)
        return newValue instanceof RegExp &&
            oldValue.toString() === newValue.toString();

    if (oldValue instanceof Date)
        return newValue instanceof Date &&
            oldValue.getTime() === newValue.getTime();

    if (oldValue instanceof Error)
        return newValue instanceof Error &&
            newValue.constructor === oldValue.constructor &&
            newValue.name === oldValue.name &&
            newValue.message === oldValue.message &&
            newValue.stack === oldValue.stack;

    if (isArray(oldValue)) {
        if (!isObject(newValue))
            return false;

        let len = oldValue.length;
        if (len !== newValue.length)
            return false;

        let upp = update === 'deep' && update,
            mid = len >> 1;

        // middle check
        if ((len + 1) >> 1 !== mid && !valEqual(oldValue[mid], newValue[mid], upp))
            return false;

        for (let i = 0, j = len - 1; i < j; i++, j--)
            // two-side checking: dodge cases with only last item changed, faster
            if (!valEqual(oldValue[i], newValue[i], upp) || !valEqual(oldValue[j], newValue[j], upp))
                return false;

        return true;
    }

    if (update === 'deep' && isObject(oldValue) && isObject(newValue)) {
        let oKeys = getObjectKeys(oldValue),
            kLen = oKeys.length,
            pairs;

        if (kLen !== getObjectKeys(newValue).length)
            return false;

        for (let i = 0; i < kLen; i++) {
            let key = oKeys[i],
                ov = toPrimitiveValue(oldValue[key]);

            if (isObject(ov)) {
                let nv = toPrimitiveValue(newValue[key]);
                if (!isObject(nv) || !isArray(ov) !== !isArray(nv))
                    return false;

                if (pairs) pairs.push(ov, nv);
                else pairs = [ov, nv];
            }

            else if (!valEqual(ov, newValue[key]))
                return false;
        }

        if (pairs) for (let i = pairs.length; i;)
            if (!valEqual(pairs[--i], pairs[--i], update))
                return false;

        return true;
    }

    return false;
}
