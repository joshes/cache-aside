# Cache-aside

Pluggable read-through, write-behind cache.

## Install

`npm install --save cache-aside`

## Usage

```
// Pull in the implementation to use 
const MemoryStore = require('rtcache').MemoryStore;

// Cache populator function
const provider = (key, cb) => {
    // Load data for your cache for the given key
    if (key === 'MyKey') {
        return cb(null, 'Some data');
    }
    return cb(null, 'Other data');
};

// Non-expiring cache
const cache = new MemoryStore('MyCache', provider);

// Expire items 5 seconds after caching
const expiringCache = new MemoryStore('ExpiringCache', provider, 5000);

cache.get('MyKey', (err, data) => {
    if (err) return console.error(err);
    console.log(data); // Prints 'Some data'
});
```

# Documentation 

## API 

**Emitted Events:**

- error (`error`)
- cacheMiss (`key`)
- cacheHit (`key`)
- cachePopulated (`{key, data}`)

## Available Stores

- AWS DynamoDB
- AWS S3
- In Memory

## Extending

To implement your own backend Store, extend `AbstractStore` and override the `constructor`, `_read` and `_write` methods to read/write to your backend.
