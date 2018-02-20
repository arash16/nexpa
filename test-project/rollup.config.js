import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import path from 'path';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/main.js',
        format: 'umd',
        sourcemap: true,
        strict: false
    },
    watch: {
        chokidar: true
    },
    plugins: [
        resolve({
            customResolveOptions: {
                // for sub modules inside es6 compiled modules, look inside main/module file's folder
                pathFilter: function (pkg, fullPath, relativePath) {
                    let indexDir = pkg.module || pkg['jsnext:main'] || pkg.browser || pkg.main;
                    if (indexDir) {
                        if (/\.js$/.test(indexDir))
                            indexDir = path.dirname(indexDir);

                        if (!relativePath.startsWith(indexDir))
                            relativePath = path.join(indexDir, relativePath);
                    }
                    return relativePath;
                }
            }
        }),
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        })
    ]
};
