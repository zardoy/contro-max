//@ts-check
import { build } from 'esbuild'
import { globby } from 'globby'

const tsTestFile = await globby('test/**/*.ts')

await build({
    bundle: true,
    entryPoints: tsTestFile,
    platform: 'browser',
    // format: 'esm',
    outdir: 'test-out',
    watch: process.argv[2] === 'watch',
})
