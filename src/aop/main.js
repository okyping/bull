/**
 * @file aop模块入口
 *
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {
    var exports = {};
    var JointPoint = require('./JointPoint');
    var aopEmitter = require('./aopEmitter');

    // 触发事件类型
    var TypeEnum = {
        BEFORE: 1,
        AFTER: 2
    };


    /**
     * jointPoint before方法
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Array} args 参数
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function before(modName, funcName, args, jointPoint) {
        args = Array.prototype.slice.call(args, 0);
        aopEmitter.emit(TypeEnum.BEFORE, modName, funcName, args, jointPoint);
    }

    /**
     * jointPoint after方法
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function after(modName, funcName, args, jointPoint) {
        args = Array.prototype.slice.call(args, 0);
        aopEmitter.emit(TypeEnum.AFTER, modName, funcName, args, jointPoint);
    }

    /**
     * 包装一个function，使之成为aop的jointPoint，具有before和after的切入能力
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 函数名称
     * @param {function} func 待处理的函数
     *
     */
    exports.createAopProxy = function (modName, funcName, func) {
        return function () {
            before(
                modName, funcName, arguments,
                new JointPoint(this, arguments, modName, funcName, func)
            );
            var ret = func.apply(this, arguments);
            after(
                modName, funcName, arguments,
                new JointPoint(this, arguments, modName, funcName, func)
            );
            return ret;
        };
    };

    /**
     * 注册aspect
     *
     * @param {string} id aspect的id
     * @param {string} namespace 模块命名空间 
     * @param {Array.<Object>} pointCut 切点规则
     * @param {string} pointCut.modName 模块名称
     * @param {string|Regexp} pointCut.funcName 方法名称
     * @param {Array.<string|Regexp>} pointCut.args 参数
     *
     * @return 
     */
    exports.aspectRegister = function(id, namespace, pointCut) {
        id = namespace + '.' + id;
        var loader = require('../loader');
        var item;
        for (var i = 0; i < pointCut.length; i++) {
            item = pointCut[i];
            
            item.before && aopEmitter.on(
                TypeEnum.BEFORE,
                namespace + '.' + item.modName,
                item.funcName,
                item.args || [],
                loader.get(id)[item.before]
            );

            item.after && aopEmitter.on(
                TypeEnum.AFTER,
                namespace + '.' + item.modName,
                item.funcName,
                item.args || [],
                loader.get(id)[item.after]
            );
        }
    };

    return exports;
});
