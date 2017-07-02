function applyChildren(proxy, children) {
    var oldKeysInd, oldLen;

    nx.run(function () {
        var newItems = unwrap(children),
            patcher = proxy.childsPatcher(newItems),
            newLen = newItems.length,
            newKeysInd = {},
            newChilds = [];

        if (oldKeysInd) {
            var oldIndexOf = {},
                newIndexOf = {};
        }

        for (var newInd = 0, item; item = newItems[newInd]; newInd++) {
            var child = item.render();
            newKeysInd[item.id] = newInd;
            newChilds.push(child);

            if (oldKeysInd) {
                var oldInd = oldKeysInd[item.id];
                if (oldInd >= 0) {
                    oldIndexOf[newInd] = oldInd;
                    newIndexOf[oldInd] = newInd;
                }
            }
            else patcher.appendElem(newInd);
        }

        if (oldKeysInd) {
            for (var i = 0, j = 0; i < oldLen;) {
                var ni = (newIndexOf[i] + 1 | 0) - 1,
                    oj = (oldIndexOf[j] + 1 | 0) - 1;

                if (oj == i) i++, j++;
                else if (ni < 0) {
                    if (j < newLen) {
                        // check at most 5 future items, if collision exists -> replaceChild
                        var m = oj > i + 1 ? min(i + 6, oj) : 0;
                        for (var k = i + 1; k < m; k++)
                            newIndexOf[k] > j && (m = 0);

                        !m && patcher.replaceElem(j++, i++);
                    }
                    else m = 1;
                    m && patcher.removeElem(i++);
                }
                else if (ni < j) i++;
                else if (i > 0 && oj == i - 1) j++;
                else if (oj < i || ni - j < oj - i)
                    patcher.insertElem(j++, i);
                else i++; // skip i
            }

            while (j < newLen) patcher.appendElem(j++);
        }

        oldKeysInd = newKeysInd;
        oldLen = newLen;
        patcher.apply(newChilds);
    });
}

//function minPatch_PseudoCode(i, j) {
//    if (i >= oldLen) return 'append(j .. newLen)';
//    if (j >= newLen) return 'remove(i .. oldLen | where ni<0)';
//
//    var ni = (newIndexOf[i] + 1) | 0 - 1,
//        oj = (oldIndexOf[j] + 1) | 0 - 1;
//
//    if (oj == i) // match -> no actions, skip both
//        return minPatch(i + 1, j + 1);
//
//    // else -->  oi != j && oj != i
//
//    // i removed
//    if (ni < 0) {
//        // j added, or previously skipped by i
//        if (oj < i || 'in [i..oj] !Ex|nx>j')
//            return 'replace(i by j)' + minPatch(i + 1, j + 1);
//
//        return 'remove(i)' + minPatch(i + 1, j);
//    }
//
//    // i already handled --> skip i
//    if (ni < j) return minPatch(i + 1, j);
//
//    // new added
//    if (oj < 0) return 'insert(j before i)' + minPatch(i, j + 1);
//
//    // j was left of i, no action required
//    if (oj == i - 1) return minPatch(i, j + 1);
//
//    if (oj < i) return 'insert(j before i)' + minPatch(i, j + 1);
//
//
//    // greedy decision to make oj=i/ni=j faster
//    return oj < i || ni - j < oj - i ?
//           'insert(j before i)' + minPatch(i, j + 1) :
//           minPatch(i + 1, j);
//}
