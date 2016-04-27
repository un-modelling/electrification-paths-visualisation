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

  var filtered_countries = data.filter(function(d) {
    if (_g.exception_countries.indexOf(d['iso3']) > -1) {
      parse_country_data(d);

      return true;
    }

    if (_g.ignored_countries.indexOf(d['iso3']) > -1 ||
        _g.ignored_subregions.indexOf(d['subregion']) > -1)
      return false;

    if (d.region === 'AFRICA' || _g.exception_countries.indexOf(d['iso3']) > -1) {
      parse_country_data(d);
      return true;

    } else
      return false;
  });

  _g.target_countries = filtered_countries.sort(function(a, b) {
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

function country_by_iso3(iso3) {
  var c = _g.all_countries.filter(function(d) {
    return d['iso3'] === iso3;
  })[0];

  if (typeof c === 'undefined')
    throw ("iso3: " + iso3);

  return c;
}

function find_country_name(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id'];
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['name'] : "");
}

function find_country_iso(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id'];
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['iso3'] : "");
}

function parse_country_data(d) {
  d['context']['electrified_2012_ratio'] = d['context']['electrified_2012'] / d['context']['population_2012'];

  d['flag_tag'] = _g.flagnames.filter(function(e) { return e['iso3'] == d['iso3'] })[0]['flag_tag'];

  // this is for the $.fn.subs_matcher
  //
  d['matches'] = true;
}

function cost_electrification(d) {
  var fx = (d['o_value'] / 1000000).toFixed(2);

  return "$" + fx + " B";
}

function population_electrified_by(d) {
  var x = d['value'] * _g.country['context']['population_2030'];

  var fx = (x / 1000000).toFixed(2);

  return fx + " M";
}
