export class ConfsError extends Error {
    public constructor(message: string) {
        super();
        this.message = message;
    }
}

interface IConfsOptions {
    defaults?: {
        boolean?: {
            [index: string]: boolean;
        };
        number?: {
            [index: string]: number;
        };
        string?: {
            [index: string]: string;
        };
    };
    env: {
        [index: string]: string | number | boolean;
    };
    exitOnMissingRequired?: boolean;
    required?: {
        boolean?: string[];
        number?: string[];
        string?: string[];
    };
    throwOnNotFound?: boolean;
    transformBooleanStrings?: boolean;
    transformNumberStrings?: boolean;
    exit?(message: string): void;
}

interface IConfs {
    B: getBooleanFn;
    N: getNumberFn;
    S: getStringFn;
    boolean: getBooleanFn;
    number: getNumberFn;
    string: getStringFn;
}

type getBooleanFn = (config: string) => boolean | undefined;
type getNumberFn = (config: string) => number | undefined;
type getStringFn = (config: string) => string | undefined;

const getDuplicated = (values: string[]): string[] => {
    const seen = new Set();

    return values.filter((item: string): boolean => {
        if (seen.has(item)) {
            return true;
        }
        seen.add(item);

        return false;
    });
};

const getStringFn = (options: IConfsOptions): getStringFn => (config: string): string | undefined => {

    let value: number | boolean | string | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.string && options.defaults.string[config] !== undefined) {
        value = options.defaults.string[config];
    } else if (options.throwOnNotFound === true) {
        throw new ConfsError(`Did not find STRING option ${config}`);
    }

    if (value !== undefined && typeof value !== "string") {
        throw new ConfsError(`Invalid value for ${config}`);
    }

    return value;

};

const getBooleanFn = (options: IConfsOptions): getBooleanFn => (config: string): boolean | undefined => {

    let value: number | boolean | string | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.boolean && options.defaults.boolean[config] !== undefined) {
        value = options.defaults.boolean[config];
    } else if (options.throwOnNotFound === true) {
        throw new ConfsError(`Did not find BOOLEAN option ${config}`);
    }

    if (value === "true") {
        value = true;
    } else if (value === "false") {
        value = false;
    }

    if (value !== undefined && typeof value !== "boolean") {
        throw new ConfsError(`Invalid value for ${config}`);
    }

    return value;

};

const getNumberFn = (options: IConfsOptions): getNumberFn => (config: string): number | undefined => {

    let value: string | number | boolean | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.number && options.defaults.number[config] !== undefined) {
        value = options.defaults.number[config];
    } else if (options.throwOnNotFound === true) {
        throw new ConfsError(`Did not find NUMBER option ${config}`);
    }

    if (value !== undefined && (typeof value !== "number" || isNaN(value) === true)) {
        throw new ConfsError(`Invalid value for ${config}`);
    }

    return value;

};

const checkRequired = (options: IConfsOptions): void => {

    const requiredN = options.required && options.required.number ? options.required.number : [];
    const requiredS = options.required && options.required.string ? options.required.string : [];
    const requiredB = options.required && options.required.boolean ? options.required.boolean : [];

    const required: string[] = [
        ...requiredN,
        ...requiredS,
        ...requiredB,
    ];

    const duplicateRequired: string[] = getDuplicated(required);

    if (duplicateRequired.length > 0) {
        throw new ConfsError(`Found duplicated required options: ${duplicateRequired.join(", ")}`);
    }

    for (const k of required) {

        if (options.env[k] === undefined) {

            const err = `Option ${k} not found`;

            if (options.exitOnMissingRequired === true && options.exit) {
                options.exit(err);
            } else {
                throw new ConfsError(err);
            }

        }

    }

};

const checkDuplicatedDefaults = (options: IConfsOptions): void => {

    const defaultN = options.defaults && options.defaults.number ? options.defaults.number : [];
    const defaultS = options.defaults && options.defaults.string ? options.defaults.string : [];
    const defaultB = options.defaults && options.defaults.boolean ? options.defaults.boolean : [];

    const defaults: string[] = [
        ...Object.keys(defaultB),
        ...Object.keys(defaultN),
        ...Object.keys(defaultS),
    ];

    const duplicateDefaults: string[] = getDuplicated(defaults);

    if (duplicateDefaults.length > 0) {
        throw new ConfsError(`Found duplicated default options: ${duplicateDefaults.join(", ")}`);
    }

};

const getCopy = (opts: IConfsOptions): IConfsOptions => {

    const options: IConfsOptions = {
        transformBooleanStrings: opts.transformBooleanStrings,
        transformNumberStrings: opts.transformNumberStrings,
        exitOnMissingRequired: opts.exitOnMissingRequired,
        throwOnNotFound: opts.throwOnNotFound,
        exit: opts.exit,
        defaults: {
            boolean: {},
            number: {},
            string: {},
        },
        required: {
            boolean: [],
            number: [],
            string: [],
        },
        env: {},
    };

    if (opts.required) {
        options.required = { ...opts.required };
    }

    const env = { ...opts.env };

    if (opts.defaults && options.defaults) {

        if (opts.defaults.boolean) {
            options.defaults.boolean = { ...opts.defaults.boolean };
        }

        if (opts.defaults.number) {
            options.defaults.number = { ...opts.defaults.number };
        }

        if (opts.defaults.string) {
            options.defaults.string = { ...opts.defaults.string };
        }

    }

    options.env = env;

    return options;

}

const setDefaults = (options: IConfsOptions): void => {

    if (options.throwOnNotFound === undefined) {
        options.throwOnNotFound = false;
    }

    if (options.exitOnMissingRequired === undefined) {
        options.exitOnMissingRequired = true;
    }

    if (options.transformBooleanStrings === undefined) {
        options.transformBooleanStrings = false;
    }

    if (options.transformNumberStrings === undefined) {
        options.transformNumberStrings = false;
    }

}

const transform = (options: IConfsOptions): void => {

    if (options.transformBooleanStrings === true || options.transformNumberStrings === true) {

        const keys: string[] = Object.keys(options.env);

        for (const key of keys) {

            let value = options.env[key];

            if (options.transformBooleanStrings === true) {

                if (value === "true") {
                    options.env[key] = true;
                } else if (value === "false") {
                    options.env[key] = false;
                }

            }

            if (options.transformNumberStrings === true) {

                if (value !== undefined && typeof value === "string") {
                    value = parseFloat(value);
                    if (isNaN(value) === false) {
                        options.env[key] = value;
                    }
                }

            }

        }

    }

    if (options.transformBooleanStrings === true && (options.defaults && options.defaults.boolean)) {

        const keys: string[] = Object.keys(options.defaults.boolean);

        for (const key of keys) {

            let value = options.defaults.boolean[key];

            if (typeof value === "string") {

                if (value === "true") {
                    options.defaults.boolean[key] = true;
                } else if (value === "false") {
                    options.defaults.boolean[key] = false;
                }

            }

        }

    }

    if (options.transformNumberStrings === true && (options.defaults && options.defaults.number)) {

        const keys: string[] = Object.keys(options.defaults.number);

        for (const key of keys) {

            let value = options.defaults.number[key];

            if (value !== undefined && typeof value === "string" && /^\d+$/.test(value)) {
                value = parseFloat(value);
                if (isNaN(value) === false) {
                    options.defaults.number[key] = value;
                }
            }

        }

    }

}

const isObject = (obj: any): boolean => {

    if (obj === undefined || obj === null) {
        return false;
    }

    if (typeof obj !== "object") {
        return false;
    }

    if (obj.constructor !== Object) {
        return false;
    }

    if (obj instanceof Array) {
        return false;
    }

    if (obj instanceof Date) {
        return false;
    }

    return true;

}

const isArray = (arr: any): boolean => {

    if (arr === undefined || arr === null) {
        return false
    }

    if (arr instanceof Array) {
        return true;
    }

    return false;

}

const checkRequiredArrayOfStrings = (arr: any[]): void => {

    for (const a of arr) {
        if (typeof a === "string" || a instanceof String) {
            continue;
        } else {
            throw new ConfsError(`Invalid required option ${a} should be a string`);
        }
    }

}

const checkTypes = (opts: IConfsOptions): void => {

    if (opts.env === undefined || isObject(opts.env) === false) {
        throw new ConfsError("env option should be an object");
    }

    if (opts.defaults !== undefined) {

        if (isObject(opts.defaults) === false) {
            throw new ConfsError("defaults option should be an object");
        }

        if (opts.defaults.boolean !== undefined && isObject(opts.defaults.boolean) === false) {
            throw new ConfsError("defaults.boolean option should be an object");
        }

        if (opts.defaults.number !== undefined && isObject(opts.defaults.number) === false) {
            throw new ConfsError("defaults.number option should be an object");
        }

        if (opts.defaults.string !== undefined && isObject(opts.defaults.string) === false) {
            throw new ConfsError("defaults.string option should be an object");
        }

    }

    if (opts.required !== undefined) {

        if (isObject(opts.required) === false) {
            throw new ConfsError("required option should be an object");
        }

        if (opts.required.boolean !== undefined) {
            if (isArray(opts.required.boolean) === false) {
                throw new ConfsError("required.boolean option should be an array");
            } else {
                checkRequiredArrayOfStrings(opts.required.boolean);
            }
        }

        if (opts.required.number !== undefined) {
            if (isArray(opts.required.number) === false) {
                throw new ConfsError("required.number option should be an array");
            } else {
                checkRequiredArrayOfStrings(opts.required.number);
            }
        }

        if (opts.required.string !== undefined) {
            if (isArray(opts.required.string) === false) {
                throw new ConfsError("required.string option should be an array");
            } else {
                checkRequiredArrayOfStrings(opts.required.string);
            }
        }

    }

}

const confs = (opts: IConfsOptions): IConfs => {

    checkTypes(opts);

    const options = getCopy(opts);

    setDefaults(options);

    if (options.exitOnMissingRequired === true && options.exit === undefined) {
        throw new ConfsError("Missing exit function");
    }

    checkRequired(options);
    checkDuplicatedDefaults(options);
    transform(options);

    const B = getBooleanFn(options);
    const N = getNumberFn(options);
    const S = getStringFn(options);

    return Object.freeze({
        B,
        N,
        S,
        boolean: B,
        number: N,
        string: S,
    });

};

export {
    confs,
    IConfsOptions,
};
