import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import fs from 'fs';
import path from 'path';

// Get all TypeScript and JavaScript files from src root directory
const srcDir = 'src';
const files = fs.readdirSync(srcDir)
    .filter(file => file.match(/\.(ts|js)$/))
    .filter(file => fs.statSync(path.join(srcDir, file)).isFile());

// Create configuration for each file
const configs = files.map(file => {
    const name = path.parse(file).name;
    return {
        input: path.join(srcDir, file),
        output: {
            file: `dist/${name}.js`,
            format: 'es', // CommonJS for k6
            sourcemap: true,
        },
        external: ['k6', 'k6/x/exec'], // Exclude k6 modules
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json', // Use tsconfig for TypeScript settings
            }),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env', '@babel/preset-typescript'],
                extensions: ['.js', '.ts'],
            }),
        ],
    };
});

export default configs;