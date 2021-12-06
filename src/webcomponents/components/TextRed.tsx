import { Component, Listen, State, h } from '@stencil/core'

@Component({
    tag: 'text-red',
})
export class McButton {
    render() {
        return <div style={{ color: 'red' }}>test</div>
    }
}
