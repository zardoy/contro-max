/// <reference types="@zardoy/tsconfig" />
// its ok. we should provide this fix globally

interface GamepadEffectParameters {
    duration?: number
    startDelay?: number
    // intensity (0-1) of the small / big ERM
    strongMagnitude?: number
    weakMagnitude?: number
}

// interface augmentation
interface Gamepad {
    /** chromium browsers! */
    vibrationActuator: {
        type: 'dual-rumble'
        reset(): Promise<void>
        playEffect(type: Gamepad['vibrationActuator']['type'], options: GamepadEffectParameters): Promise<void>
    }
}
