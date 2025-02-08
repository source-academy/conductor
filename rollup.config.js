import { globSync } from "glob";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "node:path";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [{
    plugins: [nodeResolve(), typescript()],
    input: Object.fromEntries(
        globSync("src/**/index.ts").map(file => [
            path.relative(
                "src",
                file.slice(0, file.length - path.extname(file).length)
            ),
            file
        ])
    ),
    output: {
        plugins: [terser({
            module: true,
            format: {
                comments: /webpackIgnore/
            }
        })],
        dir: "dist",
        format: "es",
        sourcemap: true,
    }
}];
