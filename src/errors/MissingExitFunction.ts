export class MissingExitFunction extends Error {
    public constructor(message: string) {
        super();
        this.message = message;
    }
}
