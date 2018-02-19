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
        resolve(),
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        })
    ]
};
