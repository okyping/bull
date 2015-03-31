/**
 * @file AOP切点类
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {

        /**
         * 切入点
         *
         * @param {Object} originThis 函数被调用时的this指针
         * @param {Array} originArgs 函数被调用时的arguments
         * @param {string} modName 所在模块名称
         * @param {string} funcName 方法名称
         * @param {function} func 回调函数
         * @param {?*} returnValue 只有after才有此参数，记录函数执行完的结果
         *
         */
    function JointPoint(originThis, originArgs, modName, funcName, func, returnValue) {
        this.thisp = originThis;
        this.args = originArgs;
        this.modName = modName;
        this.funcName = funcName;
        this.func = func;
        this.returnValue = returnValue;
    }

    JointPoint.prototype = {
        constructor: JointPoint,

        getThis: function () {
            return this.thisp;
        },

        getArgs: function () {
            return this.args;
        },

        getModName: function () {
            return this.modName;
        },

        getFuncName: function () {
            return this.funcName;
        },

        getFunc: function () {
            return this.func;
        },

        getReturnValue: function () {
            return this.returnValue;
        }
    }

    return JointPoint;
});
