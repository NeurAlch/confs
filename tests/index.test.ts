// tslint:disable:no-implicit-dependencies newline-per-chained-call no-unused-expression no-magic-numbers

import * as chai from "chai";
import { describe, it } from "mocha";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

chai.use(sinonChai);
const expect = chai.expect;

import { confu, IConfuOptions } from "../src/index";

const base: IConfuOptions = {
    defaults: {
        boolean: {},
        number: {},
        string: {},
    },
    env: {},
    exit: (message: string): string => (message),
    required: {
        boolean: [],
        number: [],
        string: [],
    },
};

describe("Confu", () => {

    it("Does not mutate options object passed", () => {

        const ourEnv = {
            yes: "true",
        };

        const configOne: IConfuOptions = {
            ...base,
            env: ourEnv,
            transformBooleanStrings: true,
        };

        confu(configOne);

        expect(configOne.throwOnNotFound).to.be.undefined;
        expect(configOne.exitOnMissingRequired).to.be.undefined;
        expect(typeof ourEnv.yes).to.be.equal("string");

    });

    it("Checks for missing exit function when exitOnRequiredMissing is default or true", () => {

        const configOne: IConfuOptions = { ...base };

        // tslint:disable-next-line:no-dynamic-delete no-string-literal
        delete configOne["exit"];

        expect(() => confu(configOne)).to.throw("Missing exit function");

    });

    it("Checks for duplicate required options", () => {

        const configOne: IConfuOptions = {...base, required: {
                boolean: ["one"],
                number: ["one", "two", "three"],
                string: ["one", "three"],
            },
        };

        expect(() => confu(configOne)).to.throw("Found duplicated required options: one, three");

        const configTwo: IConfuOptions = {
            ...base, required: {
                boolean: ["two"],
                number: ["one", "two", "three"],
                string: [],
            },
        };

        expect(() => confu(configTwo)).to.throw("Found duplicated required options: two");

    });

    it("Checks for duplicate default options", () => {

        const configOne: IConfuOptions = {
            ...base,
            defaults: {
                boolean: {
                    one: true,
                    two: false,
                },
                number: {
                    one: 1,
                },
                string: {
                    two: "two",
                },
            },
        };

        expect(() => confu(configOne)).to.throw("Found duplicated default options: one, two");

    });

    it("Exits when missing required options", () => {

        const fn = {
            exit: (message: string): string => message,
        };

        sinon.spy(fn, "exit");

        const configOne: IConfuOptions = {
            ...base,
            exit: fn.exit,
            required: {
                boolean: [],
                number: ["one"],
                string: [],
            },
        };

        confu(configOne);

        expect(fn.exit).to.have.been.calledWith("Option one not found");

    });

    it("Throws for missing required options when exitOnMissingRequired is false", () => {

        const configOne: IConfuOptions = {
            ...base,
            exitOnMissingRequired: false,
            required: {
                boolean: [],
                number: ["one"],
                string: [],
            },
        };

        expect(() => confu(configOne)).to.throw("Option one not found");

    });

    describe("Boolean configs", () => {

        // @ts-ignore
        const configOne: IConfuOptions = {
            ...base,
            defaults: {
                boolean: {
                    happy: false,
                    sad: false,
                    no: "false",
                    yes: "true",
                },
                number: {},
                string: {},
            },
            env: {
                happy: true,
                hungry: 1,
                tired: false,
            },
            required: {
                boolean: ["happy"],
                number: [],
                string: [],
            },
        };

        const config = confu(configOne);

        it("Gets the ENV value", () => {
            expect(config.B("tired")).to.be.false;
        });

        it("Converts default values in strings to booleans when valid", () => {
            expect(config.B("no")).to.be.false;
            expect(config.B("yes")).to.be.true;
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.B("happy")).to.be.true;
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.B("sad")).to.be.false;
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.B("cow")).to.be.undefined;
        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.B("hungry")).to.throw("Invalid value for hungry");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo: IConfuOptions = {
                ...base,
                ...configOne,
                throwOnNotFound: true,
            };

            const config2 = confu(configTwo);

            expect(() => config2.B("cow")).to.throw("Did not find BOOLEAN option cow");

        });

        it("Converts boolean string values to actual boolean values", () => {

            const configTwo: IConfuOptions = {
                ...base,
                env: {
                    no: "false",
                    ok: true,
                    yes: "true",
                },
                transformBooleanStrings: true,
            };

            const config2 = confu(configTwo);

            expect(config2.B("no")).to.be.false;
            expect(config2.B("yes")).to.be.true;
            expect(config2.B("ok")).to.be.true;

        });

    });

    describe("String configs", () => {

        const configOne: IConfuOptions = {
            ...base,
            defaults: {
                boolean: {},
                number: {},
                string: {
                    hello: "hello",
                    name: "juan",
                    sad: "nope",
                    world: "world",
                },
            },
            env: {
                happy: "yes",
                hungry: 1,
                name: "pablo",
                tired: "not yet",
            },
            required: {
                boolean: [],
                number: [],
                string: ["hello"],
            },
        };

        let config = confu(configOne);

        it("Gets the ENV value", () => {
            expect(config.S("happy")).to.be.equal("yes");
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.S("name")).to.be.equal("pablo");
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.S("sad")).to.be.equal("nope");
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.S("cow")).to.be.undefined;
        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.S("hungry")).to.throw("Invalid value for hungry");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo: IConfuOptions = {
                ...base,
                ...configOne,
                throwOnNotFound: true,
            };

            config = confu(configTwo);

            expect(() => config.S("cow")).to.throw("Did not find STRING option cow");

        });

    });

    describe("Number configs", () => {

        const configOne: IConfuOptions = {
            ...base,
            defaults: {
                boolean: {},
                number: {
                    four: 4,
                    one: 1,
                    three: 2,
                },
                string: {},
            },
            env: {
                happy: 100,
                hungry: 1,
                three: 3,
                two: "2",
                half: "0.5",
                what: "0x1",
                NAN: "house",
            },
            required: {
                boolean: [],
                number: ["one"],
                string: [],
            },
        };

        const config = confu(configOne);

        it("Gets the ENV value", () => {
            expect(config.N("happy")).to.be.equal(100);
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.N("three")).to.be.equal(3);
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.N("four")).to.be.equal(4);
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.N("cow")).to.be.undefined;
        });

        it("Throws when transformNumberStrings is false (default) and a value is not a number", () => {

            expect(() => config.N("two")).to.throw("Invalid value for two");
            expect(() => config.N("half")).to.throw("Invalid value for half");
            expect(() => config.N("what")).to.throw("Invalid value for what");

        });

        it("Transforms string numbers to actual numbers when using transformNumberStrings = true", () => {

            const configTwo: IConfuOptions = {
                ...base,
                ...configOne,
                throwOnNotFound: true,
                transformNumberStrings: true,
            };

            const config2 = confu(configTwo);

            expect(config2.N("two")).to.equal(2);
            expect(config2.N("half")).to.equal(0.5);
            expect(config2.N("what")).to.equal(0);

        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.N("NAN")).to.throw("Invalid value for NAN");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo: IConfuOptions = {
                ...base,
                ...configOne,
                throwOnNotFound: true,
            };

            const config2 = confu(configTwo);

            expect(() => config2.N("cow")).to.throw("Did not find NUMBER option cow");

        });

    });

});
