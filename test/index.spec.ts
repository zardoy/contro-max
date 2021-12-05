import { GamepadsStore } from '../src/inputs/gamepad'
import Emittery from 'emittery'

const getGamepadButtonState = (state: boolean) => (state ? { pressed: true, touched: true, value: 1 } : { pressed: false, touched: false, value: 0 })

describe('GamepadsStore', () => {
    let gamepadStore: GamepadsStore
    const windowEmitter = new Emittery<Pick<WindowEventMap, 'gamepadconnected' | 'gamepaddisconnected'>>()
    const gamepad: Gamepad = {
        axes: [0, 0, 0, 0],
        buttons: Array.from({ length: 17 }, () => getGamepadButtonState(false)),
        connected: true,
        // not used
        hapticActuators: undefined!,
        id: 'Xbox One Controller (STANDARD GAMEPAD Vendor: 045e Product: 02ea)',
        index: 0,
        mapping: 'standard',
        timestamp: Math.floor(Date.now() / 1000),
    }
    beforeAll(() => {
        //@ts-ignore
        globalThis.window = {
            addEventListener: windowEmitter.on.bind(windowEmitter),
        }
        //@ts-ignore
        globalThis.navigator = {}
        gamepadStore = new GamepadsStore()
    })
    it('connects', () => {
        gamepadStore.on('firstConnected', connectedGamepad => {
            expect(connectedGamepad).toBe(gamepad)
        })
        windowEmitter.emit('gamepadconnected', { type: 'gamepadconnected', gamepad } as any)
        expect(gamepadStore.connectedGamepads).toEqual([gamepad])
    })
    it('disconnects', () => {
        gamepadStore.on('lastDisconnected', connectedGamepad => {
            expect(connectedGamepad).toBe(gamepad)
        })
        windowEmitter.emit('gamepaddisconnected', { type: 'gamepaddisconnected', gamepad } as any)
        expect(gamepadStore.connectedGamepads).toEqual([])
    })
})
