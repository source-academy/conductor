export interface IIOMessage {
    // stream: number;
    message: string;

    /**
     * Distinguishes a runner-initiated request for input (carrying an optional prompt string
     * in `message`) from a plain standard-output chunk. Absent/"output" for ordinary output.
     */
    kind?: "output" | "inputRequest";
}
