import { EventEmitter } from "./common/event-emitter.js";
export { EventEmitter, EventEmitter as Emitter };
export function createEmitter() {
    return new EventEmitter();
}
export function listenTo(emitter) {
    return {
        addListener: emitter.addListener.bind(emitter),
        removeListener: emitter.removeListener.bind(emitter),
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
    };
}
export function merge(a, b) {
    const merged = createEmitter();
    const aEmit = a.emit;
    const bEmit = b.emit;
    a.emit = (eventName, event) => {
        aEmit.call(a, eventName, event);
        merged.emit(eventName, event);
    };
    b.emit = (eventName, event) => {
        bEmit.call(b, eventName, event);
        merged.emit(eventName, event);
    };
    return merged;
}
//# sourceMappingURL=events.js.map