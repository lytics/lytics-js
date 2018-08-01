import { LyticsClient } from '../LyticsClient';
import { assert } from 'chai';
import { TableSchemaFieldInfo } from '../types';

const apikey:string = '';
const aid:number = 0;

before(function(done) {
    if (apikey.trim().length == 0 || aid == 0) {
        done(new Error('The variables apikey and aid must be specified before tests can run.'));
        return;
    }
    done();
});

describe('getAccounts', function () {
    it('should return an array of accounts', async function () {
        const lytics = new LyticsClient(apikey);
        var accounts = await lytics.getAccounts();
        assert.isDefined(accounts);
        assert.equal(accounts.length, 1);
        assert.equal(accounts[0].aid, aid);
    });
});

describe('getAccount', function () {
    it('should return undefined when a mismatched account id is used', async function () {
        const lytics = new LyticsClient(apikey);
        var account = await lytics.getAccount(123);
        assert.isUndefined(account);
    });
    it('should return an account when a matched account id is used', async function () {
        const lytics = new LyticsClient(apikey);
        var account = await lytics.getAccount(aid);
        assert.isDefined(account);
        assert.equal(account!.aid, aid);
    });
});

describe('getStreams', function () {
    it('should return an array of data streams', async function () {
        const lytics = new LyticsClient(apikey);
        var streams = await lytics.getStreams();
        assert.isDefined(streams);
        assert.isTrue(streams.length >= 2);
        assert.isDefined(streams.find(s => s.stream == 'default'));
        assert.isDefined(streams.find(s => s.stream == 'lytics_content_enrich'));
    });
    it('should return undefined when a data stream that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var stream = await lytics.getStream('87y789fdfn');
        assert.isUndefined(stream);
    });
    it('should return a data stream', async function () {
        const lytics = new LyticsClient(apikey);
        var stream = await lytics.getStream('default');
        assert.isDefined(stream);
        assert.equal(stream!.stream, 'default');
    });
});

describe('getStreamField', function () {
    it('should return a field from the data stream', async function () {
        const lytics = new LyticsClient(apikey);
        var field = await lytics.getStreamField('default', '_uid');
        assert.isDefined(field);
        assert.equal(field!.name, '_uid');
    });
    it('should return undefined when a data stream that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var field = await lytics.getStreamField('3t4w4tsg', '_uid');
        assert.isUndefined(field);
    });
    it('should return undefined when a field that does not exist in the data stream is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var field = await lytics.getStreamField('default', 'dfgdsrgt43');
        assert.isUndefined(field);
    });
});

describe('getTableSchema', function() {
    it('should return undefined when a table that does not exist is specified', async function() {
        const lytics = new LyticsClient(apikey);
        var schema = await lytics.getTableSchema('xxx');
        assert.isUndefined(schema);
    });
    it('should return an object when the user table is specified', async function() {
        const lytics = new LyticsClient(apikey);
        var schema = await lytics.getTableSchema('user');
        assert.isDefined(schema);
        assert.equal(schema!.name, 'user');
        assert.isTrue(schema!.columns.length > 0);
        assert.isTrue(schema!.by_fields.length > 0);
    });
});

describe('getTableSchemaFieldInfo', function() {
    it('should return undefined when a table that does not exist is specified', async function() {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('xxx', 'yyy');
        assert.isUndefined(info);
    });
    it('should return undefined when the table exists but the field does not', async function() {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('user', 'yyy');
        assert.isUndefined(info);
    });
    it('should return an object when the user table and email field are specified', async function() {
        const lytics = new LyticsClient(apikey);
        const info = await lytics.getTableSchemaFieldInfo('user', 'email');
        assert.isDefined(info);
        assert.equal(info!.field, 'email');
        const counts = TableSchemaFieldInfo.getTermCounts(info);
        assert.isNotEmpty(counts);
    });
});

describe('getTableSchemaFieldInfo', function() {
    it('should return undefined when a table that does not exist is specified', async function() {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('xxx', 'yyy');
        assert.isUndefined(info);
    });
    it('should return undefined when the table exists but the field does not', async function() {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('user', 'yyy');
        assert.isUndefined(info);
    });
    it('should return an object when the user table is specified', async function() {
        const lytics = new LyticsClient(apikey);
        const info = await lytics.getTableSchemaFieldInfo('user', 'email');
        assert.isDefined(info);
        assert.equal(info!.field, 'email');
        const counts = TableSchemaFieldInfo.getTermCounts(info);
        assert.isNotEmpty(counts);
    });
});

describe('getEntity', function() {
    it('should return undefined when a table that does not exist is specified', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('xxx', 'yyy', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return undefined when the table exists but the field does not', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'yyy', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return undefined when the table and field exist but the value does not match an entity', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return an object when the table, field and value match an existing entity', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'jeff.brown@lytics.com');
        assert.isDefined(entity);
        assert.equal(entity!.email, 'jeff.brown@lytics.com');
    });
    it('should return an object when wait is true', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'jeff.brown@lytics.com', true);
        assert.isDefined(entity);
        assert.equal(entity!.email, 'jeff.brown@lytics.com');
    });
    it('should return an object when wait is false', async function() {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'jeff.brown@lytics.com', false);
        assert.isDefined(entity);
        assert.equal(entity!.email, 'jeff.brown@lytics.com');
    });
});

describe('getQueries', function () {
    it('should return an array of queries', async function () {
        const lytics = new LyticsClient(apikey);
        var queries = await lytics.getQueries();
        assert.isDefined(queries);
        assert.isNotEmpty(queries);
    });
});

describe('getQuery', function () {
    it('should return undefined when a query that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var query = await lytics.getQuery('xxx');
        assert.isUndefined(query);
    });
    it('should return a query when a query that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var query = await lytics.getQuery('user_web_default');
        assert.isDefined(query);
    });
});

describe('upsertQuery', function () {
    it('should throw an error when invalid LQL is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var wasThrown = false;
        try {
            await lytics.upsertQuery('xxx');
        }
        catch(err) {
            wasThrown = true;
        }
        assert.isTrue(wasThrown);
    });
    it('should return when valid LQL is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const alias = '_DELETE_ME_unit_test';
        const lql = 'SELECT email FROM test_stream INTO user BY email ALIAS aaa';
        let query = await lytics.getQuery(alias);
        assert.isUndefined(query, 'The test query already exists. The test cannot continue.');
        await lytics.upsertQuery(lql);
        query = await lytics.getQuery(alias);
        assert.isDefined(query);
        assert.equal(query!.alias, alias);
        assert.equal(query!.text, lql);
        const wasDeleted = await lytics.deleteQuery(alias);
        assert.isTrue(wasDeleted);
    });
});

describe('getQueriesGroupedByTable', function () {
    it('gets a map of the queries', async function () {
        const lytics = new LyticsClient(apikey);
        var queries = await lytics.getQueriesGroupedByTable();
        assert.isDefined(queries);
        assert.isNotEmpty(queries.get('user'));
    });
});

describe('testQuery', function () {
    it('evaluates properly when valid LQL and data are provided', async function () {
        const lytics = new LyticsClient(apikey);
        const lql = `
        SELECT

        first                   AS first_name               SHORTDESC "First Name"
        , last                  AS last_name                SHORTDESC "Last Name"
        -- By Fields/Unique Keys
        , email(email)          AS email                    SHORTDESC "Email"
    
    FROM test_stream
    INTO user BY email 
    ALIAS test_query
            `;
        const data = { first: "Adam", last: "Conn", email: "adam.conn@lytics.com" };
        const response = await lytics.testQuery(lql, data);
        assert.isDefined(response);
        assert.equal(response.first_name, "Adam");
        assert.equal(response.last_name, "Conn");
        assert.equal(response.email, "adam.conn@lytics.com");
    });
});