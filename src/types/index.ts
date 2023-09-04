// Inputs schema for your application!

import { LiteralUnion } from 'type-fest'
import { GamepadButtonName } from '../gamepad'
import { AllKeyCodes } from './keyCodes'
import { StoreProvider } from './store'

/** @partial */
export interface InputCommandOptions {
    /** @default true */
    preventDefault?: boolean
    /**
     * Temporary disable emitting events
     * @default false
     */
    disabled?: boolean
}

type BasicInputType = 'keyboard' | 'gamepad'

/** resolved command from schema */
export type SchemaCommand = InputCommandOptions & {
    keys: AllKeyCodes[]
    gamepadButtons: GamepadButtonName[]
    // trigger(): void
    /** once triggered (even by key) subsequent calls wont' take any effect */
    // triggerHold(): void
    // releaseHold(): void
    // isActive: boolean
}
// export type SchemaCommand<G extends boolean = false> = SchemaCommandBase &
//     (G extends true
//         ? KeysGroup
//         : {
//               keys: AllKeyCodes[]
//           })

// AllPageMoveKeys = arrowKeys + home end + page up page down. Also on mac: cmd + keys
// This deserves a separate package! Push an idea with accelerator!
export type KeysGroup = 'WASD' | 'Arrows' | 'Digits' | 'NumpadDigits' | 'AnyDigits' | 'Modifiers' | 'FKeys' | 'PageMoveKeys'
// export type KeysGroupObj = {
//     group: KeysGroup
// }

type KeyboardKey = AllKeyCodes | null /*  | KeysGroupObj */

export type SchemaCommandInput = [KeyboardKey | AllKeyCodes[], GamepadButtonName?, InputCommandOptions?] | null

// I don't see a better way
export type InputCommandsSchema = {
    [category: string]: {
        [command: string]: SchemaCommandInput
    }
}

type GamepadButtons = GamepadButtonName[]
export type InputGroupedCommandsSchema = {
    [category: string]: {
        [groupedCommand: string]: [KeysGroup | AllKeyCodes[], GamepadButtons, InputCommandOptions?]
    }
}

export type InputSchema = {
    // commands: InputCommandsSchema
    // groupedCommands?: InputGroupedCommandsSchema
    /**
     * By default, we're automatically listening to these keys and update movement vector. Specify null to disable for keyboard
     * @default null
     */
    movementKeymap?: 'WASD' | 'WASDArrows' | 'Arrows' | null
}

export interface InputSchemaArg<T extends InputCommandsSchema, K extends InputGroupedCommandsSchema> extends InputSchema {
    commands: T
    groupedCommands?: K
}

export type MovementVector2d = {
    x: number
    z: number
}
export type MovementVector3d = {
    x: number
    y: number
    z: number
}

type SubPath<T, Key extends keyof T> = Key extends string
    ? T[Key] extends Record<string, any>
        ? `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
        : never
    : never

export type AllSchemaCommands<T extends InputCommandsSchema | InputGroupedCommandsSchema> = SubPath<T, keyof T>
export type CommandEventArgument<T extends InputCommandsSchema> = {
    command: AllSchemaCommands<T>
    schema: SchemaCommand
}
export type GroupedCommandEventDeviceType =
    | // TODO doc: should rely on index rather than button or key
    {
          type: 'keyboard'
          key: AllKeyCodes
      }
    | {
          type: 'gamepad'
          gamepadIndex: number
          button: GamepadButtonName
      }
export type GroupCommandEventArgument<K extends InputGroupedCommandsSchema> = {
    command: AllSchemaCommands<K>
    schema: InputGroupedCommandsSchema['']['']
    /** Keyboard key or gamepad button index */
    index: number
} & GroupedCommandEventDeviceType

export type SourceType = {
    /** Who emitted event: Gamepad with index or keyboard if `undefined` */
    gamepadIndex?: number
}
export type ControEvents<T extends InputCommandsSchema, K extends InputGroupedCommandsSchema, M extends '2d' | '3d'> = {
    trigger: CommandEventArgument<T>
    triggerGrouped: GroupCommandEventArgument<K>
    release: CommandEventArgument<T>
    releaseGrouped: GroupCommandEventArgument<K>
    movementUpdate: { vector: M extends '3d' ? MovementVector3d : MovementVector2d } & SourceType
    // works on canvasElem or after registerCanvasElem
    /** usually to switch slots */
    mouseWheel: { direction: -1 | 1 }
    // updateLook: MovementVector2d

    userConfigResolve: undefined
}

// OPTIONS

type KeyboardTarget = Record<'addEventListener' | 'removeEventListener', (...args: ['keydown' | 'keyup', (e: KeyboardEvent) => void]) => unknown>

export interface CreateControlsSchemaOptions {
    /** To what bind events
     * @default window */
    target?: KeyboardTarget
    /**
     * Sometimes target is dynamic, so you use global target and filter events here
     *
     * @param e undefined if is gamepad
     * @returns continue
     */
    captureEvents?: (e?: KeyboardEvent) => boolean
    /**
     * If true, then events that fired programmatically will be ignored
     * @default false
     */
    requireTrusted?: boolean
    /** Use additional DOM events to workaround certain bugs with keyboard
     * @default true */
    additionalEventHandlers?: boolean
    /**
     * - `only-first-gamepad`: listen for first only connected gamepad
     * - `only-last-gamepad`: listen for last only connected gamepad
     * - `all-gamepads`: listen for buttons and sticks from all connected gamepads
     * - `none`: temporary disabling gamepads support
     * @default all-gamepads
     */
    listenGamepadsStrategy?: 'only-first-gamepad' | 'only-last-gamepad' | 'all-gamepads' | 'none'
    defaultControlOptions?: InputCommandOptions
    /**
     * Default is precise enough
     * @default 250 */
    gamepadPollingInterval?: LiteralUnion<500 | 250, number>
    // TODO introduce sources
    /**
     * - all - emit buttons
     * - split -
     * @default all
     */
    // emitButtons?: 'all' | 'split'
    /**
     * - all - sum movement from keyboard and all listening gamepads (controlled by `listenGamepadsStrategy`)
     * - split - emit independent movement vectors for keyboard and each gamepads. Useful for split-screen games
     * @default all
     */
    emitMovement?: 'all' | 'split'
    storeProvider?: StoreProvider
    // canvasElem?: HTMLElement
    // additionalEvents?: {}
}
