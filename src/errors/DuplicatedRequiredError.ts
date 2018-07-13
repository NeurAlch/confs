export class DuplicatedRequiredError extends Error {
    public constructor(message: string) {
        super();
        this.message = message;
    }
}
