function Event(family) {}
Event.prototype = rawObject({
    initEvent: function (type, bubbles, cancelable) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
    },
    preventDefault: function () {}
});
