var reEmailTest = /^[a-z0-9_]+[a-z0-9.!$+_~-]*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?){1,10}$/i;

defineType('string', {
    refine: function (s) {
        if (isUndefined(s.type) || ['text', 'email', 'html', 'password', 'string'].indexOf(s.type) >= 0) {
            s.kind = String(s.kind || s.type);
            if (!s.kind || s.kind == 'string') s.kind = 'text';
            if (s.kind == 'email') s.direction = 'ltr';

            if (s.kind != 'html' && isString(s.regexp))
                s.regexp = new RegExp(s.regexp);

            var initial = s.initial;
            if (initial && !isString(initial) || initial === 0)
                s.initial = String(initial);

            s.type = 'string';
            return s;
        }
    },
    create: function (meta, proto) {
        function TypedString() {}

        var reTest = meta.regexp,
            minLen = max((parseInt(meta.min) || meta.required) | 0, 0),
            maxLen = max(parseInt(meta.max), 0);

        if (!maxLen || !isFinite(maxLen))
            maxLen = Infinity;

        if (meta.kind === 'email')
            reTest = reEmailTest;

        var reTestError = 'معتبر نیست.';
        if (isArray(reTest)) {
            if (isString(reTest[2]))
                reTestError = reTest[2];
            reTest = new RegExp(reTest[0], reTest[1]);
        }

        TypedString.prototype = extend(proto, {
            required: minLen > 0,
            write: function (val) {
                if (isVoid(val)) return '';

                var str = tryStringify(val);
                if (isString(str))
                    return isFinite(maxLen) ? str.substr(0, maxLen) : str;
            },
            validate: function (val, errors) {
                if (minLen > 1 && val.length < minLen)
                    errors.push('باید حداقل ' + minLen + ' کاراکتر یا بیشتر طول داشته باشد.');

                if (val.length > max)
                    errors.push('طول رشته ی وارد شده نمی تواند بیشتر از ' + maxLen + ' کاراکتر باشد.');

                if (!errors.length && reTest && !reTest.test(val))
                    errors.push(reTestError);
            }
        });

        return TypedString;
    },


    initial: '',
    view: function (meta, exMeta, type) {
        if (meta.kind !== 'html') return 'input';
    },
    onInput: function (current, newVal) {
        var res = newVal,
            resLen = res.length,
            maxLen = this.max;

        if (isFinite(maxLen) && resLen > maxLen) {
            if (current.length == maxLen)
                res = current;

            else if (current.length > maxLen)
                res = res.substring(0, maxLen);

            else {
                // strip extra characters from newVal
                // user may paste long str in middle of current
                // in such cases, we strip ex-characters from newly pasted

                var resPre = '';
                for (var i = 0; i < maxLen && res[i] === current[i]; i++)
                    resPre += res[i];

                for (var j = resLen - 1, k = current.length - 1; j >= 0 && k >= 0 && res[j] === current[k]; j--, k--);
                var resPost = current.substring(k + 1, current.length);

                var remLen = maxLen - (resPre.length + resPost.length);
                res = resPre + res.substr(i, remLen) + resPost;
            }
        }

        return { value: res, parsed: res };
    }
});
