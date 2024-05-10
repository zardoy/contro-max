import TypedEmitter, { EventMap } from 'typed-emitter'
import { EventEmitter } from 'events'

export class TypedEventEmitter<T extends EventMap> extends (EventEmitter as { new <T>(): TypedEmitter<T & EventMap> })<T> {}
