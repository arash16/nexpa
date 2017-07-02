function domWalk(nodes, cb) {
    if (!('length' in nodes))
        nodes = [nodes];

    nodes = slice(nodes)
    while (nodes.length) {
        var node = nodes.shift(),
            ret = cb(node);

        if (ret) return ret;
        if (node.childNodes && node.childNodes.length)
            nodes = [].slice.call(node.childNodes).concat(nodes);
    }
}
