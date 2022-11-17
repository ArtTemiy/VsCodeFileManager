import ts from "rollup-plugin-ts";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodeGlobals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';

export default [ 
    {
        input: 'src/frontend/index.tsx',
        output: {
            dir: 'out',
            format: 'es'
        },
        plugins: [
            ts(),
            resolve(),
            commonjs({
                include: 'node_modules/**',
            }),
            replace({
                "process.env.NODE_ENV": JSON.stringify( 'production' )
            })
        ]
    },
    {
        input: 'src/backend/extension.ts',
        output: {
            dir: 'out',
            format: 'cjs'
        },
        external: [ 'fs', 'vscode' ],
        plugins: [
            ts(),
            resolve(),
            nodeGlobals(),
        ]
    }
];
