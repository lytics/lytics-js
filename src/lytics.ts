'use strict';
import { LyticsClient } from "./LyticsClient";

export function getClient(apikey: string) : LyticsClient {
    return new LyticsClient(apikey);
}
