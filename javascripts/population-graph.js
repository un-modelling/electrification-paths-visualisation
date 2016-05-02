function draw_population_graphs(opts, country, diesel_price) {
  _g.country = country;

  var width = opts.size.width;
  var height = opts.size.height;

  var graph = opts.svg.append('g')
    .attr({
      id: 'population-graph',
      transform: "translate(" + opts.position.x + "," + opts.position.y + ")"
    });

  var subgraph_size = {
    width: (width / 5) - _g.bar_graph_padding,
    height: height
  };

  var i = 1;
  while (i <= 5) {
    var summary = country["summary_" + diesel_price + i];

    var total_population = summary['grid'] + summary['micro_grid'] + summary['stand_alone'];

    var sources = _g.technologies.map(function(e) {
      return {
        param: e['name'],
        value: summary[e['short_name']] / total_population
      };
    });

    var bar_width = subgraph_size.width / 3;

    var x_shift = graph_bar_find_tier_shift(i, bar_width);

    graph_bar_draw({
      id: "population-graph" + i,
      svg: graph,
      size: subgraph_size,
      position: {
        x: x_shift,
        y: 0
      },
      x_vars: _g.technologies.map(function(e) { return e['name']; }),
      param: "param",
      text_format: "population"
    }, sources, i );

    // if (i === _g.current_tier) {
    //   graph.append('rect')
    //     .attr({
    //       class: "tier-marker",

    //       x: 0,
    //       y: 0,

    //       width:  subgraph_size['width'],
    //       height: subgraph_size['height'],

    //       fill: 'none',

    //       stroke: 'grey',
    //       'stroke-width': '1px'
    //     });

    //   graph_bar_move_tier_marker(i);
    // }

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
