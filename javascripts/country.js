function change_tier(tier) {
  if (!tier) tier = _g.current_tier;

  _g.current_tier = tier;
  _g.scenario['tier'] = tier;

  // Buttons
  //
  $('.tier-changer').removeClass('active');
  $('[data-tier=' + tier + ']').closest('.tier-changer').addClass('active');

  // Graphs
  //
  costs_graph_rearrange(tier);
  population_graph_rearrange(tier);

  // Map
  //
  worldmap_update(_g.country);
}

function reload_everything() {
  // TODO: animations instead of this redraw
  // TODO: this is causing unnecessary requests (svg icons)
  //
  $('svg#population').empty();
  $('svg#costs').empty();

  costs_graph_draw();

  setTimeout(function() {
    costs_graph_rearrange(_g.current_tier, 1);
  }, 100);

  change_tier();
}

function load_transmission_lines() {
  queue(2)
    .defer(d3.json, './data/topojson/' + _g.country.region + '-existing-transmission-lines.json')
    .defer(d3.json, './data/topojson/' + _g.country.region + '-planned-transmission-lines.json')
    .await(function(error, existing, planned) {
      if (error) {
        console.warn("Error loading transmission lines. The show must go on...")
        return;
      }

      worldmap_transmission_lines(
        topojson.feature(existing, existing.objects["existing-transmission-lines"]).features,
        "existing"
      );

      worldmap_transmission_lines(
        topojson.feature(planned, planned.objects["planned-transmission-lines"]).features,
        "planned"
      );
    });
}

function load_everything(err, all_countries, world_topo) {
  if (err) console.warn('error', err);

  worldmap_init();

  var tier, diesel_price;

  setup_project_countries(all_countries, function() {
    worldmap_load(world_topo, all_countries);

    // Make sure everything is OK
    //
    try {
      _g.country = country_by_iso3(get_query_param('iso3'));
      _g.country['context']['population_electrified_2030'] = 0;

      if (_config.ignored_countries.indexOf(_g.country['iso3']) > -1) {
        alert("Country not considered in the model...");
        return false;
      }

      tier = parseInt(get_query_param('tier'));
      diesel_price = get_query_param('diesel_price');

      load_transmission_lines();

    } catch (e) {
      alert("Wrong ISO3 code! Bailing out... :(");
      return false;
    }

    if (isNaN(tier) || tier < 1) {
      alert("Wrong tier! Bailing out... :(");
      return false;
    }

    if (diesel_price !== "nps" && diesel_price !== "low") {
      alert("Wrong diesel price! Bailing out... :(");
      return false;
    }

    // TODO: clean these globals up...
    //
    _g.current_tier = tier;
    _g.current_diesel = diesel_price;
    _g.scenario['diesel_price'] = _config.diesel_price[_g.current_diesel];

    costs_graph_draw();

    $('#loading-screen').fadeOut(600, change_tier);

    $("#cost-selector").change(function() {
      var cost = $('#cost-selector').find("input[type='radio']:checked").val();
      _g.current_cost = cost;

      reload_everything();
    });

    $("#diesel-price-selector").change(function() {
      _g.current_diesel = (_g.current_diesel === "nps" ? "low" : "nps");

      _g.scenario['diesel_price'] = _config.diesel_price[_g.current_diesel]

      reload_everything();
    });

    $('.tier-changer').click(function(e) {
      var tier = parseInt($(e.target).closest('.tier-changer').attr('data-tier'));

      change_tier(tier);
    });

    rivets.bind($('header'), {
      country: _g.country
    });

    rivets.bind($('#grid-description'), {
      grid: _g.current_grid
    });

    rivets.bind($('#country-stats'), {
      country: _g.country
    });

    rivets.bind($('#scenario-selector'), {
      scenario: _g.scenario
    });

    $('[data-toggle="tooltip"]').tooltip();
  });

  jQuery('.tier-icon').each(function() {
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function(data) {
      // Get the SVG tag, ignore the rest
      var $svg = jQuery(data).find('svg');

      // Add replaced image's ID to the new SVG
      if(typeof imgID !== 'undefined') { $svg = $svg.attr('id', imgID); }

      // Add replaced image's classes to the new SVG
      if(typeof imgClass !== 'undefined') { $svg = $svg.attr('class', imgClass+' replaced-svg'); }

      // Replace image with new SVG
      $img.replaceWith($svg);
    }, 'xml');
  });
}

d3.selection.prototype.move_to_front = function() {
  this.each(function() {
    this.parentNode.appendChild(this);
  });
}

_g.data_address = _config.data_sources[_config.data_source];

queue(4)
  .defer(d3.json, _g.data_address['root'] + _g.data_address['countries'])
  .defer(d3.json, './data/topojson/world-topography.json')
  .await(load_everything);
