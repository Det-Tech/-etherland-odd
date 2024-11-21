export declare type EventListener<E> = (event: E) => void;
export declare class EventEmitter<EventMap> {
    private readonly events;
    addListener<K extends keyof EventMap>(eventName: K, listener: EventListener<EventMap[K]>): void;
    removeListener<K extends keyof EventMap>(eventName: K, listener: EventListener<EventMap[K]>): void;
    on: <K extends keyof EventMap>(eventName: K, listener: EventListener<EventMap[K]>) => void;
    off: <K extends keyof EventMap>(eventName: K, listener: EventListener<EventMap[K]>) => void;
    emit<K extends keyof EventMap>(eventName: K, event: EventMap[K]): void;
}
