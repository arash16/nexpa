function removeEventListener(type, listener) {
    if (!this.listeners || !this.listeners[type])
        return;

    var list = this.listeners[type];
    var index = list.indexOf(listener);
    if (index !== -1)
        list.splice(index, 1);
}
