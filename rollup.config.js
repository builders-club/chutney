// Contents of the file /rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

const config = [
  {
    input: 'dist/index.js',
    output: {
      file: 'bin/chutney.js',
      format: 'es',
      sourcemap: true,
    },
    external: [
      'handlebars',
      'unified',
      'remark-parse',
      'remark-frontmatter',
      'remark-rehype',
      'rehype-stringify',
      'rehype-raw',
      'remark-parse-yaml',
      'fs/promises',
      'path'
    ],
    plugins: [typescript(), terser()]
  }, {
    input: 'dist/index.d.ts',
    output: {
      file: 'bin/chutney.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
export default config;