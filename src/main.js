/**
 * Bull (A Slot&Plugin FrameWork)
 * 
 * @file 入口
 * @author liyinan
 */
define(function (require) {
    var exports = {};
    var loader = require('./loader');

    exports.init = loader.init;
    exports.get = loader.get;

    return exports;
});

