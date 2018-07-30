'use strict';
import axios, { AxiosRequestConfig, } from 'axios';
import qs = require('query-string');
import { LyticsAccount, DataStream } from './types';

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
        const response = await axios.request(config);
        const data = response.data;
        if (data.status === 200) {
            if (data.message === 'Not Found') {
                return Promise.resolve(undefined);
            }
            if (data.message === 'success') {
                const data2 = dataHandler ? dataHandler(data) : data.data;
                return Promise.resolve(data2);
            }
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

    async getAccount(aid: number): Promise<LyticsAccount | null> {
        const url = `${base_url}/api/account/${aid}`;
        return this.doGet(url)
            .catch(err => {
                if (err.response.status === 404) {
                    return Promise.resolve(null);
                }
                throw err;
            });
    }
    async getStreams(): Promise<DataStream[]> {
        const url = `${base_url}/api/schema/_streams`;
        return this.doGet(url);
    }
    async getStream(name: string): Promise<DataStream | null> {
        const streams = await this.getStreams();
        const stream = streams.find(s => s.stream === name);
        if (!stream) {
            return Promise.resolve(null);
        }
        return Promise.resolve(stream);
    }
    async testQuery(lql: string, record: any): Promise<any> {
        const params = qs.stringify(record);
        const url = `${base_url}/api/query/_test?${params}`;
        var response = await this.doPost(url, lql);
        var x = response;
        return Promise.resolve(response);
    }
}