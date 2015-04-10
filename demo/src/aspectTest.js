/**
 * @file 测试文件a
 *  
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    var exports = {};
    exports.sayHi1 = function (c, jt) {
        alert('before sayHello' + c.number);
    };
    exports.sayHi2 = function (c, jt) {
        alert('after sayHello' + c.number + jt.getFuncName());
    };
    return exports;
});
