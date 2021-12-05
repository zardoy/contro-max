const mouseButtons = ['left', 'middle', 'right']

interface LockPointerOptions {
    /**
     * The most probably you don't need to override it
     * @default document.documentElement  */
    target?: HTMLElement
    /** @default true */
    // preferRawInput?: boolean; // You don't need this option
}

type LockPointerReturnType = Promise<{
    /** Whether pointer lock bypasses system acceleration and sens */
    usingRawInput: boolean
} | null>

// TODO! mouse.spec!

/**
 * Browser rejects pointer lock if it wan't requested by the user itself (user gesture)
 * @returns Returns null if not supported
 */
export const requestPointerLock = async ({ target = document.documentElement }: LockPointerOptions = {}): LockPointerReturnType => {
    if (!document.documentElement.requestPointerLock) return null
    //@ts-expect-error
    const pointerLockPromise = target.requestPointerLock({
        unadjustedMovement: true,
    }) as Promise<void> | void
    if (pointerLockPromise) await pointerLockPromise

    return { usingRawInput: !!pointerLockPromise }
}
