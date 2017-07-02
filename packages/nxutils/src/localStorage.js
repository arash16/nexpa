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
