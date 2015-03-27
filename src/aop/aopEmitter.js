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
     * 绑定事件，符合modName、funcName、args条件的事件将调用func回调,
     * modName、funcName、args三者至少有一个
     *
     * @param {Enum} type 类型，before和after
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Array.<string|RegExp>} args 参数规则列表
     * @param {function} func 回调函数
     *
     */
    exports.on = function (type, modName, funcName, args, func) {
        type = 'type' + type;
        var cur = events;
        var args = Array.prototype.slice(arguments, 0);
        cur[type] = cur[type] || {};
        cur = cur[type];
        cur[modName] = events[modName] || {};
        cur = cur[modName];
        cur[funcName] = events[funcName] || [];
        cur = cur[funcName];
        cur.push(
            {
                func: func,
                args: args || []
            }
        );
    };

    /**
     * 找到符合当前条件的事件
     *
     * @param {Enum} type
     * @param {string} modName
     * @param {string} funcName
     * @param {Array} args
     *
     * @return 
     */
    function match(type, modName, funcName, args) {
        var result = [];
        type = 'type' + type;
        var cur = events;
        cur = cur[type] || {};
        cur = cur[modName] || {};
        cur = cur[funcName] || [];
        // 对每个回调进行处理
        for (var i = 0; i < cur.length; i++) {
            var item = cur[i];
            var ret = true;
            // 比较参数是否符合规定
            for (var j = 0; j < item.args.length; j++) {
                // 是否是正则表达式
                if (item.args.test) {
                    ret = ret && item.args.test(args[j]);
                }
                // 其他类型则判断是否相等
                else {
                    ret = ret && item.args === args[j];
                }
                if (!ret) {
                    break;
                }
            }
            if (ret) {
                // 符合规则
                result.push(item.func);
            }
        }
        return result;
    }

    /**
     * 触发事件
     *
     * @param {Enum} type 类型，before和after
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Array.<string>} args 参数规则列表
     * @param {Object} obj 事件参数
     *
     * @return 
     */
    exports.emit = function (type, modName, funcName, args, obj) {
        var matches = match(type, modName, funcName, args);
        for (var i = 0; i < matches.length; i++) {
            matches[i](obj);
        }
    };

    return exports;
});
