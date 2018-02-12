import { global } from '../is-x'

const store = function () {
    try { return global.localStorage || {}; }
    catch (e) { return {}; }
}();

export const LocalStorage = function (json) {
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
}(JSON);
