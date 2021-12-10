//@ts-check
import { execa } from 'execa'
import { build } from 'esbuild'

await build({
    bundle: true,
    outfile: 'test/out.spec.js',
    platform: 'browser',
    entryPoints: ['test/main.spec.ts'],
    plugins: [
        {
            name: 'watcher',
            setup(build) {
                build.onEnd(async ({ errors }) => {
                    if (errors.length) return
                    await execa('pnpm mocha-chrome test/index.html', {
                        stdio: 'inherit',
                    }).catch(() => {})
                })
            },
        },
    ],
    watch: process.argv[2] === 'watch',
})
