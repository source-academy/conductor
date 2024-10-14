/** A subscriber of a channel. */
type Subscriber<T> = (data: T) => void;

export type { Subscriber as default };
