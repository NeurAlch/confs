# confs [![Build Status: Linux and macOS](https://travis-ci.org/PabloRosales/confs.svg?branch=master)](https://travis-ci.org/PabloRosales/confs)

> Simple Configuration with defaults and required options

Allows you to set configuration requirements and defaults for your app or module, great when combined with Dotenv.

Currently supporting Number, String and Boolean values.

Written in TypeScript but works great with Vanilla JavaScript.

Does not mutate the objects you pass as options.

*Currently at version 0.10.0, but already used in production.*

## Install

```
$ npm install confs
```
<a href="https://www.patreon.com/pablorosales">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## Usage

```js
const confs = require('confs');
const config = confs({
    env: process.env,
    transformBooleanStrings: true,
    transformNumberStrings: true,
    exitOnMissingRequired: false,
    required: {
        string: ["name"],
    },
    defaults: {
        string: {
            name: "Confs",
        },
        boolean: {
            yes: "true",
        },
        number: {
            one: "1",
        }
    },
});


console.log(config.S('name'));
//=> "Confs"

console.log(config.string('name'));
//=> "Confs"

console.log(config.B('yes'));
//=> true

console.log(config.boolean('yes'));
//=> true

console.log(config.N('one'));
//=> 1

console.log(config.number('one'));
//=> 1
```

## Options

### transformBooleanStrings (default: false)

If set to true will transform all *env* strings containing "true" or "false" to their actual boolean values.

### transformNumberStrings (default: false)

If set to true will transform all values from *env* to number, only ones that don't return NaN using parseFloat.

### exitOnMissingRequired (default: true)

Will use your defined exit function when a required value is missing, useful to exit from node process with something like:

```js
const confs = require('confs').confs;

const config = confs({
    env: {},
    exit: (message) => {
        console.error(message);
        process.exit(1);
    },
    exitOnMissingRequired: false,
    required: {
        string: ["name"],
    },
});


config.S('name');
//=> Will run exit, ending the program
```

### throwOnNotFound (default: false)

Raises an error when an option is not found in your *env* object.

### defaults

Your default options, separated by number, string and boolean values.

```js
const config = confs({
    // ...
    defaults: {
        string: {
            name: "localhost",
        },
        boolean: {
            verbose: true,
        },
        number: {
            port: 3306,
        }
    },
});
```

### required

Your required options, separated by number, string and boolean values.

```js
const config = confs({
    // ...
    required: {
        string: ["host"],
        boolean: ["verbose"],
        number: ["port"],
    },
});
```

### env

The actual object with your configuration values.

Can be used with Dotenv:

```js
// npm install --save dotenv
require('dotenv').config();

const confs = require("confs").confs;
const config = confs({
    env: process.env,
    // ...
});
```

### exit

Your exit function, only used when *exitOnMissingRequired* is set as true.

Usually you want to end your program (Node) when some required configuration is not found.

See *exitOnMissingRequired* for an example.

## Methods

### S / string

Used to get a config option that is a string.

```js
config.S("name");
// => "Confs"

config.string("name");
// => "Confs"
```

### N / number

Used to get a config option that is a number.

```js
config.N("port");
// => 3306

config.number("port");
// => 3306
```

### B / boolean

Used to get a config option that is a number.

```js
config.B("verbose");
// => true

config.boolean("verbose");
// => true
```

## License

MIT © [Pablo Rosales](https://pablorosales.xyz)