export interface EventTargetElem {
    addEventListener(type: string, listener: (event: any) => any): void
}
