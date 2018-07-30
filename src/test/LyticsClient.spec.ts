import { LyticsClient } from '../LyticsClient';
import { assert } from 'chai';

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
        assert.isNotNull(accounts);
        assert.equal(accounts.length, 1);
        assert.equal(accounts[0].aid, aid);
    });
});

describe('getAccount', function () {
    it('should return null when a mismatched account id is used', async function () {
        const lytics = new LyticsClient(apikey);
        var account = await lytics.getAccount(123);
        assert.isNull(account);
    });
    it('should return an account when a matched account id is used', async function () {
        const lytics = new LyticsClient(apikey);
        var account = await lytics.getAccount(aid);
        assert.isNotNull(account);
        assert.equal(account!.aid, aid);
    });
});

describe('getStreams', function () {
    it('should return an array of data streams', async function () {
        const lytics = new LyticsClient(apikey);
        var streams = await lytics.getStreams();
        assert.isNotNull(streams);
        assert.isTrue(streams.length >= 2);
        assert.isNotNull(streams.find(s => s.stream == 'default'));
        assert.isNotNull(streams.find(s => s.stream == 'lytics_content_enrich'));
    });
    it('should return null when a data stream that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var stream = await lytics.getStream('xxx');
        assert.isNull(stream);
    });
    it('should return a data stream', async function () {
        const lytics = new LyticsClient(apikey);
        var stream = await lytics.getStream('default');
        assert.isNotNull(stream);
        assert.equal(stream!.stream, 'default');
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
        assert.isNotNull(response);
        assert.equal(response.first_name, "Adam");
        assert.equal(response.last_name, "Conn");
        assert.equal(response.email, "adam.conn@lytics.com");
    });
});