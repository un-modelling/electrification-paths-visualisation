var shout,
  slice = [].slice;

rivets.configure({
  templateDelimiters: ["{{", "}}"]
});

rivets.formatters.mailto = function(value) {
  return "mailto:" + value;
};

rivets.formatters.capitalise = function(value) {
  return value.capitalise();
};

rivets.formatters.format = function() {
  var args, value;
  value = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  return args.join(" ").format(Array(value.toString()));
};

rivets.formatters.percentage = function(value) {
  return (+value * 100).toFixed(0);
}

rivets.formatters.in_millions = function(value) {
  var fx = (+value / 1000000).toFixed(2);

  return fx + " Million";
}

rivets.formatters.in_millions_people = function(value) {
  var fx = (+value / 1000000).toFixed(2);

  return fx + " Million People";
}

rivets.formatters.in_millions_onedecimal = function(value) {
  var fx = (+value / 1000000).toFixed(1);

  return fx + " M";
}

rivets.formatters.in_billions = function(value) {
  var fx = (+value / 1000000000).toFixed(2);

  return fx + " Billion";
}

rivets.formatters.in_b = function(value) {
  var fx = (+value / 1000000000).toFixed(2);

  return fx + " B";
}

rivets.formatters.grid_pop = function(value) {
  var formatComma = d3.format("0,000");
  if (value != null) {
    return formatComma(+value) + " People";
  }
}

rivets.formatters.lcoe = function(value) {
  var formatComma = d3.format("0,000");
  if (value != null) {
    return value.toFixed(2) + " US$/kWh";
  }
}

rivets.formatters.comma = function(value) {
  var formatComma = d3.format("0,000");
  return formatComma(value)
}

rivets.formatters.upcase = function(string) {
  if (string != null) {
    return string.toUpperCase();
  }
};

rivets.formatters.translate = function(v) {
  return dictionary[v];
};

rivets.formatters.to_icon = function(v) {
  var icon;
  icon = _g.icons_table[v];
  return "<span class='fa fa-" + icon + "'></span>";
};

rivets.formatters.pdate = function(t) {
  var fix;
  fix = t.replace(/(\d{4})-(\d{2})-(\d{2})/gi, '$1/$2/$3');
  return new Date(fix).prettyHTML(dictionary.weekdays, dictionary.months);
};

rivets.formatters.max_cost = function(v) {
  var total_cost = [];
  for (attr in v) {
    if (typeof(v[attr]) == "object" && attr != "context") { //scenarios
      var sc = v[attr];
      var cost_sc = 0;
      for (x in sc) {
        if (x.match("cost_")) {
          cost_sc += sc[x];
        }
      }
      total_cost.push(cost_sc);
    }
  }
  return (d3.max(total_cost) / 1000000000).toFixed(2) + " Billion US$";
}

rivets.formatters.min_cost = function(v) {
  var total_cost = [];
  for (attr in v) {
    if (typeof(v[attr]) == "object" && attr != "context") { //scenarios
      var sc = v[attr];
      var cost_sc = 0;
      for (x in sc) {
        if (x.match("cost_")) {
          cost_sc += sc[x];
        }
      }
      total_cost.push(cost_sc);
    }
  }
  return (d3.min(total_cost) / 1000000000).toFixed(2) + " Billion US$";
}

shout = function(obj, keypath) {
  console.log(" ---- ERROR: The value \"" + keypath + "\" of the following object is not defined OR \"" + keypath + "\" has not been called/bound by rivets ---- ");
  console.log(obj);
  throw "TypeError: Cannot read property '_rv' of undefined";
};

rivets.adapters['.'].get = function(obj, keypath) {
  if (typeof obj[keypath] === 'undefined') {
    shout(obj, keypath);
  }
  return obj[keypath];
};

rivets.adapters[':'] = {
  observe: function(obj, keypath, callback) {
    return rivets.adapters['.'].observe(obj, keypath, callback);
  },
  unobserve: function(obj, keypath, callback) {},
  get: function(obj, keypath) {
    return obj[keypath];
  },
  set: function(obj, keypath, value) {}
};

rivets.adapters['='] = {
  observe: function(obj, keypath, callback) {},
  unobserve: function(obj, keypath, callback) {},
  get: function(obj, keypath) {
    if (typeof obj[keypath] === 'undefined') {
      shout(obj, keypath);
    }
    return obj === keypath;
  },
  set: function(obj, keypath, value) {}
};

rivets.binders['match-*'] = function(el, value) {
  if (value === this.args[0]) {
    return el.style.display = "";
  } else {
    return el.style.display = "none";
  }
};
