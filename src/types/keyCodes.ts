// w3c-keys seems to be outdated

// todo-low raise range typescript support

// ONLY POPULAR KEYS ARE INCLUDED. Do not use rarely keys unless you really need that. Some special keys could be find here: https://github.com/wesbos/keycodes/issues/295

// For example media keys couldn't be cancelled and there is no need to use them

type SingleNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type DigitKeys = `Digit${SingleNumber}`

export type Fnumbers = Exclude<SingleNumber, 0> | 10 | 11 | 12

// SUPPORT!!! "CmdOrCtrl" | "Alt" | "Option" | "AltGr"

export type ModifierOnlyKeys = `${'Meta' | 'Control' | 'Alt' | 'Shift'}${'' | 'Left' | 'Right'}`

export type OtherKeys =
    | 'Space'
    | 'Esc'
    | 'Tab'
    | 'Enter'
    | 'Equal'
    | 'Minus'
    | 'Backslash'
    | 'Slash'
    | 'Period'
    | 'Comma'
    | 'Capslock'
    | 'Numlock'
    | 'PrintScreen'
    | 'Scrolllock'
    | 'Pause'
    | 'Backspace'
    | 'Delete'
    | 'Insert'
    | 'Backquote'
    | 'BracketLeft'
    | 'BracketRight'
    | `Arrow${'Up' | 'Down' | 'Left' | 'Right'}`
    | 'Home'
    | 'End'
    | 'PageUp'
    | 'PageDown'

/** it doesn't matter whether NumLock is on or not */
export type NumpadKeys = `Numpad${SingleNumber}` | `Numpad${'Divide' | 'Multiply' | 'Subtract' | 'Add' | 'Enter' | 'Decimal'}`

type LetterKey = `Key${Capitalize<
    'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
>}`

type MouseSideKeys = `Mouse${0 | 1 | 2 | 3 | 4}`

type AllKeyCodesWithoutModifiers = `${DigitKeys}` | LetterKey | `F${Fnumbers}` | NumpadKeys | OtherKeys | MouseSideKeys
export type AllKeyCodes = `${ModifierOnlyKeys}` | AllKeyCodesWithoutModifiers | `${ModifierOnlyKeys}+${AllKeyCodesWithoutModifiers}`

export type AllKeyCodesWithModifiers = `${AllKeyCodes}` | `${ModifierOnlyKeys}+${AllKeyCodesWithoutModifiers}`
