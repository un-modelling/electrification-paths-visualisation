var costs_graph = {
  position: { x: 0, y: 0 },
  width:  0,
  height: 300
}

function doughnut_graph_draw(opts, data, tier) {
  var radius = opts.radius;
  var position = opts.position;
  var svg = opts.svg;
  var id = opts.id;

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 20);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d['value'];
      });

  var graph = opts.svg.append('g')
      .attr({
        id: id,
        class: 'doughnut-group',
        transform: "translate(" + opts.position.x + "," + opts.position.y + ")"
      });

  var g = graph.selectAll(".arc")
      .data(pie(data))
      .enter().append("g");

  g.append("path")
    .attr({
      d: arc,
      class: "arc " + "arc" + tier,
    })

    .style({
      fill: function(d) {
        return d['data']['color'];
      },
      'fill-opacity': function(d) {
        return (tier === _g.current_tier ? 1 : 0.2)
      },
    });

  graph.on({
    click: function(d) {
      return change_tier(tier);
    }
  });

  var cost = data
      .map(function(e) {
        return e['value']
      })
      .reduce(function(a, b) {
        return a + b;
      });

  graph.append("text")
    .attr({
      class: 'doughnut-text',
      dx: "-2.5em",
      dy: "1.5em"
    })
    .style({ fill: _config.font_color })
    .text(function(d) {
      return rivets.formatters.in_b(cost) + " US$";
    });

  tier_icon(graph, tier, 'doughnut-icon', {
    x: "-1em",
    y: "-1.5em",
    width: 25,
    height: 25
  });

  costs_graph_rearrange(tier, null);
}

function costs_graph_draw() {
  costs_graph.width = $('svg#costs').parent().width();

  costs_graph.position = {
    x: $('svg#costs').parent().width() / 2,
    y: 150
  };

  var position = costs_graph.position;

  var graph = d3.select('svg#costs').append('g')
      .attr({
        id: 'costs-graph',
        transform: "translate(" + position.x + "," + position.y + ")"
      });

  var i = 1;

  var diesel = _g.current_diesel === "nps" ? "n" : "l";

  while (i <= 5) {
    var summary = _g.country["split_summary"];
    var label = _g.current_cost + diesel + i;

    var sources = _config.technologies.map(function(e,i) {
      return {
        color: e['color'],
        value: summary[e['group'] + label]
      };
    });

    var pp = pentagon_position(i, costs_graph.width / 4);

    doughnut_graph_draw({
      id: "costs-graph" + i,
      svg: graph,
      position: {
        x: pp['x'],
        y: pp['y'],
      },

      radius: Math.min(costs_graph.width, costs_graph.height) / 6

    }, sources, i)

    i += 1;
  }
}

function costs_graph_rearrange(tier, animation_time) {
  var position = costs_graph.position;

  if (!animation_time) animation_time = 1000;

  d3.selectAll(".doughnut-text")
    .attr({
      dy: "1.5em",
      dx: "-2.5em",
      'font-weight': 'normal'
    })
    .style({
      'font-size': "1em"
    })
    .select("svg") // dig deeper for the icons...
    .attr({
      x: "-1em",
      y: "-1.5em",
    });

  d3.selectAll("#costs-graph .doughnut-text")
    .attr({
      'opacity': 1
    });

  d3.select("#costs-graph")
    .transition()
    .duration(animation_time)
    .attrTween("transform", function() {
      return d3.interpolateString(
        d3.select(this).attr('transform'),
        "translate(" + position.x + "," + position.y + ")" + "rotate(" + 72 * tier + ")"
      );
    });

  d3.select("#costs-graph" + tier + " .doughnut-text")
    .attr({
      dx: "2em",
      dy: "-1em",
      'font-weight': 'bold',
      'opacity': 1
    })
    .style({
      'font-size': "2em"
    })
    .select("svg") // dig deeper for the icons...
    .attr({
      x: "-0.5em",
      y: "-0.5em"
    });

  d3.selectAll('.doughnut-text, .doughnut-icon')
    .transition()
    .duration(animation_time)
    .attrTween("transform", function() {
      return d3.interpolateString(
        d3.select(this).attr('transform'),
        "translate(" + 0 + "," + 0 + ")" + "rotate(" + 72 * tier * (-1) + ")"
      );
    });

  d3.selectAll(".arc").style({
    'fill-opacity': 0.2,
    'transform': "scale(1)"
  });

  d3.selectAll(".arc" + tier).style({
    'fill-opacity': 1,
    'transform': "scale(1.2)"
  });
}
