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
    var TypeEnum = exports.TypeEnum = {
        BEFORE: 'type1',
        AFTER: 'type2'
    };


    /**
     * jointPoint before方法
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function before(modName, funcName, jointPoint) {
        aopEmitter.emit(TypeEnum.BEFORE, modName, funcName, jointPoint);
    }

    /**
     * jointPoint after方法
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function after(modName, funcName, jointPoint) {
        aopEmitter.emit(TypeEnum.AFTER, modName, funcName, jointPoint);
    }

    // 除模块外还可以被注入的名字
    var specKey = {
        'jointPoint': true
    };

    /**
     * 包装一个function，使之成为aop的jointPoint，具有before和after的切入能力
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 函数名称
     * @param {function} func 待处理的函数
     *
     */
    exports.createAopProxy = function (modName, funcName, func) {
        var loader = require('../loader');

        return function () {
            var args = [];
            var originArguments = Array.prototype.slice.call(arguments, 0);
            var jointPoint = new JointPoint(this, originArguments, modName, funcName, func);

            // 除模块外还可以被注入的值
            var specValue = {
                'jointPoint': jointPoint
            };

            before(modName, funcName, jointPoint);
            // 处理注入
            var injection = loader.getInjection(modName) || {};
            var deps = injection[funcName] || [];

            // 有依赖注入的时候使用注入参数
            for (var i = 0; i < deps.length; i++) {
                var key = deps[i];
                if (key in specKey) {
                    args.push(specValue[key]);
                }
                else {
                    args.push(loader.get(key));
                }
            }
            args = args.concat(originArguments);

            // 执行函数体
            var ret = func.apply(this, args);

            jointPoint.setReturnValue(ret);

            after(modName, funcName, jointPoint);

            return ret;
        };
    };

    /**
     * 去掉两边的空格，简单缩略版
     *
     * @param {string} str 待处理的字符串
     *
     * @return {string}
     */
    function trim(str) {
        str = str || '';
        return str.replace(/^\s|\s$/g, '');
    }

    /**
     * 把pointCut配置字符串解析为对象
     *
     * @param {string} pointCutStr 配置字符串
     * 格式为modName.funcName.args,before,after
     *
     * @return {Object}
     */
    function pointCutParser(pointCutStr) {
        pointCutStr = pointCutStr || '';
        // 将module信息、before、after分开
        var items = pointCutStr.split(',');
        var modInfo = trim(items[0] || '');
        var before = trim(items[1]);
        var after = trim(items[2]);

        // 处理module信息
        items = modInfo.split('.');
        var packageName = items[0];
        var modName = items[1];
        var funcName = items[2];

        return {
            packageName: packageName,
            modName: modName,
            funcName: funcName,
            before: before,
            after: after
        };
    }

    /**
     * 注册aspect
     *
     * @param {string} id aspect的id
     * @param {string} package 模块命名空间 
     * @param {Array.<Object>} pointCut 切点规则
     * @param {string} pointCut.modName 模块名称
     * @param {string|Regexp} pointCut.funcName 方法名称
     * @param {Array.<string|Regexp>} pointCut.args 参数
     *
     */
    exports.aspectRegister = function(id, package, pointCut) {
        var loader = require('../loader');
        if (id.indexOf('.') === -1) {
            id = package + '.' + id;
        }
        for (var i = 0; i < pointCut.length; i++) {
            (function (item) {
                item.before && aopEmitter.on(
                    TypeEnum.BEFORE,
                    item.packageName + '.' + item.modName,
                    item.funcName,
                    {
                        modName: id,
                        funcName: item.before,
                        func: function (jointPoint) {
                            loader.get(id)[item.before].apply(
                                jointPoint.getThis(),
                                jointPoint.getArgs()
                            )
                        }
                    }
                );

                item.after && aopEmitter.on(
                    TypeEnum.AFTER,
                    item.packageName + '.' + item.modName,
                    item.funcName,
                    {
                        modName: id,
                        funcName: item.after,
                        func: function (jointPoint) {
                            loader.get(id)[item.after].apply(
                                jointPoint.getThis(),
                                jointPoint.getArgs()
                            )
                        }
                    }
                );
            })(pointCutParser(pointCut[i]));
        }
    };

    return exports;
});
