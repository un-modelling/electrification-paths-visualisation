window._g = {
  region: "AFRICA",

  target_countries: [],

  ignored_subregions: [
    "Northern Africa"
  ],

  // Added countries (ignoring region and ignored_subregions)
  //
  exception_countries: [
    "SDN" // Sudan
  ],

  ignored_countries: [
    // Countries with too many hipotetical assumptions
    //
    "COM", // Comoros
    "CPV", // Cabo Verde
    "MUS", // Mauritus
    "MYT", // Mayotte
    "REU", // Réunion
    "SHN", // Saint Helena
    "STP", // São Tomé and Príncipe
    "SYC" // Seychelles
  ],

  // TODO: unify technology dictionaries
  //
  technologies_dictionary: {
    grid: {
      cost: "cost_grid",
      show: 'Grid'
    },

    micro_grid: {
      cost: "cost_mg",
      show: 'Mini Grid'
    },

    stand_alone: {
      cost: "cost_sa",
      show: 'Stand Alone'
    }
  },
  technology_colors: {
    grid: "#73B2FF",
    micro_grid: "#AAFF00",
    stand_alone: "#FBB117"
  },

  legends: {
    "Grid": {
      min_op: 1,
      max_op: 0,
      min_val: 99999,
      max_val: 0
    },
    "Mini Grid": {
      min_op: 1,
      max_op: 0,
      min_val: 99999,
      max_val: 0
    },
    "Stand Alone": {
      min_op: 1,
      max_op: 0,
      min_val: 99999,
      max_val: 0
    }
  },

  all_countries: [],

  bar_graph_padding: 20,

  population_graph: {
    size: {
      width: 340,
      height: 150,
    },

    position: {
      x: 0,
      y: 0
    }
  },

  bubble_graph: {
    size: {
      width: 350,
      height: 300,
      padding: 35
    },

    position: {
      x: 0,
      y: 200
    }
  },

  costs_graph: {
    size: {
      width: 350,
      height: 300
    },

    position: {
      x: 150,
      y: 150
    }
  },

  bubble_radius: 10,

  countries_gdp_per_capita: null,

  country: null,

  current_tier: 3,
  current_diesel: 'nps',

  current_grid: {
    technology: null,
    population_2030: null,
    lcoe: null
  },

  country_arrangement: null,

  current_cost: 0,

  tier_icons: {
    1: 'lightbulb',
    2: 'tele',
    3: 'washing-machine',
    4: 'microwave',
    5: 'ac'
  },

  diesel_price: {
    'nps': 0.70,
    'low': 0.32
  },

  scenario: {
    'diesel_price': 'low',
    'tier': 1,
  }

}

window.paceOptions = {
  target: '.cover'
}
