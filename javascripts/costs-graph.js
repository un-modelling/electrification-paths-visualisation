var costs_graph_center;

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
    .style({ fill: _g.font_color })
    .text(function(d) {
      return rivets.formatters.in_b(cost) + " US$";
    });

  tier_icon(graph, tier, 'doughnut-icon', {
    x: "-1em",
    y: "-1.5em",
    width: 25,
    height: 25
  });

  costs_graph_rearrange(tier);
}

function costs_graph_draw(opts) {
  var position = opts.position;
  var width = opts.size.width;
  var height = opts.size.height;

  var graph = opts.svg.append('g')
      .attr({
        id: 'costs-graph',
        transform: "translate(" + position.x + "," + position.y + ")"
      });

  var i = 1;

  while (i <= 5) {
    var summary = _g.country["summary_" + _g.current_diesel + i];

    // TODO: data will be reformatted and then we can clean this
    // up. It's mostly ready.
    //
    var total_cost = summary['cost_grid'] + summary['cost_mg'] + summary['cost_sa'];
    var technologies_groups = ['grid', 'mg', 'sa'];

    var sources = technologies_groups.map(function(e) {
      var tech = _g.technologies.filter(function(t) {
        return ((t['short_name'] === 'grid'        && e === 'grid') ||
                (t['short_name'] === 'micro_grid'  && e === 'mg')   ||
                (t['short_name'] === 'stand_alone' && e === 'sa'))
      })[0];

      return {
        color: tech['color'],
        value: summary['cost_' + e]
      };
    });

    var pp = pentagon_position(i, width / 4);

    doughnut_graph_draw({
      id: "costs-graph" + i,
      svg: graph,
      position: {
        x: pp['x'],
        y: pp['y'],
      },

      radius: Math.min(width, height) / 6

    }, sources, i)

    i += 1;
  }
}

function costs_graph_rearrange(tier, animation_time) {
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
        "translate(" + costs_graph_center.x + "," + costs_graph_center.y + ")" + "rotate(" + 72 * tier + ")"
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
