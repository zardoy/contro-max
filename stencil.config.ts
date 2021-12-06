import { Config } from '@stencil/core'
import { inlineSvg } from 'stencil-inline-svg'

export const config: Config = {
    namespace: 'contro-max',
    srcDir: 'src/webcomponents',
    outputTargets: [
        {
            type: 'dist',
            esmLoaderPath: '../loader',
        },
        {
            type: 'dist-custom-elements-bundle',
        },
        {
            type: 'docs-readme',
        },
        // {
        //     type: 'docs-vscode',
        //     file: 'custom-elements.json',
        // },
        {
            type: 'www',
            serviceWorker: null, // disable service workers
        },
    ],
    tsconfig: 'src/webcomponents/tsconfig.json',
    plugins: [inlineSvg()],
}
