define(function (require) {
    var exports = {};

    function buildDepsConfig(series) {
        series.nodes = [];
        series.links = [];
        var nodes = series.nodes;
        var links = series.links;
        var loader = require('./loader');
        var allMods = loader.getModules();
        for (var i = 0; i < allMods.length; i++) {
            var mod = allMods[i];
            // 添加节点，也就是模块名
            nodes.push(
                {
                    name: mod
                }
            );
            var deps = loader.getDeps(mod);
            for (var j = 0; j < deps.length; j++) {
                var dep = deps[j];
                links.push(
                    {
                        source: mod,
                        target: dep,
                        weight: 1,
                        name: '依赖'
                    }
                );
            }
        }
    }

    function buildRevertDepsConfig(series) {
        series.nodes = [];
        series.links = [];
        var nodes = series.nodes;
        var links = series.links;
        var loader = require('./loader');
        var allMods = loader.getModules();
        for (var i = 0; i < allMods.length; i++) {
            var mod = allMods[i];
            // 添加节点，也就是模块名
            nodes.push(
                {
                    name: mod
                }
            );
            var deps = loader.getDeps(mod);
            for (var j = 0; j < deps.length; j++) {
                var dep = deps[j];
                links.push(
                    {
                        source: dep,
                        target: mod,
                        weight: 1,
                        name: '被依赖'
                    }
                );
            }
        }
    }

    var config = {
            title: {
                text: '模块关系图',
                x:'right',
                y:'bottom'
            },
            // tooltip : {
            //     trigger: 'item',
            //     formatter: function (params) {
            //         if (params.indicator2) {    // is edge
            //             return params.indicator + ' ' + params.name + ' ' + params.indicator2;
            //         } else {    // is node
            //             return params.name
            //         }
            //     }
            // },
            legend: {
                x: 'left',
                selectedMode: 'single',
                selected: {
                    '模块反向依赖关系图' : false
                },
                data:['模块依赖关系图', '模块反向依赖关系图']
            },
            series : [
                {
                    name: '模块依赖关系图',
                    type:'chord',
                    sort : 'ascending',
                    sortSub : 'descending',
                    ribbonType: false,
                    radius: '60%',
                    itemStyle : {
                        normal : {
                            label : {
                                rotate : true
                            }
                        }
                    },
                    minRadius: 7,
                    maxRadius: 20,
                },
                {
                    name: '模块反向依赖关系图',
                    type:'chord',
                    sort : 'ascending',
                    sortSub : 'descending',
                    ribbonType: false,
                    radius: '60%',
                    itemStyle : {
                        normal : {
                            label : {
                                rotate : true
                            }
                        }
                    },
                    minRadius: 7,
                    maxRadius: 20,
                }
            ]
        };
    buildDepsConfig(config.series[0]);
    buildRevertDepsConfig(config.series[1]);

    return config;
});
