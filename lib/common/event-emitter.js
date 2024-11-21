export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.on = this.addListener;
        this.off = this.removeListener;
    }
    addListener(eventName, listener) {
        const eventSet = this.events.get(eventName);
        if (eventSet === undefined) {
            this.events.set(eventName, new Set([listener]));
        }
        else {
            eventSet.add(listener);
        }
    }
    removeListener(eventName, listener) {
        const eventSet = this.events.get(eventName);
        if (eventSet === undefined)
            return;
        eventSet.delete(listener);
        if (eventSet.size === 0) {
            this.events.delete(eventName);
        }
    }
    emit(eventName, event) {
        this.events.get(eventName)?.forEach((listener) => {
            listener.apply(this, [event]);
        });
    }
}
//# sourceMappingURL=event-emitter.js.map