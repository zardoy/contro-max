import { ControMax } from '../src/controMax'

// controls labels: forward/back left/right sneak toggle sneak

const controls = new ControMax({
    commands: {
        movement: {
            jump: ['Space', 'A'],
        },
        mod: {
            doSomething: ['Alt'],
        },
    },
    groupedCommands: {
        core: {
            press: [['Digit0', 'Digit2'], []],
        },
    },
    movementKeymap: 'WASD',
    movementVector: '2d',
})

controls.on('movementUpdate', data => {
    console.log('vector', data)
})

controls.on('trigger', ({ command }) => {
    console.log(command)
})

// schema.on('trigger', ({ command }) => {
//     if (stringStartsWith(command, 'core')) {
//         // if (command === '')
//     }
// })
