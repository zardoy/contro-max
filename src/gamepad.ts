export const buttonMap = [
    ['A'],
    ['B'],
    ['X'],
    ['Y'],
    ['Left Bumper', 'LB'],
    ['Right Bumper', 'RB'],
    ['Left Trigger', 'LT'],
    ['Right Trigger', 'RT'],
    ['Back', 'View'],
    ['Start'],
    ['Left Stick'],
    ['Right Stick'],
    ['Up', 'DpadUp'],
    ['Down', 'DpadDown'],
    ['Left', 'DpadLeft'],
    ['Right', 'DpadRight'],
    ['Home', 'Guide', 'Xbox'],
] as const

export type GamepadButtonName = typeof buttonMap[number][0]

/** Find button number by button name (or number itself) */
export const findButtonNumber = (button: GamepadButtonName | number): number => {
    if (typeof button === 'number') return button

    button = button.toLowerCase() as any

    const buttonNumber = buttonMap.findIndex((aliases: readonly string[]) => aliases.find(alias => button === alias.toLowerCase()))
    if (buttonNumber) return buttonNumber

    throw new Error(`There is no gamepad button called "${button}"!`)
}

export function getButtonLabel(buttonIndex: number): GamepadButtonName | undefined {
    return buttonMap[buttonIndex]![0]
}
