export const defaultBuildOptions = {
    triggerMethod: 'function' as 'function' | 'object',
    allowModifiers: false,
    keyTypeSuggestions: 'keyOnly' as 'keyOnly' | 'withModifier' | 'withTwoModifiers' | 'withThreeModifiers',
}

export type CustomBuildOptions = typeof defaultBuildOptions
