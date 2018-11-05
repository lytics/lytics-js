import { assert } from 'chai';
import { LyticsUtils } from '../LyticsUtils';

describe('LyticsUtils', function () {
    it('should generate a sip hash for the specified value', async function () {
        const hashedValue = await LyticsUtils.generateSipHash('test');
        assert.equal(hashedValue, -8890464022492218970);
    });
});
