import { mapValues } from 'lodash-es'
import Emittery from 'emittery'
import { Except } from 'type-fest'
import { AllKeyCodes } from './types/keyCodes'
import {
    AllSchemaCommands,
    ControEvents,
    CreateControlsSchemaOptions,
    GroupCommandEventArgument,
    InputCommandsSchema,
    InputGroupedCommandsSchema,
    InputSchemaArg,
    MovementVector3d,
    SchemaCommand,
} from './types'
import { keysGroup, getMovementKeysGroup } from './keysUtil'
import { keysMovementConfig } from './shared/movement'
import { bindEventListeners } from './eventUtils'
import { GamepadsStore } from './inputs/gamepadStore'
import { GamepadButtonName, getButtonLabel } from './gamepad'
import { UserOverridesConfig } from './types/store'
const mapKeyboardCodes = {
    // firefox
    // eslint-disable-next-line @typescript-eslint/naming-convention
    OS: 'Meta',
} as const

type MovementVectorType = '2d' | '3d'

// TODO enable debug
export class ControMax<
    T extends InputCommandsSchema,
    K extends InputGroupedCommandsSchema,
    M extends MovementVectorType,
    // this generic is hitting performance
    D extends ({
        movementVector?: M
    } & InputSchemaArg<T, K>) &
        // eslint-disable-next-line @typescript-eslint/ban-types
        (M extends '3d' ? { upCommand: AllSchemaCommands<T>; downCommand?: AllSchemaCommands<T> } : {}),
> extends Emittery<ControEvents<T, K, M>> {
    inputSchema: Except<D, 'commands'> & { commands: { [G in keyof T]: { [C in keyof T[G]]: SchemaCommand } } }

    /** Raw set of all pressed key at the moment */
    pressedKeys: ReadonlySet<AllKeyCodes>
    /** Completely disable emitting all events. */
    disabled = false

    userConfig: UserOverridesConfig | undefined

    constructor(inputSchema: D, public options: CreateControlsSchemaOptions = {}) {
        super()
        // TODO!
        const {
            target = window,
            additionalEventHandlers = true,
            defaultControlOptions,
            requireTrusted = false,
            listenGamepadsStrategy = 'all-gamepads',
            gamepadPollingInterval = 250,
            emitMovement = 'all',
        } = this.options

        this.inputSchema = {
            ...inputSchema,
            commands: mapValues(inputSchema.commands as InputCommandsSchema, group =>
                mapValues(group, (inputCommand): SchemaCommand => {
                    const resolvedCommand: SchemaCommand = {
                        keys: [],
                        gamepadButtons: [],
                    }
                    if (inputCommand === null) return resolvedCommand
                    const [...args] = inputCommand

                    Object.assign(resolvedCommand, typeof args[1] === 'object' ? args[1] : args[2] ?? {})
                    // lodash-marker ensureArray
                    if (typeof args[0] === 'string') resolvedCommand.keys = [args[0]]
                    if (Array.isArray(args[0]) && typeof args[0][0] === 'string') resolvedCommand.keys = args[0]

                    if (typeof args[1] === 'string') resolvedCommand.gamepadButtons = [args[1]]

                    return resolvedCommand
                }),
            ),
            // TODO
        } as any

        if (this.options.storeProvider) {
            const promiseOrConfig = this.options.storeProvider.load()
            if (typeof promiseOrConfig.then === 'function') {
                this.disabled = true
                void promiseOrConfig.then(config => {
                    this.userConfig = config
                    void this.emit('userConfigResolve')
                })
            } else {
                this.userConfig = promiseOrConfig as UserOverridesConfig
                void this.emit('userConfigResolve')
            }
        }

        const getInitialMovementVector = () => ({ x: 0, y: 0, z: 0 })

        const currentMovementVector = {
            all: getInitialMovementVector(),
            keyboard: getInitialMovementVector(),
            gamepads: [] as {
                [gamepadIndex: number]: MovementVector3d
            },
        }
        /** Emit update */
        const updateMovementVector = (type: { keyboard: true } | { gamepadIndex: number }) => {
            // todo
            if (emitMovement === 'all')
                currentMovementVector.all = [currentMovementVector.keyboard, ...Object.values(currentMovementVector.gamepads)].reduce(
                    (prevMovement, currentMovement) => ({
                        x: prevMovement.x + currentMovement.x,
                        y: prevMovement.y + currentMovement.y,
                        z: prevMovement.z + currentMovement.z,
                    }),
                    getInitialMovementVector(),
                )

            const movementVectorToEmit =
                emitMovement === 'all'
                    ? currentMovementVector.all
                    : 'keyboard' in type
                    ? currentMovementVector.keyboard
                    : currentMovementVector[type.gamepadIndex]

            void this.emit('movementUpdate', {
                ...(inputSchema.movementVector === '2d' ? { ...movementVectorToEmit, y: undefined } : movementVectorToEmit),
                gamepadIndex: 'keyboard' in type ? undefined : type.gamepadIndex,
            })
        }

        this.pressedKeys = new Set<AllKeyCodes>()

        // eslint-disable-next-line complexity
        const pressedKeyOrButtonChanged = (
            codeOrButton: { code: AllKeyCodes } | { gamepadIndex: number; button: GamepadButtonName },
            buttonPressed: boolean,
            { preventDefault: doPreventDefault = () => {} } = {},
        ) => {
            // ;(keydownEvent ? pressedKeys.add : pressedKeys.delete)(code)
            // ignore subsequent keypresses. also possible via event.repeat == true
            if ('code' in codeOrButton) {
                if (buttonPressed && this.pressedKeys.has(codeOrButton.code)) return
                this.pressedKeys[buttonPressed ? 'add' : 'delete'](codeOrButton.code)
            }

            // lodash-marker
            for (const [sectionName, section] of Object.entries(this.inputSchema.commands))
                for (const [name, command] of Object.entries(section)) {
                    const { keys, disabled, gamepadButtons, preventDefault } = command
                    if ('code' in codeOrButton) {
                        if (!keys.includes(codeOrButton.code)) continue
                    } else if (!gamepadButtons.includes(codeOrButton.button)) {
                        continue
                    }

                    if (preventDefault ?? defaultControlOptions?.preventDefault ?? true) doPreventDefault()
                    if ((disabled ?? defaultControlOptions?.disabled) && buttonPressed) continue
                    void this.emit(buttonPressed ? 'trigger' : 'release', { command: `${sectionName}.${name}` as any, schema: command })
                }

            for (const [sectionName, section] of Object.entries((this.inputSchema.groupedCommands as K) ?? {}))
                for (const [name, groupedCommand] of Object.entries(section)) {
                    const [keyboard, gamepadButtons, options = {}] = groupedCommand
                    const emitData: Partial<GroupCommandEventArgument<any>> = {
                        command: `${sectionName}.${name}`,
                        schema: groupedCommand,
                    }
                    if ('code' in codeOrButton) {
                        const resolvedKeys = typeof keyboard === 'string' ? keysGroup(keyboard) : keyboard
                        const keyIndex = resolvedKeys.indexOf(codeOrButton.code)
                        if (keyIndex === -1) continue
                        Object.assign(emitData, {
                            type: 'keyboard',
                            index: keyIndex,
                            key: resolvedKeys[keyIndex]!,
                        })
                    } else {
                        const buttonIndex = gamepadButtons.indexOf(codeOrButton.button)
                        if (buttonIndex === -1) continue

                        Object.assign(emitData, {
                            type: 'gamepad',
                            index: buttonIndex,
                            gamepadIndex: codeOrButton.gamepadIndex,
                            key: gamepadButtons[buttonIndex]!,
                        })
                    }

                    if (options.preventDefault ?? defaultControlOptions?.preventDefault ?? true) doPreventDefault()
                    if ((options.disabled ?? defaultControlOptions?.disabled) && buttonPressed) continue
                    void this.emit(buttonPressed ? 'triggerGrouped' : 'releaseGrouped', emitData as any)
                }

            if (inputSchema.movementKeymap && 'code' in codeOrButton) {
                const movementKeys = getMovementKeysGroup(inputSchema.movementKeymap)
                let keyIndex = movementKeys.indexOf(codeOrButton.code)
                if (keyIndex !== -1) {
                    // lodash-marker
                    if (keyIndex >= keysMovementConfig.length) keyIndex -= keysMovementConfig.length
                    const movementAction = keysMovementConfig[keyIndex]!
                    currentMovementVector.keyboard[movementAction[0]] += movementAction[1] * (buttonPressed ? 1 : -1)
                    updateMovementVector({ keyboard: true })
                }
            }
        }

        const keyboardEvent = (e: KeyboardEvent) => {
            if (requireTrusted && !e.isTrusted) return
            const keydownEvent = e.type === 'keydown'

            let { code } = e
            const fixedCode = Object.entries(mapKeyboardCodes).find(([wrongCode]) => code === wrongCode)
            if (fixedCode) code = fixedCode[1]

            // interesting thing. todo: cover with all possible tests
            const codeWithoutSide = /^(.+?)(Left|Right)$/.exec(code)?.[1]
            const codes = codeWithoutSide ? [code, codeWithoutSide] : [code]
            for (const code of codes)
                pressedKeyOrButtonChanged({ code: code as AllKeyCodes }, keydownEvent, { preventDefault: e.preventDefault.bind(e) })
        }

        // BIND EVENTS
        bindEventListeners(target, {
            keydown: keyboardEvent,
            keyup: keyboardEvent,
        })

        const visibilitychangeListener = () => {
            if (document.visibilityState !== 'hidden') return
            for (const code of this.pressedKeys) pressedKeyOrButtonChanged({ code }, false)
        }

        // For now, all browsers don't fire "keyup" event if the user released key after alt+tab or tab switch
        // This should show the difference between libraries for apps and games
        if (additionalEventHandlers) document.addEventListener('visibilitychange', visibilitychangeListener)
        // NOTE: The method above still doesn't work with cmd+tab on macos but there is nothing I can with it

        const gamepadsStore = new GamepadsStore()
        let pollingInterval: undefined | number
        gamepadsStore.on('firstConnected', () => {
            type ButtonsState = {
                [gamepadIndex: number]: boolean[]
            }

            let prevPressedButtons: ButtonsState = []
            pollingInterval = setInterval(() => {
                const allConnectedGamepads = [...gamepadsStore.connectedGamepads]
                // TODO handle disablement in other way
                // Polling interval would stop if there is no gamepads
                const gamepads: Gamepad[] =
                    listenGamepadsStrategy === 'only-first-gamepad'
                        ? [allConnectedGamepads[0]!]
                        : listenGamepadsStrategy === 'only-last-gamepad'
                        ? [allConnectedGamepads.at(-1)!]
                        : listenGamepadsStrategy === 'all-gamepads'
                        ? allConnectedGamepads
                        : []
                const newPressedButtons: ButtonsState = Object.fromEntries(
                    gamepads.map(({ index: gamepadIndex, buttons }) => [
                        gamepadIndex,
                        GamepadsStore.getConnectedGamepads()
                            .find(({ index }) => index === gamepadIndex)!
                            .buttons.map(({ pressed }) => pressed),
                    ]),
                )
                for (const [gamepadIndex, pressedButtons] of Object.entries(newPressedButtons))
                    for (const [buttonIndex, buttonState] of pressedButtons.entries()) {
                        // TODO think about better name
                        let pressEvent = undefined as undefined | boolean
                        if (buttonState && !prevPressedButtons[gamepadIndex]?.[buttonIndex]) pressEvent = true
                        if (!buttonState && prevPressedButtons[gamepadIndex]?.[buttonIndex] === true) pressEvent = false
                        if (pressEvent !== undefined) pressedKeyOrButtonChanged({ button: getButtonLabel(+buttonIndex)!, gamepadIndex }, pressEvent)
                    }

                for (const gamepad of gamepads) {
                    const newMovement = GamepadsStore.queryStick(
                        'left',
                        GamepadsStore.getConnectedGamepads().find(({ index }) => index === gamepad.index)!,
                    )
                    if (!currentMovementVector.gamepads[gamepad.index]) currentMovementVector.gamepads[gamepad.index] = getInitialMovementVector()
                    const gamepadVector = currentMovementVector.gamepads[gamepad.index]!
                    if (gamepadVector.x === newMovement.x && gamepadVector.y === newMovement.y) continue
                    gamepadVector.x = newMovement.x
                    gamepadVector.y = newMovement.y
                    updateMovementVector({ gamepadIndex: gamepad.index })
                }

                prevPressedButtons = newPressedButtons
            }, gamepadPollingInterval) as unknown as number
        })
        gamepadsStore.on('lastDisconnected', () => {
            clearInterval(pollingInterval)
        })
    }

    // query: <K extends keyof T>(category: K, command: keyof T[K], type?: BasicInputType) => boolean
    // setTriggered: <K extends keyof T>(category: K, command: keyof T[K], state: boolean | 'toggle') => void
    // cleanup fn?

    trigger<T1 extends keyof T>(category: T1, command: keyof T[T1]) {
        const eventData = {
            command: `${category as string}.${command as string}` as any,
            schema: this.inputSchema.commands[category]![command]!,
        }
        void this.emit('trigger', eventData)
        void this.emit('release', eventData)
    }

    triggerGroupedCommand<K1 extends keyof K>(
        category: K1,
        command: keyof K[K1],
        indexOrKey: (K[K1] extends [Array<infer U>, ...any] ? U : string) | number,
    ) {
        if (!this.inputSchema.groupedCommands) throw new Error('No grouped commands defined')
        // TODO
        const schema = this.inputSchema.groupedCommands[category as any]![command as any]!
        const eventData = {
            command: `${category as string}.${command as string}` as any,
            schema,
            type: 'keyboard',
            // TODO!
            index: null!,
            key: null!,
            // ...typeof indexOrKey === 'string' ? {
            //     index: schema[]
            // }
            // index: keyIndex,
            // key: keyboardKeys[keyIndex]!,
        } as const
        void this.emit('triggerGrouped', eventData)
        void this.emit('releaseGrouped', eventData)
    }
}
