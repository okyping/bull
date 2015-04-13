/**
 * @file 前端查询内存数据库
 * 为了解决订阅发布模块事件树状结构难以维护的问题
 * 所以不设置删除和修改方法
 *
 * @author liyinan
 * @version 1.0
 * @date 2015-04-13
 */
define(function (require) {
    var exports = {};

    var db = [];

    // 用于缓存每个字段的value，
    // 用于快速判断查询的内容是否存在，
    // 可以快速判定查询无结果
    var columnCache = {};

    // 针对每次查询条件缓存，
    // 提高下次查询速度
    var queryCache = {};

    // 数据库在字段名
    var columns = [];

    exports.add = function (data) {
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            columnCache[column][data[column]] = true;
        }
        db.push(data);
        // 暴力点添加一条就清空缓存
        // 从当前的应用场景看，通常是全部插入后再查询
        // 查询缓存再清空对插入效率影响较大
        queryCache = {};
    };

    /**
     * 根据查询条件计算查询字符串
     *
     * @Param {Object} queryObj 查询条件
     *
     * @return {string}
     */
    function getQueryStr(queryObj) {
        var query = [];
        // 计算query字符串，用于查询缓存
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column in queryObj) {
                var val = queryObj[column];
                query.push(column + ':' + val);
            }
        }
        return query.join(',');
    }

    /**
     * 查询
     *
     * @Param {Object} queryObj 查询条件，key value形式
     *
     * @return {Array.<Object>} 查询出的记录
     */
    exports.query = function (queryObj) {
        var result = db;
        var tempResult;
        var queryStr = getQueryStr(queryObj);

        // 查询缓存，有结果直接返回
        if (queryStr in queryCache) {
            return queryCache[queryStr];
        }

        // 循环所有定义的列
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            // 查询条件里无此列，继续查下一列
            if (!(column in queryObj)) {
                continue;
            }
            tempResult = [];
            var val = queryObj[column];
            // 星号是查询全部，不筛选
            if (val === '*') {
                continue;
            }
            // 缓存里没有此值，
            // 表示没有符合条件的结果
            // 清空结果数组，结束循环
            if (!(val in columnCache[column])) {
                result = [];
                break;
            }
            // 从全集里筛选出符合条件的结果
            for (var j = 0; j < result.length; j++) {
                if (result[j][column] === val) {
                    tempResult.push(result[j]);
                }
            }
            // 筛选后无结果，结束循环
            if (!tempResult.length) {
                break;
            }
            // 下次循环以这次筛选后的结果为全集
            result = tempResult;
        }
        // 缓存查询结果
        queryCache[queryStr] = result;
        return result;
    };

    /**
     * 定义数据库字段
     * 定义的字段可以作为查询字段，未定义的不可以查询
     *
     * @Param {Array.<string>} schema 数据库字段名称
     *
     */
    exports.init = function (schema) {
        schema = schema || [];
        if (!schema.length) {
            // 查询字段是必须的，此配置决定了数据库对哪些字段做cache
            throw('needs schema');
        }
        columns = schema;
        for (var i = 0; i < schema.length; i++) {
            columnCache[schema[i]] = {};
        }
    };

    return exports;
});
