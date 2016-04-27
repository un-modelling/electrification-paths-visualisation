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

  // CAREFUL with these. ORDER MATTERS
  //
  technologies: [{
    name: "National Grid",
    color: '#73B2FF',
    min_opacity: 0.2
  }, {
    name:  'Micro Grid',
    color: '#AAFF00',
    min_opacity: 0.5
  }, {
    name: 'Stand Alone',
    color: '#FBB117',
    min_opacity: 0.2
  }],

  transmission_lines: ['Existing Line', 'Planned Line'],

  // the value at which we consider an area as "very dense"
  // and set the opacity to 1.
  //
  hd: 100000,

  font_color: "#4d4d4d",

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
