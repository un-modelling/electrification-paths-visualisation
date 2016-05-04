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
        return change_tier(tier);
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
    .domain([0, _g.country['context']['population_2030']])
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
        return _g.technologies.filter(function(e) { return e['name'] === d['param'] })[0]['color'];
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

    var total_population = summary['grid'] + summary['micro_grid'] + summary['stand_alone'];

    var sources = _g.technologies.map(function(e) {
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
      x_vars: _g.technologies.map(function(e) { return e['name']; }),
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
