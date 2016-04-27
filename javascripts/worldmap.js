//// D3 VERSION

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
};

var map_svg = d3.select('#map-area').append('svg')
    .attr({
      id: 'map',
      width: worldmap.width,
      height: worldmap.height
    });

function worldmap_init() {
  // Helpers
  //
  _g.technologies.map(function(e) {
    worldmap.technologies.push(e['name']);
    worldmap.grid_colors.push(e['color']);
    worldmap.min_opacities.push(e['min_opacity']);
  });

  worldmap.countries = map_svg.append("g").attr("class", "countries");

  worldmap.path = d3.geo.path().projection(
    worldmap.projection
      .scale(350)
      .center([18, 0])
      .translate([worldmap.width / 2, worldmap.height / 2])
  );

  worldmap.zoom = d3.behavior.zoom()
    .scaleExtent([0.5, 200])
    .on("zoom", zoomed);

  map_svg.call(worldmap.zoom);

  $('#map-area-curtain').width(worldmap.width);
  $('#map-area-curtain').height(worldmap.height);
}

function map_curtain(callback) {
  var it = document.getElementById('map-area-curtain');
  it.style.display = "block";

  var a = setInterval(function() {
    if (it.style.display === "block") {
      if (typeof callback === "function") callback();
      clearInterval(a);
    }
  }, 10);
}

function zoomed() {
  worldmap.countries.attr({
    transform: "translate(" + worldmap.zoom.translate() + ")" + "scale(" + worldmap.zoom.scale() + ")"
  });

  d3.selectAll('.country-label').style('font-size', 0.8 / worldmap.zoom.scale() + 'em');
}

function interpolate_zoom(translate, scale) {
  return d3.transition().duration(750).tween("zoom", function() {
    var t = d3.interpolate(worldmap.zoom.translate(), translate),
      s = d3.interpolate(worldmap.zoom.scale(), scale);

    return function(d) {
      worldmap.zoom.translate(t(d));
      worldmap.zoom.scale(s(d));

      zoomed();
    };
  });
}

function update_map(country) {
  var split = _g.current_diesel + _g.current_tier.toString();

  var diesel = _g.current_diesel === "nps" ? "n" : "o";

  var compressed_split = [diesel, _g.current_tier];

  if (_g.first_load) {
    queue()
      .defer(d3.json, './data/grids/' + country['iso3'] + '_grids.json')
    // .defer(d3.json, 'http://localhost:3000/countries/' + country['iso3'] + '/full')
      .await(function(err, grids_json) {
        load_country_grids(err, grids_json, split, compressed_split);
        _g.grids = grids_json;
        _g.first_load = false;
      });

  } else {
    if (_g.grids.length > 10000)
      map_curtain(function() { load_country_grids(null, _g.grids, split, compressed_split); });
    else
      load_country_grids(null, _g.grids, split, compressed_split);
  }
}

function load_world(world_topo, countries_list) {
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
      fill: function(d) {
        if (d.id == country_by_iso3(get_query_param('iso3')).code) {
          return "#ffffff";
        } else {
          if (d.id == 24) {
            return "red";
          } else {
            return "#eeeeee";
          }

        }
      }
    })

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
        d3.select(this).style("fill", _g.font_color)
      },
      dblclick: function(d) {
        var ccode = find_country_iso(d);
        var country = country_by_iso3(ccode)
        if ((country.region == _g.region) && ($.inArray(country.subregion, _g.ignored_subregions))) {
          window.location = "./country.html?iso3=" + find_country_iso(d) + "&tier=3&diesel_price=nps";
        } else {
          alert("Electrification model not available. Choose another country.")
        }
      }
    })

  var width_legend = d3.select('#map-legend').node().clientWidth;
  var height_legend = 80;
  var padding_legend = 35;

  var legend_svg = d3.select("#map-legend")
    .append("svg")
    .attr({
      "width": width_legend,
      "height": height_legend
    });

  var legend_grad = legend_svg.selectAll('.legend-group')
    .data(worldmap.technologies)
    .enter().append('defs')
    .append("svg:linearGradient")
    .attr({
      id: function(d,i) {
        return 'gradient' + i;
      },
      x1: function(d,i) {
        return (worldmap.min_opacities[i] * 100) + "%";
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
        return worldmap.grid_colors[i];
      },

      "stop-opacity": function(d,i) {
        return worldmap.min_opacities[i];
      },
    });

  legend_grad.append("stop")
    .attr({
      "offset": "100%",
    })
    .style({
      "stop-color": function(d, i) {
        return worldmap.grid_colors[i];
      },

      "stop-opacity": 1
    });

  var legend = legend_svg.selectAll('.legend-group')
    .data(worldmap.technologies)
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend.append("rect")
    .attr({
      "width": 150,
      "height": 20,
      "x": 25,
      "y": 2
    })
    .style("fill", function(d, i) {
      return "url(#gradient" + i + ")";
    })

  legend.append('text')
    .attr({
      y: 17,
      x: 50
    })
    .text(function(d) {
      return d;
    })
    .style('fill', _g.font_color);

  legend_svg.append("text")
    .attr("x", 15)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "end",
      "fill": _g.font_color
    })
    .text("0");

  legend_svg.append("text")
    .attr("x", 150 + 40)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "start",
      "fill": _g.font_color
    })
    .text(_g.hd.toLocaleString() + "+");

  var width_lines_legend = d3.select('#map-legend-lines').node().clientWidth;
  var height_lines_legend = 80;
  var padding_lines_legend = 35;

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
      "width": width_lines_legend,
      "height": height_lines_legend
    });

  var legend_lines = legend_lines_svg.selectAll('.legend-group')
    .data(_g.transmission_lines)
    .enter().append('g')
    .attr({
      class: 'legend-group',
      transform: function(d, i) {
        return 'translate(0,' + ((20 * i) + 10) + ')'
      }
    });

  legend_lines.append('path')
    .attr("d", line_function(line_data))
    .attr("stroke-width", 2)
    .style({
      'stroke': _g.font_color,
      'stroke-dasharray': function(d) {
        if (d === 'Planned Line') {
          return 0.4;
        }
      },
      'stroke-dashoffset': function(d) {
        if (d === 'Existing Line') {
          return 0.4;
        }
      }
    });

  legend_lines.append('text')
    .attr({
      x: 35,
      y: 12
    })
    .text(function(d) {
      return d;
    })
    .style('fill', _g.font_color);
}

function grid_opacity(grid, i) {
  var p = grid['p2'];
  if (!p) return 0;

  // select the minimum opacity based on population and the setting in _g.technologies:
  //
  var min = worldmap.min_opacities[i];

  // scale linearly between (min..1)
  //
  return (p < _g.hd) ? (((p / _g.hd) * (1 - min)) + min) : 1;
}

function load_country_grids(err, country_grids, split, comp_split) {
  if (err) console.warn('error', err);

  // Doing this is suicide: d3.selectAll('rect.point-group').remove();
  // Instead, wrap all grids in a single group and remove it:
  //
  var meta_container = document.getElementById('points-container');
  if (meta_container) meta_container.remove();

  var points_container = worldmap.countries.append('g')
      .attr({ id: 'points-container' })

  var points = points_container.selectAll('.point-group')
    .data(country_grids)
    .enter().append('rect')
    .attr({
      class: 'point-group',

      width: 0.4,
      height: 0.4,

      transform: function(d) {
        var p = worldmap.projection([d.x, d.y]);
        return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
      },

      fill: function(d) {
        return worldmap.grid_colors[d[comp_split[0]][comp_split[1] - 1]];
      },

      opacity: function(d,i) {
        return grid_opacity(d,d[comp_split[0]][comp_split[1] - 1]);
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

        var t = d[comp_split[0]][comp_split[1] - 1];
        var l = d['l' + comp_split[0]][comp_split[1] - 1];

        _g.current_grid['technology'] = worldmap.technologies[t];
        _g.current_grid['lcoe'] = l;
        _g.current_grid['population_2030'] = d['p2'];
      }
    });

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
  var k = country_bounds(country_path.datum())['scale'];

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

  interpolate_zoom([center[0] - (centroid[0] * k), center[1] - (centroid[1] * k)], k);
}

function country_bounds(d) {
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

function draw_transmission_lines(features, cls) {
  worldmap.countries.selectAll(".transmission-line-" + cls)
    .data(features)
    .enter().append('path')

  .attr({
    class: "transmission-line-" + cls,
    d: d3.geo.path().projection(worldmap.projection),
    'stroke-width': 0.2,
    fill: "none"
  });
}
