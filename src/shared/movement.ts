// from dimaka-love/interface

export type MovementAction = [coordinate: 'x' | 'y' | 'z', step: number]

export const keysMovementConfig: MovementAction[] = [
    ['z', -1], //W
    ['x', -1], //A
    ['z', 1], //S
    ['x', 1], //D
]

export type MobileControlsConfig = Array<[label: string, rotate: number, movementAction: MovementAction[]]>

/** Schema of left part of touch controls */
export const touchLeftControlsConfig: MobileControlsConfig = [
    [
        'wa',
        -45,
        [
            ['x', -1],
            ['z', -1],
        ],
    ],
    ['w', 0, [['z', -1]]],
    [
        'wd',
        45,
        [
            ['x', 1],
            ['z', -1],
        ],
    ],
    ['d', 90, [['x', 1]]],
    ['s', 180, [['z', 1]]],
    ['a', 270, [['x', -1]]],
]
