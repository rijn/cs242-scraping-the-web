const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

ipc.on('data', (event, graph) => {

    _.each(graph.links, link => {
        for (var i = 0; i < graph.nodes.length; i++) {
            if (link.source === graph.nodes[i].name) {
                link.source = i;
            }
            if (link.target === graph.nodes[i].name) {
                link.target = i;
            }
        }
    });

    console.log(graph.links);

    var width = 3000,
        height = 3000
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var force = d3.layout
        .force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([width, height]);
    
    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();
    
    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");
    
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);
    
    node.append('circle')
        .attr('r', (d) => { return Math.max(5, d.isActor ? d.age / 7 : d.grossingValue / 1e8); })
        .style('fill', (d) => { return d.isActor ? '#1f77b4' : '#71e072'; });
    
    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text((d) => { return d.name });

    node.append('text')
        .attr('class', 'small')
        .attr('dx', 12)
        .attr('dy', '1.35em')
        .text((d) => { return d.isActor ? 'Age ' + d.age : '$ ' + d.grossingValue });
    
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});

ipc.send('network-ready');
