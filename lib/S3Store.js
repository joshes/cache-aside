'use strict';

const debug = require('debug')('cache-aside:s3');
const moment = require('moment');
const AbstractStore = require('./AbstractStore');

/**
 * AWS S3 cache store.
 *
 * @author joshes
 */
class S3Store extends AbstractStore {

    /**
     * Constructor
     *
     * @param bucket {string} AWS S3 bucket to use
     * @param s3 {object} AWS S3 instance
     * @param provider {function} Provider function for populating the cache by `key` (key, data)
     * @param ttl {number} Time to live in milliseconds. Implementations should evict the cached item at TTL if set (optional)
     */
    constructor(bucket, s3, provider, ttl) {
        super(provider, ttl);
        this._bucket = bucket;
        this._s3 = s3;
    }

    _read(key, cb) {
        const req = {
            Bucket: this._bucket,
            Key: key
        };
        this._s3.headObject(req, (err, metadata) => {
            if (err && err.code === 'NotFound') {
                return cb();
            }
            this._s3.getObject(req, (err, res) => {
                if (err) {
                    debug(err);
                    return cb(err);
                }
                cb(null, res.Body);
            });
        });
    }

    _write(key, data, ttl, cb) {
        const req = {
            Bucket: this._bucket,
            Key: key,
            Body: data
        };
        if (ttl) {
            req.Expires = moment().add(ttl, 'ms').valueOf()
        }
        this._s3.putObject(req, (err, res) => {
            if (err) {
                debug(err);
                return cb(err);
            }
            cb(null, res);
        });
    }
}

module.exports = S3Store;
