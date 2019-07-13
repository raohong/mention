import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

import pkg from './package.json';

const extensions = ['.js', '.json', '.ts', '.tsx'];

export default {
  input: './src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named'
    }
  ],
  external: [...Object.keys(pkg.dependencies)],
  plugins: [
    resolve({
      extensions,
      jsnext: true
    }),
    postcss({
      plugins: [autoprefixer],
      extract: true
    }),

    commonjs(),
    babel({
      exclude: 'node_modules/**',
      include: ['src/**/*'],
      extensions
    })
  ]
};
