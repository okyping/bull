/**
 * @file 配置文件
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    return {
        package: 'test',
        resource: {
            main: require('./main'),
            a: require('./a'),
            b: require('./b'),
            aspectTest: require('./aspectTest')
        },
        aspect: [
            {
                id: 'test.aspectTest',
                pointCut: [
                    // package.modName.funcName.args, before, after
                    // 'test.a.sayHello.arg1|arg2|arg3, sayHi1, sayHi2'
                    'test.a.sayHello, sayHi1',
                    'test.a.sayHello, , sayHi2'
                ]
            },
            {
                id: 'a',
                pointCut: [
                    'test.main.init.1,,sayHello',
                    // 'test.aspectTest.sayHi1,,sayHello'
                ]
            }
        ]
    };
});
