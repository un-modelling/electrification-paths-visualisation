// General

function get_query_param(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function average(list, property_function) {
  return list.map(property_function).reduce(function(a, b) {
    return a + b
  }) / list.length;
}

function setup_project_countries(data, callback) {
  _g.all_countries = data;

  var tmp_countries = data.filter(function(d) {
    parse_country_data(d);

    if (country_is_ignored(d.iso3))
      return false;

    if (d.region === _config.region) {
      return true;
    } else
      return false;
  });

  _g.target_countries = tmp_countries.sort(function(a,b) {
    return a['name'].localeCompare(b['name']);
  });

  callback();
}

function pentagon_position(direction, container_size) {
  var dir = direction % 5;

  var pi25 = Math.PI * 2 / 5;
  var pi34 = Math.PI * 3 / 2;

  var angle = (dir * pi25) + pi34;

  return {
    x: -1 * (Math.cos(angle) * container_size),
    y: (Math.sin(angle) * container_size)
  }
}

// Country utils

function country_is_ignored(iso3) {
  if (_config.exception_countries.indexOf(iso3) > -1)
    return false

  return (_config.ignored_countries.indexOf(iso3) > -1 ||
          _config.ignored_subregions.indexOf(country_by_iso3(iso3)['subregion']) > -1);
}

function country_by_iso3(iso3) {
  var c = _g.all_countries.filter_firstp('iso3', iso3);

  if (typeof c === 'undefined')
    throw ("iso3: " + iso3);

  return c;
}

function find_country_name(c) {
  var r = _g.all_countries.filter_firstp('code', c['id']);

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['name'] : "");
}

function find_country_iso(c) {
  var r = _g.all_countries.filter_firstp('code', c['id']);

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['iso3'] : "");
}

function parse_country_data(d) {
  var flag = _g.flagnames.filter_firstp('iso3', d['iso3']);

  if (flag)
    d['flag_tag'] = flag['flag_tag'];
  else
    d['flag_tag'] = "";

  // this is for the $.fn.subs_matcher
  //
  d['matches'] = true;
}

function cost_electrification(d) {
  var fx = (d['o_value'] / 1000000).toFixed(2);

  return "$" + fx + " B";
}

function population_electrified_by(d) {
  var x = d['value'] * _g.country['context']['population_' + _config.year_end];

  var fx = (x / 1000000).toFixed(2);

  return fx + " M";
}

function tier_icon(container, tier, cls, attrs) {
  var icon_file = "images/icons/" + _config.tier_icons[tier] + "-icon.svg";

  d3.xml(icon_file, function(error, documentFragment) {
    if (error) {
      console.log(error);
      return;
    }

    var icon_container = container.append('g')
        .attr({
          class: cls
        });

    icon_container.node().appendChild(documentFragment.getElementsByTagName("svg")[0]);

    icon_container.select("svg")
      .attr(attrs)
      .selectAll('path')
      .style({ stroke: _config.font_color });
  });
}

function interpolate_zoom(zoom, translate, scale, zoomed_callback) {
  return d3.transition().duration(750).tween("zoom", function() {
    var t = d3.interpolate(zoom.translate(), translate),
      s = d3.interpolate(zoom.scale(), scale);

    return function(d) {
      zoom.translate(t(d));
      zoom.scale(s(d));

      if (typeof zoomed_callback === 'function'); zoomed_callback();
    };
  });
}

function zoomed(collection, zoom, callback) {
  collection.attr({
    transform: "translate(" + zoom.translate() + ")" + "scale(" + zoom.scale() + ")"
  });

  if (typeof callback === 'function'); callback();
}
