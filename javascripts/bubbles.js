function showTooltip(div, scenario, tech) {
  var cost_grid = "$" + (scenario['cost_grid'] / 1000000).toFixed(2) + " M"

  var sa_diesel = "$" + (scenario['sa_diesel'] / 1000).toFixed(2) + " K"
  var sa_pv = "$" + (scenario['sa_pv'] / 1000).toFixed(2) + " K"

  var mg_diesel = "$" + (scenario['mg_diesel'] / 1000000).toFixed(2) + " K"
  var mg_pv = "$" + (scenario['mg_pv'] / 1000).toFixed(2) + " K"
  var mg_wind = "$" + (scenario['mg_wind'] / 1000).toFixed(2) + " K"
  var mg_hydro = "$" + (scenario['mg_hydro'] / 1000).toFixed(2) + " K"

  div.transition()
    .duration(200)
    .style("opacity", 1);

  div.html(function() {
      if (tech == 'sa') {
        return "<span>Diesel</span> : " + sa_diesel + "<br/><span>PV : </span>" + sa_pv;
      }
      if (tech == 'mg') {
        return "<span>Diesel</span> : " + mg_diesel + "<br/><span>PV : </span>" + mg_pv +
          "<br/><span>Wind</span> : " + mg_wind + "<br/><span>Hydro : </span>" + mg_hydro
      }
      if (tech = 'g') {
        return "<span>Total cost</span> : " + cost_grid
      }
    })
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
}

function graph_bubbles_draw(opts, country, diesel_price, tier) {
  var svg = opts.svg;
  var width = opts.size.width;
  var height = opts.size.height;
  var padding = opts.size.padding;

  var technologies = ['grid', 'micro_grid', 'stand_alone'];
  var prices = ['nps', 'low'];
  var kWh = [22, 224, 696, 1800, 2195];

  var minRad = 5;
  var maxRad = 20;

  // find out the highest population and cost of all tiers
  var max_population = 0;
  var max_cost = 0;
  var max_cost_tier = 0;

  d3.select('#bubbles-graph').remove();

  for (var p = 0; p < prices.length; p++) {
    for (var i = 1; i < 6; i++) {
      var summary = country['summary_' + prices[p] + i];

      for (var t = 0; t < technologies.length; t++) {
        if (summary[technologies[t]] > max_population)
          max_population = summary[technologies[t]];

        if (summary[_g.technologies_dictionary[technologies[t]]['cost']] > max_cost)
          max_cost = summary[_g.technologies_dictionary[technologies[t]]['cost']];

        if (summary[_g.technologies_dictionary[technologies[t]]['cost']] / kWh[tier - 1] > max_cost_tier)
          max_cost_tier = summary[_g.technologies_dictionary[technologies[t]]['cost']] / kWh[tier - 1];
      }
    }
  }

  var graph = svg.append('g')
    .attr({
      id: "bubbles-graph",
      transform: "translate(" + opts.position.x + "," + opts.position.y + ")"
    });

  var project_cost =
    country['summary_' + diesel_price + tier]['cost_grid'] +
    country['summary_' + diesel_price + tier]['cost_mg'] +
    country['summary_' + diesel_price + tier]['cost_sa']

  var max_population_electrified_by_technologies =
    d3.max([
      country['summary_low' + tier]['grid'],
      country['summary_low' + tier]['micro_grid'],
      country['summary_low' + tier]['stand_alone'],
      country['summary_nps' + tier]['grid'],
      country['summary_nps' + tier]['micro_grid'],
      country['summary_nps' + tier]['stand_alone']
    ])

  var max_costs_electrified_by_technologies =
    d3.max([
      country['summary_low' + tier]['cost_grid'],
      country['summary_low' + tier]['cost_mg'],
      country['summary_low' + tier]['cost_sa'],
      country['summary_nps' + tier]['cost_grid'],
      country['summary_nps' + tier]['cost_mg'],
      country['summary_nps' + tier]['cost_sa']
    ])

  var xScale = d3.scale.linear()
    .domain([0, max_costs_electrified_by_technologies])
    .range([padding, width - padding * 2]);

  var yScale = d3.scale.linear()
    .domain([0, max_population_electrified_by_technologies])
    .range([height - padding, padding]);

  var rScale = d3.scale.linear()
    .domain([0, max_cost_tier])
    .range([minRad, maxRad]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(5)
    .tickFormat(function(v) {
      return rivets.formatters.in_billions(v)
    });

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5)
    .tickFormat(function(v) {
      return rivets.formatters.in_millions(v)
    });

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  graph.append("g")
    .attr({
      "class": "axis",
      "transform": "translate(0," + (height - padding) + ")"
    })
    .call(xAxis);

  graph.append("g")
    .attr({
      "class": "axis",
      "transform": "translate(" + padding + ",0)"
    })
    .call(yAxis);

  //axis label

  graph.append("text")
    .attr({
      "class": "label",
      "text-anchor": "end",
      "x": width - padding,
      "y": height - 6
    })
    .text("Cost in USD");

  graph.append("text")
    .attr({
      "class": "label",
      "text-anchor": "end",
      "x": -padding,
      "dy": ".75em",
      "transform": "rotate(-90)"
    })
    .text("Population in millions");

  for (var p = 0; p < prices.length; p++) {
    var scenario = country['summary_' + prices[p] + tier];

    //// grid

    var o = graph.append('g');

    var x = country['summary_' + prices[p] + tier]['cost_grid'];
    var y = country['summary_' + prices[p] + tier]['grid'];
    var r = (country['summary_' + prices[p] + tier]['cost_grid']) / kWh[tier - 1];

    o.append('circle')
      .attr({
        class: 'grid circle-' + prices[p],
        r: rScale(r),
        cx: xScale(x),
        cy: yScale(y),
        fill: '#73B2FF',
        opacity: function(d) {
          return prices[p] == diesel_price ? 1 : 0.5;
        }
      })
      .on("mouseover", function(d) {
        var this_price = d3.event.srcElement.className.baseVal.split("-")[1]
        if (this_price == diesel_price) {
          showTooltip(div, scenario, 'g');
        }
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    var t = o.append('text')
      .attr({
        dy: '-' + rScale(r) * 1.2,
        x: xScale(x),
        y: yScale(y),
        class: 'bubble-text'
      });

    t.text(tier_cost_per_capita(_g.country, prices[p], tier, 'grid').toFixed(2));


    //// mini grid

    var o = graph.append('g');

    var x = country['summary_' + prices[p] + tier]['cost_mg'];
    var y = country['summary_' + prices[p] + tier]['micro_grid'];
    var r = (country['summary_' + prices[p] + tier]['cost_mg']) / kWh[tier - 1];

    o.append('circle')
      .attr({
        id: 'micro_grid',
        class: 'circle-' + prices[p],
        r: rScale(r),
        cx: xScale(x),
        cy: yScale(y),
        fill: '#AAFF00',
        opacity: function(d) {
          return prices[p] == diesel_price ? 1 : 0.5;
        }
      })
      .on("mouseover", function(d) {
        var this_price = d3.event.srcElement.className.baseVal.split("-")[1]
        if (this_price == diesel_price) {
          showTooltip(div, scenario, 'mg', this_price);
        }
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    var t = o.append('text')
      .attr({
        dy: '-' + rScale(r) * 1.2,
        x: xScale(x),
        y: yScale(y),
        class: 'bubble-text'
      });

    t.text(tier_cost_per_capita(_g.country, prices[p], tier, 'micro_grid').toFixed(2));


    //// micro grid

    var o = graph.append('g');

    var x = country['summary_' + prices[p] + tier]['cost_sa'];
    var y = country['summary_' + prices[p] + tier]['stand_alone'];
    var r = (country['summary_' + prices[p] + tier]['cost_sa']) / kWh[tier - 1];

    o.append('circle')
      .attr({
        id: 'stand_alone',
        class: 'circle-' + prices[p],
        r: rScale(r),
        cx: xScale(x),
        cy: yScale(y),
        fill: '#FBB117',
        opacity: function(d) {
          return prices[p] == diesel_price ? 1 : 0.5;
        }
      })
      .on("mouseover", function(d) {
        var this_price = d3.event.srcElement.className.baseVal.split("-")[1]
        if (this_price == diesel_price) {
          showTooltip(div, scenario, 'sa');
        }
      })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    var t = o.append('text')
      .attr({
        dy: '-' + rScale(r) * 1.2,
        x: xScale(x),
        y: yScale(y),
        class: 'bubble-text'
      });

    t.text(tier_cost_per_capita(_g.country, prices[p], tier, 'stand_alone').toFixed(2));
  }
}
