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

// Grid/CSV utils

function json_grid_collection_to_csv(grid_collection) {
  var partial_csv_headers = [];

  for (var k in grid_collection[0]) {
    partial_csv_headers.push(k);
  }

  var content = grid_collection.map(function(obj) {
    return grid_to_csv_row(obj, partial_csv_headers);
  }).join("\n");

  // get the fullset of headers...

  var csv_headers = [];

  for (var k in grid_collection[0]) {
    if (k.match(/^l?c\d[nl]/))
      for (var i = 1; i <= 5; i++) csv_headers.push(k + i);
    else
      csv_headers.push(k);
  }

  return csv_headers + "\n" + content;
}

function grid_to_csv_row(grid, keys) {
  return keys.map(function(k) {
    if (typeof grid[k] === 'number')
      return grid[k].toString();

    var c = k.match(/^c\d[nl]/);
    var l = k.match(/^lc\d[nl]/);

    if (c && typeof grid[c[0]] === 'object')
      return grid[c[0]].map(function(tier_i) { return _config.technologies[tier_i]['name'] });
    else if (l && typeof grid[l] === 'object')
      return grid[l].toString();
    else
      return null;
  }).toString();
}

function json_to_csv_row(obj) {
  return Object.keys(obj).map(function(k) {
    return k + "," + obj[k];
  }).join("\n");
}

// File utils

function fake_download(string, filename, datatype) {
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style = "display:none;";

  var blob = new Blob([string], {type: datatype});
  var url  = URL.createObjectURL(blob);

  a.href     = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
}

function download_grid_data() {
  fake_download(json_grid_collection_to_csv(_g.grids), _g.country['iso3'] + '_grid_data.csv', 'text/csv');
}

function download_context_summary_data() {
  fake_download(
    [
      json_to_csv_row(_g.country['context']),
      json_to_csv_row(_g.country['split_summary'])
    ].join("\n"),
    _g.country['iso3'] + '_context_summary_data.csv',
    'text/csv'
  );
}

function download_map() {
  saveSvgAsPng(document.getElementById('map'), _g.country['iso3'] + '-' + 'tier' + _g.current_tier + '-' + 'cost' + _g.current_cost + '-' + _g.current_diesel + '.png')
}
