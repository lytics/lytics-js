'use strict';
import axios, { AxiosRequestConfig, } from 'axios';
import qs = require('query-string');
import { LyticsAccount, DataStream, DataStreamField, TableSchema, TableSchemaField, TableSchemaFieldInfo, Query, CollectResultInfo, SegmentCollection, Segment } from './types';
import { isArray } from 'util';

const base_url = 'https://api.lytics.io';
export class LyticsClient {
    private apikey: string;
    private headers: any;
    constructor(apikey: string) {
        this.apikey = apikey;
        this.headers = {
            'Authorization': this.apikey,
            'Content-Type': 'application/json'
        };
    }
    private async doRequest(config: AxiosRequestConfig, dataHandler?: (data: string) => any): Promise<any> {
        var wasSuccess: boolean = false;
        const response = await axios.request(config);
        const data = response.data;
        if (data.status === 200) {
            if (data.message === 'Not Found') {
                return Promise.resolve(undefined);
            }
            if (data.message === 'success' || data.message.length === 0) {
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

    async getAccounts(): Promise<LyticsAccount[]> {
        const url = `${base_url}/api/account`;
        return this.doGet(url);
    }

    async getAccount(aid: number): Promise<LyticsAccount | undefined> {
        const url = `${base_url}/api/account/${aid}`;
        return this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(undefined);
                }
                throw err;
            });
    }
    async getStreams(): Promise<DataStream[]> {
        const url = `${base_url}/api/schema/_streams`;
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
        const url = `${base_url}/api/schema/${tableName}`;
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
        const url = `${base_url}/api/schema/${tableName}/fieldinfo?fields=${fieldName}`;
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
        const url = `${base_url}/api/entity/${tableName}/${fieldName}/${fieldValue}?wait=${wait}`;
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
        const url = `${base_url}/api/query`;
        return this.doGet(url);
    }
    async getQuery(alias: string): Promise<Query | undefined> {
        if (this.isNullOrWhitespace(alias)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${base_url}/api/query/${alias}`;
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
        const url = `${base_url}/api/query`;
        return this.doPost(url, lql);
    }
    async deleteQuery(alias: string): Promise<boolean> {
        if (this.isNullOrWhitespace(alias)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${base_url}/api/query/${alias}`;
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
        const url = `${base_url}/api/query/_tolql`;
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
        const url = `${base_url}/api/query/_test?${params}`;
        return this.doPost(url, lql);
    }

    async collect(stream: string, data: any): Promise<CollectResultInfo | undefined> {
        if (this.isNullOrWhitespace(stream) || !data) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${base_url}/collect/json/${stream}`;
        const result = await this.doPost(url, data);
        return Promise.resolve(result);
    }
    async getSegments(): Promise<Segment[]> {
        const url = `${base_url}/api/segment`;
        const segments = await this.doGet(url) as Segment[];
        if (!segments) {
            throw new Error('An array of segments was expected.');
        }
        segments.sort(this.compareByNameProperty);
        return Promise.resolve(segments);
    }
    async getSegment(idOrSlug: string): Promise<Segment | undefined> {
        if (this.isNullOrWhitespace(idOrSlug)) {
            throw new Error('Required parameter is missing.');
        }
        const url = `${base_url}/api/segment/${idOrSlug}`;
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
        const url = `${base_url}/api/segment`;
        const segments = await this.doGet(url) as Segment[];
        if (!segments) {
            throw new Error('An array of segments was expected.');
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
        col.characteristics.sort(this.compareByNameProperty);
        col.audiences.sort(this.compareByNameProperty);
        col.unidentified.sort(this.compareByNameProperty);
        return Promise.resolve(col);
    }
    private compareByNameProperty(a: any, b: any): number {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    }
    private isNullOrWhitespace(value?: string): boolean {
        return (!value || value.trim().length == 0);
    }
}