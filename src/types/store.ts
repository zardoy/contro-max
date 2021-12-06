/** Store handles resolving and saving user-overrides binds */
export type StoreProvider = {
    /** Will be called on init. Must return user shortcuts that will be merged with default. If async, emitting (and if even preventing default) events will be disable until resolved. You SHOULD display loading modal (or screen) at this moment */
    load(): MaybePromise<UserOverridesConfig>
    /** Must save user-overrided binds. Should return promise, if appliable, to display saving toast (notification) until resolved */
    save(): MaybePromise<void>
    // TODO updateOverride method. Args: command, newValue: {}
    /** Emitted, when user clicks reset shortcuts in UI */
    // onReset(): void
}

export type UserOverrideCommand = {
    /** If defined, will replace ALL default keys binds e.g. returning `[]` will disable key binds */
    keys?: string[]
    /** If defined, will replace ALL default gamepad buttons binds e.g. returning `[]` will disable gamepad binds */
    gamepad?: string[]
}
export type UserOverridesConfig = {
    [category: string]: {
        [command: string]: UserOverrideCommand
    }
}
export type MaybePromise<T> = T | Promise<T>
