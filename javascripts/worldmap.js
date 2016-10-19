var worldmap = {
  width:      d3.select('#map-area').node().clientWidth,
  height:     window.screen.availHeight * 0.5,
  projection: d3.geo.equirectangular(),
  countries:  [],
  zoom:       null,
  path:       null,
  technologies:  [],
  grid_colors:   [],
  min_opacities: [],
  grid_counts:   null,
  technology_populations: null
};

var worldmap_svg = d3.select('#map-area').append('svg')
    .attr({
      id: 'map',
      width: worldmap.width,
      height: worldmap.height
    });

function worldmap_init() {
  // Helpers
  //
  _config.technologies.forEach(function(e) {
    worldmap.technologies.push(e['name']);
    worldmap.grid_colors.push(e['color']);
    worldmap.min_opacities.push(e['min_opacity']);
  });

  worldmap_svg.append('rect')
    .attr({
      id: 'sea',
      width: worldmap.width,
      height: worldmap.height
    })
    .style({
      fill: '#E2ECFF'
    });

  worldmap.countries = worldmap_svg.append("g").attr("class", "countries");

  worldmap.path = d3.geo.path().projection(
    worldmap.projection
      .scale(250)
      .center([-20, 0])
      .translate([worldmap.width / 2, worldmap.height / 2])
  );

  worldmap.zoom = d3.behavior.zoom()
    .scaleExtent([0.5, 200])
    .on("zoom", worldmap_zoomed_countries);

  worldmap_svg.call(worldmap.zoom);

  $('#map-area-curtain').width(worldmap.width);
  $('#map-area-curtain').height(worldmap.height);
}

function worldmap_curtain(callback) {
  var it = document.getElementById('map-area-curtain');
  it.style.display = "block";

  var a = setInterval(function() {
    if (it.style.display === "block") {
      if (typeof callback === "function") callback();
      clearInterval(a);
    }
  }, 10);
}

function worldmap_update(country) {
  var split = _g.current_diesel + _g.current_tier.toString();

  var diesel = _g.current_diesel === "nps" ? "n" : "l";

  var compressed_split = [_g.current_cost, diesel, _g.current_tier];

  var c_row  = "c"  + _g.current_cost + diesel;
  var lc_row = "lc" + _g.current_cost + diesel;
  var col    = _g.current_tier - 1;

  if (_g.first_load) {
    queue()
      .defer(d3.json, _g.data_address['root'] + _g.data_address['grids_prefix'] + country['iso3'] + _g.data_address['grids_suffix'])
      .await(function(err, grids_json) {
        worldmap_grids(err, grids_json, split, c_row, lc_row, col);
        _g.grids = grids_json;
        _g.first_load = false;
      });

  } else {
    if (_g.grids.length > 10000)
      worldmap_curtain(function() { worldmap_grids(null, _g.grids, split, c_row, lc_row, col); });
    else
      worldmap_grids(null, _g.grids, split, c_row, lc_row, col);
  }

  d3.selectAll('.country-label').move_to_front();
}

function worldmap_load(world_topo, countries_list) {
  var country_boundaries = topojson.feature(world_topo, world_topo.objects.countries).features;

  worldmap.countries.selectAll(".country")
    .data(country_boundaries)
    .enter().append("path")
    .attr({
      class: function(d) {
        return "country country" + d.id;
      },
      d: worldmap.path
    })
    .style({
      stroke: _config.font_color,
      fill: "#CDE6CD"
    });

  var c = country_by_iso3(get_query_param('iso3')).code;

  worldmap.countries.selectAll(".country.country" + c)
    .style({
      fill: 'white',
      stroke: 'red',
      'stroke-width': 0.2
    });

  var country_labels = worldmap.countries.selectAll("text")
    .data(country_boundaries)
    .enter().append("text")
    .attr({
      class: 'country-label',
      transform: function(d) {
        return "translate(" + worldmap.path.centroid(d) + ")";
      },
    })
    .append('tspan')
    .text(function(d) {
      return find_country_name(d);
    })
    .on({
      mouseover: function(d) {
        d3.select(this).style({
          "fill": "#00adef",
          "cursor": "pointer"
        })
      },
      mouseout: function(d) {
        d3.select(this).style("fill", _config.font_color)
      },
      dblclick: function(d) {
        var ccode = find_country_iso(d);
        var country = country_by_iso3(ccode)
        if (!country_is_ignored(country.iso3)) {
          window.location = "./country.html?iso3=" + find_country_iso(d) + "&tier=3&diesel_price=nps";
        } else {
          alert("Electrification model not available. Choose another country.")
        }
      }
    });
}

function worldmap_load_legends() {
  var line_data = [{
    "x": 15,
    "y": 7
  }, {
    "x": 30,
    "y": 7
  }];

  var line_function = d3.svg.line()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    })
    .interpolate("linear");

  var legend_lines_svg = d3.select("#map-legend-lines")
    .append("svg")
    .attr({
      height: 80
    });

  var legend_lines = legend_lines_svg.selectAll('.legend-group')
    .data(_config.transmission_lines)
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend_lines.append('path')
    .attr("d", line_function(line_data))
    .attr("stroke-width", 3)
    .style({
      'stroke': _config.technologies.filter_firstp('name', 'National Grid')['color'],
      'stroke-dasharray': function(d) { if (d === 'Planned Line') { return 0.4; } }
    });

  legend_lines.append('text')
    .attr({
      x: 35,
      y: 12
    })
    .text(function(d) {
      return d;
    })
    .style('fill', _config.font_color);
}

function worldmap_grid_opacity(grid, i) {
  var p = grid['p' + _config.year_end];
  if (!p) return 0;

  // select the minimum opacity based on population and the setting in _config.technologies:
  //
  var min = worldmap.min_opacities[i];

  // scale linearly between (min..1)
  //
  return (p < _config.hd) ? (((p / _config.hd) * (1 - min)) + min) : 1;
}

function worldmap_grids(err, country_grids, split, c, lc, col) {
  if (err) console.warn('error', err);

  // Doing this is suicide: d3.selectAll('rect.point-group').remove();
  // Instead, wrap all grids in a single group and remove it:
  //
  var meta_container = document.getElementById('points-container');
  if (meta_container) meta_container.remove();

  var points_container = worldmap.countries.append('g')
      .attr({ id: 'points-container' });

  var diesel = _g.current_diesel === "nps" ? "n" : "l";
  var label  = _g.current_cost + diesel + _g.current_tier;

  worldmap.technology_populations = _config.technologies.map(function(e) {
    return {
      name: e['name'],
      population: 0
    }
  });

  worldmap.grid_counts = _config.technologies.map(function(e) {
    return {
      name: e['name'],
      count: 0
    }
  });

  _g.country['context']['population_electrified_2030'] = 0;

  var points = points_container.selectAll('.point-group')
    .data(country_grids)
    .enter().append('rect')
    .attr({
      class: 'point-group',

      width: 0.4,
      height: 0.4,

      count: function(d) {
        worldmap.technology_populations[d[c][col]]['population'] += d['p' + _config.year_end];
        worldmap.grid_counts[d[c][col]]['count'] += 1;
        _g.country['context']['population_electrified_2030'] += d['e' + _config.year_end];

        return null;
      },

      transform: function(d) {
        var p = worldmap.projection([d.x, d.y]);
        return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")";
      },

      fill: function(d) {
        return worldmap.grid_colors[d[c][col]];
      },

      opacity: function(d,i) {
        return worldmap_grid_opacity(d, d[c][col]);
      }
    })
    .on({
      mouseover: function(d) {
        d3.select('#grid-marker').attr({
          transform: function() {
            var p = worldmap.projection([d.x, d.y]);
            return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
          }
        });

        var t = d[c][col];
        var l = d[lc][col];

        _g.current_grid['technology'] = worldmap.technologies[t];
        _g.current_grid['lcoe'] = l;
        _g.current_grid['population_' + _config.year_end] = d['p' + _config.year_end];
      }
    });

  population_graph_draw();

  worldmap_load_legends();

  document.getElementById('map-area-curtain').style.display = "none";

  if (!_g.first_load) return;

  var centered;

  var country_path = d3.select('.country' + _g.country.code);

  var x, y, k;

  if (country_path && centered !== country_path) {
    var centroid = worldmap.path.centroid(country_path.datum());
    x = centroid[0];
    y = centroid[1];
    centered = country_path;
  }

  worldmap.countries.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  var center = [worldmap.width / 2, worldmap.height / 2];
  var k = worldmap_country_bounds(country_path.datum())['scale'];

  worldmap.countries.append("rect")
    .attr({
      id: 'grid-marker',
      width: 0.4,
      height: 0.4
    })
    .style({
      'fill': 'none',
      'stroke': '#00adef',
      'stroke-width': 0.1,
      'border-radius': 2,
      'z-index': 999999
    });

  interpolate_zoom(worldmap.zoom,
                   [center[0] - (centroid[0] * k), center[1] - (centroid[1] * k)],
                   k,
                   worldmap_zoomed_countries);
}

function worldmap_zoomed_countries() {
  zoomed(worldmap.countries, worldmap.zoom, function() {
    d3.selectAll('.country-label').style('font-size', 0.8 / worldmap.zoom.scale() + 'em');
  });
}

function worldmap_country_bounds(d) {
  var bounds = worldmap.path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2

  scale = .9 / Math.max(dx / worldmap.width, dy / worldmap.height),
    translate = [worldmap.width / 2 - scale * x, worldmap.height / 2 - scale * y];

  return {
    scale: scale,
    translate: translate
  };
}

function worldmap_transmission_lines(features, cls) {
  var transmission_lines_color = _config.technologies.filter_firstp('name', "National Grid" )['color'];

  worldmap.countries.selectAll(".transmission-line-" + cls)
    .data(features)
    .enter().append('path')
    .attr({
      class: "transmission-line-" + cls,
      d: d3.geo.path().projection(worldmap.projection),
      'stroke-width': 0.2,
      stroke: transmission_lines_color,
      fill: "none"
    });
}
