// TODO should be TS builtin behavior
// Only for TypeScript narrowing of command type

export const stringStartsWith = <T extends string>(str: string, search: T): str is `${T}${string}` => str.startsWith(search)
export const stringEndsWith = <T extends string>(str: string, search: T): str is `${string}${T}` => str.endsWith(search)
export const stringIncludes = <T extends string>(str: string, search: T): str is `${string}${T}${string}` => str.includes(search)
