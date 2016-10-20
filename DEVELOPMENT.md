Installing and running
======================

**Requirements:** Nodejs, web browser and python (or a web server of
your choice).

Clone this repository and install the requirements:

    git clone https://github.com/UN-DESA-Modelling/electrification-paths-visualisation.git
    cd electrification-paths-visualisation

Run a web server within the project's directory. eg, With python3:

    python -m http.server


Usage
=====

Visit ```localhost:8000``` on your web browser and see the guide
mentioned in the _About_ section above.


Configuration & Hacking
=======================

**A moderate/fluent knowledge of Javascript is required.**

Edit the ```javascripts/config.js``` file depending on your data set.

Configuration has to be made considering that the data provided is
_carefully_ formatted accordingly.

The following aspects are configurable:

### data_sources:

A list of locations where the data can be retrieved from. Two are
included:

_static:_ using a precompiled set of JSON files

_api:_ an web-api address (local or remote)

### data_source:

The selector for the previously defined ```data_sources```

### region

One of the following:

- AFRICA
- AMERICA
- OCEANIA
- EUROPE
- ASIA

### ignored_subregion

A list of sub regions inside ```region``` but to be
excluded. Subregions are:

- Southern Africa
- Eastern Africa
- Central America
- South America
- Polynesia
- Southern Europe
- Northern America
- Western Asia
- Western Africa
- Eastern Asia
- Southern Asia
- South-Eastern Asia
- Northern Europe
- Northern Africa
- Eastern Europe
- Central Asia
- Western Europe
- Micronesia
- Australia and New Zealand
- Melanesia
- Caribbean

### exception_countries

A list of countries that, even though inside an ignored subregion,
should be included.

### ignored_countries

A list of countries that will be ignored independently of the above criteria.

### technologies

An **ordered** list of the technologies that a grid may have. It **must
be ordered** in the same fashion as stated by the API.

### transmission_lines

The text labels to be shown for the transmission lines.

### year\_start and year\_end

The years which the data is formatted to cover. See The "Countries
data" and "Grid data" examples below for details.

### hd (high density)

The amount of population at which a grid is considered to be "very"
densly populated. This will set the opacity of the grid to 1 if the
population is greater or equal to thi value.

### tier_icons

Tiers are identified with the following icons:

- tier 1: 'lightbulb',
- tier 2: 'tele',
- tier 3: 'washing-machine',
- tier 4: 'microwave',
- tier 5: 'ac'

to be changed the file ```./images/icons/<iconname>-icon.svg``` must
be included.


Countries data
--------------

A list of all the countries is included in this project, namely,
```data/country/countries_summaries.json```. This includes the costs
summaries for every considered country thus far. You can see an
excerpt of this run:

    node --eval "var a = require('./data/country/countries_summaries.json'); console.log(a.slice(0,2));"

Also the world's topojson file is included: ```data/topojson/world-topography.json```.


**The accuracy of these files is not guaranteed by the United Nations
nor the developers of this project.**


Grid data
---------

The grid data must be pre-formatted and grouped by country's iso3
code. You can see an small example like this by running:

    node --eval "var a = require('./data/grids/COG_grids.json'); console.log(a.slice(0,2));"
