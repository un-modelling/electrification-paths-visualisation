//// D3 VERSION

var widthMap = d3.select('#map-area').node().clientWidth;
var heightMap = window.screen.availHeight * 0.5;
var centered;

$('#map-area-curtain').width(widthMap);
$('#map-area-curtain').height(heightMap);

d3.select('.cover')
  .style("width", widthMap + "px")
  .style("height", heightMap + "px");

var projection = d3.geo.equirectangular()
  .center([18, 0])
  .scale(350)
  .translate([widthMap / 2, heightMap / 2]);

var path = d3.geo.path()
  .projection(projection);

var transmission_lines = ['Existing Line', 'Planned Line'];

var font_color = "#4d4d4d";

var technologies = _g.technologies.map(function(e) { return e['name'] });
var grid_colors  = _g.technologies.map(function(e) { return e['color'] });

var linesColors = d3.scale.ordinal()
  .range([font_color, font_color])
  .domain(transmission_lines);

var svgMap = d3.select('#map-area').append('svg')
  .attr({
    id: 'map',
    width: widthMap,
    height: heightMap
  });

var countries = svgMap.append("g")
  .attr("class", "countries");

var zoom = d3.behavior.zoom()
  .scaleExtent([0.5, 200])
  .on("zoom", zoomed);

function zoomed() {
  countries.attr({
    transform: "translate(" + zoom.translate() + ")" + "scale(" + zoom.scale() + ")"
  });

  d3.selectAll('.country-label').style('font-size', 0.8 / zoom.scale() + 'em');
}

function interpolate_zoom(translate, scale) {
  return d3.transition().duration(750).tween("zoom", function() {
    var t = d3.interpolate(zoom.translate(), translate),
      s = d3.interpolate(zoom.scale(), scale);

    return function(d) {
      zoom.translate(t(d));
      zoom.scale(s(d));

      zoomed();
    };
  });
}

svgMap.call(zoom)

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
    $('#map-area-curtain').fadeIn(600, function() {
      load_country_grids(null, _g.grids, split, compressed_split);
    });
  }

  $('#map-area-curtain').fadeOut(300);
}

function load_world(world_topo, countries_list) {
  var country_boundaries = topojson.feature(world_topo, world_topo.objects.countries).features;

  var land_boundaries = topojson.feature(world_topo, world_topo.objects.land);

  var state = country_boundaries.filter(function(d) {
    return d.id === country_by_iso3(get_query_param('iso3')).code;
  })[0];

  countries.insert("path")
    .datum(land_boundaries)
    .attr("class", "land")
    .attr("d", path)
    .classed("outline", true)
    .style("fill", "none");

  countries.selectAll(".country")
    .data(country_boundaries)
    .enter().append("path")
    .attr({
      class: function(d) {
        return "country country" + d.id;
      },
      d: path
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

  var country_labels = countries.selectAll("text")
    .data(country_boundaries)
    .enter().append("text")
    .attr({
      class: 'country-label',
      transform: function(d) {
        return "translate(" + path.centroid(d) + ")";
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
        d3.select(this).style("fill", font_color)
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

  countries.append("path")
    .datum(state)
    .attr("class", "outline")
    .attr("d", path);

  //legend for grid
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
    .data(technologies)
    .enter().append('defs')
    .append("svg:linearGradient")
    .attr({
      "id": function(d, i) {
        return 'gradient' + i;
      },
      "x1": "100%",
      "y1": "100%",
      "x2": "0%",
      "y2": "100%",
      "spreadMethod": "pad",
      "y": function(d, i) {
        return i * 15;
      }
    });

  legend_grad.append("stop")
    .attr({
      "offset": "0%",
      "stop-color": function(d, i) {
        return grid_colors[i];
      },
      "stop-opacity": 1
    });

  legend_grad.append("stop")
    .attr({
      "offset": "100%",
      "stop-color": function(d, i) {
        return grid_colors[i];
      },
      "stop-opacity": function(d) {
        if (d == 'Stand Alone') {
          return 0.2
        } else {
          return 0.3
        }
      }
    });

  var legend = legend_svg.selectAll('.legend-group')
    .data(technologies)
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
    .style('fill', font_color);

  legend_svg.append("text")
    .attr("x", 15)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "end",
      "fill": font_color
    })
    .text("0");

  legend_svg.append("text")
    .attr("x", 150 + 40)
    .attr("y", 48)
    .style({
      "font-size": 18,
      "text-anchor": "start",
      "fill": font_color
    })
    .text("100,000+");

  //legend for lines

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
    .data(transmission_lines)
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
      'stroke': function(d, i) {
        return linesColors.range()[i];
      },
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
    .style('fill', font_color);
}

function grid_opacity(grid, split) {
  var p = grid['p2'];

  var min, grid_op = 0;

  // the value at which we consider an area as "very dense"
  // and set the opacity to 1.
  //
  var h = 100000;

  // min opacity for "National Grid" and "Mini Grid":
  //
  var min_g_mg = 0.3;

  // min opacity for "Stand Alone":
  //
  var min_sa = 0.2;

  if (!p) return 0;

  if (grid[split[0]][split[1] - 1] === 2)
    min = min_sa;
  else
    min = min_g_mg;

  // scale linearly between (min..1)
  //
  if (p < h)
    grid_op = ((p / h) * (1 - min)) + min
  else
    grid_op = 1;

  return grid_op;
}

function load_country_grids(err, country_grids, split, comp_split) {
  if (err) console.warn('error', err);

  // Doing this is suicide: d3.selectAll('rect.point-group').remove();
  // Instead, wrap all grids in a single group and remove it:
  //
  var meta_container = document.getElementById('points-container');
  if (meta_container) meta_container.remove();

  var points_container = countries.append('g')
      .attr({ id: 'points-container' })

  var points = points_container.selectAll('.point-group')
    .data(country_grids)
    .enter().append('rect')
    .attr({
      class: 'point-group',
      transform: function(d) {
        var p = projection([d.x, d.y]);
        return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
      },
      fill: function(d) {
        return grid_colors[d[comp_split[0]][comp_split[1] - 1]];
      },
      width: 0.4,
      height: 0.4,
      opacity: function(d) {
        return grid_opacity(d, comp_split);
      },
      xval: function(d) {
        return d.x;
      },
      yval: function(d) {
        return d.y;
      }
    })
    .on({
      mouseover: function(d) {
        d3.select('#grid-marker').attr({
          transform: function() {
            var p = projection([d.x, d.y]);
            return "translate(" + (p[0] - 0.2) + "," + (p[1] - 0.2) + ")"
          }
        })

        var t = d[comp_split[0]][comp_split[1] - 1];
        var l = d['l' + comp_split[0]][comp_split[1] - 1]

        _g.current_grid['technology'] = technologies[t];
        _g.current_grid['lcoe'] = l;
        _g.current_grid['population_2030'] = d['p2'];
      }
    });

  var countryCode = _g.country.code,
    countryPath = d3.select('.country' + countryCode);

  var x, y, k;

  if (countryPath && centered !== countryPath) {
    var centroid = path.centroid(countryPath.datum());
    x = centroid[0];
    y = centroid[1];
    centered = countryPath;
  }

  countries.selectAll("path")
    .classed("active", centered && function(d) {
      return d === centered;
    });

  var center = [widthMap / 2, heightMap / 2];
  var k = country_bounds(countryPath.datum())['scale'];

  // outline for hovered grid
  countries.append("rect")
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
  var bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2

  scale = .9 / Math.max(dx / widthMap, dy / heightMap),
    translate = [widthMap / 2 - scale * x, heightMap / 2 - scale * y];

  return {
    scale: scale,
    translate: translate
  };
}

function draw_transmission_lines(features, cls) {
  countries.selectAll(".transmission-line-" + cls)
    .data(features)
    .enter().append('path')

  .attr({
    class: "transmission-line-" + cls,
    d: d3.geo.path().projection(projection),
    'stroke-width': 0.2,
    fill: "none"
  });
}
