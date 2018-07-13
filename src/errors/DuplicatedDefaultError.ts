export class DuplicatedDefaultError extends Error {
    public constructor(message: string) {
        super();
        this.message = message;
    }
}
