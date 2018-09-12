import { Url } from "url";

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
    whitelist_fields: string[] = [];
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

export class TableSchemaField {
    as: string | undefined;
    froms: string[] = [];
    hidden: boolean = false;
    identities: string[] = [];
    is_by: boolean = false;
    longdesc: string | undefined;
    private: boolean = false;
    shortdesc: string | undefined;
    type: string | undefined;
}
export class TableSchema {
    by_fields: string[] = [];
    columns: TableSchemaField[] = [];
    name: string | undefined;
};
export class TableSchemaFieldInfo {
    approx_cardinality: number = 0;
    ents_absent: number = 0;
    ents_present: number = 0;
    field: string | undefined;
    more_terms: boolean = false;
    terms_counts: any;
    static getTermCounts = (obj: any): TableSchemaFieldInfoTermCount[] => {
        const counts: TableSchemaFieldInfoTermCount[] = [];
        if (obj) {
            for (let key in obj.terms_counts) {
                const count = new TableSchemaFieldInfoTermCount();
                count.value = key;
                count.count = obj.terms_counts[key];
                counts.push(count);
            }
        }
        return counts;
    }
};
export class TableSchemaFieldInfoTermCount {
    value: string | undefined;
    count: number = 0;
}

export class Query {
    alias: string | undefined;
    by_fields: string[] = [];
    created: string | undefined;
    description: string | undefined;
    disabled: boolean = false;
    fields: QueryField[] = [];
    from: string | undefined;
    id: string | undefined;
    into: string | undefined;
    keyword: string | undefined;
    query_type: string | undefined;
    table: string | undefined;
    text: string | undefined;
    updated: string | undefined;

}
export class QueryField {
    as: string | undefined;
    froms: string[] = [];
    hidden: boolean = false;
    identities: string[] = [];
    is_by: boolean = false;
    longdesc: string | undefined;
    private: boolean = false;
    shortdesc: string | undefined;
    type: string | undefined;
}
export class CollectResultInfo {
    message_count: number = 0;
    rejected_count: number = 0;
    "content-type": string | undefined;
    droperrors: boolean = false;
    dryrun: boolean = false;
    timestamp_field: string | undefined;
    filename: string | undefined;
}
export class SegmentCollection {
    audiences: Segment[] = [];
    characteristics: Segment[] = [];
    unidentified: Segment[] = [];
}
export class Segment {
    account_id: string | undefined;
    aid: number = 0;
    ast: any;
    author_id: string | undefined;
    created: string | undefined;
    datemath_calc: boolean = false;
    deleted: boolean = false;
    description: string | undefined;
    forward_datemath: boolean = false;
    id: string | undefined;
    invalid: boolean = false;
    invalid_reason: string | undefined;
    is_public: boolean = false;
    kind: string | undefined;
    name: string | undefined;
    public_name: string | undefined;
    save_hist: boolean = false;
    schedule_exit: boolean = false;
    segment_ql: string | undefined;
    short_id: string | undefined;
    slug_name: string | undefined;
    table: string | undefined;
    tags: string[] = [];
    updated: string | undefined;
};

export class Campaign {
    id: string | undefined;
    aid: number = 0;
    account_id: string | undefined;
    user_id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;
    name: string | undefined;
    system_status: string | undefined;
    published_at: string | undefined;
    start_at: string | undefined;
    segments: string[] = [];
}

export class CampaignVariation {
    id: string | undefined;
    aid: number = 0;
    account_id: string | undefined;
    user_id: string | undefined;
    created: string | undefined;
    updated: string | undefined;
    created_at: string | undefined;
    updated_at: string | undefined;
    variation: number = 0;
    campaign_id: string | undefined;
    vehicle: string | undefined;
    reach: string | undefined;
    conversion: string | undefined;
    detail: CampaignVariationDetail | undefined;
    detail_override: CampaignVariationDetailOverride | undefined;
}

export class CampaignVariationDetail {
    appearsOn: CampaignVariationAppearanceRule[] = [];
    attachment: string | undefined;
    body: string | undefined;
    className: string | undefined;
    colors: CampaignVariationColor[] = [];
    displayOptions: CampaignVariationDisplayOption[] = [];
    formFields: CampaignVariationFormField[] = [];
    headline: string | undefined;
    image: string | undefined;
    layout: string | undefined;
    okMessage: string | undefined;
    theme: string | undefined;
    typeKey: string | undefined;
}
export class CampaignVariationAppearanceRule {
    exclude: boolean = false;
    match: string | undefined;
    value: string | undefined;
}

export class CampaignVariationColor {
    hex: string | undefined;
    key: string | undefined;
    title: string | undefined;
}

export class CampaignVariationDisplayOption {
    key: string | undefined;
    value: string | undefined;
}

export class CampaignVariationFormField {
    isEnabled: boolean = false;
    isRequired: boolean = false;
    placeholder: string | undefined;
    slug: string | undefined;
}

export class CampaignVariationDetailOverride {
    confirmAction: CampaignVariationDetailOverrideConfirmAction | undefined;
    fields: CampaignVariationDetailOverrideFields | undefined;
    formElements: CampaignVariationDetailOverrideFormElement[] = [];
    formFields: any[] = [];
    formStates: CampaignVariationDetailOverrideFormStates | undefined;
}

export class CampaignVariationDetailOverrideConfirmAction {
    callback: string | undefined;
    waitForAsyncResponse: boolean = false;
}

export class CampaignVariationDetailOverrideFields {
    name: boolean = true;
    email: boolean = true;
    title: boolean = true;
    company: boolean = true;
    phone: boolean = true;
    referralEmail: boolean = true;
    message: boolean = true;
}

export class CampaignVariationDetailOverrideFormElement {
    label: string | undefined;
    name: string | undefined;
    required: boolean = false;
    type: string | undefined;
}

export class CampaignVariationDetailOverrideFormStates {
    error: CampaignVariationDetailOverrideFormState | undefined;
    success: CampaignVariationDetailOverrideFormState | undefined;
}

export class CampaignVariationDetailOverrideFormState {
    delay: number = 0;
    headline: string | undefined;
    msg: string | undefined;
}

export class ContentClassification {
    id: string | undefined;
    fb: string | undefined;
    url: ContentClassificationUrl | undefined;
    canonical: string | undefined;
    url_redirected_from: string | undefined;
    description: string | undefined;
    long_description: string | undefined;
    type: string | undefined;
    source: string | undefined;
    stream: string | undefined;
    httpstatus: number = 0;
    httpfailures: number = 0;
    humanLanguage: string | undefined;
    tags: ContentClassificationTag[] = [];
    images: ContentClassificationImage[] = [];
    primary_image: string | undefined;
    videos: ContentClassificationVideo[] = [];
    primary_video: string | undefined;
    published: string | undefined;
    author: string | undefined;
    numpages: number = 0;
    sitename: string | undefined;
    productDescription: string | undefined;
    brand: string | undefined;
    price: string | undefined;
    saveAmount: string | undefined;
    productId: string | undefined;
    created: Date | undefined;
    fetched: Date | undefined;
    updated: Date | undefined;
    enriched: any;
    version: number = 0;
}
export class ContentClassificationUrl {
    Params: any;
    Parsed: any;
    Utm: any;
    UserInfo: any;
    Https: boolean = false;
    IsStatic: boolean = false;
}
export class ContentClassificationTag {
    type: string | undefined;
    id: string | undefined;
    value: string | undefined;
    source: string | undefined;
    vocab: string | undefined;
    relevance: number = 0;
}
export class ContentClassificationImage {
    url: string | undefined;
}
export class ContentClassificationVideo {
    url: string | undefined;
}
export class Topic {
    label: string | undefined;
    doc_count: number = 0;
    total: number = 0;
    missing: number = 0;
    present: number = 0;
    bucket_none: number = 0;
    bucket_low: number = 0;
    bucket_mid: number = 0;
    bucket_high: number = 0;
    avg: number = 0;
    tags: string[] = [];
}
export class TopicUrl {
    url: string | undefined;
    https: boolean = false;
    title: string | undefined;
    description: string | undefined;
    topics: string[] = [];
    topic_relevances: any;
    primary_image: string | undefined;
    author: string | undefined;
    created: Date | undefined;
    id: string | undefined;
    sitename: string | undefined;
    stream: string | undefined;
    aspects: string[] = [];
    language: string | undefined;
    updated: Date | undefined;
    fetched: Date | undefined;
    meta: string[] = [];
}
export class TopicUrlCollection {
    total: number = 0;
    urls: TopicUrl[] = [];
}
export class Subscription {
    aid: number = 0;
    id: string | undefined;
    account_id: string | undefined;
    name: string | undefined;
    slug: string | undefined;
    description: string | undefined;
    channel: string | undefined;
    updated: Date | undefined;
    created: Date | undefined;
    version: string | undefined;
    table: string | undefined;
    withbackfill: boolean = false;
    work_id: string | undefined;
    object: string | undefined;
    segment_ids: string[] = [];
    query: string | undefined;
}
export class WebhookConfig {
    channel: string = "webhook";
    version: string = "new";
    name: string | undefined;
    description: string | undefined;
    webhook_url: Url | undefined;
    headers: any | undefined;
    segment_ids: string[] = [];
    user_fields: string[] = [];
    static isValid = (obj: any): boolean => {
        if (obj) {
            if (!obj.name || obj.name.trim().length == 0) {
                return false;
            }
            if (!obj.webhook_url) {
                return false;
            }
            return true;
        }
        return false;
    }
}