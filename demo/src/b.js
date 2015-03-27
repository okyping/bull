/**
 * @file 测试文件b
 *  
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    function B() {
    }
    B.prototype = {
        constructor: B,
        sayHello: function () {
            alert('sayHelloB');
        }
    };
    return B;
});
