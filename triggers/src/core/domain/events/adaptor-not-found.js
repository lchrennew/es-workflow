import DomainEvent from "./domain-event.js";

export default class AdaptorNotFound extends DomainEvent {
    constructor(adaptor, error, ...chain) {
        super({ adaptor, error }, ...chain);
    }
}
