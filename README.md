# conf [![Build Status: Linux and macOS](https://travis-ci.org/PabloRosales/confu.svg?branch=master)](https://travis-ci.org/PabloRosales/confu)

> Simple Configuration with defaults and required options

Allows you to set configuration requirements and defaults for your app or module, great when combined with Dotenv.

Currently supporting Number, String and Boolean values.

Written in TypeScript but works great with Vanilla JavaScript.

Does not mutate the objects you pass as options.

*Currently at version 0.10.0, but already used in production.*

## Install

```
$ npm install confu
```
<a href="https://www.patreon.com/pablorosales">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## Usage

```js
const confu = require('confu');
const config = confu({
    env: process.env,
    transformBooleanStrings: true,
    transformNumberStrings: true,
    exitOnMissingRequired: false,
    required: {
        string: ["name"],
    },
    defaults: {
        string: {
            name: "Confu",
        },
        boolean: {
            yes: "true",
        },
        number: {
            one: "1",
        }
    },
});


console.log(config('name'));
//=> "Confu"

console.log(config('yes'));
//=> true

console.log(config('one'));
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
const confu = require('confu').confu;

const config = confu({
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


config('name');
//=> Will run exit, ending the program
```

### throwOnNotFound (default: false)

Raises an error when an option is not found in your *env* object.

### defaults

Your default options, separated by number, string and boolean values.

```js
const config = confu({
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
const config = confu({
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

const confu = require("confu").confu;
const config = confu({
    env: process.env,
    // ...
});
```

### exit

Your exit function, only used when *exitOnMissingRequired* is set as true.

Usually you want to end your program (Node) when some required configuration is not found. See *exitOnMissingRequired* for an example.

## License

MIT © [Pablo Rosales](https://pablorosales.xyz)