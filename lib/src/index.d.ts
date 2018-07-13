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
declare type getBooleanFn = (config: string) => boolean | undefined;
declare type getNumberFn = (config: string) => number | undefined;
declare type getStringFn = (config: string) => string | undefined;
declare const getStringFn: (options: IConfuOptions) => getStringFn;
declare const getBooleanFn: (options: IConfuOptions) => getBooleanFn;
declare const getNumberFn: (options: IConfuOptions) => getNumberFn;
declare const confu: (opts: IConfuOptions) => IConfu;
export { confu, IConfuOptions, DuplicatedRequiredError, DuplicatedDefaultError, MissingExitFunction, };
