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
}(function(){
	try { return global.localStorage || {}; }
	catch(e) { return {}; }
}(), JSON);
