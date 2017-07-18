'use strict';

const debug = require('debug')('cache-aside:memorystore');
const AbstractStore = require('./AbstractStore');

/**
 * In-memory cache store.
 *
 * @author joshes
 */
class MemoryStore extends AbstractStore {

    /**
     * Constructor
     *
     * @param provider {function} Provider function for populating the cache by `key` (key, data)
     * @param ttl {number} Time to live in milliseconds. Implementations should evict the cached item at TTL if set (optional)
     */
    constructor(provider, ttl) {
        super(provider, ttl);
        this._store = {};
    }

    _read(key, cb) {
        return cb(null, this._store[key]);
    }

    _write(key, data, ttl, cb) {
        this._store[key] = data;
        if (ttl) {
            setTimeout(() => {
                debug(`Evicting data for key: ${key}`);
                delete this._store[key];
            }, ttl);
        }
        cb(null);
    }
}

module.exports = MemoryStore;
