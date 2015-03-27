/**
 * @file 配置文件
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    return {
        resource: {
            main: require('./main'),
            a: require('./a'),
            b: require('./b'),
            aspectTest: require('./aspectTest')
        },
        aspect: [
            {
                id: 'aspectTest',
                pointCut: [
                    // {
                    //     modName: 'a',
                    //     funcName: 'sayHello',
                    //     before: 'sayHi1'
                    // },
                    {
                        modName: 'a',
                        funcName: 'sayHello',
                        after: 'sayHi2'
                    }
                ]
            },
            {
                id: 'a',
                pointCut: [
                    {
                        modName: 'main',
                        funcName: 'init',
                        args: [],
                        after: 'sayHello'
                    }
                ]
            }
        ]
    };
});
