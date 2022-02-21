// Contents of the file /rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
const config = [
  {
    input: 'dist/index.js',
    output: {
      file: 'chutney.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['fs/promises', 'path'],
    plugins: [typescript()]
  }, {
    input: 'dist/index.d.ts',
    output: {
      file: 'chutney.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
export default config;