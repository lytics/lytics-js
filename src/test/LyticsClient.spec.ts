import { LyticsClient } from '../LyticsClient';
import { assert } from 'chai';
import { TableSchemaFieldInfo, CollectResultInfo, CampaignVariation, CampaignVariationDetail } from '../types';
import { doesNotReject } from 'assert';
const settings = require('./settings');

const apikey: string = settings.lytics_apikey;
const aid: number = settings.lytics_aid;

before(function (done) {
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

describe('getTableSchema', function () {
    it('should return undefined when a table that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var schema = await lytics.getTableSchema('xxx');
        assert.isUndefined(schema);
    });
    it('should return an object when the user table is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var schema = await lytics.getTableSchema('user');
        assert.isDefined(schema);
        assert.equal(schema!.name, 'user');
        assert.isTrue(schema!.columns.length > 0);
        assert.isTrue(schema!.by_fields.length > 0);
    });
});

describe('getTableSchemaFieldInfo', function () {
    it('should return undefined when a table that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('xxx', 'yyy');
        assert.isUndefined(info);
    });
    it('should return undefined when the table exists but the field does not', async function () {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('user', 'yyy');
        assert.isUndefined(info);
    });
    it('should return an object when the user table and email field are specified', async function () {
        const lytics = new LyticsClient(apikey);
        const info = await lytics.getTableSchemaFieldInfo('user', '_uid');
        assert.isDefined(info);
        assert.equal(info!.field, '_uid');
        const counts = TableSchemaFieldInfo.getTermCounts(info);
        assert.isNotEmpty(counts);
    });
});

describe('getTableSchemaFieldInfo', function () {
    it('should return undefined when a table that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('xxx', 'yyy');
        assert.isUndefined(info);
    });
    it('should return undefined when the table exists but the field does not', async function () {
        const lytics = new LyticsClient(apikey);
        var info = await lytics.getTableSchemaFieldInfo('user', 'yyy');
        assert.isUndefined(info);
    });
    it('should return a field info object when the user table is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const info = await lytics.getTableSchemaFieldInfo('user', '_uid');
        assert.isDefined(info);
        assert.equal(info!.field, '_uid');
        const counts = TableSchemaFieldInfo.getTermCounts(info);
        assert.isNotEmpty(counts);
    });
});

describe('getEntity', function () {
    it('should return undefined when a table that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('xxx', 'yyy', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return undefined when the table exists but the field does not', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'yyy', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return undefined when the table and field exist but the value does not match an entity', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'zzz');
        assert.isUndefined(entity);
    });
    it('should return an object when the table, field and value match an existing entity', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', '_uid', '114940.99527438209');
        assert.isDefined(entity);
        assert.equal(entity!._uid, '114940.99527438209');
    });
    it('should return an object when wait is true', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', '_uid', '114940.99527438209', true);
        assert.isDefined(entity);
        assert.equal(entity!._uid, '114940.99527438209');
    });
    it('should return an object when wait is false', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', '_uid', '114940.99527438209', false);
        assert.isDefined(entity);
        assert.equal(entity!._uid, '114940.99527438209');
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
        catch (err) {
            wasThrown = true;
        }
        assert.isTrue(wasThrown);
    });
    it('should return when valid LQL is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const alias = '_DELETE_me_unit_test'.toLowerCase();
        const lql = `SELECT email FROM test_stream INTO user BY email ALIAS ${alias}`;
        let query = await lytics.getQuery(alias);
        assert.isUndefined(query, 'The test query already exists. The test cannot continue.');
        var query2 = await lytics.upsertQuery(lql);
        assert.isDefined(query2);
        assert.isNotEmpty(query2);
        assert.equal(query2[0].alias, alias);
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

describe('toLql', function () {
    it('generates LQL when text is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const csv = `user_id,event,ts
        7456,login,"2012-10-17T17:29:39.738Z"
        1234,"a quoted bad event","2012-12-11T19:53:31.547Z"`;
        const response = await lytics.toLql(csv);
        assert.isDefined(response);
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

describe('collect', function () {
    it('should not throw an error when data is written to a stream', async function () {
        const lytics = new LyticsClient(apikey);
        const result = await lytics.collect('test-stream-unit-test', { name: 'aaa' }) as CollectResultInfo;
        assert.isDefined(result);
        assert.equal(result.message_count, 1);
    });
});

describe('getSegmentCollection', function () {
    it('should get all segments when no parameter is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegmentCollection();
        assert.isDefined(segments);
        assert.isDefined(segments.audiences);
        assert.isDefined(segments.characteristics);
        assert.isDefined(segments.unidentified);
    });
    it('should get 1 segment when only 1 segment is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegmentCollection(['fcfb11e24b93964cba3aa2527ab913a3']);
        assert.isDefined(segments);
        assert.isDefined(segments.audiences);
        assert.equal(segments.audiences.length, 1);
        assert.isDefined(segments.characteristics);
        assert.equal(segments.characteristics.length, 0);
        assert.isDefined(segments.unidentified);
        assert.equal(segments.unidentified.length, 0);
    });
    it('should get 0 segment when a segment is specified that does not exist', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegmentCollection(['aaaaa']);
        assert.isDefined(segments);
        assert.isDefined(segments.audiences);
        assert.equal(segments.audiences.length, 0);
        assert.isDefined(segments.characteristics);
        assert.equal(segments.characteristics.length, 0);
        assert.isDefined(segments.unidentified);
        assert.equal(segments.unidentified.length, 0);
    });
});

describe('getSegments', function () {
    it('should get all segments', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegments();
        assert.isDefined(segments);
        assert.isTrue(segments.length > 0);
    });
});

describe('getSegment', function () {
    it('should get undefined is the value specified does not match an existing segment', async function () {
        const lytics = new LyticsClient(apikey);
        const segment = await lytics.getSegment('asdasd');
        assert.isUndefined(segment);
    });
    it('should get the segment by slug', async function () {
        const lytics = new LyticsClient(apikey);
        const segment = await lytics.getSegment('all');
        assert.isDefined(segment);
        assert.equal(segment!.slug_name, 'all');
    });
    it('should get the segment by id', async function () {
        const lytics = new LyticsClient(apikey);
        const segment = await lytics.getSegment('fcfb11e24b93964cba3aa2527ab913a3');
        assert.isDefined(segment);
        assert.equal(segment!.id, 'fcfb11e24b93964cba3aa2527ab913a3');
    });
});

describe('getCampaigns', function () {
    it('should return campaigns', async function () {
        const lytics = new LyticsClient(apikey);
        var campaigns = await lytics.getCampaigns();
        assert.isDefined(campaigns);
        assert.isArray(campaigns);
    });
});
describe('getCampaign', function () {
    it('should return the specified campaign when the campaign exists', async function () {
        const campaignId = "38adaf20d5cad612b013ae2082cd8ae3";
        const lytics = new LyticsClient(apikey);
        var campaign = await lytics.getCampaign(campaignId);
        assert.isDefined(campaign);
        assert.equal(campaign!.id, campaignId);
    });
    it('should return undefined when the campaign does not exist', async function () {
        const campaignId = "sdfasdfasdfasfda";
        const lytics = new LyticsClient(apikey);
        var campaign = await lytics.getCampaign(campaignId);
        assert.isUndefined(campaign);
    });
});

describe('getCampaignVariations', function () {
    it('should return an array when a campaign that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const campaignId = "38adaf20d5cad612b013ae2082cd8ae3";
        var variations = await lytics.getCampaignVariations(campaignId);
        assert.isDefined(variations);
        assert.isArray(variations);
        assert.isNotEmpty(variations);
        for (let i = 0; i < variations.length; i++) {
            assert.equal(variations[i].campaign_id, campaignId);
        }
    });
    it('should return an empty array when a campaign that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var variations = await lytics.getCampaignVariations("sdfsdfsdfjkhkjsdf");
        assert.isDefined(variations);
        assert.isArray(variations);
        assert.isEmpty(variations);
    });
});

describe('getCampaignVariation', function () {
    it('should return an object when a campaign variation that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const variationId = "c7bcd903694c66d1d72371b51286f7da";
        var variation = await lytics.getCampaignVariation(variationId);
        assert.isDefined(variation);
        assert.equal(variation!.id, variationId);
    });
    it('should return undefined when a campaign variation that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var variation = await lytics.getCampaignVariation("sdfsdfsdfjkhkjsdf");
        assert.isUndefined(variation);
    });
});
describe('updateCampaignVariation', function () {
    it('should return the updated variation when a campaign variation that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const variationId = "e95f1ed37d357fff00aa938ca947e407";
        const layout = "slideout";
        const attachment = "bottom-left";
        const variation = await lytics.getCampaignVariation(variationId);
        assert.isDefined(variation);
        variation!.detail!.layout = layout;
        variation!.detail!.attachment = attachment;
        const variation2 = await lytics.updateCampaignVariation(variationId, variation!);
        assert.isDefined(variation2);
        assert.equal(variation2!.id, variationId);
        assert.equal(variation2!.detail!.layout, layout);
        assert.equal(variation2!.detail!.attachment, attachment);
    });
});

describe('getCampaignVariationDetailOverride', function () {
    it('should return an object when a campaign variation that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const variationId = "5ad0b92b1eec4903fa4c21a3046d72a8";
        var override = await lytics.getCampaignVariationDetailOverride(variationId);
        assert.isDefined(override);
        assert.isFalse(override!.fields!.email);
    });
    it('should return undefined when a campaign variation that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        var override = await lytics.getCampaignVariation("sdfsdfsdfjkhkjsdf");
        assert.isUndefined(override);
    });
});

describe('updateCampaignVariationDetailOverride', function () {
    it('should return the updated variation when a campaign variation that exists is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const variationId = "5ad0b92b1eec4903fa4c21a3046d72a8";
        const override = await lytics.getCampaignVariationDetailOverride(variationId);
        assert.isDefined(override);
        assert.isFalse(override!.fields!.email);
        override!.fields!.email = true;
        const variation2 = await lytics.updateCampaignVariationDetailOverride(variationId, override!);
        assert.isDefined(variation2);

        const override2 = await lytics.getCampaignVariationDetailOverride(variationId);
        assert.isDefined(override2);
        assert.isTrue(override2!.fields!.email);
        override2!.fields!.email = false;
        const variation3 = await lytics.updateCampaignVariationDetailOverride(variationId, override2!);
        assert.isDefined(variation3);

        const override3 = await lytics.getCampaignVariationDetailOverride(variationId);
        assert.isDefined(override3);
        assert.isFalse(override3!.fields!.email);
    });
});

describe('classifyUsingText', function () {
    it('should return an object when enough text is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const text = '50% of the Dawn of Love is an oil painting by English artist William Etty, first exhibited in 1828. Loosely based on a passage from John Miltons 1634 Comus, it shows Venus leaning across to wake the sleeping Love by stroking his wings. It was very poorly received when first exhibited; the stylised Venus was thought unduly influenced by foreign artists such as Rubens as well as being overly voluptuous and unrealistically coloured, while the painting as a whole was considered tasteless and obscene. The Dawn of Love was omitted from the major 1849 retrospective exhibition of Ettys works, and its exhibition in Glasgow in 1899 drew complaints for its supposed obscenity. In 1889 it was bought by Merton Russell-Cotes, and has remained in the collection of the Russell-Cotes Art Gallery & Museum ever since.';
        var classification = await lytics.classifyUsingText(text);
        assert.isDefined(classification);
    });
    it('throws an error when not enough text is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const text = 'This is a test.';
        try {
            var classification = await lytics.classifyUsingText(text);
        }
        catch (err) {
            return Promise.resolve();
        }
        return Promise.reject('No error was thrown.');
    });
});

describe('classifyUsingUrl', function () {
    it('should return an object when enough text is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const url = "https://www.google.com";
        var classification = await lytics.classifyUsingUrl(url);
        assert.isDefined(classification);
    });
    it('throws an error when an invalid url is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const url = 'not a url';
        try {
            var classification = await lytics.classifyUsingUrl(url);
        }
        catch (err) {
            return Promise.resolve();
        }
        return Promise.reject('No error was thrown.');
    });
});

describe('testFunction', function () {
    it('The tobool function returns true.', async function () {
        const lytics = new LyticsClient(apikey);
        var result = await lytics.testFunction('tobool', ['true']);
        assert.isTrue(result);
    });
    it('The toint function returns an integer.', async function () {
        const lytics = new LyticsClient(apikey);
        var result = await lytics.testFunction('toint', ['100']);
        assert.equal(result, 100);
    });
});
