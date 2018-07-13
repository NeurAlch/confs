require('dotenv').config();

const assert = require('assert');
const confu = require("../../lib/index").confu;

const config = confu({
    env: process.env,
    transformBooleanStrings: true,
    transformNumberStrings: true,
    exitOnMissingRequired: false,
    defaults: {
        string: {
            name: "Confu",
        },
        boolean: {
            yes: "true",
        },
        number: {
            one: 1,
        }
    },
});

assert.strictEqual(config.string("name"), "Confu");
assert.strictEqual(config.S("MY_STRING"), "Hello World");

assert.strictEqual(config.boolean("yes"), true);
assert.strictEqual(config.B("MY_BOOL"), true);

assert.strictEqual(config.number("one"), 1);
assert.strictEqual(config.N("MY_NUMBER"), 42);
assert.strictEqual(config.N("MY_DECIMAL"), 0.5);
assert.strictEqual(config.N("MY_ZERO_STRING"), 0);