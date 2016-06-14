window._config = {
  data_source: "static",

  data_sources: {
    'static': {
      'root': "./data/",
      'grids_prefix': "grids/",
      'grids_suffix': "_grids.json",
      'countries': 'country/countries_summaries.json'
    },
    'api': {
      'root': "http://localhost:3000/",
      'grids_prefix': "countries/",
      'grids_suffix': "/full",
      'countries': 'countries'
    }
  },

  // Region to be displayed
  //
  region: "AFRICA",

  // Subregions not contemplated in the model
  //
  ignored_subregions: [
    "Northern Africa"
  ],

  // Added countries (ignoring region and ignored_subregions)
  //
  exception_countries: [
    "SDN" // Sudan
  ],

  // Countries with too many hipotetical assumptions
  //
  ignored_countries: [
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
    group: "grid",
    color: '#73B2FF',
    min_opacity: 0.2
  }, {
    name: "MG Diesel",
    group: 'mg',
    color: '#CCDF54',
    min_opacity: 1
  }, {
    name: "MG Hydro",
    group: 'mg',
    color: '#1BA330',
    min_opacity: 1
  }, {
    name: "MG Wind",
    group: 'mg',
    color: '#8FDF54',
    min_opacity: 1
  }, {
    name: "MG Photo Voltaic",
    group: 'mg',
    color: '#00ff00',
    min_opacity: 1
  }, {
    name: 'SA Diesel',
    group: "sa",
    color: 'red',
    min_opacity: 0.2
  }, {
    name: 'SA Photo Voltaic',
    group: "sa",
    color: 'orange',
    min_opacity: 0.2
  }],

  transmission_lines: ['Existing Line', 'Planned Line'],

  year_start: 2012,
  year_end: 2030,

  // the value at which we consider an area as "very dense" and set the opacity to 1.
  //
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
  }
}
