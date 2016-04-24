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

    var g = summary['grid'];
    var mg = summary['micro_grid'];
    var sa = summary['stand_alone'];

    var total_population = g + mg + sa;

    var sources = [{
      param: 'grid',
      value: g / total_population
    }, {
      param: 'micro_grid',
      value: mg / total_population
    }, {
      param: 'stand_alone',
      value: sa / total_population
    }]

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
        x_vars: ["grid", "micro_grid", "stand_alone"],
        param: "param",
        text_format: "population"
      },

      sources,

      i
    );

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
