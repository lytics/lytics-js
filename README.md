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
var accounts = await client.getAccounts();
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
$(npm bin)/lytics help

#global package
lytics help
```
#### Lytics watch

```sh
#to use the Lytics API key set in the environment variable LIOKEY
lytics watch .

#to pass the Lytics API key directly
lytics -k [apikey] watch .
```