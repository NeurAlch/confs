"use strict";
// tslint:disable:no-implicit-dependencies newline-per-chained-call no-unused-expression no-magic-numbers
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var chai = require("chai");
var mocha_1 = require("mocha");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var index_1 = require("../src/index");
var base = {
    defaults: {
        boolean: {},
        number: {},
        string: {}
    },
    env: {},
    exit: function (message) { return (message); },
    required: {
        boolean: [],
        number: [],
        string: []
    }
};
mocha_1.describe("Confu", function () {
    mocha_1.it("Does not mutate options object passed", function () {
        var ourEnv = {
            yes: "true"
        };
        var configOne = __assign({}, base, { env: ourEnv, transformBooleanStrings: true });
        index_1.confu(configOne);
        expect(configOne.throwOnNotFound).to.be.undefined;
        expect(configOne.exitOnMissingRequired).to.be.undefined;
        expect(typeof ourEnv.yes).to.be.equal("string");
    });
    mocha_1.it("Checks for missing exit function when exitOnRequiredMissing is default or true", function () {
        var configOne = __assign({}, base);
        // tslint:disable-next-line:no-dynamic-delete no-string-literal
        delete configOne["exit"];
        expect(function () { return index_1.confu(configOne); }).to["throw"]("Missing exit function");
    });
    mocha_1.it("Checks for duplicate required options", function () {
        var configOne = __assign({}, base, { required: {
                boolean: ["one"],
                number: ["one", "two", "three"],
                string: ["one", "three"]
            } });
        expect(function () { return index_1.confu(configOne); }).to["throw"]("Found duplicated required options: one, three");
        var configTwo = __assign({}, base, { required: {
                boolean: ["two"],
                number: ["one", "two", "three"],
                string: []
            } });
        expect(function () { return index_1.confu(configTwo); }).to["throw"]("Found duplicated required options: two");
    });
    mocha_1.it("Checks for duplicate default options", function () {
        var configOne = __assign({}, base, { defaults: {
                boolean: {
                    one: true,
                    two: false
                },
                number: {
                    one: 1
                },
                string: {
                    two: "two"
                }
            } });
        expect(function () { return index_1.confu(configOne); }).to["throw"]("Found duplicated default options: one, two");
    });
    mocha_1.it("Exits when missing required options", function () {
        var fn = {
            exit: function (message) { return message; }
        };
        sinon.spy(fn, "exit");
        var configOne = __assign({}, base, { exit: fn.exit, required: {
                boolean: [],
                number: ["one"],
                string: []
            } });
        index_1.confu(configOne);
        expect(fn.exit).to.have.been.calledWith("Option one not found");
    });
    mocha_1.it("Throws for missing required options when exitOnMissingRequired is false", function () {
        var configOne = __assign({}, base, { exitOnMissingRequired: false, required: {
                boolean: [],
                number: ["one"],
                string: []
            } });
        expect(function () { return index_1.confu(configOne); }).to["throw"]("Option one not found");
    });
    mocha_1.describe("Boolean configs", function () {
        var configOne = __assign({}, base, { defaults: {
                boolean: {
                    happy: false,
                    sad: false,
                    no: "false",
                    yes: "true"
                },
                number: {},
                string: {}
            }, env: {
                happy: true,
                hungry: 1,
                tired: false
            }, required: {
                boolean: ["happy"],
                number: [],
                string: []
            } });
        var config = index_1.confu(configOne);
        mocha_1.it("Gets the ENV value", function () {
            expect(config.B("tired")).to.be["false"];
        });
        mocha_1.it("Converts default values in strings to booleans when valid", function () {
            expect(config.B("no")).to.be["false"];
            expect(config.B("yes")).to.be["true"];
        });
        mocha_1.it("Gets the ENV value and not the default when a default is set", function () {
            expect(config.B("happy")).to.be["true"];
        });
        mocha_1.it("Gets the default value if not set in ENV", function () {
            expect(config.B("sad")).to.be["false"];
        });
        mocha_1.it("Returns undefined when throwOnNotFound default value (false) is used", function () {
            expect(config.B("cow")).to.be.undefined;
        });
        mocha_1.it("Throws when value is an invalid one", function () {
            expect(function () { return config.B("hungry"); }).to["throw"]("Invalid value for hungry");
        });
        mocha_1.it("Throws when throwOnNotFound option is set to true", function () {
            var configTwo = __assign({}, base, configOne, { throwOnNotFound: true });
            var config2 = index_1.confu(configTwo);
            expect(function () { return config2.B("cow"); }).to["throw"]("Did not find BOOLEAN option cow");
        });
        mocha_1.it("Converts boolean string values to actual boolean values", function () {
            var configTwo = __assign({}, base, { env: {
                    no: "false",
                    ok: true,
                    yes: "true"
                }, transformBooleanStrings: true });
            var config2 = index_1.confu(configTwo);
            expect(config2.B("no")).to.be["false"];
            expect(config2.B("yes")).to.be["true"];
            expect(config2.B("ok")).to.be["true"];
        });
    });
    mocha_1.describe("String configs", function () {
        var configOne = __assign({}, base, { defaults: {
                boolean: {},
                number: {},
                string: {
                    hello: "hello",
                    name: "juan",
                    sad: "nope",
                    world: "world"
                }
            }, env: {
                happy: "yes",
                hungry: 1,
                name: "pablo",
                tired: "not yet"
            }, required: {
                boolean: [],
                number: [],
                string: ["hello"]
            } });
        var config = index_1.confu(configOne);
        mocha_1.it("Gets the ENV value", function () {
            expect(config.S("happy")).to.be.equal("yes");
        });
        mocha_1.it("Gets the ENV value and not the default when a default is set", function () {
            expect(config.S("name")).to.be.equal("pablo");
        });
        mocha_1.it("Gets the default value if not set in ENV", function () {
            expect(config.S("sad")).to.be.equal("nope");
        });
        mocha_1.it("Returns undefined when throwOnNotFound default value (false) is used", function () {
            expect(config.S("cow")).to.be.undefined;
        });
        mocha_1.it("Throws when value is an invalid one", function () {
            expect(function () { return config.S("hungry"); }).to["throw"]("Invalid value for hungry");
        });
        mocha_1.it("Throws when throwOnNotFound option is set to true", function () {
            var configTwo = __assign({}, base, configOne, { throwOnNotFound: true });
            config = index_1.confu(configTwo);
            expect(function () { return config.S("cow"); }).to["throw"]("Did not find STRING option cow");
        });
    });
    mocha_1.describe("Number configs", function () {
        var configOne = __assign({}, base, { defaults: {
                boolean: {},
                number: {
                    four: 4,
                    one: 1,
                    three: 2
                },
                string: {}
            }, env: {
                happy: 100,
                hungry: 1,
                three: 3,
                two: "2",
                half: "0.5",
                what: "0x1",
                NAN: "house"
            }, required: {
                boolean: [],
                number: ["one"],
                string: []
            } });
        var config = index_1.confu(configOne);
        mocha_1.it("Gets the ENV value", function () {
            expect(config.N("happy")).to.be.equal(100);
        });
        mocha_1.it("Gets the ENV value and not the default when a default is set", function () {
            expect(config.N("three")).to.be.equal(3);
        });
        mocha_1.it("Gets the default value if not set in ENV", function () {
            expect(config.N("four")).to.be.equal(4);
        });
        mocha_1.it("Returns undefined when throwOnNotFound default value (false) is used", function () {
            expect(config.N("cow")).to.be.undefined;
        });
        mocha_1.it("Throws when transformNumberStrings is false (default) and a value is not a number", function () {
            expect(function () { return config.N("two"); }).to["throw"]("Invalid value for two");
            expect(function () { return config.N("half"); }).to["throw"]("Invalid value for half");
            expect(function () { return config.N("what"); }).to["throw"]("Invalid value for what");
        });
        mocha_1.it("Transforms string numbers to actual numbers when using transformNumberStrings = true", function () {
            var configTwo = __assign({}, base, configOne, { throwOnNotFound: true, transformNumberStrings: true });
            var config2 = index_1.confu(configTwo);
            expect(config2.N("two")).to.equal(2);
            expect(config2.N("half")).to.equal(0.5);
            expect(config2.N("what")).to.equal(0);
        });
        mocha_1.it("Throws when value is an invalid one", function () {
            expect(function () { return config.N("NAN"); }).to["throw"]("Invalid value for NAN");
        });
        mocha_1.it("Throws when throwOnNotFound option is set to true", function () {
            var configTwo = __assign({}, base, configOne, { throwOnNotFound: true });
            var config2 = index_1.confu(configTwo);
            expect(function () { return config2.N("cow"); }).to["throw"]("Did not find NUMBER option cow");
        });
    });
});
