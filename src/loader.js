/**
 * @file 加载配置文件
 *  
 * @author liyinan
 * @version 1.0
 * @date 2015-03-26
 */

define(function (require) {
    var exports = {};
    var modules = {};

    var aop = require('./aop/main');
    var createAopProxy = aop.createAopProxy;
    var aspectRegister = aop.aspectRegister;

    /**
     * 处理一个require来的modules，把所有的方法处理为advisor
     *
     * @return {Object}
     */
    function moduleProcessor(modName, mod) {
        if (mod._belong) {
            throw ('module "' + modName + '" already register to ' + mod._belong);
        }
        // 记录一下这个module是属于哪个命名空间的，方便调试
        mod._belong = modName;
        var item;
        if (typeof mod === 'function') {
            // 将function的prototype中的方法处理为advisor
            moduleProcessor(modName, mod.prototype);
            // 将function自身处理为advisor
            var func = createAopProxy(modName, key, mod);
            func.prototype = mod.prototype;
            return func;
        }
        else {
            for (var key in mod) {
                if (!mod.hasOwnProperty(key)) {
                    continue;
                }
                item = mod[key];
                if (typeof item === 'function') {
                    mod[key] = createAopProxy(modName, key, item);
                }
            }
            return mod;
        }
    }

    /**
     * 处理资源加载，生成名称和文件的映射
     *
     * @param {Object} config 资源配置， key-名称，value-require的模块
     * @param {string} namespace 命名空间
     *
     * @return 
     */
    function processResource(config, namespace) {
        // config是普通对象，无需做hasOwnProperty检测
        for (var key in config) {
            var item = config[key];
            key = namespace + '.' + key;
            if (modules.hasOwnProperty(key)) {
                throw ('module conflict: module ' + key + ' is already exist');
            }
            else {
                modules[key] = moduleProcessor(key, item);
            }
        }
    }

    function processAop(config, namespace) {
        for (var i = 0; i < config.length; i++) {
            var item = config[i];
            aspectRegister(item.id, namespace, item.pointCut);
        }
    }

    /**
     * 初始化加载配置文件
     *
     * @return 
     */
    exports.init = function (config) {
        var namespace = config.namespace;

        if (!namespace) {
            throw ('namespace not found');
        }

        processResource(config.resource, namespace);
        processAop(config.aspect, namespace);
    };

    exports.checkDeps = function () {
        for (var key in modules) {
        }
    };

    exports.get = function (name) {
        if (name in modules) {
            return modules[name];
        }
        else {
            throw('module "' + name + '" not found');
        }
    };

    return exports;
});

