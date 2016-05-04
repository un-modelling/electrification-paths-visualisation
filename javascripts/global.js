window._g = {
  region: "AFRICA",

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

  technologies: [{
    name: "National Grid",
    short_name: "grid",
    color: '#73B2FF',
    min_opacity: 0.2
  }, {
    name:  "Micro Grid",
    short_name: "micro_grid",
    color: '#AAFF00',
    min_opacity: 0.5
  }, {
    name: "Stand Alone",
    short_name: "stand_alone",
    color: '#FBB117',
    min_opacity: 0.2
  // }, {
  //   name: "MG Diesel",
  //   short_name: 'mg_diesel',
  //   color: 'grey',
  //   min_opacity: 1
  // }, {
  //   name: "MG Hydro",
  //   short_name: 'mg_hydro',
  //   color: 'cyan',
  //   min_opacity: 1
  // }, {
  //   name: "MG Wind",
  //   short_name: 'mg_wind',
  //   color: 'yellow',
  //   min_opacity: 1

  // }, {
  //   name: "MG Photo Voltaic",
  //   short_name: 'mg_pv',
  //   color: '#0000ff',
  //   min_opacity: 1
  // }, {
  //   name: 'SA Diesel',
  //   short_name: "sa_diesel",
  //   color: 'brown',
  //   min_opacity: 1
  // }, {
  //   name: 'SA Photo Voltaic',
  //   short_name: "sa_pv",
  //   color: '#ff00ff',
  //   min_opacity: 1
  }],

  transmission_lines: ['Existing Line', 'Planned Line'],

  // the value at which we consider an area as "very dense" and set the opacity to 1.
  //
  current_tier: 3,
  current_diesel: 'nps',

  hd: 100000,

  font_color: "#4d4d4d",

  diesel_price: {
    'nps': 0.70,
    'low': 0.32
  },

  tier_icons: {
    1: 'lightbulb',
    2: 'tele',
    3: 'washing-machine',
    4: 'microwave',
    5: 'ac'
  },

  // The following ae NOT configurable
  //
  all_countries: [],

  target_countries: [],

  grids: [],

  first_load: true,

  country: null,

  current_grid: {
    technology: null,
    population_2030: null,
    lcoe: null
  },

  country_arrangement: null,

  scenario: {
    diesel_price: null,
    tier: 0,
  }
}
