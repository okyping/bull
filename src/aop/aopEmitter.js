/**
 * @file emitter.js
 *  
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    var exports = {};
    var events = {};

    /**
     * 绑定事件，符合modName、funcName的事件将调用func回调,
     * modName、funcName至少有一个
     *
     * @param {Enum} type 类型，before和after
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Object} modInfo 切入的模块信息
     * @param {string} modInfo.modName 模块名称
     * @param {string} modInfo.funcName 函数名称
     * @param {function} modInfo.func 回调函数
     *
     */
    exports.on = function (type, modName, funcName, modInfo) {
        var cur = events;
        cur[type] = cur[type] || {};
        cur = cur[type];
        cur[modName] = cur[modName] || {};
        cur = cur[modName];
        cur[funcName] = cur[funcName] || [];
        cur = cur[funcName];
        cur.push(
            {
                func: modInfo.func,
                funcName: modInfo.funcName,
                modName: modInfo.modName
            }
        );
    };

    /**
     * 逐个参数比较，找到符合当前条件的事件
     *
     * @param {Enum} type 事件类型，before和after两种
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Array.<string|RegExp>} args 参数规则
     *
     * @return {Array.<function>} 符合条件的回调函数
     */
    function match(type, modName, funcName) {
        var result = [];
        var cur = events;
        // 类型筛选，before、after
        cur = cur[type] || {};
        // 模块名筛选
        cur = cur[modName] || {};
        // 方法名筛选
        cur = cur[funcName] || [];
        // 对每个回调进行处理
        for (var i = 0; i < cur.length; i++) {
            result.push(cur[i]);
        }
        return result;
    }

    exports.queryBefore = function (modName, funcName) {
        var aop = require('./main');
        var typeBefore = aop.TypeEnum.BEFORE;
        var res = match(typeBefore, modName, funcName);
        console.log('method before ' + modName + ' -> ' + funcName + ':');
        if (!res.length) {
            console.log('none');
            return;
        }
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].modName + ' -> ' + res[i].funcName);
        }
        console.log('-----------------------------------');
    };

    exports.queryAfter= function (modName, funcName) {
        var aop = require('./main');
        var typeAfter = aop.TypeEnum.AFTER;
        var res = match(typeAfter, modName, funcName);
        if (!res.length) {
            console.log('none');
            return;
        }
        console.log('method after ' + modName + ' -> ' + funcName + ':');
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].modName + ' -> ' + res[i].funcName);
        }
        console.log('-----------------------------------');
    };

    /**
     * 触发事件
     *
     * @param {Enum} type 类型，before和after
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Object} obj 事件参数
     *
     */
    exports.emit = function (type, modName, funcName, obj) {
        var matches = match(type, modName, funcName);
        for (var i = 0; i < matches.length; i++) {
            matches[i].func(obj);
        }
    };

    return exports;
});
