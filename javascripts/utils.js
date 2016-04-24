// General

function getQueryParam(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);

  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function tier_cost_per_capita(country, diesel_price, tier, tech) {
  var t = (function() {
    if (tech === "grid") return "grid";
    else if (tech === "micro_grid") return "mg";
    else if (tech === "stand_alone") return "sa";
  })();

  var c = country['context'];

  var project_cost = country["summary_" + diesel_price + tier]["cost_" + t];

  // HOW many will be born un-electrified? This is the lame version:
  //
  var newly_electrified = c['population_2030'] - (c['population_2012'] - c['electrified_2012']);

  return project_cost / newly_electrified;
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
      parseCountryData(d);

      return true;
    }

    if (_g.ignored_countries.indexOf(d['iso3']) > -1 ||
      _g.ignored_subregions.indexOf(d['subregion']) > -1)
      return false;

    if (d.region === 'AFRICA' || _g.exception_countries.indexOf(d['iso3']) > -1) {
      parseCountryData(d);

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

function countryByISO3(iso3) {
  var c = _g.all_countries.filter(function(d) {
    return d['iso3'] === iso3
  })[0];

  if (typeof c === 'undefined')
    throw ("iso3: " + iso3);

  return c;
}

function findCountryName(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id']
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['name'] : "");
}

function findCountryISO(c) {
  var r = _g.all_countries.filter(function(e) {
    return e['code'] === c['id']
  })[0];

  // For debugging purposes:
  //
  // if (typeof r === 'undefined') console.warn("country not found or object is not a country:", c);

  return (r ? r['iso3'] : "");
}

function country_get_gdp_per_capita(iso3) {
  return parseFloat(_g.countries_gdp_per_capita.filter(function(c) {
    return iso3 === c['country_code']
  })[0]['2012']);
}

function parseCountryData(d) {
  // d['context']['gdp_per_capita_2012'] = country_get_gdp_per_capita(d['iso3']);
  d['context']['electrified_2012_ratio'] = d['context']['electrified_2012'] / d['context']['population_2012'];

  d['flag_tag'] = _g.flagnames.filter_firstp('iso3', d['iso3'])['flag_tag'];

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
