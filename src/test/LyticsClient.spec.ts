import { LyticsClient, LyticsClientOptions } from '../LyticsClient';
import { assert } from 'chai';
import { TableSchemaFieldInfo, CollectResultInfo, WebhookConfig, CreateAccessTokenConfig, LyticsAccessTokenReader, LyticsAccessTokenConfig, DataUploadConfig, Fragment, FragmentCollection, FragmentKey, FragmentHashManager, SegmentMLModelConfig, CreateSegmentMLModelConfig } from '../types';
import { URL } from 'url';
import { isArray } from 'util';
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
    //
    it('should return an object when a value that must be url-encoded is used', async function () {
        const lytics = new LyticsClient(apikey);
        var entity = await lytics.getEntity('user', 'email', 'adam.conn+test10@gmail.com', false);
        assert.isDefined(entity);
        assert.equal(entity!.email, 'adam.conn+test10@gmail.com');
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

describe('validateQuery', function () {
    it('validation fails with invalid LQL', async function () {
        const lytics = new LyticsClient(apikey);
        const lql = 'SELECT email(`email) AS email FROM test INTO user BY email ALIAS test';
        let result = await lytics.validateQuery(lql);
        assert.isFalse(result.success);
    });
    it('validation is successful with valid LQL', async function () {
        const lytics = new LyticsClient(apikey);
        const lql = 'SELECT email(`email`) AS email FROM test INTO user BY email ALIAS test';
        let result = await lytics.validateQuery(lql);
        assert.isTrue(result.success);
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

describe('getSegmentGroup', function () {
    it('should get all segments when no parameter is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegmentGrouping();
        assert.isDefined(segments);
        assert.isDefined(segments.audiences);
        assert.isDefined(segments.characteristics);
        assert.isDefined(segments.unidentified);
    });
    it('should get 1 segment when only 1 segment is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const segments = await lytics.getSegmentGrouping(['fcfb11e24b93964cba3aa2527ab913a3']);
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
        const segments = await lytics.getSegmentGrouping(['aaaaa']);
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

describe('getSegmentCollections', function () {
    it('should get all segment collections', async function () {
        const lytics = new LyticsClient(apikey);
        const collections = await lytics.getSegmentCollections();
        assert.isDefined(collections);
        assert.isTrue(collections.length > 0);
    });
});

describe('getSegmentCollection', function () {
    it('should get undefined is the value specified does not match an existing segment collection', async function () {
        const lytics = new LyticsClient(apikey);
        const collection = await lytics.getSegmentCollection('asdasd');
        assert.isUndefined(collection);
    });
    it('should get the segment collection by slug', async function () {
        const lytics = new LyticsClient(apikey);
        const collection = await lytics.getSegmentCollection('segmentation_email_capture');
        assert.isDefined(collection);
        assert.equal(collection!.slug_name, 'segmentation_email_capture');
    });
    it('should get the segment collection by id', async function () {
        const lytics = new LyticsClient(apikey);
        const collection = await lytics.getSegmentCollection('00d8698ed83dc7edf6e9e31c77a60e74');
        assert.isDefined(collection);
        assert.equal(collection!.id, '00d8698ed83dc7edf6e9e31c77a60e74');
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
    it('The qs function returns a string.', async function () {
        const lytics = new LyticsClient(apikey);
        var result = await lytics.testFunction('qs', ['https://www.lytics.com/test?name=First+Last', 'name']);
        assert.equal(result, 'First Last');
    });
});

describe('setWhitelistFieldStatus', function () {
    it('Add an already existing field returns false.', async function () {
        const lytics = new LyticsClient(apikey);
        const before = await lytics.getWhitelistFields(aid);
        const resetWhenFinished = before.indexOf('email') == -1;
        if (resetWhenFinished) {
            await lytics.setWhitelistFieldStatus(aid, 'email', true);
        }
        var result = await lytics.setWhitelistFieldStatus(aid, 'email', true);
        assert.isFalse(result);
        if (resetWhenFinished) {
            result = await lytics.setWhitelistFieldStatus(aid, 'email', false);
            assert.isTrue(result);
        }
        const after = await lytics.getWhitelistFields(aid);
        before.sort();
        after.sort();
        assert.equal(after.length, before.length);
        for (var i = 0; i < before.length; i++) {
            assert.equal(after[i], before[i]);
        }
    });
});

describe('getTopics', function () {
    it('should get all topics with no limit set', async function () {
        const lytics = new LyticsClient(apikey);
        const topics = await lytics.getTopics();
        assert.isDefined(topics);
        assert.isTrue(topics.length > 0);
        assert.isTrue(topics.length <= 500);
    });
    it('should get 2 topics when limit is set to 2', async function () {
        const lytics = new LyticsClient(apikey);
        const topics = await lytics.getTopics(2);
        assert.isDefined(topics);
        assert.equal(topics.length, 2);
    });
});

describe('getTopic', function () {
    it('should get undefined when the specified label does not match an existing topic', async function () {
        const lytics = new LyticsClient(apikey);
        const topic = await lytics.getTopic('asdasd');
        assert.isDefined(topic);
        assert.equal(topic!.doc_count, 0);
    });
    it('should get the topic that matches the specified label', async function () {
        const lytics = new LyticsClient(apikey);
        const topic = await lytics.getTopic('Protein');
        assert.isDefined(topic);
        assert.equal(topic!.label, 'Protein');
        assert.isTrue(topic!.doc_count > 0);
    });
});

describe('getTopicUrls', function () {
    it('should get an empty collection when no topic matches the specified label', async function () {
        const lytics = new LyticsClient(apikey);
        const urls = await lytics.getTopicUrls('asdasd');
        assert.isDefined(urls);
        assert.equal(urls!.total, 0);
        assert.isDefined(urls!.urls);
        assert.equal(urls!.urls.length, 0);
    });
    it('should get a populated collection when a topic matches the specified label', async function () {
        const lytics = new LyticsClient(apikey);
        const urls = await lytics.getTopicUrls('Protein');
        assert.isDefined(urls);
        assert.isTrue(urls!.total > 0);
        assert.isDefined(urls!.urls);
        assert.isTrue(urls!.urls.length > 0);
    });
});

describe('getSubscriptions', function () {
    it('should return subscriptions', async function () {
        const lytics = new LyticsClient(apikey);
        var subscriptions = await lytics.getSubscriptions();
        assert.isDefined(subscriptions);
        assert.isArray(subscriptions);
    });
});
describe('getSubscription', function () {
    it('should return the specified subscription when the subscription exists', async function () {
        const subscriptionId = "17e5c8c1a9f8e467d6786497a32c9ffc";
        const lytics = new LyticsClient(apikey);
        var subscription = await lytics.getSubscription(subscriptionId);
        assert.isDefined(subscription);
        assert.equal(subscription!.id, subscriptionId);
    });
    it('should return undefined when the subscription does not exist', async function () {
        const subscriptionId = "sdfasdfasdfasfda";
        const lytics = new LyticsClient(apikey);
        var subscription = await lytics.getSubscription(subscriptionId);
        assert.isUndefined(subscription);
    });
});
describe('createWebhook', function () {
    it('should throw error when values are missing from the webhook config object', async function () {
        const lytics = new LyticsClient(apikey);
        lytics.createWebhook(new WebhookConfig())
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should return a subscription when the webhook config object is properly configured', function () {
        const lytics = new LyticsClient(apikey);
        const config = new WebhookConfig();
        const d = new Date();
        config.name = `CREATE UNIT TEST ${d}`;
        config.description = `subscription for unit test ${d}`;
        config.segment_ids.push('c5cbd2543e9c1fb33b78bcc5b58dec3a'); //all
        config.segment_ids.push('809ab71ce55ec096a9b4bdff0c108456'); //new
        config.webhook_url = new URL('https://localhost/test');
        lytics.createWebhook(config).then(subscription => {
            assert.isDefined(subscription);
            assert.equal(subscription!.name, config.name);
            assert.equal(subscription!.description, config.description);
            assert.equal(subscription!.segment_ids.length, config.segment_ids.length);
            //
            //delete subscription
            const id = subscription!.id!;
            lytics.deleteSubscription(id).then(wasDeleted => {
                assert.isTrue(wasDeleted);
                //
                //ensure subscription does not exist
                lytics.getSubscription(id).then(subscription => {
                    assert.isUndefined(subscription);
                })
            })
        });
    });
});
describe('updateWebhook', function () {
    it('should throw error when no id is specified', async function () {
        const lytics = new LyticsClient(apikey);
        lytics.updateWebhook('', new WebhookConfig())
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should throw error when values are missing from the webhook config object', async function () {
        const lytics = new LyticsClient(apikey);
        lytics.updateWebhook('aaaa', new WebhookConfig())
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should return a subscription when the webhook config object is properly configured', function () {
        const lytics = new LyticsClient(apikey);
        const config = new WebhookConfig();
        const d = new Date();
        config.name = `UPDATE UNIT TEST ${d}`;
        config.description = `subscription for unit test ${d}`;
        config.segment_ids.push('c5cbd2543e9c1fb33b78bcc5b58dec3a'); //all
        config.segment_ids.push('809ab71ce55ec096a9b4bdff0c108456'); //new
        config.webhook_url = new URL('https://localhost/test');
        lytics.createWebhook(config).then(subscription => {
            assert.isDefined(subscription);
            assert.equal(subscription!.name, config.name);
            assert.equal(subscription!.description, config.description);
            assert.equal(subscription!.segment_ids.length, config.segment_ids.length);
            config.name = `xxx ${config.name}`;
            lytics.updateWebhook(subscription!.id!, config).then(subscription => {
                assert.isDefined(subscription);
                assert.equal(subscription!.name, config.name);
                //
                //delete subscription
                const id = subscription!.id!;
                lytics.deleteSubscription(id).then(wasDeleted => {
                    assert.isTrue(wasDeleted);
                    //
                    //ensure subscription does not exist
                    lytics.getSubscription(id).then(subscription => {
                        assert.isUndefined(subscription);
                    })
                })
            });
        });
    });
});
describe('deleteSubscription', function () {
    it('should throw error when trying to delete a subscription that does not exist', async function () {
        const lytics = new LyticsClient(apikey);
        lytics.deleteSubscription('asdasdasda')
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should return when a subscription is deleted', function () {
        //
        //create a subscription
        const lytics = new LyticsClient(apikey);
        const config = new WebhookConfig();
        const d = new Date();
        config.name = `DELETE UNIT TEST ${d}`;
        config.description = `subscription for unit test ${d}`;
        config.segment_ids.push('c5cbd2543e9c1fb33b78bcc5b58dec3a'); //all
        config.segment_ids.push('809ab71ce55ec096a9b4bdff0c108456'); //new
        config.webhook_url = new URL('https://localhost/test');
        lytics.createWebhook(config)
            .then(subscription => {
                assert.isDefined(subscription);
                assert.isDefined(subscription!.id);
                const id = subscription!.id!;
                //
                //ensure subscription exists
                lytics.getSubscription(subscription!.id!).then(subscription => {
                    assert.equal(subscription!.id, id);
                    //
                    //delete subscription
                    lytics.deleteSubscription(id).then(wasDeleted => {
                        assert.isTrue(wasDeleted);
                        //
                        //ensure subscription does not exist
                        lytics.getSubscription(id).then(subscription => {
                            assert.isUndefined(subscription);
                        })
                    })
                });
            })

    });
});

describe('createAccessToken', function () {
    it('should throw error when trying no values are set on the config object', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateAccessTokenConfig();
        lytics.createAccessToken(config)
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should return an access token', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateAccessTokenConfig();
        config.expires = '10m';
        config.name = 'unit_test_token';
        config.scopes.push('admin');
        const token = await lytics.createAccessToken(config);
        assert.isDefined(token);
        assert.equal(token!.description, config.name);
        assert.isDefined(token!.config);
        const apikey2 = LyticsAccessTokenReader.getApiKey(token!);
        assert.isDefined(apikey2);
        const client = new LyticsClient(apikey2!);
        const account = await client.getAccount(aid);
        assert.isDefined(account);
    });
});

describe('getAccessTokens', function () {
    it('should return undefined if an aid that does not exist is used', async function () {
        const lytics = new LyticsClient(apikey);
        lytics.getAccessTokens(111231231)
            .then(result => assert.isTrue(false))
            .catch(err => assert.isTrue(true));
    });
    it('should return an array', async function () {
        const lytics = new LyticsClient(apikey);
        const tokens = await lytics.getAccessTokens(aid);
        assert.isDefined(tokens);
    });
});

describe('getAccessToken', function () {
    it('should return undefined when an access token that does not exist is specified', async function () {
        const lytics = new LyticsClient(apikey);
        const token = await lytics.getAccessToken('xxxxx', aid);
        assert.isUndefined(token);
    });
    it('should return an access token', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateAccessTokenConfig();
        config.name = 'test-token';
        config.expires = '10m';
        config.scopes.push('admin');
        const token = await lytics.createAccessToken(config);
        assert.isDefined(token);
        assert.isDefined(token!.id);
        assert.equal(token!.description, config.name);
        const token2 = await lytics.getAccessToken(token!.id!, aid);
        assert.isDefined(token2);
        assert.equal(token2!.id, token!.id);
        const wasDeleted = await lytics.deleteAccessToken(token!.id!, aid);
        assert.isTrue(wasDeleted);
        const token3 = await lytics.getAccessToken(token!.id!, aid)
        assert.isUndefined(token3);
    });
});

describe('getTokenScopes', function () {
    it('should return an array', async function () {
        const lytics = new LyticsClient(apikey);
        const scopes = await lytics.getTokenScopes();
        assert.isDefined(scopes);
        assert.isTrue(isArray(scopes));
    });
});

describe('getAccountSettings', function () {
    it('should return an array of account settings', async function () {
        const lytics = new LyticsClient(apikey);
        const settings = await lytics.getAccountSettings();
        assert.isDefined(settings);
        assert.isTrue(isArray(settings));
    });
});

describe('getAccountSettingsGroupedByCategory', function () {
    it('should return a map of account settings', async function () {
        const lytics = new LyticsClient(apikey);
        const map = await lytics.getAccountSettingsGroupedByCategory();
        assert.isDefined(map);
        for (let key of map.keys()) {
            const settings = map.get(key);
            assert.isDefined(settings);
            for (var i=0; i<settings!.length; i++) {
                assert.equal(settings![i].category, key);
            }
        }
    });
});

describe('getAccountSetting', function () {
    it('should return undefined if an invalid slug is used', async function () {
        const slug = 'xxxx';
        const lytics = new LyticsClient(apikey);
        const setting = await lytics.getAccountSetting(slug);
        assert.isUndefined(setting);
    });
    it('should return an object when a valid slug is used', async function () {
        const slug = 'api_whitelist_domains';
        const lytics = new LyticsClient(apikey);
        const setting = await lytics.getAccountSetting(slug);
        assert.isDefined(setting);
        assert.equal(setting!.slug, slug);
    });
});

describe('updateAccountSetting', function () {
    it('should return undefined if the slug of a setting that does not exist is specified', async function () {
        const slug = 'xxxx';
        const lytics = new LyticsClient(apikey);
        const setting = await lytics.updateAccountSetting(slug, 'aaaaa');
        assert.isUndefined(setting);
    });
    it('should throw an error if no value is specified', async function () {
        const slug = 'api_whitelist_domains';
        const lytics = new LyticsClient(apikey);
        try {
            const setting = await lytics.updateAccountSetting(slug, undefined);
            assert.isTrue(false, 'An error should have been thrown.');
        }
        catch (err) {
            assert.isTrue(true);
        }
        try {
            const setting = await lytics.updateAccountSetting(slug, null);
            assert.isTrue(false, 'An error should have been thrown.');
        }
        catch (err) {
            assert.isTrue(true);
        }
    });
    it('should throw an error if an invalid value is specified', async function () {
        const slug = 'api_whitelist_domains';
        const lytics = new LyticsClient(apikey);
        try {
            const setting = await lytics.updateAccountSetting(slug, false);
            assert.isTrue(false, 'An error should have been thrown if false is set for an array setting.');
        }
        catch (err) {
            assert.isTrue(true);
        }
    });
    it('should return an object when an existing account setting is updated with a compatible value', async function () {
        const newValue = ['www.lytics.com', 'new.lytics.com'];
        const slug = 'api_whitelist_domains';
        const lytics = new LyticsClient(apikey);
        const setting = await lytics.updateAccountSetting(slug, newValue);
        assert.isDefined(setting);
        assert.equal(setting!.slug, slug);
        assert.isDefined(setting!.value);
        assert.isTrue(isArray(setting!.value));
        assert.equal(setting!.value!.length, newValue.length);
        for (let i = 0; i < newValue.length; i++) {
            assert.equal(setting!.value![i], newValue[i]);
        }
        const result = await lytics.deleteAccountSetting(slug);
        assert.isTrue(result);
    });
});

describe('getDocumentTopics', function () {
    it('should throw an error if an empty url is provided', async function () {
        const lytics = new LyticsClient(apikey);
        try {
            await lytics.getDocumentTopics('  ');
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
    });
    it('should return undefined if a url that has not been crawled is provided', async function () {
        const lytics = new LyticsClient(apikey);
        const topics = await lytics.getDocumentTopics('xxxxxxx');
        assert.isUndefined(topics);
    });
    it('should return topic if a url that has been crawled is provided', async function () {
        const url = 'adamconn.lyticsdemo.com/no-cook-yogurt-cups.html';
        const lytics = new LyticsClient(apikey);
        const topics = await lytics.getDocumentTopics(url);
        assert.isDefined(topics);
        assert.equal(topics!.url, url);
        const topics2 = await lytics.getDocumentTopics(`https://${url}`);
        assert.isDefined(topics2);
        assert.equal(topics2!.url, url);
    });
});

describe('uploadData', function () {
    it('should throw an error if parameters are missing', async function () {
        const lytics = new LyticsClient(apikey);
        try {
            await lytics.uploadData(new DataUploadConfig('xxxxx'), undefined);
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
    });
    it('should return that one message was handled', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new DataUploadConfig('xxxxx');
        config.dryrun = true;
        const data = { name: "Test User 1" };
        const result = await lytics.uploadData(config, data);
        assert.isDefined(result);
        assert.equal(result.message_count, 1);
        assert.equal(result.rejected_count, 0);
    });
    it('should return that multiple message were handled', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new DataUploadConfig('xxxxx');
        config.dryrun = true;
        const data = [
            { name: "Test User 1" },
            { name: "Test User 2" }
        ];
        const result = await lytics.uploadData(config, data);
        assert.isDefined(result);
        assert.equal(result.message_count, data.length);
        assert.equal(result.rejected_count, 0);
    });
});
describe('getSegmentMLModels', function () {
    it('should return an array of models', async function () {
        const lytics = new LyticsClient(apikey);
        const models = await lytics.getSegmentMLModels();
        assert.isDefined(models);
        assert.isTrue(isArray(models));
    });
});

describe('getSegmentMLModel', function () {
    it('should return undefined if an invalid id is used', async function () {
        const id = 'xxxx';
        const lytics = new LyticsClient(apikey);
        const model = await lytics.getSegmentMLModel(id);
        assert.isUndefined(model);
    });
    it('should return a model when a valid id is used', async function () {
        const id = 'smt_new::smt_active';
        const lytics = new LyticsClient(apikey);
        const model = await lytics.getSegmentMLModel(id);
        assert.isDefined(model);
        assert.isDefined(model!.conf);
        assert.isDefined(model!.conf!.source);
        assert.isDefined(model!.conf!.source!.slug_name);
        assert.isDefined(model!.conf!.target);
        assert.isDefined(model!.conf!.target!.slug_name);
        assert.equal(`${model!.conf!.source!.slug_name}::${model!.conf!.target!.slug_name}`, id);
    });
});

describe('createSegmentMLModel', function () {
    it('should return a model when valid parameters are used', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateSegmentMLModelConfig();
        config.source = "all";
        config.target = "smt_active";
        config.use_scores = true;
        const model = await lytics.createSegmentMLModel(config);
        assert.isDefined(model);
    });
    it('should throw an error if the source segment is too small', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateSegmentMLModelConfig();
        config.source = "smt_new";
        config.target = "smt_active";
        config.use_scores = true;
        try {
            const model = await lytics.createSegmentMLModel(config);
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
    });
    it('should throw an error if the target segment is too small', async function () {
        const lytics = new LyticsClient(apikey);
        const config = new CreateSegmentMLModelConfig();
        config.source = "smt_active";
        config.target = "smt_new";
        config.use_scores = true;
        try {
            const model = await lytics.createSegmentMLModel(config);
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
    });
});

describe('createSegmentMLModel', function () {
    it('should delete the model when the generation number is included', async function () {
        const lytics = new LyticsClient(apikey);
        const result = await lytics.deleteSegmentMLModel('all::smt_active::2');
        assert.isTrue(result);
    });
    it('should delete the model when no generation number is included', async function () {
        const lytics = new LyticsClient(apikey);
        const result = await lytics.deleteSegmentMLModel('all::smt_active');
        assert.isTrue(result);
    });
    it('should throw an error when the model does not exist', async function () {
        const lytics = new LyticsClient(apikey);
        const result = await lytics.deleteSegmentMLModel('xxx::yyy');
        assert.isFalse(result);
    });

});

describe('getFragments', function () {
    it('should throw an error if parameters are missing', async function () {
        const lytics = new LyticsClient(apikey);
        try {
            await lytics.getFragments('', 'bbb', 'ccc');
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
        try {
            await lytics.getFragments('aaa', '', 'ccc');
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
        try {
            await lytics.getFragments('aaa', 'bbb', '');
            assert.isTrue(false);
        }
        catch(err) {
            assert.isTrue(true);
        }
    });
    it('should return undefined if no matching fragments are found', async function () {
        const lytics = new LyticsClient(apikey);
        const fragments = await lytics.getFragments('user', 'xxxxx', 'xxxxx');
        assert.isUndefined(fragments);
    });
    it('should return collection of user fragments if matching fragments are found', async function () {
        const table = 'user';
        const field = 'email';
        const value = 'adam.conn@gmail.com';
        const lytics = new LyticsClient(apikey);
        const fragments = await lytics.getFragments(table, field, value);
        assert.isDefined(fragments);
        const entity = fragments!.entity;
        assert.isDefined(entity);
        assert.equal(entity[field], value);
        const keys = fragments!.keys;
        const key = keys.find(key => key.key === field);
        assert.isDefined(key);
        assert.equal(key!.value, value);
    });
    it('should return collection of content fragments if matching fragments are found', async function () {
        const table = 'content';
        const field = 'hashedurl';
        const value = '8197029859537599926';
        const lytics = new LyticsClient(apikey);
        const fragments = await lytics.getFragments(table, field, value);
        assert.isDefined(fragments);
        const entity = fragments!.entity;
        assert.isDefined(entity);
        assert.equal(entity[field], value);
        const keys = fragments!.keys;
        const key = keys.find(key => key.key === field);
        assert.isDefined(key);
        assert.equal(key!.value, value);
    });
});
describe('FragmentHashManager', function () {
    it('Hashes should match for 2 fragments with the same keys.', async function () {
        const keyA = new FragmentKey();
        keyA.key = 'aaa';
        keyA.value = '111';
        const keyB = new FragmentKey();
        keyB.key = 'bbb';
        keyB.value = '222';
        const fragment1 = new Fragment();
        fragment1.key.push(keyA);
        fragment1.key.push(keyB);
        const fragment2 = new Fragment();
        fragment2.key.push(keyB);
        fragment2.key.push(keyA);
        const hash1 = FragmentHashManager.getHashForKey(fragment1.key);
        const hash2 = FragmentHashManager.getHashForKey(fragment2.key);
        assert.equal(hash1, hash2);
    });
});