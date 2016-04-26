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
    "SYC"  // Seychelles
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


  all_countries: [],

  first_load: true,

  grids: [],

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

  country: null,

  current_tier: 3,
  current_diesel: 'nps',

  current_grid: {
    technology: null,
    population_2030: null,
    lcoe: null
  },

  country_arrangement: null,

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
