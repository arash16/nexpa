var xhr = function () {
    for (var a = 0; a < 4; a++)
        try {
            return a
                ? new ActiveXObject([, "Msxml2", "Msxml3", "Microsoft"][a] + ".XMLHTTP")
                : new XMLHttpRequest
        }
        catch (e) {}
};


var LocalStorage = function (store, json) {
    return json
        ? {
               get: function (c) {
                   return store[c] && json.parse(store[c])
               },
               set: function (key, value) {
                   store[key] = json.stringify(value)
               }
           }
        : {}
}(global.localStorage || {}, JSON);
