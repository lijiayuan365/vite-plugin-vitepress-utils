import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import { visualizer } from "rollup-plugin-visualizer";


export default {
  input: "./src/index.ts",
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'VitePressUtils',
    },
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    terser(),
    // visualizer(
    //   {
    //     // emitFile: true,
    //     // filename: "stats.html",
    //     open: true,  // 打包后自动打开页面
    //     gzipSize: true,  // 查看 gzip 压缩大小
    //     brotliSize: true // 查看 brotli 压缩大小
    //   }
    // )
  ],
  // external: ["fast-glob", "gray-matter"],
};
