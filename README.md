## Installation 
```sh
#local package installation
npm install lytics-js 

#global package installation
npm install lytics-js -g
```

## Usage

### JavaScript

You can use this package in order to write applications that
use the Lytics API.

```javascript
var lytics = require('lytics-js');
var client = lytics.getClient('[apikey]');
//
//get an array of account objects
var accounts = await client.getAccounts();
//
//test a query function
var is_true = await client.testFunction('tobool', ['1']);
var is_false = await client.testFunction('tobool', ['f']);
var is_undefined = await client.testFunction('email', ['something that isn\'t an email']);
var is_email = await client.testFunction('email', ['test@email.com']);
```

### Command-line interface (CLI)

This package includes a command-line interface 
(CLI) for Lytics. The CLI is available as an 
executable included in the package. You can 
run the CLI by installing the package locally 
or globally.

#### Display help

```sh
#local package
$(npm bin)/lytics-js help

#global package
lytics-js help
```
#### Lytics watch

```sh
#to use the Lytics API key set in the environment variable LIOKEY
lytics-js watch .

#to pass the Lytics API key directly
lytics-js -k [apikey] watch .
```

#### Test query function

```sh
#to use the Lytics API key set in the environment variable LIOKEY
lytics-js function tobool 1

#to pass the Lytics API key directly
lytics-js -k [apikey] function tobool 1
```