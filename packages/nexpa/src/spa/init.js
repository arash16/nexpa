function init(renderFn, container) {
    if (isString(container))
        container = document.querySelector(container);

    if (isUndefined(container))
        container = document.body;

    return nx.run(() => {
        var allRoots = [renderFn(), globalElements],
            tree = <div>{allRoots}</div>,
            rootNode = nxDom.render(tree);

        container.appendChild(rootNode);
        // tree.emit('attached');

        nextFrame(function s() {
            nx.signal();
            nextFrame(s);
        });
        nx.onSignal(() => {
            var newRoot = nxDom.render(tree);
            if (newRoot !== rootNode) {
                container.replaceChild(newRoot, rootNode);
                rootNode = newRoot;
            }
        });

        return rootNode;
    });
}
