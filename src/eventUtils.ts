// TODO remove them
export const bindEventListeners = <K extends (...args: any) => any>(
    target: Record<'addEventListener' | 'removeEventListener', K>,
    events: { [e in Parameters<K>[0]]?: Parameters<K>[1] },
) => {
    for (const [event, listener] of Object.entries(events)) target.addEventListener(event, listener)

    return {
        cleanup() {
            for (const [event, listener] of Object.entries(events)) target.removeEventListener(event, listener)
        },
    }
}

const bindKeyboardEvents = (options: Record<'onkeydown' | 'onkeyup', () => Record<string, unknown>>) => {}
