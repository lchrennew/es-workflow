export const mockedPrefetchers = [
    {
        kind: 'prefetcher',
        name: 'demo/request-targets',
        metadata: {
            title: '生成请求目标列表',
            tags: [ 'demo/example' ]
        },
        spec: {
            script: '// 最简示例：直接指定一个处理方\nresult["TMP_REQUEST_TARGETS"] = "user:10086";'
        }
    }
];