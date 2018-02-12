import babel from 'rollup-plugin-babel'

export default {
    input: 'src2/index.js',
    output: {
        file: 'lib/index.mjs',
        format: 'es',
        sourcemap: true,
        strict: false
    },
    plugins: [
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        })
    ]
};
