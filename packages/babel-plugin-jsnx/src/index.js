const nxIdentifier = 'nx';

export default function ({ types: t }) {

    const reElemCtor = /^[A-Z]+[a-zA-Z0-9_]*$/;

    const reCamelCaseStr = /(^|\-)([a-z])/gi;

    function camelCase(str) {
        return str.replace(reCamelCaseStr, function (s, x, y) {
            return x ? y.toUpperCase() : y.toLowerCase();
        });
    }

    const reValidJsIdentifier = /^[$_a-z]+[$_a-z0-9]*$/i;

    function propertyKeyNode(key) {
        return reValidJsIdentifier.test(key) ? t.identifier(key) : t.stringLiteral(key);
    }

    // ----------------------------------------------------------------------------------------

    function isComputedNode(path) {
        const { node } = path;
        if (node.type === 'MemberExpression')
            return true;

        if (node.type === 'CallExpression') {
            const { callee } = node;
            if (callee.name === nxIdentifier) return;
            if (callee.type === 'MemberExpression'
                && callee.object.name === nxIdentifier
                && ['call', 'apply'].indexOf(callee.property.name) >= 0) return;

            return true;
        }
    }

    const funcTypes = { FunctionExpression: 1, FunctionDeclaration: 1 };

    function isStatic(path) {
        if (funcTypes[path.node.type])
            return true;

        if (path.evaluate().confident)
            return true;

        if (isComputedNode(path))
            return false;

        let isstatic = true;
        path.traverse({
            enter(path) {
                const { node } = path;
                if (funcTypes[node.type]) {
                    path.skip();
                    return;
                }

                if (isComputedNode(path)) {
                    isstatic = false;
                    path.stop();
                }
            }
        });
        return isstatic;
    }


    function transformElementName(node) {
        if (node.type === 'JSXIdentifier')
            return reElemCtor.test(node.name)
                ? t.identifier(node.name)
                : t.stringLiteral(node.name);

        if (node.type === 'JSXNamespacedName')
            return t.stringLiteral(node.namespace.name + ':' + node.name.name);

        return t.memberExpression(
            node.object.type === 'JSXIdentifier'
                ? t.identifier(node.object.name)
                : node.object,
            t.identifier(node.property.name)
        );
    }

    function transformJSXExpression(path) {
        const { node } = path;
        if (node.type === "JSXExpressionContainer") {
            let exppath = path.get('expression');
            return isStatic(exppath) ? node.expression : t.callExpression(
                t.identifier(nxIdentifier),
                [t.arrowFunctionExpression([],
                    t.blockStatement([t.returnStatement(node.expression)])
                )]
            );
        }
        return node;
    }

    // TODO: add loc properties
    return {
        manipulateOptions(opts, parserOpts, file) {
            parserOpts.plugins.push("jsx");
        },
        visitor: {
            JSXElement: {
                exit(path, { file }) {
                    const { node } = path;
                    const { children, openingElement } = node;
                    let { attributes } = openingElement;


                    let element = transformElementName(openingElement.name);

                    // ---------------------------------------------------------------------

                    let attsp = path.get('openingElement.attributes');
                    let props = attributes.map((attr, i) => {
                        return t.objectProperty(
                            propertyKeyNode(camelCase(attr.name.name)),
                            transformJSXExpression(attsp[i].get('value'))
                        );
                    });


                    let propsHash = {};
                    props.forEach(function (prop, index) {
                        if (!prop.computed && prop.kind === 'init') {
                            let key = prop.key.name || prop.key.value;
                            prop.key = propertyKeyNode(key);
                            propsHash[key] = { index: index, node: prop };
                        }
                    });

                    if (propsHash.className) {
                        if (!propsHash.class)
                            propsHash.className.node.key.name = 'class';

                        else {
                            props[propsHash.class.index] = t.objectProperty(
                                t.identifier('class'),
                                t.arrayExpression([
                                    propsHash.className.node.value,
                                    propsHash.class.node.value
                                ])
                            );
                            props.splice(propsHash.className.index, 1);
                        }
                    }
                    props = props.length && t.objectExpression(props);

                    // ---------------------------------------------------------------------

                    let chCount = children.length,
                        childs = [];

                    let childsp = path.get('children');
                    for (let i = 0; i < chCount; i++) {
                        let childNode = transformJSXExpression(childsp[i]);
                        if (childNode.type === 'JSXText') {
                            let val = childNode.value.replace(/\s+/g, ' ').trim();
                            if (val) childs.push(t.stringLiteral(val));
                            else if (i > 0 && i < chCount - 1) childs.push(null);
                        }
                        else childs.push(childNode);
                    }

                    // TODO: join consecutive StringLiterals
                    childs = childs.length && t.arrayExpression(childs);

                    let callee = t.memberExpression(t.identifier('nexpa'), t.identifier('createElement')),
                        args = [];

                    args.push(element);
                    file.set('hasJSNX', true);

                    if (props) args.push(props);
                    if (childs) args.push(childs);

                    path.replaceWith(t.callExpression(callee, args));
                }
            },
            Program: {
                enter(path, { file }) {
                    file.set('hasJSNX', false);
                },
                exit({ node, scope }, { file }) {
                    if (!file.get('hasJSNX') || scope.hasBinding('nexpa'))
                        return;

                    const nexpaImportDeclaration = t.importDeclaration([
                        t.importDefaultSpecifier(t.identifier('nexpa')),
                    ], t.stringLiteral('nexpa'));

                    node.body.unshift(nexpaImportDeclaration);
                }
            }
        }
    };
};
