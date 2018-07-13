import { DuplicatedDefaultError } from "./errors/DuplicatedDefaultError";
import { DuplicatedRequiredError } from "./errors/DuplicatedRequiredError";
import { MissingExitFunction } from "./errors/MissingExitFunction";
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
declare type getBooleanFn = (config: string) => boolean | undefined;
declare type getNumberFn = (config: string) => number | undefined;
declare type getStringFn = (config: string) => string | undefined;
declare const getStringFn: (options: IConfsOptions) => getStringFn;
declare const getBooleanFn: (options: IConfsOptions) => getBooleanFn;
declare const getNumberFn: (options: IConfsOptions) => getNumberFn;
declare const confs: (opts: IConfsOptions) => IConfs;
export { confs, IConfsOptions, DuplicatedRequiredError, DuplicatedDefaultError, MissingExitFunction, };
