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
     * @param {Array.<*>} args 参数
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function before(modName, funcName, args, jointPoint) {
        aopEmitter.emit(TypeEnum.BEFORE, modName, funcName, args, jointPoint);
    }

    /**
     * jointPoint after方法
     *
     * @param {string} modName 模块名称
     * @param {string} funcName 方法名称
     * @param {Array.<*>} args 参数
     * @param {JointPoint} jointPoint 切入点对象，可以从此对象获取当前函数的信息
     *
     */
    function after(modName, funcName, args, jointPoint) {
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
        var loader = require('../loader');

        return function () {
            var args = [];
            var originArguments = Array.prototype.slice.call(arguments, 0);
            before(
                modName, funcName, originArguments,
                new JointPoint(this, originArguments, modName, funcName, func)
            );
            // 处理注入
            var injection = loader.getInjection(modName);

            if (injection && funcName in injection) {
                var deps = injection[funcName] || [];
                // 有依赖注入的时候使用注入参数
                for (var i = 0; i < deps.length; i++) {
                    args.push(loader.get(deps[i]));
                }
                args.push(originArguments);
            }
            else {
                // 没有依赖注入就用arguments
                args = originArguments;
            }
            // 执行函数体
            var ret = func.apply(this, args);

            after(
                modName, funcName, originArguments,
                new JointPoint(this, originArguments, modName, funcName, func, ret)
            );
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
        var modName = items[1];
        var funcName = items[2];
        var argStr = items[3] || '';
        // 处理args
        if (argStr) {
            var args = argStr.split('|');
            for (var i = 0; i < args.length; i++) {
                args[i] = trim(args[i]);
                // 如果是正则就生成正则表达式，替换现有字符串
                args[i].replace(/^\/(.+)\/([gmi]*)$/, function ($1, $2, $3) {
                    args[i] = new RegExp($2, $3);
                });
            }
        }
        else {
            args = [];
        }

        return {
            modName: modName,
            funcName: funcName,
            args: args,
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
            var item = pointCutParser(pointCut[i]);
            
            item.before && aopEmitter.on(
                TypeEnum.BEFORE,
                package + '.' + item.modName,
                item.funcName,
                item.args,
                function (jointPoint) {
                    loader.get(id)[item.before].apply(
                        jointPoint.getThis(),
                        jointPoint.getArgs()
                    )
                }
            );

            item.after && aopEmitter.on(
                TypeEnum.AFTER,
                package + '.' + item.modName,
                item.funcName,
                item.args,
                function (jointPoint) {
                    loader.get(id)[item.after].apply(
                        jointPoint.getThis(),
                        jointPoint.getArgs()
                    )
                }
            );
        }
    };

    return exports;
});
