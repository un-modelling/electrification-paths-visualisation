function graph_bar_find_tier_shift(tier, bar_width) {
  return (tier - 1) * ((bar_width * 3) + _g.bar_graph_padding);
}

function graph_bar_move_tier_marker(tier, bar_width) {
  var x = graph_bar_find_tier_shift(tier, 17);

  d3.selectAll('.tier-marker').attr({
    transform: "translate(" + x + ",0)"
  });
}

function draw_bar_icon(container, height, tier) {
  var icon_file = "images/icons/" + _g.tier_icons[tier] + "-icon.svg";

  d3.xml(icon_file, function(error, documentFragment) {
    if (error) {
      console.log(error);
      return;
    }

    var svgNode = documentFragment
      .getElementsByTagName("svg")[0];

    container.node().appendChild(svgNode);

    var icon = container.select("svg");

    icon.attr({
      dy: '.75em',
      y: height + 10,
      x: 13,
      width: 25,
      height: 25
    });

    icon.selectAll('path')
      .style({ stroke: _g.font_color });
  });
}

// TODO: graph_bar_draw should NOT be agnostic about:
//    _g, countries, summary...

function draw_bar_text(bars_group, text_format) {

  d3.selectAll('.bar-graph text').remove()

  var bar_texts = bars_group.append('text')
    .attr({
      dy: '.75em',
      y: -17,
      x: 30,
      'text-anchor': 'middle'
    });

  if (text_format === "population") {
    bar_texts.text(population_electrified_by);
  } else if (text_format === "costs") {
    bar_texts.text(cost_electrification);
  }
}

function graph_bar_draw(opts, sources, tier) {
  var width = opts.size.width;
  var height = opts.size.height;
  var position = opts.position;
  var x_vars = opts.x_vars;
  var param = opts.param;
  var svg = opts.svg;
  var id = opts.id

  var text_format = opts.text_format;

  var m = 100;

  var bar_width = width / 3;

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
      class: 'bar ' + "bar" + tier,

      width: bar_width,

      height: function(d) {
        return d['value'] * height
      },

      fill: function(d) {
        return _g.technologies.filter(function(e) { return e['name'] === d['param'] })[0]['color'];
      },

      'fill-opacity': function(d) {
        if (tier === _g.current_tier)
          return 1;
        else
          return 0.2;
      }
    });

  draw_bar_icon(container, height, tier);
}
