function set_project_cost(tier) {
  _g.country['current_cost'] = d3.select("#costs-graph" + tier + ' > text').text().split(" ")[0];
}

function change_tier(tier) {
  _g.current_tier = tier;

  update_map(_g.country);

  $('.tier-changer').removeClass('active');

  $('[data-tier=' + tier + ']').closest('.tier-changer').addClass('active');

  d3.selectAll(".doughnut-text")
    .attr({
      dy: "1.5em",
      dx: "-2.5em",
      'font-weight': 'normal'
    })
    .style({
      'font-size': "1em"
    });

  d3.selectAll(".doughnut-text > svg")
    .attr({
      x: "-1em",
      y: "-1.5em",
    });

  d3.selectAll("#costs-graph")
    .transition()
    .duration(1000)
    .attrTween("transform", function() {
      return d3.interpolateString(
        d3.select(this).attr('transform'),
        "translate(" + _g.costs_graph.position.x + "," + _g.costs_graph.position.y + ")" + "rotate(" + 72 * tier + ")"
      );
    });

  d3.selectAll("#costs-graph .doughnut-text")
    .attr({
      'opacity': 1
    });

  d3.selectAll("#costs-graph" + tier + " .doughnut-text")
    .attr({
      dx: "2em",
      dy: "-1em",
      'font-weight': 'bold',
      'opacity': 1
    })
    .style({
      'font-size': "2em"
    });

  d3.selectAll('.doughnut-text')
    .transition()
    .duration(1000)
    .attrTween("transform", function() {
      return d3.interpolateString(
        d3.select(this).attr('transform'),
        "translate(" + 0 + "," + 0 + ")" + "rotate(" + 72 * tier * (-1) + ")"
      );
    });

  d3.selectAll("#costs-graph" + tier + " .doughnut-text > svg")
    .attr({
      x: "-0.5em",
      y: "-0.5em"
    });

  d3.selectAll(".bar").style({
    'fill-opacity': 0.2
  });

  d3.selectAll(".bar" + tier).style({
    'fill-opacity': 1
  });

  d3.selectAll(".arc").style({
    'fill-opacity': 0.2,
    'transform': "scale(1)"
  });

  d3.selectAll(".arc" + tier).style({
    'fill-opacity': 1,
    'transform': "scale(1.2)"
  });

  set_project_cost(tier);

  _g.scenario['tier'] = _g.current_tier;
}

function load_everything(err, all_countries, world_topo, transmission_lines, planned_transmission_lines) {
  if (err) console.warn('error', err);

  var tier, diesel_price;

  var existing_transmission_lines_features = topojson.feature(transmission_lines, transmission_lines.objects["existing-transmission-lines"]).features;
  var planned_transmission_lines_features = topojson.feature(planned_transmission_lines, planned_transmission_lines.objects["planned-transmission-lines"]).features;

  setup_project_countries(all_countries, function() {

    load_world(world_topo, all_countries);

    // Make sure everything is OK
    //
    try {
      _g.country = country_by_iso3(get_query_param('iso3'));
      tier = parseInt(get_query_param('tier'));
      diesel_price = get_query_param('diesel_price');

    } catch (e) {
      alert("Wrong ISO3 code! Bailing out... :(");
      return false;
    }

    if (isNaN(tier) || tier < 1) {
      alert("Wrong tier! Bailing out... :(");
      return false;
    }

    if (diesel_price !== "nps" && diesel_price !== "low") {
      alert("Wrong diesel price! Bailing out... :(");
      return false;
    }

    // TODO: clean this globals up...
    //
    _g.current_tier = tier;
    _g.current_diesel = diesel_price;
    _g.scenario['diesel_price'] = _g.diesel_price[_g.current_diesel];

    var population_svg = d3.select('svg#population')
      .attr({
        width: $('svg#population').parent().width(),
        height: 200
      });

    draw_population_graphs({
      size: _g.population_graph['size'],
      position: _g.population_graph['position'],
      svg: population_svg

    }, _g.country, _g.current_diesel);

    var costs_svg = d3.select('svg#costs')
      .attr({
        width: $('svg#costs').parent().width(),
        height: 300
      });

    draw_costs_graphs({
      size: _g.costs_graph['size'],
      position: _g.costs_graph['position'],
      svg: costs_svg

    }, _g.country, _g.current_diesel);

    $('#loading-screen').fadeOut(600, function() { change_tier(_g.current_tier); });

    $("#diesel-price-selector").change(function() {
      if (_g.current_diesel === "nps")
        _g.current_diesel = "low";
      else
        _g.current_diesel = "nps";

      _g.scenario['diesel_price'] = _g.diesel_price[_g.current_diesel]

      update_map(_g.country);

      // TODO: animations instead of this redraw which is buggy (rotations)
      // TODO: this is causing unnecessary requests (svg icons)
      //
      $('#population').empty();
      $('#costs').empty();

      draw_population_graphs({
        size: _g.population_graph['size'],
        position: _g.population_graph['position'],
        svg: population_svg

      }, _g.country, _g.current_diesel);

      draw_costs_graphs({
        size: _g.costs_graph['size'],
        position: _g.costs_graph['position'],
        svg: costs_svg

      }, _g.country, _g.current_diesel);

      change_tier(_g.current_tier);
    });

    $('.tier-changer').click(function(e) {
      var tier = parseInt($(e.target).closest('.tier-changer').attr('data-tier'));

      change_tier(tier);
    });

    draw_transmission_lines(existing_transmission_lines_features, "existing");
    draw_transmission_lines(planned_transmission_lines_features, "planned");

    set_project_cost(_g.current_tier);

    rivets.bind($('header'), {
      country: _g.country
    });

    rivets.bind($('#grid-description'), {
      grid: _g.current_grid
    });

    rivets.bind($('#country-stats'), {
      country: _g.country
    });

    rivets.bind($('#scenario-selector'), {
      scenario: _g.scenario
    });

    //Initialize tooltip
    $('[data-toggle="tooltip"]').tooltip();
  });
}

queue(4)
  .defer(d3.json, './data/country/summaries.json')
  .defer(d3.json, './data/topojson/world-topography.json')
  .defer(d3.json, './data/topojson/existing-transmission-lines.json')
  .defer(d3.json, './data/topojson/planned-transmission-lines.json')
  .await(load_everything);
