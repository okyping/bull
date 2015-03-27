/**
 * @file AOP切点类
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */
define(function (require) {

    function JointPoint(originThis, originArgs, modName, funcName, func) {
        this.this = originThis;
        this.args = originArgs;
        this.modName = modName;
        this.funcName = funcName;
        this.func = func;
    }

    JointPoint.prototype = {
        constructor: JointPoint,

        getThis: function () {
            return this.this;
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
        }
    }

    return JointPoint;
});
