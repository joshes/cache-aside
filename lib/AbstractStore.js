'use strict';

const debug = require('debug')('cache-aside');
const EventEmitter = require('events').EventEmitter;

/**
 * Abstract cache store.
 * Concrete implementations should extend and override `_read` and `_write` methods.
 *
 * @author joshes
 */
class AbstractStore extends EventEmitter {

    /**
     * Constructor.
     *
     * @param provider {function} Provider function for populating the cache by `key` (key, data)
     * @param ttl {number} Time to live in milliseconds. Implementations should evict the cached item at TTL if set (optional)
     */
    constructor(provider, ttl) {
        super();
        if (!provider) {
            throw new Error('Provider is required');
        }
        this._provider = provider;
        this._ttl = ttl;
    }

    /**
     * Gets the data associated with `key`, if not found, the data is retrieved using the `provider` and cached.
     *
     * @param key {string} Key
     * @param cb {function} Callback(err, data)
     */
    get(key, cb) {
        this._read(key, (err, data) => {
            if (err) {
                this.emit('error', err);
                return cb(err);
            }

            if (data) {
                debug(`Cache hit - key: ${key}`);
                this.emit('cacheHit', key);
                return cb(null, data);
            }

            debug(`Cache miss - key: ${key}`);
            this.emit('cacheMiss', key);
            this._provider(key, (err, data) => {
                if (err) {
                    this.emit('error', err);
                    return cb(err);
                }
                this._write(key, data, this._ttl, (err) => {
                    if (err) {
                        this.emit('error', err);
                        return cb(err);
                    }
                    debug(`Populated cache - key - ${key}`);
                    this.emit('cachePopulated', {key, data});
                    cb(null, data);
                });
            });
        });
    }

    /**
     * Sets the value for the key on the underlying store
     *
     * @param key {string} Key
     * @param val {object} Value to associate with the key
     * @param cb {function} Callback(err, {oldVal, newVal})
     */
    set(key, val, cb) {
        get(key, (err, oldVal) => {
            if (err) return cb(err);
            this._write(key, val, null, (err) => {
                if (err) return cb(err);
                cb(null, {oldVal: oldVal, newVal: val});
            });
        });
    }


    /**
     * Internal implementation for reading the value of `key` from the underlying data source.
     *
     * @param key {string} Key
     * @param cb {function} Callback(err)
     * @private
     */
    _read(key, cb) {
        throw new Error();
    }

    /**
     * Internal implementation for writing the value of `key` with value `data` to the underlying data source.
     *
     * @param key {string} Key
     * @param data {any} Data
     * @param ttl {number} Time to live in milliseconds
     * @param cb {function} Callback (err)
     * @private
     */
    _write(key, data, ttl, cb) {
        throw new Error();
    }

}

module.exports = AbstractStore;
