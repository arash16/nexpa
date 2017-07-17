function typedNumberToString() {
    var v = this.valueOf();
    if (v === 0 && 1 / v === -Infinity) return '-0';
    return String(isNumber(v) ? v : '');
}

var reTnInf = /^\+?(\-?)Inf(?:inity)?$/i,
    reTnNonNumeric = /[^0-9e.+-]+/gi,
    reTnCleanAfterExp = /^([0-9.+-]*)e([0-9+-]*)[^0-9+-]+([0-9+-]*).*/g,
    reTnCleanup = /^\+*(?:[0+-]*(?:(\-)|\+))?(?:0*(\d+)|(0)[0+-]*)?(?:(\.)\.*(\d*))?(?:(\.)\.*(\d*))?[^e]*(?:(e)\+*(?:[0+-]*(?:(\-)|\+))?0*(\d*))?.*$/i;

defineType('number', {
    refine: function (s) {
        if (s.type == 'number') {
            s.type = 'number';

            var init = s.initial,
                v = parseFloat(init);

            if (v !== init && isFinite(v))
                s.initial = init;

            return s;
        }
    },
    create: function (meta, proto) {
        function TypedNumber() {}

        var minVal = toFloat(meta.min, -Infinity),
            maxVal = toFloat(meta.max, Infinity),
            precision = isFinite(meta.precision) ? pow(10, meta.precision | 0) : 0;

        TypedNumber.prototype = extend(proto, {
            toString: typedNumberToString,
            write: function (val) {
                var x = val;

                if (isVoid(x) || x === '') return '';
                if (isBool(x)) return x | 0;
                if (!isNumber(x)) x = parseFloat(x);
                if (isFinite(x)) {
                    if (precision) x = round(x * precision) / precision;
                    return x;
                }
            },
            validate: function (val, errors) {
                if (val < minVal)
                    errors.push('مقدار این فیلد باید حداقل ' + minVal + ' یا بیشتر از آن باشد.');

                if (val > maxVal)
                    errors.push('مقدار این فیلد نمی تواند بیشتر از ' + maxVal + ' باشد.');
            }
        });

        return TypedNumber;
    },

    view: 'input',
    direction: 'ltr',
    onInput: function (current, newVal) {
        if (newVal == '-0' || 1 / newVal === -Infinity) {
            newVal = '-0';
            parsedNewVal = -0;
        }
        else if (newVal) {
            if (reTnInf.test(newVal))
                newVal = newVal.replace(reTnInf, '$1Infinity');

            else {
                newVal = newVal
                    .replace(reTnNonNumeric, '')
                    .replace(reTnCleanAfterExp, '$1e$2$3');

                if (newVal[0] == '+')
                    newVal = newVal.substr(1);

                if (newVal[0] == 'e')
                    newVal = current[1] == 'e' && newVal[2] != 'e' ? newVal.substr(1) : '1' + newVal;

                if (newVal[0] == '.')
                    newVal = current[0] == '0' ? newVal.substr(1) : '0' + newVal;

                if (newVal[0] == '-' && newVal[1] == '.') // -.22
                    newVal = (current[1] == '0' ? '-' : '-0.') + newVal.substr(2);

                if (newVal[1] == '-')
                    newVal = '-' + newVal[0] + newVal.substr(2);


                for (var negPos = 0; negPos >= 0 && current[negPos = newVal.indexOf('-', negPos + 1)] === '-';);
                if (negPos > 0) {
                    var ePos = newVal.indexOf('e');
                    if (ePos < 0 || negPos < ePos)
                        newVal = '-' +
                            newVal.substring(0, negPos).replace(/[-+]+/g, '') +
                            newVal.substr(negPos + 1);

                    else if (ePos > 0)
                        newVal = newVal.substring(0, ePos) + 'e-' +
                            newVal.substr(ePos + 1).replace(/[-+]+/g, '');
                }

                newVal = newVal.replace(reTnCleanup, '$1$2$3$4$5$6$7$8$9$10');

                var p1 = newVal.indexOf('.'),
                    p2 = p1 < 0 ? -1 : newVal.indexOf('.', p1 + 1);

                if (p2 >= 0) {
                    p1 = current[p1] == '.' ? p1 : p2;
                    newVal = newVal.substring(0, p1) + newVal.substr(p1 + 1);
                }
            }

            var parsedNewVal = parseFloat(newVal);
        }
        else {
            newVal = this.placeholder ? '' : '0';
            parsedNewVal = newVal && 0;
        }

        return {
            value: newVal,
            parsed: parsedNewVal
        };
    }
});
