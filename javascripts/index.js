_g.region = location.getQueryParam('region').toUpperCase();

var squaremap = {
  height: 0,
  width:  0,
  shift:  5
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

  general_context_show: function(e,v) {
    general_context_show();
  },

  country_href: function(e,v) {
    index_country_href(v.c['iso3']);
  },

  region: _g.region
}

function general_context_load() {
  var general = {
    population_start: _g.target_countries.map(function(c) {
      return c['context'] ? c['context']['population_' + _config.year_start] : 0;
    }).reduce(function(a, b) {
      return a + b
    }),
    population_end:   _g.target_countries.map(function(c) {
      return c['context'] ? c['context']['population_' + _config.year_end] : 0;
    }).reduce(function(a, b) {
      return a + b
    }),
    electrified_percentage: average(_g.target_countries, function(e) {
      return e['context'] ? e['context']['electrification_rate'] : 0;
    }),
    year_start: _config.year_start,
    year_end: _config.year_end,
    region: _g.region
  };

  rivets.bind($('#general-context'), {
    general: general
  });

  general_context_show();
}

function general_context_show() {
  d3.select("#country-context").style("visibility", "hidden");
  d3.select("#general-context").style("visibility", "visible");
}

function index_country_context(iso3) {
  var country_square = _g.country_arrangement.filter_firstp('iso3', iso3);

  d3.select('#flag-marker').attr({
    x: (country_square.x - 1) * square.width  + squaremap.shift,
    y: (country_square.y - 1) * square.height + squaremap.shift
  });

  var country = _g.all_countries.filter_firstp('iso3', iso3);

  if (!country) {
    d3.select("#country-context").style("visibility", "hidden");
    d3.select("#ignored-country-context").style("visibility", "hidden");
    return;
  }

  if (index_country_bind)
    index_country_bind.unbind()

  if (country_is_ignored(iso3)) {
    index_ignored_context(country);
    return;
  }

  country.context['population_start']  = country.context['population_'  + _config.year_start];
  country.context['population_end']    = country.context['population_'  + _config.year_end];
  country.context['electrified_start'] = country.context['electrified_' + _config.year_start];

  index_country_bind = rivets.bind($('#country-context'), {
    country: country,
    year_start: _config.year_start,
    year_end: _config.year_end
  });

  d3.select("#country-context").style("visibility", "visible");
  d3.select("#general-context").style("visibility", "hidden");
  d3.select("#ignored-country-context").style("visibility", "hidden");
}

function index_ignored_context(country) {
  country.context = {
    population_start: "N/A",
    electrified_start: "N/A",
    electrification_rate: "N/A"
  }

  index_country_bind = rivets.bind($('#ignored-country-context'), {
    country: country
  });

  d3.select("#ignored-country-context").style("visibility", "visible");
  d3.select("#country-context").style("visibility", "hidden");
  d3.select("#general-context").style("visibility", "hidden");
}

function squaremap_init(rows,cols) {
  squaremap.container = d3.select("#squaremap").append("svg");

  squaremap.width = $("#squaremap").width();
  square.width    = (squaremap.width - (cols + 1)) / cols;

  squaremap.height = $(window).height() - 160;
  square.height    = (squaremap.height - (rows + 1)) / rows;
}

function squaremap_draw() {
  squaremap.container
    .attr({
      width:  squaremap.width,
      height: squaremap.height
    });

  squaremap.container.append('g')
    .attr({
      transform: "translate(" + squaremap.shift + "," + squaremap.shift + ")"
    })
    .selectAll("g")
    .data(_g.country_arrangement)
    .enter().append("g")

    .append("rect")
    .attr({
      id: function(d) {
        return d['iso3'];
      },

      class: "country-flag",

      width: function(d) {
        return (!d['iso3'] ? 0 : square.width);
      },

      height: function(d) {
        return (!d['iso3'] ? 0 : square.height);
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
        return (d['iso3'] ? index_country_context(d['iso3']) : false);
      },
      dblclick: function(d) {
        return (d['iso3'] ? index_country_href(d['iso3']) : false);
      }
    })
    .style({
      fill: function(d) {
        if (!d['iso3']) return 'none';
        else if (country_is_ignored(d['iso3'])) return '#f2f2f2';
        else return '#00ADEC';
      },
      stroke: '#FFFFFF',
      opacity: function(d) {
        // TODO: this should be merged into _g.target_countries BEFORE
        //       and iso3 dropped

        if (!d['iso3']) return;

        if (!country_is_ignored(d['iso3']))
          return _g.all_countries.filter_firstp('iso3', d['iso3'])['context']['electrification_rate'];
        else
          return 1;
      }
    });

  squaremap.container.append("rect")
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
    return d['context'] ? d.context["electrification_rate"] : 0;
  });

  var legend_container = squaremap.container.append("svg")
    .attr({
      width:  w,
      height: h,
      y: squaremap.height - (2 * h)
    });

  var legend = legend_container.append("defs")
    .append("svg:linearGradient")
    .attr({
      id: "gradient",
      x1: "100%",
      y1: "100%",
      x2: "0%",
      y2: "100%",
      spreadMethod: "pad"
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

  legend_container.append("rect")
    .attr({
      y: 13,
      width: w,
      height: (h * 0.3),
    })
    .style("fill", "url(#gradient)");

  legend_container.append("text")
    .attr("y", 10)
    .text("Electrified Population / Country")
    .style({
      "text-anchor": "start",
      "text-transform": "uppercase",
      "font-weight": "bold",
      "fill": "#4d4d4d"
    });

  legend_container.append("text")
    .attr("y", h - 13)
    .style({
      "text-anchor": "start",
      "fill": "#4d4d4d"
    })
    .text(d3.format("%")(d3.min(er)));

  legend_container.append("text")
    .attr({
      x: w,
      y: h - 13
    })
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

  var rows = 0;
  var cols = 0;

  _g.country_arrangement = arrangement.map(function(e) {
    rows = +(+e['y'] > rows ? e['y'] : rows);
    cols = +(+e['x'] > cols ? e['x'] : cols);

    return {
      x: +e['x'],
      y: +e['y'],
      iso3: e['iso3']
    }
  });

  setup_project_countries(all_countries, function() {
    squaremap_init(rows,cols);

    squaremap_draw();

    $('#country-selector').slimScroll({
      height: squaremap.height - 100,
      color: '#4d4d4d',
      size: '10px'
    });

    general_context_load();

    rivets.bind($('#country-selector'), {
      countries: _g.target_countries,
      year_start: _config.year_start,
      year_end: _config.year_end,
      rv: rv
    });

    $('#loading-screen').fadeOut(600);

    $('#country-selector-input').subs_matcher({
      collection: _g.target_countries,
      attributes: ['name', 'iso3']
    });
  });
}

_g.data_address = _config.data_sources[_config.data_source];

queue()
  .defer(d3.csv,  './data/country/' + _g.region + '-arrangement.csv')
  .defer(d3.json, _g.data_address['root'] + _g.data_address['countries'])
  .await(index_load_everything);
