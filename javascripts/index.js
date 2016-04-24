var pixelMapWidth = d3.select("#pixel-map").style("width")

var pixelWidth = pixelMapWidth.replace("px", "") / 8.5;
var pixelHeight = window.screen.availHeight * 0.055;
var pixelMapHeight = (pixelHeight * 14);
var pixelMapPadding = 5;

var country_bind;

var pixelMapContainer = d3.select("#pixel-map").append("svg")
  .attr("width", pixelMapWidth)
  .attr("height", pixelMapHeight);

var o = d3.scale.linear()
  .range([1, 0]);

var rv = {
  load_country_context: function(e, v) {
    load_country_context(v.c['iso3']);
  },

  show_all_africa_context: function(e, v) {
    show_all_africa_context();
  },

  go_to_country: function(e, v) {
    go_to_country(v.c['iso3']);
  }
}

//set country list height according to the mapd3.select("#search")

function load_all_africa_context() {
  var africa = {
    population_2012: _g.target_countries.map(function(c) {
      return c['context']['population_2012']
    }).reduce(function(a, b) {
      return a + b
    }),
    population_2030: _g.target_countries.map(function(c) {
      return c['context']['population_2030']
    }).reduce(function(a, b) {
      return a + b
    }),
    electrified_percentage: average(_g.target_countries, function(e) {
      return e['context']['electrification_rate']
    })
  };

  rivets.bind($('#all-africa-context'), {
    africa: africa
  });

  show_all_africa_context();
}

function show_all_africa_context() {
  d3.select("#country-context").style("visibility", "hidden");
  d3.select("#all-africa-context").style("visibility", "visible");
}

function load_country_context(ccode) {

  var country_arr = _g.country_arrangement.filter_firstp('countryCode', ccode);

  d3.select('#flag-marker').attr({
    x: country_arr.x * pixelWidth + pixelMapPadding,
    y: (country_arr.y - 1) * pixelHeight + pixelMapPadding
  });

  var country = _g.target_countries.filter_firstp('iso3', ccode);

  if (country) {
    d3.select("#all-africa-context").style("visibility", "hidden");
    d3.select("#country-context").style("visibility", "visible");
  } else {
    d3.select("#country-context").style("visibility", "hidden");
    return;
  }

  if (country_bind)
    country_bind.unbind()

  country_bind = rivets.bind($('#country-context'), {
    country: country
  });
}

function go_to_country(iso3) {
  window.location.href = "./country.html?iso3=" + iso3 + "&tier=3&diesel_price=nps";
}

function initializePrettification() {
  //Slimscroll
  $('#country-selector').slimScroll({
    height: pixelMapHeight - 100,
    color: '#4d4d4d',
    size: '10px'
  });
}

function drawMap(country_arrangement) {
  var pixelMap = pixelMapContainer.selectAll("g")
    .data(country_arrangement)
    .enter().append("g");

  pixelMap.append("rect")
    .attr({
      id: function(d) {
        return d['iso3'];
      },

      class: "country-flag",

      width: function(d) {
        if (d.countryCode == "0") { //blank
          return 0;
        } else {
          return pixelWidth;
        }
      },

      height: function(d) {
        if (d.countrycode == "0") {
          return 0;
        } else {
          return pixelHeight;
        }
      },

      x: function(d) {
        return d.x * pixelWidth + pixelMapPadding;
      },

      y: function(d) {
        return (d.y - 1) * pixelHeight + pixelMapPadding;
      }
    })

  .on({
    click: function(d) {
      if (d.countryCode != 0 && d.countryCode != 'X') {
        load_country_context(d['countryCode']);
      }
    },
    dblclick: function(d) {
      if (d.countryCode != 0 && d.countryCode != 'X') {
        go_to_country(d['countryCode']);
      }
    }

  })

  .style({
    fill: function(d) {
      if (d.countryCode == 'X') { //northern africa country
        return '#f2f2f2';
      } else {
        return '#00ADEC';
      }
    },
    stroke: '#FFFFFF',
    opacity: function(d) {
      // TODO: this should be merged into _g.target_countries BEFORE
      //   and countryCode dropped

      if (d.countryCode != 0 && d.countryCode != 'X')
        return _g.target_countries.filter_firstp('iso3', d.countryCode)['context']['electrification_rate'];
    }
  });

  pixelMapContainer.append("rect")
    .attr({
      id: 'flag-marker',
      x: -200,
      y: -200,
      width: pixelWidth,
      height: pixelHeight
    })

  .style({
    'fill': 'none',
    'stroke': '#EC8080',
    'stroke-width': 3,
    'border-radius': 2
  });


  //draw legend
  var w = pixelMapWidth.replace("px", "") * 4 / 9;
  var h = 60;
  var er = _g.target_countries.map(function(d) {
    return d.context["electrification_rate"]
  });

  var legendContainer = pixelMapContainer.append("svg")
    .attr({
      "width": w,
      "height": h,
      "y": pixelMapHeight - (2 * h)
    });

  var legend = legendContainer.append("defs")
    .append("svg:linearGradient")
    .attr({
      "id": "gradient",
      "x1": "100%",
      "y1": "100%",
      "x2": "0%",
      "y2": "100%",
      "spreadMethod": "pad"
    });

  legend.append("stop")
    .attr({
      "offset": "0%",
      "stop-color": "#00ADEC",
      "stop-opacity": d3.max(er)
    });

  legend.append("stop")
    .attr({
      "offset": "100%",
      "stop-color": "#00ADEC",
      "stop-opacity": d3.min(er)
    });

  legendContainer.append("rect")
    .attr({
      "width": w,
      "height": (h * 0.3),
      "y": 13
    })
    .style("fill", "url(#gradient)");

  legendContainer.append("text")
    .attr("y", 10)
    .text("Electrified Population / Country")
    .style({
      "text-anchor": "start",
      "text-transform": "uppercase",
      "font-weight": "bold",
      "fill": "#4d4d4d"
    });

  legendContainer.append("text")
    .attr("y", h - 13)
    .style({
      "text-anchor": "start",
      "fill": "#4d4d4d"
    })
    .text(d3.format("%")(d3.min(er)));

  legendContainer.append("text")
    .attr("x", w)
    .attr("y", h - 13)
    .style({
      "text-anchor": "end",
      "fill": "#4d4d4d"
    })
    .text(d3.format("%")(d3.max(er)));
}

function loadEverything(err, country_arrangement, all_countries) {
  if (err) console.warn('error', err);

  d3.select("#country-context").style("visibility", "hidden");

  _g.country_arrangement = country_arrangement;

  setup_project_countries(all_countries, function() {
    drawMap(country_arrangement);
    initializePrettification();

    load_all_africa_context();

    rivets.bind($('#country-selector'), {
      countries: _g.target_countries,
      rv: rv
    });

    $('#loading-screen').fadeOut(600);

    $('#country-selector-input').subs_matcher({
      collection: _g.target_countries,
      attributes: ['name', 'iso3']
    });
  });
}

queue()
  .defer(d3.csv, './data/country/arrangement.csv')
  .defer(d3.json, './data/country/summaries.json')
  .await(loadEverything);
