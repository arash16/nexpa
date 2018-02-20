import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

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
                pathFilter: require('resolve-submodule-filter')
            }
        }),
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        })
    ]
};
