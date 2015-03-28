/**
 * @file 配置文件
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    return {
        namespace: 'test',
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
                    // package.modName.funcName.args, before, after
                    // 'test.a.sayHello.a|b|c, sayHi1, sayHi2'
                    'test.a.sayHello, sayHi1',
                    'test.a.sayHello, , sayHi2'
                ]
            },
            {
                id: 'a',
                pointCut: [
                    'test.main.init.1,,sayHello'
                ]
            }
        ]
    };
});
