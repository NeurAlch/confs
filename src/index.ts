import { DuplicatedDefaultError } from "./errors/DuplicatedDefaultError";
import { DuplicatedRequiredError } from "./errors/DuplicatedRequiredError";
import { MissingExitFunction } from "./errors/MissingExitFunction";

interface IConfuOptions {
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

interface IConfu {
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

const getStringFn = (options: IConfuOptions): getStringFn => (config: string): string | undefined => {

    let value: number | boolean | string | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.string && options.defaults.string[config] !== undefined) {
        value = options.defaults.string[config];
    } else if (options.throwOnNotFound === true) {
        throw new Error(`Did not find STRING option ${config}`);
    }

    if (value !== undefined && typeof value !== "string") {
        throw new Error(`Invalid value for ${config}`);
    }

    return value;

};

const getBooleanFn = (options: IConfuOptions): getBooleanFn => (config: string): boolean | undefined => {

    let value: number | boolean | string | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.boolean && options.defaults.boolean[config] !== undefined) {
        value = options.defaults.boolean[config];
    } else if (options.throwOnNotFound === true) {
        throw new Error(`Did not find BOOLEAN option ${config}`);
    }

    if (value === "true") {
        value = true;
    } else if (value === "false") {
        value = false;
    }

    if (value !== undefined && typeof value !== "boolean") {
        throw new Error(`Invalid value for ${config}`);
    }

    return value;

};

const getNumberFn = (options: IConfuOptions): getNumberFn => (config: string): number | undefined => {

    let value: string | number | boolean | undefined;

    if (options.env[config] !== undefined) {
        value = options.env[config];
    } else if (options.defaults && options.defaults.number && options.defaults.number[config] !== undefined) {
        value = options.defaults.number[config];
    } else if (options.throwOnNotFound === true) {
        throw new Error(`Did not find NUMBER option ${config}`);
    }

    if (value !== undefined && (typeof value !== "number" || isNaN(value) === true)) {
        throw new Error(`Invalid value for ${config}`);
    }

    return value;

};

const checkRequired = (options: IConfuOptions): void => {

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
        throw new DuplicatedRequiredError(`Found duplicated required options: ${duplicateRequired.join(", ")}`);
    }

    for (const k of required) {

        if (options.env[k] === undefined) {

            const err = `Option ${k} not found`;

            if (options.exitOnMissingRequired === true && options.exit) {
                options.exit(err);
            } else {
                throw Error(err);
            }

        }

    }

};

const checkDuplicatedDefaults = (options: IConfuOptions): void => {

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
        throw new DuplicatedDefaultError(`Found duplicated default options: ${duplicateDefaults.join(", ")}`);
    }

};

const confu = (opts: IConfuOptions): IConfu => {

    // TODO: Check that env is an object
    // TODO: Check that required is an object, also its children are lists of strings
    // TODO: Check that defaults is an object, also its children

    const options = { ...opts };
    const env = { ...opts.env };

    options.env = env;

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

    if (options.exitOnMissingRequired === true && options.exit === undefined) {
        throw new MissingExitFunction("Missing exit function");
    }

    checkRequired(options);
    checkDuplicatedDefaults(options);

    if (options.transformBooleanStrings === true) {

        const keys: string[] = Object.keys(options.env);

        for (const key of keys) {
            if (options.env[key] === "true") {
                options.env[key] = true;
            } else if (options.env[key] === "false") {
                options.env[key] = false;
            }
        }

    }

    if (options.transformNumberStrings === true) {

        const keys: string[] = Object.keys(options.env);

        for (const key of keys) {
            let value = options.env[key];
            if (value !== undefined && typeof value === "string") {
                value = parseFloat(value);
                if (isNaN(value) === false) {
                    options.env[key] = value;
                }
            }
        }

    }

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
    confu,
    IConfuOptions,
    DuplicatedRequiredError,
    DuplicatedDefaultError,
    MissingExitFunction,
};
