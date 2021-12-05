# Contro Max &middot; [![npm version][npm-version-badge]][npm-link] &middot; [![coverage][coverage-badge]][coverage-link]

Highly maintained fork of [Contro](https://github.com/shroudedcode/contro). Check out original repository!

![development status](https://img.shields.io/badge/status-in%20development-orange.svg)

> The package is ESM

## Why Fork?

- Not that complete
- Contro used `e.key` instead of `e.code` so your app/game [won't work](https://javascript.info/keyboard-events#event-code-and-event-key) with different layouts
- Fixed bugs with keyboard and `alt+tab`
- [DX] Great typings support!
- And more...

## Testing Input

<!-- TODO its obsolete, remove it -->
- Keyboard: <https://keycode.info> – you need `event.code`
- Gamepad: <https://gamepad-tester.com>
<!-- - These plus mobile (touch): TODO PLACE LIVE DEMO -->

Contro Max is a **framework** rather than library. The main goal is to give easiest way for handling all possible input types in web.

[API](https://paka.dev/npm/contro-max)

## Features

<!-- - Great Mobile support -->
<!-- - (optional) Control PS4 controller lighthouse -->
- (soon) Bundled UI for configuring Input
- Handles annoying edge cases where key was unpressed while alt+tabing, but...
- React hooks

todo: place a live demo here

## Usage

<!-- TODO rethink -->
`contro-max` doesn't share concept of being flexible and doesn't provide abstractions that would allow you to craft custom inputs (but maybe you shouldn't?). Instead, we suggest should define so called **schema** of all commands

### Define Controls

First of all, you need to create controls schema for your app/game:

```ts
export const controls = createControlsSchema({
    core: {
        openInventory: ["KeyE", "LB"]
    }
});
```

As you can see, schema is the object with event names and arrays: `[KeyboardKey, GamepadButton]`.

Also, you can add options for the event (options we'll cover later):

```ts
{ openInventory: ["KeyE", "LB", { disabled: true, /* other options */ }] }
```

If your event doesn't have binding for Gamepad, just don't pass anything:

```ts
{ sayHello: ["Comma"] } // or
{ sayHello: ["Comma", { /* event specific options */ }] }
```

If your command doesn't have default keyboard binding:

```ts
{ sayHello: null }
// or if you have to specify options
{ sayHello: [null, { /* event specific options */ }] }
// with gamepad button specified
{ sayHello: [null, "LB", { /* event specific options */ }] }
```

### Using Controls

Okay, when we defined schema, you can use it anywhere in your app for executing/listening to commands

### Trigger Programmatically

There are two ways of triggering:

1. Obvious and recommended:

```ts
controls.trigger()
// this will fire trigger and then release events with the given command
```

2. [Universal method](javascript.info/dispatch-events) (works not only with this library):

```ts
window.dispatchEvent(new KeyboardEvent("keydown", {
   code: "Escape"
}))
```

2. Elegant method:

```ts
controls.trigger("openInventory");
```

### React

Without global state:

```tsx
const DisplayControls: React.FC = () => {
   const {  } = useKeyboard(["space", "arrowKeys"], { preventDefault: true })
}
```

### Key Groups

- WASD
- Digits – all digits usual and Numpad

### Enablement

> (experimental)

Contro max would fire events only when it actually sees the canvas.

Here is how it works:

You specify `canvasElem` as an option for your `createControlsSchema`.
If you don't specify this feature won't and events will always fire skipping the check.

`createControlsSchema` start watching for the changes of `document.body`. When it detects change of its children (some root element is added or removed), the check is performed that element in center of the screen is `canvasElem`.

But with this approach you must ensure that **all modals and menus** are being showed in root of DOM (`document.body`). Most UI libraries does this for you (e.g. MUI).

Contro max doesn't rely on `document.activeElement` and instead would unlock controls only when

## Notes

TODO

<details>
<summary>Odd Gamepads</summary>

Gamepads like this the most probably won't work at all. (use tester above)
But if you're under Windows and OS sees gamepad as gamepad (not keyboard) or can remap buttons using [TocaEdit](https://www.x360ce.com/) in pair with vJoy, but it's quite not easy to do so I'll post instructions later here.
</details>

## Similar Libraries

- <https://www.npmjs.com/package/keyboardist>
- [Mousetrap](npmjs.com/mousetrap) - not that good
- [cheet.js](npmjs.com/cheet.js) - dead

[npm-version-badge]:
