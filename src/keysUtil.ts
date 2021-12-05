import { InputSchema, KeysGroup } from './types'
import { AllKeyCodes } from '.'
export const getMovementKeysGroup = (group: NonNullable<InputSchema['movementKeymap']>): string[] => {
    const wasdKeys = [...'WASD'].map(key => letterKeyToKeyCode(key))
    const arrowKeys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']

    switch (group) {
        case 'WASD':
            return wasdKeys

        case 'Arrows':
            return arrowKeys

        case 'WASDArrows':
            return [...wasdKeys, ...arrowKeys]

        default:
            throw new Error('Unreachable')
    }
}

// TODO find alternative
export const letterKeyToKeyCode = (letter: string) => `Key${letter}`

/** @index */
export const keysGroup = (group: KeysGroup): AllKeyCodes[] => {
    switch (group) {
        case 'Arrows':
            // the same order as for WASD
            return ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']
        case 'PageMoveKeys':
            return ['PageDown', 'PageUp']
        case 'WASD':
            return ['KeyW', 'KeyA', 'KeyS', 'KeyD']
        case 'Digits':
            return Array.from({ length: 10 }, (_, i) => `Digit${i}`) as AllKeyCodes[]
        case 'NumpadDigits':
            return Array.from({ length: 10 }, (_, i) => `Numpad${i}`) as AllKeyCodes[]
        case 'AnyDigits':
            return Array.from({ length: 10 }, (_, i) => [`Digit${i}`, `Numpad${i}`]).flat(1) as AllKeyCodes[]
        case 'FKeys':
            return Array.from({ length: 24 }, (_, i) => `F${i + 1}`) as AllKeyCodes[]
        case 'Modifiers':
            return ['Shift', 'Control', 'Alt', 'Meta'].flatMap(key => ['Left', 'Right'].map(side => `${key}${side}`)) as AllKeyCodes[]

        default:
            throw new Error('Unreachable')
    }
}

export const createCombinedGroup = (groups: KeysGroup[]) => {}
