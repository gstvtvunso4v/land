import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import progress from 'rollup-plugin-progress';
import { terser } from 'rollup-plugin-terser';
import { obfuscator } from 'rollup-obfuscator';

const plugins = [
  resolve({
    browser: true,
    modulePaths: [process.cwd() + '/node_modules']
  }),
  commonjs({ sourceMap: false }),
  progress()
];

if (process.env.PRODUCTION) {
  plugins.push(
    // obfuscator(), // tmp, потом удалить
    terser()
  );
}

export default {
  input: 'src/czarverse.js',
  output: [
    {
      file: 'build/czarverse.js',
      format: 'es',
      name: 'named',
      sourcemap: !process.env.PRODUCTION,
    }
  ],
  watch: !process.env.PRODUCTION,
  plugins: plugins
}
