'use strict';

const AWS = require('aws-sdk');
const debug = require('debug')('cache-aside:dynamo');
const moment = require('moment');
const AbstractStore = require('./AbstractStore');

/**
 * AWS DynamoDb cache store.
 *
 * @author joshes
 */
class DynamoStore extends AbstractStore {

    /**
     * Constructor
     *
     * @param table {string} AWS DynamoDb table to use
     * @param dynamoDocumentClient {object} AWS DynamoDb DocumentClient instance
     * @param provider {function} Provider function for populating the cache by `key` (key, data)
     * @param ttl {number} Time to live in milliseconds. Implementations should evict the cached item at TTL if set (optional)
     */
    constructor(table, dynamoDocumentClient, provider, ttl) {
        super(provider, ttl);
        this._table = table;
        this._client = dynamoDocumentClient;
    }

    _read(key, cb) {
        const req = {
            Key: key,
            TableName: this._table
        };
        this._client.get(req, function (err, data) {
            if (err) {
                debug(err);
                return cb(err);
            }
            cb(null, data ? data.Item : null);
        });
    }

    _write(key, data, ttl, cb) {
        const req = {
            Key: key,
            TableName: this._table,
            Item: data
        };
        if (ttl) {
            setTimeout(() => {
                this._client.delete(req, (err) => {
                    if (err) {
                        debug(err);
                    }
                });
            }, ttl);
        }
        this._client.put(req, (err) => {
            cb(err);
        });
    }
}

module.exports = DynamoStore;
