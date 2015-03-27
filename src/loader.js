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
     * 处理一个require来的module，把所有的方法处理为advisor
     *
     * @return {Object}
     */
    function moduleProcessor(modName, mod) {
        var item;
        if (typeof mod === 'function') {
            moduleProcessor(modName, mod.prototype);
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
     * @param {boolean|undefined} 是否允许同名模块存在
     *
     * @return 
     */
    function processResource(config, allowConflict) {
        // config是普通对象，无需做hasOwnProperty检测
        for (var key in config) {
            var item = config[key];
            if (allowConflict && (modules.hasOwnProperty(key))) {
                throw ('module conflict: module ' + key + ' is already exist');
            }
            else {
                modules[key] = moduleProcessor(key, item);
            }
        }
    }

    function processAop(config) {
        for (var i = 0; i < config.length; i++) {
            var item = config[i];
            aspectRegister(item.id, item.pointCut);
        }
    }

    /**
     * 初始化加载配置文件
     *
     * @return 
     */
    exports.init = function (config) {

        processResource(config.resource, config.allowConflict);
        processAop(config.aspect);
    };

    exports.get = function (name) {
        return modules[name];
    }

    return exports;
});

