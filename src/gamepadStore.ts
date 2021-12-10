import Emittery from 'emittery'
import { findButtonNumber, GamepadButtonName } from './gamepad'

export interface GamepadStick {
    label: string
    xAxis: number
    yAxis: number
}

export const gamepadSticks: { [id in 'left' | 'right']: GamepadStick } = {
    left: { label: 'Left stick', xAxis: 0, yAxis: 1 },
    right: { label: 'Right stick', xAxis: 2, yAxis: 3 },
}

// TODO!
// if (gamepad.timestamp > this.gamepadTimestamp) {

type WhichGamepad = 'all' | 0 | 1 | 2 | 3

export class GamepadsStore extends Emittery<{
    firstConnected: Gamepad
    lastDisconnected: undefined
    /** Emits only after queried */
    nowPrefersGamepad: undefined
}> {
    // static getConnectedGamepadIndexes() {
    //     return new Set((navigator.getGamepads().filter(Boolean) as Gamepad[]).map(gamepad => gamepad.index))
    // }
    static getConnectedGamepads() {
        return [...navigator.getGamepads()].filter(Boolean) as Gamepad[]
    }

    static queryButton(whichGamepad: WhichGamepad, button: number | GamepadButtonName): boolean {
        const buttonNumber = findButtonNumber(button)
        if (whichGamepad === 'all') return navigator.getGamepads().some(gamepad => gamepad?.buttons[buttonNumber]!.pressed)

        return !!navigator.getGamepads()[whichGamepad]?.buttons[buttonNumber]!.pressed
    }

    static queryStick(stick: keyof typeof gamepadSticks | GamepadStick, gamepad: Gamepad): { x: number; y: number } {
        // const gamepadConnectedIndex =
        //     which === 'first'
        //         ? 0
        //         : which === 'last'
        //         ? this.connectedGamepads.length - 1
        //         : this.connectedGamepads.findIndex(({ index }) => index === which)
        // const gamepad = this.connectedGamepads[gamepadConnectedIndex]
        if (gamepad === undefined) throw new Error('Queried disconnected gamepad')

        const resolvedStick: GamepadStick = typeof stick === 'string' ? gamepadSticks[stick] : stick
        // if (!this.isConnected()) return?

        return {
            x: gamepad.axes[resolvedStick.xAxis]!,
            y: gamepad.axes[resolvedStick.yAxis]!,
        }
    }

    public connectedGamepadIndexes = GamepadsStore.getConnectedGamepadIndexes()

    constructor() {
        super()
        // public enabledGamepad: WhichGamepad = 'all', // public gamepadButtonsMap
        window.addEventListener('gamepadconnected', this.gamepadEvent)
        window.addEventListener('gamepaddisconnected', this.gamepadEvent)
    }

    // dispose() {
    //     window.removeEventListener('gamepadconnected', this.gamepadEvent)
    //     window.removeEventListener('gamepaddisconnected', this.gamepadEvent)
    // }

    gamepadEvent = ({ gamepad, type, ...rest }: GamepadEvent) => {
        const connectedGamepadsLength = this.connectedGamepads.length
        if (type === 'gamepadconnected') {
            if (gamepad.mapping !== 'standard') {
                console.warn(`Unknown gamepad mapping ${gamepad.mapping}. Ignoring..`)
                return
            }

            this.connectedGamepads.push(gamepad)
        } else {
            const gamepadIndex = this.connectedGamepads.indexOf(gamepad)
            // Is this even possible?
            // if (gamepadIndex === -1) this.connectedGamepads = GamepadsStore.getConnectedGamepads()
            this.connectedGamepads.splice(gamepadIndex, 1)
        }

        if (connectedGamepadsLength === 0 && this.connectedGamepads.length > 0)
            void this.emit('firstConnected', this.connectedGamepads.values().next().value)
        if (connectedGamepadsLength > 0 && this.connectedGamepads.length === 0) void this.emit('lastDisconnected')
    }
}

// export const createGamepadsStore = () => {
//   const ,
//     disabledGamepadIndexes: number[] = [];

//   return {
//     connectedGamepads,
//     /**
//      * @returns `false` if was already enabled
//      */
//     disableGamepad: (gamepadIndex: number) => !disabledGamepadIndexes.includes(gamepadIndex) && (disabledGamepadIndexes.push(gamepadIndex), true),
//     /**
//      * @returns `false` if was already enabled
//      */
//     enableGamepad: (gamepadIndex: number) => disabledGamepadIndexes.includes(gamepadIndex) &&
//       (disabledGamepadIndexes.splice(disabledGamepadIndexes.indexOf(gamepadIndex), 1), true),
//     /**
//      * @returns whether button is pressed
//      */
//     queryButton: (button: string): boolean => {

//     },
//     queryButton: (button: string | number) => {
//       const buttonNumber = findButtonNumber(button);
//       return buttonNumber;
//     }
//   };
// };
