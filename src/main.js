/**
 * Bull (A Slot&Plugin FrameWork)
 *
 * @file 入口
 * @author liyinan
 */
define(function (require) {
    var exports = {};
    var loader = require('./loader');
    var aopEmitter = require('./aop/aopEmitter');

    exports.init = loader.init;
    exports.get = loader.get;
    exports.queryBefore = aopEmitter.queryBefore;
    exports.queryAfter = aopEmitter.queryAfter;
    exports.queryInvoke = loader.queryInvoke;
    exports.queryDep = loader.queryDep;
    exports.checkDep = loader.checkDep;

    return exports;
});

