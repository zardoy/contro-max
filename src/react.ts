import { useState } from 'react'
import useEventListener from 'use-typed-event-listener'
import { AllKeyCodes } from './types/keyCodes'

// TODO HIGH DEFAULT JSDOC

interface Options {
    /** whether to fire `e.preventDefault()`. Usefull for cancelling actions by browser Ex. `CTRL+S`
     * @default true
     */
    preventDefault?: boolean
    caseSensitive?: boolean
}

/**
 * @example
 * ```ts
 * const isPressed = useKeyPressed('KeyZ')
 * ```
 */
export const useKeyPressed = (key: AllKeyCodes, options?: Options) => {
    const [pressed, setIsPressed] = useState(false)

    useEventListener(window, 'keydown', key => {})
    useEventListener(window, 'keydown', async key => {
        // key.k
    })
    return pressed
}

export const usePointerLockActive = () => {
    const [l, setL] = useState(() => !!document.pointerLockElement)
    useEventListener(document, 'pointerlockchange', () => {
        setL(!!document.pointerLockElement)
    })

    return {
        pointerLocked: l,
    }
}
