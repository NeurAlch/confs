var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./errors/DuplicatedDefaultError", "./errors/DuplicatedRequiredError", "./errors/MissingExitFunction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DuplicatedDefaultError_1 = require("./errors/DuplicatedDefaultError");
    exports.DuplicatedDefaultError = DuplicatedDefaultError_1.DuplicatedDefaultError;
    var DuplicatedRequiredError_1 = require("./errors/DuplicatedRequiredError");
    exports.DuplicatedRequiredError = DuplicatedRequiredError_1.DuplicatedRequiredError;
    var MissingExitFunction_1 = require("./errors/MissingExitFunction");
    exports.MissingExitFunction = MissingExitFunction_1.MissingExitFunction;
    var getDuplicated = function (values) {
        var seen = new Set();
        return values.filter(function (item) {
            if (seen.has(item)) {
                return true;
            }
            seen.add(item);
            return false;
        });
    };
    var getStringFn = function (options) { return function (config) {
        var value;
        if (options.env[config] !== undefined) {
            value = options.env[config];
        }
        else if (options.defaults && options.defaults.string && options.defaults.string[config] !== undefined) {
            value = options.defaults.string[config];
        }
        else if (options.throwOnNotFound === true) {
            throw new Error("Did not find STRING option " + config);
        }
        if (value !== undefined && typeof value !== "string") {
            throw new Error("Invalid value for " + config);
        }
        return value;
    }; };
    var getBooleanFn = function (options) { return function (config) {
        var value;
        if (options.env[config] !== undefined) {
            value = options.env[config];
        }
        else if (options.defaults && options.defaults.boolean && options.defaults.boolean[config] !== undefined) {
            value = options.defaults.boolean[config];
        }
        else if (options.throwOnNotFound === true) {
            throw new Error("Did not find BOOLEAN option " + config);
        }
        if (value === "true") {
            value = true;
        }
        else if (value === "false") {
            value = false;
        }
        if (value !== undefined && typeof value !== "boolean") {
            throw new Error("Invalid value for " + config);
        }
        return value;
    }; };
    var getNumberFn = function (options) { return function (config) {
        var value;
        if (options.env[config] !== undefined) {
            value = options.env[config];
        }
        else if (options.defaults && options.defaults.number && options.defaults.number[config] !== undefined) {
            value = options.defaults.number[config];
        }
        else if (options.throwOnNotFound === true) {
            throw new Error("Did not find NUMBER option " + config);
        }
        if (value !== undefined && (typeof value !== "number" || isNaN(value) === true)) {
            throw new Error("Invalid value for " + config);
        }
        return value;
    }; };
    var checkRequired = function (options) {
        var requiredN = options.required && options.required.number ? options.required.number : [];
        var requiredS = options.required && options.required.string ? options.required.string : [];
        var requiredB = options.required && options.required.boolean ? options.required.boolean : [];
        var required = requiredN.concat(requiredS, requiredB);
        var duplicateRequired = getDuplicated(required);
        if (duplicateRequired.length > 0) {
            throw new DuplicatedRequiredError_1.DuplicatedRequiredError("Found duplicated required options: " + duplicateRequired.join(", "));
        }
        for (var _i = 0, required_1 = required; _i < required_1.length; _i++) {
            var k = required_1[_i];
            if (options.env[k] === undefined) {
                var err = "Option " + k + " not found";
                if (options.exitOnMissingRequired === true && options.exit) {
                    options.exit(err);
                }
                else {
                    throw Error(err);
                }
            }
        }
    };
    var checkDuplicatedDefaults = function (options) {
        var defaultN = options.defaults && options.defaults.number ? options.defaults.number : [];
        var defaultS = options.defaults && options.defaults.string ? options.defaults.string : [];
        var defaultB = options.defaults && options.defaults.boolean ? options.defaults.boolean : [];
        var defaults = Object.keys(defaultB).concat(Object.keys(defaultN), Object.keys(defaultS));
        var duplicateDefaults = getDuplicated(defaults);
        if (duplicateDefaults.length > 0) {
            throw new DuplicatedDefaultError_1.DuplicatedDefaultError("Found duplicated default options: " + duplicateDefaults.join(", "));
        }
    };
    var confs = function (opts) {
        // TODO: Check that env is an object
        // TODO: Check that required is an object, also its children are lists of strings
        // TODO: Check that defaults is an object, also its children
        var options = __assign({}, opts);
        var env = __assign({}, opts.env);
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
            throw new MissingExitFunction_1.MissingExitFunction("Missing exit function");
        }
        checkRequired(options);
        checkDuplicatedDefaults(options);
        if (options.transformBooleanStrings === true) {
            var keys = Object.keys(options.env);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (options.env[key] === "true") {
                    options.env[key] = true;
                }
                else if (options.env[key] === "false") {
                    options.env[key] = false;
                }
            }
        }
        if (options.transformNumberStrings === true) {
            var keys = Object.keys(options.env);
            for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
                var key = keys_2[_a];
                var value = options.env[key];
                if (value !== undefined && typeof value === "string") {
                    value = parseFloat(value);
                    if (isNaN(value) === false) {
                        options.env[key] = value;
                    }
                }
            }
        }
        var B = getBooleanFn(options);
        var N = getNumberFn(options);
        var S = getStringFn(options);
        return Object.freeze({
            B: B,
            N: N,
            S: S,
            boolean: B,
            number: N,
            string: S,
        });
    };
    exports.confs = confs;
});
