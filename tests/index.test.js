require("mocha");

const chai = require("chai");
const sinon = require("sinon");
const confs = require("../lib/index").confs;
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const expect = chai.expect;

const base = {
    defaults: {
        boolean: {},
        number: {},
        string: {},
    },
    env: {},
    exit: (message) => (message),
    required: {
        boolean: [],
        number: [],
        string: [],
    },
};

describe("Confs", () => {

    it("Does not mutate options object passed", () => {

        const ourEnv = {
            yes: "true",
        };

        const configOne = Object.assign({}, base, {
            env: ourEnv,
            transformBooleanStrings: true,
        });

        confs(configOne);

        expect(configOne.throwOnNotFound).to.be.undefined;
        expect(configOne.exitOnMissingRequired).to.be.undefined;
        expect(typeof ourEnv.yes).to.be.equal("string");

    });

    it("Checks that env, defaults and required are of the correct type", () => {

        expect(() => confs({
            env: "",
        })).to.throw("env option should be an object");

        // required

        expect(() => confs({
            env: {},
            required: "",
        })).to.throw("required option should be an object");

        expect(() => confs({
            env: {},
            required: {
                boolean: "",
            },
        })).to.throw("required.boolean option should be an array");

        expect(() => confs({
            env: {},
            required: {
                boolean: [1],
            },
        })).to.throw("Invalid required option 1 should be a string");

        expect(() => confs({
            env: {},
            required: {
                number: "",
            },
        })).to.throw("required.number option should be an array");

        expect(() => confs({
            env: {},
            required: {
                number: [1],
            },
        })).to.throw("Invalid required option 1 should be a string");

        expect(() => confs({
            env: {},
            required: {
                string: "",
            },
        })).to.throw("required.string option should be an array");

        expect(() => confs({
            env: {},
            required: {
                string: [1],
            },
        })).to.throw("Invalid required option 1 should be a string");

        // defaults

        expect(() => confs({
            env: {},
            defaults: "",
        })).to.throw("defaults option should be an object");

        expect(() => confs({
            env: {},
            defaults: {
                boolean: "",
            },
        })).to.throw("defaults.boolean option should be an object");

        expect(() => confs({
            env: {},
            defaults: {
                number: "",
            },
        })).to.throw("defaults.number option should be an object");

        expect(() => confs({
            env: {},
            defaults: {
                string: "",
            },
        })).to.throw("defaults.string option should be an object");

    });

    it("Checks for missing exit function when exitOnRequiredMissing is default or true", () => {

        const configOne = Object.assign({}, base);

        delete configOne["exit"];

        expect(() => confs(configOne)).to.throw("Missing exit function");

    });

    it("Checks for duplicate required options", () => {

        const configOne = Object.assign({}, base, { required: {
                boolean: ["one"],
                number: ["one", "two", "three"],
                string: ["one", "three"],
            },
        });

        expect(() => confs(configOne)).to.throw("Found duplicated required options: one, three");

        const configTwo = Object.assign({},
            base, { required: {
                boolean: ["two"],
                number: ["one", "two", "three"],
                string: [],
            },
        });

        expect(() => confs(configTwo)).to.throw("Found duplicated required options: two");

    });

    it("Checks for duplicate default options", () => {

        const configOne = Object.assign({},
            base, {
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
        });

        expect(() => confs(configOne)).to.throw("Found duplicated default options: one, two");

    });

    it("Exits when missing required options", () => {

        const fn = {
            exit: (message) => message,
        };

        sinon.spy(fn, "exit");

        const configOne = Object.assign({},
            base, {
            exit: fn.exit,
            required: {
                boolean: [],
                number: ["one"],
                string: [],
            },
        });

        confs(configOne);

        expect(fn.exit).to.have.been.calledWith("Option one not found");

    });

    it("Throws for missing required options when exitOnMissingRequired is false", () => {

        const configOne = Object.assign({},
            base, {
            exitOnMissingRequired: false,
            required: {
                boolean: [],
                number: ["one"],
                string: [],
            },
        });

        expect(() => confs(configOne)).to.throw("Option one not found");

    });

    describe("Boolean configs", () => {

        const configOne = Object.assign({},
            base, {
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
        });

        const config = confs(configOne);

        it("Gets the ENV value", () => {
            expect(config.B("tired")).to.be.false;
            expect(config.boolean("tired")).to.be.false;
        });

        it("Converts default values in strings to booleans when valid", () => {
            expect(config.B("no")).to.be.false;
            expect(config.B("yes")).to.be.true;

            expect(config.boolean("no")).to.be.false;
            expect(config.boolean("yes")).to.be.true;
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.B("happy")).to.be.true;
            expect(config.boolean("happy")).to.be.true;
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.B("sad")).to.be.false;
            expect(config.boolean("sad")).to.be.false;
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.B("cow")).to.be.undefined;
            expect(config.boolean("cow")).to.be.undefined;
        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.B("hungry")).to.throw("Invalid value for hungry");
            expect(() => config.boolean("hungry")).to.throw("Invalid value for hungry");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo = Object.assign({},
                base,
                configOne, {
                throwOnNotFound: true,
            });

            const config2 = confs(configTwo);

            expect(() => config2.B("cow")).to.throw("Did not find BOOLEAN option cow");
            expect(() => config2.boolean("cow")).to.throw("Did not find BOOLEAN option cow");

        });

        it("Converts boolean string values to actual boolean values", () => {

            const configTwo = Object.assign({},
                base, {
                env: {
                    no: "false",
                    ok: true,
                    yes: "true",
                },
                defaults: {
                    boolean: {
                        coffee: "true",
                    },
                },
                transformBooleanStrings: true,
            });

            const config2 = confs(configTwo);

            expect(config2.B("no")).to.be.false;
            expect(config2.B("yes")).to.be.true;
            expect(config2.B("ok")).to.be.true;
            expect(config2.B("coffee")).to.be.true;

            expect(config2.boolean("no")).to.be.false;
            expect(config2.boolean("yes")).to.be.true;
            expect(config2.boolean("ok")).to.be.true;
            expect(config2.boolean("coffee")).to.be.true;

        });

    });

    describe("String configs", () => {

        const configOne = Object.assign({},
            base, {
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
        });

        let config = confs(configOne);

        it("Gets the ENV value", () => {
            expect(config.S("happy")).to.be.equal("yes");
            expect(config.string("happy")).to.be.equal("yes");
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.S("name")).to.be.equal("pablo");
            expect(config.string("name")).to.be.equal("pablo");
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.S("sad")).to.be.equal("nope");
            expect(config.string("sad")).to.be.equal("nope");
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.S("cow")).to.be.undefined;
            expect(config.string("cow")).to.be.undefined;
        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.S("hungry")).to.throw("Invalid value for hungry");
            expect(() => config.string("hungry")).to.throw("Invalid value for hungry");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo = Object.assign({},
                base,
                configOne, {
                throwOnNotFound: true,
            });

            config = confs(configTwo);

            expect(() => config.S("cow")).to.throw("Did not find STRING option cow");
            expect(() => config.string("cow")).to.throw("Did not find STRING option cow");

        });

    });

    describe("Number configs", () => {

        const configOne = Object.assign({},
            base, {
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
        });

        const config = confs(configOne);

        it("Gets the ENV value", () => {
            expect(config.N("happy")).to.be.equal(100);
            expect(config.number("happy")).to.be.equal(100);
        });

        it("Gets the ENV value and not the default when a default is set", () => {
            expect(config.N("three")).to.be.equal(3);
            expect(config.number("three")).to.be.equal(3);
        });

        it("Gets the default value if not set in ENV", () => {
            expect(config.N("four")).to.be.equal(4);
            expect(config.number("four")).to.be.equal(4);
        });

        it("Returns undefined when throwOnNotFound default value (false) is used", () => {
            expect(config.N("cow")).to.be.undefined;
            expect(config.number("cow")).to.be.undefined;
        });

        it("Throws when transformNumberStrings is false (default) and a value is not a number", () => {

            expect(() => config.N("two")).to.throw("Invalid value for two");
            expect(() => config.N("half")).to.throw("Invalid value for half");
            expect(() => config.N("what")).to.throw("Invalid value for what");

            expect(() => config.number("two")).to.throw("Invalid value for two");
            expect(() => config.number("half")).to.throw("Invalid value for half");
            expect(() => config.number("what")).to.throw("Invalid value for what");

        });

        it("Transforms string numbers to actual numbers when using transformNumberStrings = true", () => {

            const configTwo = Object.assign({},
                base,
                configOne, {
                throwOnNotFound: true,
                transformNumberStrings: true,
            });

            configTwo.defaults.number.five = "5.25";

            const config2 = confs(configTwo);

            expect(config2.N("two")).to.equal(2);
            expect(config2.N("half")).to.equal(0.5);
            expect(config2.N("what")).to.equal(0);
            expect(config2.N("five")).to.equal(5.25);

            expect(config2.number("two")).to.equal(2);
            expect(config2.number("half")).to.equal(0.5);
            expect(config2.number("what")).to.equal(0);
            expect(config2.number("five")).to.equal(5.25);

        });

        it("Throws when value is an invalid one", () => {
            expect(() => config.N("NAN")).to.throw("Invalid value for NAN");
            expect(() => config.number("NAN")).to.throw("Invalid value for NAN");
        });

        it("Throws when throwOnNotFound option is set to true", () => {

            const configTwo = Object.assign({},
                base,
                configOne, {
                throwOnNotFound: true,
            });

            const config2 = confs(configTwo);

            expect(() => config2.N("cow")).to.throw("Did not find NUMBER option cow");
            expect(() => config2.number("cow")).to.throw("Did not find NUMBER option cow");

        });

    });

});
