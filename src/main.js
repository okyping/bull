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

    exports.get = loader.get;
    exports.queryBefore = aopEmitter.queryBefore;
    exports.queryAfter = aopEmitter.queryAfter;
    exports.queryInvoke = loader.queryInvoke;
    exports.queryDep = loader.queryDep;
    exports.checkDep = loader.checkDep;
    exports.queryModule = loader.queryModule;

    function createDebugIcon() {
        var el = document.createElement('div');
        var style = el.style;
        style.position = 'fixed';
        style.right = '20px';
        style.top = '20px';
        el.innerHTML = '点此查看\n模块关系';
        el.onclick = function () {
            require(['bull/debug'], function (debug) {
                console.log('debug');
            });
        };
        document.body.insertBefore(el, document.body.firstChild)
    }

    function debug() {
        var hash = location.hash;
        if (hash.indexOf('bullDebug') > -1) {
            createDebugIcon();
        }
    }

    exports.init = function (config) {
        debug();
        loader.init(config);
    }

    return exports;
});

