import {
    CacheExtension,
    GeoIPExtension,
    PluginEvent,
    PluginMeta,
    StorageExtension,
    UtilsExtension,
} from '@posthog/plugin-scaffold'
import { processEvent } from '../plugin'

describe('useragent-plugin', () => {
    test('should not process event when disabled', async () => {
        const event = { properties: {} }
        const processedEvent = await processEvent(event as any, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: true,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'true' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(Object.keys(processedEvent.properties)).toStrictEqual(Object.keys(event.properties))
    })

    test('should not process event when $userAgent is missing', async () => {
        const event = {
            properties: {
                $lib: 'posthog-node',
            },
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: true,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'true' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(Object.keys(processedEvent.properties)).toStrictEqual(['$lib'])
    })

    test('should not process event when $userAgent is empty', async () => {
        const event = {
            properties: {
                $useragent: '',
                $lib: 'posthog-node',
            },
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: true,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'true' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(Object.keys(processedEvent.properties)).toStrictEqual(['$lib'])
    })

    test('should add user agent details when $useragent property exists', async () => {
        const event = {
            properties: {
                $useragent:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
                $lib: 'posthog-node',
            },
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: true,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'true' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(Object.keys(processedEvent.properties)).toEqual(
            expect.arrayContaining(['$lib', '$browser', '$browser_version', '$os', '$browser_type'])
        )
        expect(processedEvent.properties).toStrictEqual(
            expect.objectContaining({
                $browser: 'safari',
                $browser_version: '14.0.0',
                $os: 'Mac OS',
            })
        )
    })

    test('should add user agent details when $user-agent property exists', async () => {
        const event = {
            properties: {
                '$user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
                $lib: 'posthog-node',
            },
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: true,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'true' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(Object.keys(processedEvent.properties)).toEqual(
            expect.arrayContaining(['$lib', '$browser', '$browser_version', '$os', '$browser_type'])
        )
        expect(processedEvent.properties).toStrictEqual(
            expect.objectContaining({
                $browser: 'safari',
                $browser_version: '14.0.0',
                $os: 'Mac OS',
            })
        )
    })

    test('should return correct browser properties for given $browser property', async () => {
        const event = {
            id: '017dc2cb-9fe0-0000-ceed-5ef8e328261d',
            timestamp: '2021-12-16T10:31:04.234000+00:00',
            event: 'check',
            distinct_id: '91786645996505845983216505144491686624250709556909346823253562854100595129050',
            properties: {
                $ip: '31.164.196.102',
                $lib: 'posthog-python',
                $lib_version: '1.4.4',
                $plugins_deferred: [],
                $plugins_failed: [],
                $plugins_succeeded: ['GeoIP (3347)', 'useragentplugin (3348)'],
                $useragent:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.57',
            },
            elements_chain: '',
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: false,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'false' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })

        expect(Object.keys(processedEvent.properties)).toEqual(
            expect.arrayContaining(['$browser', '$browser_version', '$os', '$browser_type'])
        )

        console.log(processedEvent.properties)

        expect(processedEvent.properties).toStrictEqual(
            expect.objectContaining({
                $browser: 'edge-chromium',
                $browser_version: '96.0.1054',
                $os: 'Mac OS',
            })
        )
    })

    test('should not override existing properties when overrideUserAgentDetails is disabled', async () => {
        const event = {
            properties: {
                $browser: 'safari',
                $browser_version: '14.0',
                $os: 'macos',
                $useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0',
                $lib: 'posthog-node',
            },
        } as unknown as PluginEvent

        const processedEvent = await processEvent(event, {
            cache: {} as CacheExtension,
            storage: {} as StorageExtension,
            global: {
                enabledPlugin: true,
                overrideUserAgentDetails: false,
            },
            config: { enable: 'true', overrideUserAgentDetails: 'false' },
            attachments: {},
            jobs: {},
            metrics: {},
            geoip: {} as GeoIPExtension,
            utils: {} as UtilsExtension,
        })
        expect(processedEvent.properties).toStrictEqual(
            expect.objectContaining({
                $browser: 'safari',
                $browser_version: '14.0',
                $os: 'macos',
            })
        )
    })
})
