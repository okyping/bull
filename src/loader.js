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
    var injection = {};

    var aop = require('./aop/main');
    var createAopProxy = aop.createAopProxy;
    var aspectRegister = aop.aspectRegister;

    /**
     * 处理一个require来的modules，把所有的方法处理为advisor
     *
     * @return {Object}
     */
    function moduleProcessor(modName, mod) {
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
     * 处理引用的其他配置文件
     *
     * @param {} config
     *
     * @return 
     */
    function processImport(config) {
        config = config || [];
        for (var i = 0; i < config.length; i++) {
            exports.init(config[i]);
        }
    }

    /**
     * 处理资源加载，生成名称和文件的映射
     *
     * @param {Object} config 资源配置， key-名称，value-require的模块
     * @param {string} package 命名空间
     *
     */
    function processResource(config, package) {
        for (var key in config) {
            if (!config.hasOwnProperty(key)) {
                continue;
            }
            var item = config[key];
            key = package + '.' + key;
            if (modules.hasOwnProperty(key)) {
                if (item._belong && key !== item._belong) {
                    // 当模块名已经存在，并且与当前模块名称不同，产生冲突
                    throw ('module conflict: module "' + key + '" is already register to "' + item._belong + '"');
                }
                // 如果已存在此模块名，并且与当前模块名称相同，则不处理
            }
            else {
                if (item._belong) {
                    // 当前模块已被注册为其他名称，应避免相同模块不同名称的现象存在
                    throw ('module "' + key + '" already register to "' + item._belong + '"');
                }
                // 记录一下这个module是属于哪个命名空间的，方便调试
                item._belong = key;
                modules[key] = moduleProcessor(key, item);
            }
        }
    }

    /**
     * 处理依赖注入
     *
     * @param {Array.<Object>} config 注入配置
     * @param {string} config.id 注入的模块名
     * @param {Object} config.method 注入的方法
     * @param {Array.<string>} config.args 注入的参数
     * @param {string} package 命名空间
     *
     * @return
     */
    function processInjection(config, package) {
        config = config || [];

        for (var i = 0; i < config.length; i++) {
            var item = config[i];
            injection[item.id] = injection[item.id] || {};
            var mod = injection[item.id];
            var method = item.method;
            for (var key in method) {
                mod[key] = method[key];
            }
        }
    }

    /**
     * 处理切点配置
     *
     * @param {Object} config 切点配置
     * @param {string} config.id 切点id，关联到resource对应的id
     * @param {Array.<string>} config.pointCut 决定了该advice需要在哪些位置执行
     * @param {string} package 包名
     *
     */
    function processAop(config, package) {
        for (var i = 0; i < config.length; i++) {
            var item = config[i];
            aspectRegister(item.id, package, item.pointCut);
        }
    }

    /**
     * 初始化加载配置文件
     *
     * @return 
     */
    exports.init = function (config) {
        var package = config.package;

        if (!package && (config.resource || config.aspect)) {
            throw ('package name not found');
        }

        processImport(config.importConfig);
        config.resource && processResource(config.resource, package);
        config.aspect && processAop(config.aspect, package);
        config.injection && processInjection(config.injection, package);
    };

    exports.getInjection = function (modName) {
        return injection[modName];
    };

    /**
     * 获取一个模块所有需要注入的参数
     *
     * @Param {string} modName
     *
     * @return {Array.<string>}
     */
    exports.getDeps = function (modName) {
        var injections = injection[modName];
        var set = {};
        for (var key in injections) {
            if (injections.hasOwnProperty(key)) {
                var item = injections[key];
                for (var i = 0; i < item.length; i++) {
                    set[item[i]] = true;
                }
            }
        }
        // 删除对自己的依赖
        delete set[modName];
        var res = [];
        for (var key in set) {
            if (key.indexOf('.') > -1) {
                res.push(key);
            }
        }

        return res;
    };

    exports.queryDep = function (modName) {
        var deps = exports.getDeps(modName);
        console.log('deps of ' + modName + ' is:');
        if (!deps.length) {
            console.log('none');
        }
        for (var i = 0; i < deps.length; i++) {
            console.log(deps[i]);
        }
        console.log('-----------------------------------');
    };

    exports.getModules = function (queryWord) {
        queryWord = queryWord || '';
        var ret = [];
        for (var key in modules) {
            if (modules.hasOwnProperty(key)) {
                // 有检索词就查询
                if (queryWord) {
                    if (key.indexOf(queryWord) > -1) {
                        ret.push(key);
                    }
                }
                // 没有检索词就返回所有模块
                else {
                    ret.push(key);
                }
            }
        }
        return ret;
    };

    /**
     * 列出查询到的所有模块
     *
     * @param {string=} queryWord
     *
     */
    exports.queryModule = function (queryWord) {
        var result = exports.getModules(queryWord);
        if (queryWord) {
            console.log('modules contains "' + queryWord + '":');
        }
        else {
            console.log('all modules:');
        }
        for (var i = 0; i < result.length; i++) {
            console.log(result[i]);
        }
        console.log('-----------------------------------');
    };


    /**
     * 查询此模块在哪些地方调用，调试用的
     *
     * @Param {string} modName 模块名称
     *
     */
    exports.queryInvoke = function (modName) {
        var res = [];
        // 去重用的
        var set = {};
        for (var mod in injection) {
            if (injection.hasOwnProperty(mod)) {
                var funcs = injection[mod];
                for (var funcName in funcs) {
                    if (funcs.hasOwnProperty(funcName)) {
                        var depsList = funcs[funcName];
                        for (var i = 0; i < depsList.length; i++) {
                            var depName = depsList[i];
                            if (depName === modName) {
                                var key = mod + depName;
                                if (key in set) {
                                    continue;
                                }
                                else {
                                    set[key] = true;
                                }
                                res.push(
                                    {
                                        modName: mod,
                                        funcName: funcName
                                    }
                                );
                            }
                        }
                    }
                }
            }
        }
        if (res.length) {
            console.log('module ' + modName + ' used by these method:');
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].modName + ' -> ' + funcName);
            }
        }
        else {
            console.log('module' + modName + ' used nowhere');
        }
        console.log('-----------------------------------');
    };


    /**
     * 检查每个模块的依赖关系，打印没有被加载的依赖
     *
     */
    exports.checkDep = function () {
        var deps;
        var count = 0;
        console.log('checking deps:');
        for (var key in modules) {
            if (modules.hasOwnProperty(key)) {
                deps = exports.getDeps(key);
                for (var i = 0; i < deps.length; i++) {
                    if (!exports.has(deps[i])) {
                        if (deps[i].indexOf('.') > -1) {
                            count++;
                            console.log(deps[i] + ' is required by ' + key + ' but now missing');
                        }
                    }
                }
            }
        }
        if (!count) {
            console.log('all dependencies is ready');
        }
        console.log('-----------------------------------');
    };

    /**
     * 判断是否加载了模块
     *
     * @Param {string} modName
     *
     * @return {boolean}
     */
    exports.has = function (modName) {
        return modName in modules;
    };

    /**
     * 获取对应的模块
     *
     * @Param {string} modName
     *
     * @return {Object}
     */
    exports.get = function (modName) {
        if (modName in modules) {
            return modules[modName];
        }
        else {
            throw('module "' + modName + '" not found');
        }
    };

    return exports;
});

