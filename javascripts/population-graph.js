var bar_graph_padding = 10;

function bar_graph_shift(tier, bar_width) {
  return (tier - 1) * (bar_width + bar_graph_padding);
}

function bar_graph_draw(opts, sources, tier) {
  var width = opts.size.width;
  var height = opts.size.height;
  var position = opts.position;
  var x_vars = opts.x_vars;
  var param = opts.param;
  var svg = opts.svg;
  var id = opts.id

  var m = 100;

  var container = svg.append('g')
    .attr({
      id: id,
      class: function() {
        return (tier === _g.current_tier ? "bar-graph active" : "bar-graph");
      },
      transform: "translate(" + (position.x + 50) + "," + position.y + ")"
    })

    .on({
      click: function(d) {
        return change_tier();
      }
  });

  var x = d3.scale.ordinal()
    .domain(x_vars)
    .rangeRoundBands([0, width]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(1)
    .tickFormat(function(v) {
      return null
    });

  var y = d3.scale.linear()
    .domain([0, m])
    .range([height, 10]);

  var real_y = d3.scale.linear()
    .domain([0, _g.country['context']['population_' + _g.year_end]])
    .range([height, 10]);

  var yAxis = d3.svg.axis()
    .scale(real_y)
    .ticks(3)
    .orient("left")
    .tickFormat(function(v) {
      return rivets.formatters.in_millions_onedecimal(v);
    });

  container.append('g')
    .attr({
      class: 'x axis',
      transform: "translate(" + (0) + "," + height + ")",
      fill: _g.font_color
    })
    .call(xAxis);


  // only draw y axis for 1st tier

  if (tier == 1) {
    container.append('g')
      .attr({
        class: 'y axis',
        transform: "translate(" + 0 + "," + 0 + ")",
        fill: _g.font_color
      })
      .call(yAxis);
  }

  var bars_group = container.selectAll('.bar')
    .data(sources)
    .enter().append('g')
    .attr({
      transform: function(d, i) {
        return "translate(" + x(d[param]) + "," + (height - (d['value'] * height)) + ")";
      }
    });

  bars_group.append('rect')
    .attr({
      class: "bar " + "bar" + tier,
      width: width / _g.technologies.length,
      height: function(d) {
        return d['value'] * height
      },

      fill: function(d) {
        return _g.technologies.filter_firstp('name', d['param'])['color'];
      },

      'fill-opacity': function(d) {
        return (tier === _g.current_tier ? 1 : 0.2);
      }
    });

  tier_icon(container, tier, 'bar-icon', {
    dy: '.75em',
    y: height + 10,
    x: 13,
    width: 25,
    height: 25
  });
}

function population_graph_draw(opts) {
  var selected_grids = worldmap.technology_populations.sort_p('population');

  var width_legend = d3.select('#map-legend').node().clientWidth;
  var height_legend = (selected_grids.length * 20) + 20;

  $("#map-legend, #map-legend-lines").empty();

  var total_population = worldmap.technology_populations.reduce(function(a,b) { return a + b['population']; }, 0);

  var legend_svg = d3.select("#map-legend")
    .append("svg")
    .attr({
      "width": width_legend,
      "height": height_legend
    });

  var legend_grad = legend_svg.selectAll('.legend-group')
    .data(selected_grids)
    .enter().append('defs')
    .append("svg:linearGradient")
    .attr({
      id: function(d,i) {
        return 'gradient' + i;
      },
      x1: function(d,i) {
        return (_config.technologies.filter_firstp('name', d['name'])['min_opacity'] * 100) + "%";
      },
      x2: "100%",
      y1: "0%",
      y2: "0%",

      y: function(d,i) {
        return i * 15;
      }
    });

  legend_grad.append("stop")
    .attr({
      offset: "0%"
    })
    .style({
      "stop-color": function(d,i) {
        return _config.technologies.filter_firstp('name', d['name'])['color'];
      },

      "stop-opacity": function(d,i) {
        return _config.technologies.filter_firstp('name', d['name'])['min_opacity'];
      },
    });

  legend_grad.append("stop")
    .attr({
      "offset": "100%",
    })
    .style({
      "stop-color": function(d, i) {
        return _config.technologies.filter_firstp('name', d['name'])['color'];
      },

      "stop-opacity": 1
    });

  var legend = legend_svg.selectAll('.legend-group')
    .data(selected_grids)
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend.append("rect")
    .attr({
      "width": 250,
      "height": 20,
      "x": 25,
      "y": 2
    })
    .style("fill", function(d, i) {
      return "url(#gradient" + i + ")";
    });

  legend.append('text')
    .attr({
      y: 17,
      x: 50
    })
    .text(function(d) {
      var p = ((d['population'] / total_population) * 100).toFixed(2);

      return p + "%" + " " + d['name'];
    })
    .style('fill', _config.font_color);

  legend_svg.append("text")
    .attr("x", 15)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "end",
      "fill": _config.font_color
    })
    .text("0");

  legend_svg.append("text")
    .attr("x", 250 + 30)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "start",
      "fill": _config.font_color
    })
    .text(_config.hd.toLocaleString() + "+");

  return;

  var t_width  = opts.size[0] - 45 - (bar_graph_padding * 5);
  var t_height = opts.size[1] - 40;

  var graph = opts.svg.append('g')
    .attr({
      id: 'population-graph'
    });

  var subgraph_size = {
    width:  t_width / 5,
    height: t_height
  };

  var i = 1;
  while (i <= 5) {
    var summary = _g.country["summary_" + _g.current_diesel + i];

    var sources = _config.technologies.map(function(e) {
      return {
        param: e['name'],
        value: summary[e['short_name']] / total_population
      };
    });

    var x_shift = bar_graph_shift(i, subgraph_size.width);

    bar_graph_draw({
      id: "population-graph" + i,
      svg: graph,
      size: subgraph_size,
      position: {
        x: x_shift,
        y: 0
      },
      x_vars: _config.technologies.map(function(e) { return e['name']; }),
      param: "param",
    }, sources, i );

    i += 1;
  }
}

function population_graph_rearrange(tier) {
  d3.selectAll(".bar").style({
    'fill-opacity': 0.2
  });

  d3.selectAll(".bar" + tier).style({
    'fill-opacity': 1
  });
}
