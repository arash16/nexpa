import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
// import strip from 'rollup-plugin-strip';

export default {
    input: 'src3/index.js',
    output: {
        file: 'lib/nexable.js',
        format: 'umd',
        name: 'nx',
        sourcemap: true,
        strict: false
    },
    plugins: [
        resolve(),
        babel({
            externalHelpers: false,
            exclude: 'node_modules/**'
        }),/*
        {
            name: 'replace',
            transform(code, id) {
                console.log(code, id);
            }
        },*/
        /*
        strip({
            // set this to `false` if you don't want to
            // remove debugger statements
            debugger: true,

            // defaults to `[ 'console.*', 'assert.*' ]`
            functions: ['console.log', 'assert.*', 'debug', 'alert'],

            // set this to `false` if you're not using sourcemaps –
            // defaults to `true`
            sourceMap: true
        })
        */
    ]
};
