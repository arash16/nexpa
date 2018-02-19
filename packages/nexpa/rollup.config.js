import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
// import strip from 'rollup-plugin-strip';

export default {
    input: 'src2/index.js',
    output: {
        file: 'lib/nexpa.js',
        format: 'umd',
        name: 'Nexpa',
        sourcemap: true,
        strict: false
    },
    plugins: [
        resolve(),
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        })
    ]
};
