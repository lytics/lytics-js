'use strict';
import axios, { AxiosRequestConfig, } from 'axios';
import qs = require('query-string');
import { LyticsAccount, DataStream, DataStreamField, TableSchema, TableSchemaField, TableSchemaFieldInfo, Query } from './types';
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
        const streams = await this.getStreams();
        const stream = streams.find(s => s.stream === name);
        if (!stream) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(stream);
    }
    async getStreamField(streamName: string, fieldName: string): Promise<DataStreamField | undefined> {
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
        const url = `${base_url}/api/schema/${tableName}`;
        const data = await this.doGet(url);
        if (Object.keys(data).length == 0) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(data);
    }
    async getTableSchemaFieldInfo(tableName: string, fieldName: string): Promise<TableSchemaFieldInfo | undefined> {
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
    async upsertQuery(lql: string) {
        const url = `${base_url}/api/query`;
        return this.doPost(url, lql);
    }
    async deleteQuery(alias: string): Promise<boolean> {
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

    async testQuery(lql: string, record: any): Promise<any> {
        const params = qs.stringify(record);
        const url = `${base_url}/api/query/_test?${params}`;
        return this.doPost(url, lql);
    }
}