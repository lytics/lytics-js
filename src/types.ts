export class LyticsAccount {
    aid: number = 0;
    apikey: string | undefined;
    created: string | undefined;
    dataapikey: string | undefined;
    domain: string | undefined;
    email: string | undefined;
    features: {
        "audience-attribution": boolean;
        campaigns: boolean;
        "content-classification": boolean;
    };
    fid: string | undefined;
    id: string | undefined;
    locked: boolean = false;
    masteraid: number = 0;
    name: string | undefined;
    package_id: string | undefined;
    parent_id: string | undefined;
    parentaid: number = 0;
    partner_id: string | undefined;
    partner_slug: string | undefined;
    provider_id: string | undefined;
    pubusers: boolean = false;
    two_factor_auth: boolean = false;
    updated: string | undefined;
    constructor() {
        this.features = {
            "audience-attribution": false,
            "content-classification": false,
            campaigns: false
        };
    }
}
export class GetAccountsResponse {
    data: LyticsAccount[] = [];
    message: string | undefined;
    status: number = 0;
}
export class GetAccountResponse {
    data: LyticsAccount | undefined;
    message: string | undefined;
    status: number = 0;
}
export class DataStreamFieldColumn {
    as: string | undefined;
    table: string | undefined;
}
export class DataStreamFieldSmartFields {
    analyses: number = 0;
    coverage: number = 0;
    email: number = 0;
    ip: number = 0;
    noun: number = 0;
    phone: number = 0;
    time: number = 0;
    uid: number = 0;
    url: number = 0;
    value: number = 0;
    verb: number = 0;
}

export class DataStreamField {
    avg: number = 0;
    card: number = 0;
    column: DataStreamFieldColumn[] = [];
    first_seen: string | undefined;
    hidden: boolean = false;
    is_array: boolean = false;
    last_seen: string | undefined;
    name: string | undefined;
    sample: string[] = [];
    smart: DataStreamFieldSmartFields | undefined;
    sumlen: number = 0;
    type: string | undefined;
    usage: number = 0;
}
export class DataStream {
    avg_event_size: number = 0;
    ct: number = 0;
    curct: number = 0;
    fields: DataStreamField[] = [];
    hidden: boolean = false;
    last_msg_ts: string | undefined;
    last_update_ts: string | undefined;
    recent_events: any[] = [];
    stream: string | undefined;
}