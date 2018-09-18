'use strict';
import axios, { AxiosRequestConfig, } from 'axios';
import qs = require('query-string');
import { LyticsAccount, DataStream, DataStreamField, TableSchema, TableSchemaField, TableSchemaFieldInfo, Query, CollectResultInfo, SegmentCollection, Segment, Campaign, CampaignVariation, ContentClassification, CampaignVariationDetailOverride, Topic, TopicUrlCollection, Subscription, WebhookConfig, CreateAccessTokenConfig, LyticsAccessToken, TokenScope } from './types';
import { isArray } from 'util';
import { URL } from 'url';

export class LyticsClientOptions {
    base_url: string = 'https://api.lytics.io';
    readonly apikey: string;
    constructor(apikey: string) {
        this.apikey = apikey;
    }
}

export class LyticsClient {
    private base_url = 'https://api.lytics.io';
    private apikey: string;
    private headers: any;
    constructor(apikey: string) {
        this.apikey = apikey;
        this.headers = {
            'Authorization': this.apikey,
            'Content-Type': 'application/json'
        };
    }
    static create(options: LyticsClientOptions): LyticsClient {
        const client = new LyticsClient(options.apikey!);
        client.base_url = options.base_url;
        return client;
    }
    private async doRequest(config: AxiosRequestConfig, dataHandler?: (data: string) => any): Promise<any> {
        var wasSuccess: boolean = false;
        const response = await axios.request(config);
        const data = response.data;
        if (!data && response.status === 204) {
            return Promise.resolve(undefined);
        }
        if (data.status === 200 || data.status === 201) {
            if (data.message === 'Not Found') {
                return Promise.resolve(undefined);
            }
            if (data.message === 'created' || data.message === 'success' || data.message === 'updated' || data.message.length === 0) {
                wasSuccess = true;
            }
        }
        if (!wasSuccess && data.status === 'success') {
            wasSuccess = true;
        }
        if (wasSuccess) {
            const data2 = dataHandler ? dataHandler(data) : data.data;
            return Promise.resolve(data2);
        }
        return Promise.reject(data);
    }

    private async doGet(url: string, dataHandler?: (data: string) => any): Promise<any> {
        const config = {
            url: url,
            method: 'get',
            headers: this.headers
        };
        return this.doRequest(config, dataHandler);
    }
    private async doPost(url: string, data: any, dataHandler?: (data: string) => any): Promise<any> {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        const config = {
            url: url,
            method: 'post',
            data: data,
            headers: this.headers
        };
        return this.doRequest(config, dataHandler);
    }
    private async doDelete(url: string, dataHandler?: (data: string) => any): Promise<any> {
        const config = {
            url: url,
            method: 'delete',
            headers: this.headers
        };
        return this.doRequest(config, dataHandler);
    }

    async getAccounts(): Promise<LyticsAccount[]> {
        const url = `${this.base_url}/api/account`;
        return this.doGet(url);
    }

    async getAccount(aid: number): Promise<LyticsAccount | undefined> {
        const url = `${this.base_url}/api/account/${aid}`;
        return this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(undefined);
                }
                throw err;
            });
    }
    async getStreams(): Promise<DataStream[]> {
        const url = `${this.base_url}/api/schema/_streams`;
        return this.doGet(url);
    }
    async getStream(name: string): Promise<DataStream | undefined> {
        if (this.isNullOrWhitespace(name)) {
            throw new Error('Required parameter is missing.');
        }
        const streams = await this.getStreams();
        const stream = streams.find(s => s.stream === name);
        if (!stream) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(stream);
    }
    async getStreamField(streamName: string, fieldName: string): Promise<DataStreamField | undefined> {
        if (this.isNullOrWhitespace(streamName) || this.isNullOrWhitespace(fieldName)) {
            throw new Error('Required parameter is missing.');
        }
        const streams = await this.getStreams();
        const stream = streams.find(stream => stream.stream === streamName);
        if (stream) {
            var field = stream.fields.find(field => field.name === fieldName);
            if (field) {
                return Promise.resolve(field);
            }
        }
        return Promise.resolve(undefined);
    }
    async getTableSchema(tableName: string): Promise<TableSchema | undefined> {
        if (this.isNullOrWhitespace(tableName)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/schema/${tableName}`;
        const data = await this.doGet(url);
        if (Object.keys(data).length == 0) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(data);
    }
    async getTableSchemaFieldInfo(tableName: string, fieldName: string): Promise<TableSchemaFieldInfo | undefined> {
        if (this.isNullOrWhitespace(tableName) || this.isNullOrWhitespace(fieldName)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/schema/${tableName}/fieldinfo?fields=${fieldName}`;
        const data = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 400) {
                    return;
                }
                if (err.response.status === 500) {
                    return;
                }
                throw err;
            });
        if (!data) {
            return Promise.resolve(undefined);
        }
        if (!isArray(data.fields) || data.fields.length != 1) {
            return Promise.reject('The fields property is not an array or the array does not have 1 member.');
        }
        return Promise.resolve(data.fields[0]);
    }
    async getEntity(tableName: string, fieldName: string, fieldValue: any, wait: boolean = false): Promise<any> {
        if (this.isNullOrWhitespace(tableName) || this.isNullOrWhitespace(fieldName) || !fieldValue) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/entity/${tableName}/${fieldName}/${fieldValue}?wait=${wait}`;
        const data = await this.doGet(url)
            .catch(err => {
                if (err.response.status == 500) {
                    //table not found
                    return Promise.resolve(undefined);
                }
            });
        return Promise.resolve(data);
    }

    async getQueries(): Promise<Query[]> {
        const url = `${this.base_url}/api/query`;
        return this.doGet(url);
    }
    async getQuery(alias: string): Promise<Query | undefined> {
        if (this.isNullOrWhitespace(alias)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/query/${alias}`;
        const data = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return;
                }
                throw err;
            });
        return Promise.resolve(data);
    }
    async upsertQuery(lql: string): Promise<Query[]> {
        if (this.isNullOrWhitespace(lql)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/query`;
        return this.doPost(url, lql);
    }
    async deleteQuery(alias: string): Promise<boolean> {
        if (this.isNullOrWhitespace(alias)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/query/${alias}`;
        const config = {
            url: url,
            method: 'delete',
            headers: this.headers
        };
        const response = await axios.request(config);
        if (response.status === 204) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    async getQueriesGroupedByTable(): Promise<Map<string, Query[]>> {
        const queries = await this.getQueries();
        let map: Map<string, Query[]> = new Map();
        for (let i = 0; i < queries.length; i++) {
            let query = queries[i];
            const table = query.table!;
            let values = map.get(table);
            if (!values) {
                values = [];
                map.set(table, values);
            }
            values.push(query);
        }
        return Promise.resolve(map);
    }

    async toLql(csvText: string): Promise<string | undefined> {
        if (this.isNullOrWhitespace(csvText)) {
            throw new Error('Required parameter is missing.');
        }
        const headers = this.headers;
        headers['Content-Type'] = 'application/csv';
        const url = `${this.base_url}/api/query/_tolql`;
        const config = {
            url: url,
            method: 'post',
            data: csvText,
            headers: this.headers
        };
        const response = await axios.request(config);
        return Promise.resolve(response.data);
    }

    async testQuery(lql: string, record: any): Promise<any> {
        if (this.isNullOrWhitespace(lql) || !record) {
            throw new Error('Required parameter is missing.');
        }
        const params = qs.stringify(record);
        const url = `${this.base_url}/api/query/_test?${params}`;
        return this.doPost(url, lql);
    }

    async collect(stream: string, data: any): Promise<CollectResultInfo | undefined> {
        if (this.isNullOrWhitespace(stream) || !data) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/collect/json/${stream}`;
        const result = await this.doPost(url, data);
        return Promise.resolve(result);
    }
    async getSegments(): Promise<Segment[]> {
        const url = `${this.base_url}/api/segment`;
        const segments = await this.doGet(url) as Segment[];
        if (!segments) {
            return Promise.resolve([]);
        }
        return Promise.resolve(segments);
    }
    async getSegment(idOrSlug: string): Promise<Segment | undefined> {
        if (this.isNullOrWhitespace(idOrSlug)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/segment/${idOrSlug}`;
        const segment = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return;
                }
                throw err;
            });
        return Promise.resolve(segment);
    }
    async getSegmentCollection(ids?: string[]): Promise<SegmentCollection> {
        const col = new SegmentCollection();
        const url = `${this.base_url}/api/segment`;
        const segments = await this.doGet(url) as Segment[];
        if (!segments) {
            return Promise.resolve(col);
        }
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (ids && ids.indexOf(segment.id!) === -1) {
                continue;
            }
            let target: Segment[] = col.unidentified;
            switch (segment.kind) {
                case 'segment':
                    target = col.audiences;
                    break;
                case 'aspect':
                    target = col.characteristics;
                    break;
            }
            if (target) {
                target.push(segment);
            }
        }
        return Promise.resolve(col);
    }
    private isNullOrWhitespace(value?: string): boolean {
        return (!value || value.trim().length == 0);
    }

    async getCampaigns(): Promise<Campaign[]> {
        const url = `${this.base_url}/api/program/campaign`;
        const campaigns = await this.doGet(url) as Campaign[];
        if (!campaigns) {
            return Promise.resolve([]);
        }
        return Promise.resolve(campaigns);
    }

    async getCampaign(id: string): Promise<Campaign | undefined> {
        if (this.isNullOrWhitespace(id)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/program/campaign/${id}`;
        const campaign = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(undefined);
                }
                throw err;
            });
        return Promise.resolve(campaign);
    }

    async getCampaignVariationsAll(): Promise<Map<string, CampaignVariation[]>> {
        const map = new Map<string, CampaignVariation[]>();
        const url = `${this.base_url}/api/program/campaign/variation`;
        const variations = await this.doGet(url) as CampaignVariation[];
        if (!variations) {
            return map;
        }
        for (let i = 0; i < variations.length; i++) {
            const variation = variations[i];
            if (!variation) {
                throw new Error(`Campaign variation at position ${i} is null.`);
            }
            if (!map.has(variation.campaign_id!)) {
                map.set(variation.campaign_id!, []);
            }
            const cvars = map.get(variation.campaign_id!);
            cvars!.push(variation);
        }
        return Promise.resolve(map);
    }

    async getCampaignVariations(campaignId: string): Promise<CampaignVariation[]> {
        if (this.isNullOrWhitespace(campaignId)) {
            throw new Error('Required parameter is missing.');
        }
        var map = await this.getCampaignVariationsAll();
        var variations = map.has(campaignId) ? map.get(campaignId) : [];
        return Promise.resolve(variations!);
    }

    async getCampaignVariation(variationId: string): Promise<CampaignVariation | undefined> {
        if (this.isNullOrWhitespace(variationId)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/program/campaign/variation/${variationId}`;
        const variation = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(undefined);
                }
                throw err;
            });
        return Promise.resolve(variation);
    }
    async updateCampaignVariation(variationId: string, variation: CampaignVariation): Promise<CampaignVariation | undefined> {
        if (this.isNullOrWhitespace(variationId) || !variation) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/program/campaign/variation/${variationId}`;
        return this.doPost(url, variation);
    }
    async getCampaignVariationDetailOverride(variationId: string): Promise<CampaignVariationDetailOverride | undefined> {
        var variation = await this.getCampaignVariation(variationId);
        if (!variation) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(variation.detail_override);
    }
    async updateCampaignVariationDetailOverride(variationId: string, override: CampaignVariationDetailOverride): Promise<CampaignVariation | undefined> {
        if (this.isNullOrWhitespace(variationId) || !override) {
            throw new Error('Required parameter is missing.');
        }
        var variation = new CampaignVariation();
        variation.detail_override = override;
        return this.updateCampaignVariation(variationId, variation);
    }

    async classifyUsingText(text: string, draft: boolean = true): Promise<ContentClassification | undefined> {
        const url = `${this.base_url}/api/content/doc/classify?draft=${draft}`;
        return this.doPost(url, { "text": text });
    }
    async classifyUsingUrl(url: string, draft: boolean = true): Promise<ContentClassification | undefined> {
        const url2 = `${this.base_url}/api/content/doc/classify?draft=${draft}`;
        return this.doPost(url2, { "url": url });
    }
    async testFunction(functionName: string, args?: string[]): Promise<any | undefined> {
        if (this.isNullOrWhitespace(functionName)) {
            throw new Error('Required parameter is missing.');
        }
        const args2 = args ? args.map(arg => `"${arg}"`) : [''];
        const expr = `${functionName}(${args2.join(',')})`;
        const lql = `SELECT ${expr} AS value, email(email) AS email FROM test_stream INTO user BY email ALIAS test_query`;
        var response = await this.testQuery(lql, { email: "test@test.com" });
        return Promise.resolve(response.value);
    }
    async getWhitelistFields(aid: number): Promise<string[]> {
        if (aid === 0) {
            throw new Error('Required parameter is missing.');
        }
        const account = await this.getAccount(aid);
        if (!account) {
            throw new Error(`Account ${aid} does not exist or cannot be accessed.`);
        }
        if (!account.whitelist_fields) {
            return Promise.resolve([]);
        }
        if (account.whitelist_fields.length == 1 && this.isNullOrWhitespace(account.whitelist_fields[0])) {
            return Promise.resolve([]);
        }
        return Promise.resolve(account.whitelist_fields);
    }
    /**
     * 
     * @param aid
     * @param fieldName 
     * @param add 
     * @returns true if a change was made; false if no change was made. For example, if the field "email" is already whitelisted and try to add "email" to the whitelist, this function returns false.
     */
    async setWhitelistFieldStatus(aid: number, fieldName: string, add: boolean): Promise<boolean> {
        if (this.isNullOrWhitespace(fieldName)) {
            throw new Error('Required parameter is missing.');
        }
        const fields = await this.getWhitelistFields(aid);
        const position = fields.indexOf(fieldName);
        if (position == -1) {
            if (!add) {
                return Promise.resolve(false);
            }
            fields.push(fieldName);
        }
        else {
            if (add) {
                return Promise.resolve(false);
            }
            fields.splice(position, 1);
            if (fields.length == 0) {
                //
                // Lytics will not write an empty array, so
                // an empty string is used in order to force
                // the existing value to be replaced.
                fields.push('');
            }
        }
        const data = {
            "whitelist_fields": fields
        };
        const url = `${this.base_url}/api/account/${aid}`;
        return this.doPost(url, data);
    }

    async getTopics(limit: number = 500): Promise<Topic[]> {
        const url = `${this.base_url}/api/content/topic?limit=${limit}`;
        const topics = await this.doGet(url) as Topic[];
        if (!topics) {
            return Promise.resolve([]);
        }
        return Promise.resolve(topics);
    }
    async getTopic(label: string): Promise<Topic | undefined> {
        if (this.isNullOrWhitespace(label)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/content/topic/${label}`;
        const topic = await this.doGet(url);
        return Promise.resolve(topic);
    }
    async getTopicUrls(label: string, limit: number = 10): Promise<TopicUrlCollection> {
        if (this.isNullOrWhitespace(label)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/content/topic/${label}/urls?limit=${limit}`;
        const collection = await this.doGet(url)
        return Promise.resolve(collection);
    }

    async getSubscriptions(): Promise<Subscription[]> {
        const url = `${this.base_url}/api/subscription`;
        const subscriptions = await this.doGet(url) as Subscription[];
        if (!subscriptions) {
            return Promise.resolve([]);
        }
        return Promise.resolve(subscriptions);
    }
    async getSubscription(id: string): Promise<Subscription | undefined> {
        if (this.isNullOrWhitespace(id)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/subscription/${id}`;
        const subscription = await this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(undefined);
                }
                throw err;
            });
        return Promise.resolve(subscription);
    }
    async createWebhook(config: WebhookConfig): Promise<Subscription | undefined> {
        if (!WebhookConfig.isValid(config)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/subscription`;
        const subscription = await this.doPost(url, config);
        return Promise.resolve(subscription);
    }
    async updateWebhook(id: string, config: WebhookConfig): Promise<Subscription | undefined> {
        if (!id || id.trim().length === 0) {
            throw new Error('Subscription id is required.');
        }
        if (!WebhookConfig.isValid(config)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/subscription/${id}`;
        const subscription = await this.doPost(url, config);
        return Promise.resolve(subscription);
    }
    async deleteSubscription(id: string): Promise<boolean> {
        if (this.isNullOrWhitespace(id)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/subscription/${id}`;
        const subscription = await this.doDelete(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(false);
                }
                throw err;
            });
        return Promise.resolve(true);
    }
    
    async getTokenScopes() : Promise<TokenScope[]> {
        return Promise.resolve(TokenScope.supportedScopes);
    }

    async createAccessToken(config: CreateAccessTokenConfig): Promise<LyticsAccessToken | undefined> {
        if (!config || !config.name || config.name.trim().length === 0) {
            throw new Error('Required parameter is missing.');
        }
        if (!config || !config.scopes || config.scopes.length === 0) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${this.base_url}/api/auth/createtoken`;
        return this.doPost(url, config);
    }

    async getAccessTokens(aid: number): Promise<LyticsAccessToken[]> {
        const account = await this.getAccount(aid);
        if (!account) {
            return Promise.resolve([]);
        }
        const url = `${this.base_url}/api/auth?auth_type=api_token&account_id=${account.id}`;
        const tokens = await this.doGet(url) as LyticsAccessToken[];
        if (!tokens) {
            return Promise.resolve([]);
        }
        return Promise.resolve(tokens);
    }

    async getAccessToken(authid: string, aid: number): Promise<LyticsAccessToken | undefined> {
        const account = await this.getAccount(aid);
        if (!account) {
            return Promise.resolve(undefined);
        }
        const url = `${this.base_url}/api/auth/${authid}?account_id=${account.id}`;
        return this.doGet(url)
            .catch(err => {
                if (err.response.status == 404) {
                    return Promise.resolve(undefined);
                }
            });
    }

    async deleteAccessToken(authid: string, aid: number): Promise<boolean> {
        if (this.isNullOrWhitespace(authid)) {
            throw new Error('Required parameter is missing.');
        }
        const account = await this.getAccount(aid);
        if (!account) {
            return Promise.resolve(false);
        }
        const url = `${this.base_url}/api/auth/${authid}?account_id=${account.id}`;
        const config = {
            url: url,
            method: 'delete',
            headers: this.headers
        };
        const response = await axios.request(config);
        if (response.status === 204) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}