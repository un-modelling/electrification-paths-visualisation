var squaremap = {
  height: 0,
  width:  0
}

var square = {
  width: 0,
  height: 0,
  padding: 1
}

var index_country_bind;

var rv = {
  country_context_load: function(e,v) {
    index_country_context(v.c['iso3']);
  },

  show_all_africa_context: function(e, v) {
    show_all_africa_context();
  },

  country_href: function(e,v) {
    index_country_href(v.c['iso3']);
  }
}

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

function index_country_context(iso3) {
  var country_square = _g.country_arrangement.filter_firstp('iso3', iso3);

  d3.select('#flag-marker').attr({
    x: (country_square.x - 1) * square.width,
    y: (country_square.y - 1) * square.height
  });

  var country = _g.target_countries.filter_firstp('iso3', iso3);


  if (country) {
    d3.select("#all-africa-context").style("visibility", "hidden");
    d3.select("#country-context").style("visibility", "visible");
  } else {
    d3.select("#country-context").style("visibility", "hidden");
    return;
  }

  if (index_country_bind)
    index_country_bind.unbind()

  index_country_bind = rivets.bind($('#country-context'), {
    country: country
  });
}


  squaremap.height = $(window).height() - 160;
  square.height    = (squaremap.height - (rows + 1)) / rows;
}

function squaremap_draw() {
  var pixelMapContainer = d3.select("#pixel-map").append("svg")
      .attr({
        width:  squaremap.width,
        height: squaremap.height
      });

  var pixelMap = pixelMapContainer.selectAll("g")
    .data(_g.country_arrangement)
    .enter().append("g");

  pixelMap.append("rect")
    .attr({
      id: function(d) {
        return d['iso3'];
      },

      class: "country-flag",

      width: function(d) {
        return (d.iso3 == "0" ? 0 : square.width);
      },

      height: function(d) {
        return (d.iso3 == "0" ? 0 : square.height);
      },

      x: function(d) {
        return (d.x - 1) * square.width;
      },

      y: function(d) {
        return (d.y - 1) * square.height;
      }
    })
    .on({
      click: function(d) {
        if (d.iso3 !== '0' && d.iso3 != 'X') {
          index_country_context(d['iso3']);
        }
      },
      dblclick: function(d) {
        if (d.iso3 !== '0' && d.iso3 !== 'X') {
          country_go(d['iso3']);
        }
      }
    })
    .style({
      fill: function(d) {
        return (d.iso3 === 'X' ? '#f2f2f2' : '#00ADEC');
      },
      stroke: '#FFFFFF',
      opacity: function(d) {
        // TODO: this should be merged into _g.target_countries BEFORE
        //       and iso3 dropped

        if (d.iso3 !== '0' && d.iso3 !== 'X')
          return _g.target_countries.filter_firstp('iso3', d.iso3)['context']['electrification_rate'];
        else if (d.iso3 === 'X')
          return 1;
        else
          return 0;
      }
    });

  pixelMapContainer.append("rect")
    .attr({
      id: 'flag-marker',
      x: -200,
      y: -200,
      width:  square.width,
      height: square.height
    })

    .style({
      'fill': 'none',
      'stroke': '#EC8080',
      'stroke-width': 3,
      'border-radius': 2
    });

  var w = squaremap.width / 4;
  var h = 60;
  var er = _g.target_countries.map(function(d) {
    return d.context["electrification_rate"]
  });

  var legendContainer = pixelMapContainer.append("svg")
    .attr({
      width:  w,
      height: h,
      y: squaremap.height - (2 * h)
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

function index_country_href(iso3) {
  window.location.href = "./country.html?iso3=" + iso3 + "&tier=3&diesel_price=nps";
}

function index_load_everything(err, arrangement, all_countries) {
  if (err) console.warn('error', err);

  d3.select("#country-context").style("visibility", "hidden");

  _g.country_arrangement = country_arrangement;

  setup_project_countries(all_countries, function() {
    squaremap_init(rows,cols);

    squaremap_draw();

    $('#country-selector').slimScroll({
      height: squaremap.height - 100,
      color: '#4d4d4d',
      size: '10px'
    });

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
  .defer(d3.csv,  './data/country/arrangement.csv')
  .defer(d3.json, './data/country/summaries.json')
  .await(index_load_everything);
