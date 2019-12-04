var easings = extend(nullObject(), {
    'Linear': identity,
    'Swing': function (p) {
        return 0.5 - cos(p * PI) / 2;
    },
    'Sine': function (p) {
        return 1 - cos(p * PI / 2);
    },
    'Circ': function (p) {
        return 1 - sqrt(1 - p * p);
    },
    'Elastic': function (p) {
        return p === 0 || p === 1 ? p :
               -pow(2, 8 * (p - 1)) * sin(((p - 1) * 80 - 7.5) * PI / 15);
    },
    'Back': function (p) {
        return p * p * (3 * p - 2);
    },
    'Bounce': function (p) {
        var pow2, bounce = 4;
        while (p < ((pow2 = pow(2, --bounce)) - 1) / 11);
        return 1 / pow(4, 3 - bounce) - 7.5625 * pow((pow2 * 3 - 2) / 22 - p, 2);
    }
});

['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function (i, name) {
    easings[name] = function (p) {
        return pow(p, i + 2);
    };
});

eachKey(easings, function (name, easeIn) {
    easings['easeIn' + name] = easeIn;

    easings['easeOut' + name] = function (p) {
        return 1 - easeIn(1 - p);
    };

    easings['easeInOut' + name] = function (p) {
        return p < 0.5 ? easeIn(p * 2) / 2 :
               1 - easeIn(p * -2 + 2) / 2;
    };
});


var reCamelName = /[A-Z]/g;
eachKey(easings, function (camelName, easing) {
    var dashedName = camelName
        .replace(reCamelName, function (x) {
            return '-' + x.toLowerCase();
        });

    easings[dashedName] = easing;
});


easings.default = function (p) {
    return ((((1.7475 * p - 6.3425) * p + 9.495) * p - 7.7) * p + 3.8) * p;
};
