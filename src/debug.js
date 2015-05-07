/**
 * @file 调试文件，用于图形化展示模块之间的关系，异步加载，不自动打包
 * @author liyinan
 * @version 1.0
 * @date 2015-04-14
 */
define(function (require) {
    var exports = {};

    require('echarts/chart/chord');
    var echarts = require('echarts');
    var inited = false;

    var closeBtn;
    var container;
    var echartsContainer;
    var tpl = ''
        + '<div id="bullDebugContainer" style="width:800px; height:600px; position:fixed; top:50%; left:50%; margin-top:-400px; margin-left:-300px; background-color:#fff; border:solid 1px #888;">'
        + '    <div id="bullCloseBtn" style="width: 20px; height: 20px; position: absolute; right: 0; top: 0; z-index: 10; cursor: pointer;">'
        + '    X'
        + '    </div>'
        + '    <div id="echartsContainer" style="height: 100%; width: 100%;">'
        + '    </div>'
        + '</div>';

    exports.show = function () {
        container.style.display = 'block';
    };

    exports.hide = function () {
        container.style.display = 'none';
    };

    exports.initEcharts = function () {
        var myChart = require('echarts').init(echartsContainer);
        var config = require('./echartsConfig');
        myChart.setOption(config);
    };

    exports.init = function () {
        inited = true;
        var div = document.createElement('div');
        div.innerHTML = tpl;
        document.body.appendChild(div);
        container = document.getElementById('bullDebugContainer');
        echartsContainer = document.getElementById('echartsContainer');
        closeBtn = document.getElementById('bullCloseBtn');
        exports.initEcharts();
    };

    exports.bindEvent = function () {
        closeBtn.onclick = function () {
            exports.hide();
        };
    };

    exports.entry = function () {
        if (inited) {
            exports.show();
        }
        else {
            exports.init();
            exports.bindEvent();
        }
    };
    return exports;
});
