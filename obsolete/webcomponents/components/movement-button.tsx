import { Component, Event, Listen, State, h, Prop, EventEmitter } from '@stencil/core'

@Component({
    tag: 'cm-movement-button',
    styleUrl: 'movement-button.styles.css',
})
export class McButton {
    @State() touching = false
    // not watching. should be static
    @Prop() type = 'arrow' as 'arrow' | 'circle'

    @Listen('click')
    handleClick() {
        this.touching = !this.touching
    }

    @Event() isTouchingChanged: EventEmitter<boolean>

    // would be good to move in its own util?
    @State() currentTouching = false
    private setIsTouching(newState: boolean, event?: PointerEvent) {
        if (this.currentTouching === newState) return
        const relatedTarget = event?.relatedTarget as HTMLElement
        if (event && event.type === 'pointerout' && relatedTarget?.parentElement === event.currentTarget) return
        this.currentTouching = newState
        this.isTouchingChanged.emit(this.currentTouching)
    }

    @Listen('visibilitychange', { target: 'document' })
    visibilityChangeHandler() {
        if (document.visibilityState === 'hidden') this.setIsTouching(false)
    }

    // in case of other Safari bugs
    @Listen('touchend', { target: 'body' })
    onTouchEnd(e: TouchEvent) {
        if (e.touches.length === 0) this.setIsTouching(false)
    }

    @Listen('pointerdown', { passive: false })
    releasePointerCapture(e: PointerEvent) {
        e.preventDefault()
        const target = e.target as HTMLElement
        if (!target.releasePointerCapture) return
        target.releasePointerCapture(e.pointerId)
    }

    @Listen('pointerover', { passive: false })
    onPointerOverHandler(event) {
        console.log(event.target)
        this.setIsTouching(true, event)
    }

    @Listen('pointerout', { passive: false })
    onPointerOutHandler(event) {
        this.setIsTouching(false, event)
    }

    @Listen('pointercancel', { passive: false })
    onPointerCancelHandler(event) {
        this.setIsTouching(false, event)
    }

    @Listen('contextmenu', { passive: false })
    // for tablets on windows
    onContextMenuHandler(event: Event) {
        event.preventDefault()
    }

    render() {
        return (
            <div class={{ 'cm-movement-button': true, 'cm-movement-button-touching': this.currentTouching }}>
                {this.type === 'arrow' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960">
                        <path d="m480 151.8-376 651.3h752z" stroke-width="10" stroke="#fff" fill="rgba(0, 0, 0, 0.5)" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" stroke="#fff" fill="none" stroke-width="10" />
                    </svg>
                )}
            </div>
        )
    }
}
