import { GamepadsStore } from '../src/gamepadStore'

const { expect } = chai

const getGamepadButtonState = (state: boolean) => (state ? { pressed: true, touched: true, value: 1 } : { pressed: false, touched: false, value: 0 })

// These tests are not comprehensive. the library mainly is still tested manually

describe('GamepadStore', () => {
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
    const gamepadStore = new GamepadsStore()
    window.navigator.getGamepads = function () {
      return [gamepad];
    };

    const connectGamepad = () => {
        const event = new Event('gamepadconnected')
        // https://github.com/alvaromontoro/gamepad-simulator/blob/master/src/index.js
        //@ts-ignore
        event.gamepad = gamepad
        window.dispatchEvent(event)
    }
    const disconnectGamepad = () => {
        const event = new Event('gamepaddisconnected')
        //@ts-ignore
        event.gamepad = gamepad
        window.dispatchEvent(event)
    }

    it('connects', () => {
        return new Promise<void>(resolve => {
            gamepadStore.on('firstConnected', () => {
                resolve()
            })
            connectGamepad()
            expect(gamepadStore.connectedGamepads).to.deep.equal([gamepad])
        })
    })
    it('disconnects', () => {
        return new Promise<void>(resolve => {
            gamepadStore.on('lastDisconnected', () => {
                resolve()
            })
            disconnectGamepad()
            expect(gamepadStore.connectedGamepads).to.deep.equal([])
        })
    })

    describe('quering', () => {
        afterEach(() => {
            disconnectGamepad()
        })
        it('queries button', () => {
            connectGamepad()
            gamepadStore.
        })
    })
})

mocha.run()
