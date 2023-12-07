// Create client-side range list
function range(start_inc, end_inc) {
  var out = [];
  for (var i = start_inc; i <= end_inc; ++i) {
    out.push(i); 
  }
  return out;
}

// Get year from image ID
function set_year_from_id(split_index) {
  return function(f) {
    return f.set('year', ee.Number.parse(
        ee.String(f.id()).split('_').get(split_index)));
  };
}
                    
// Config dictionary
var SUMMARY_DICT = {
    'NLCD_forest_woodywet': {
        'description': 'NLCD landcover product. Selected product classes are ' +
            'deciduous forest (41), evergreen forest (42), mixed forest (43), ' + 
            'and woody wetlands (90).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2019_REL/NLCD')
            .merge(ee.ImageCollection('USGS/NLCD_RELEASES/2021_REL/NLCD')),
        'band': 'landcover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [41, 42, 43, 90],
        'years': [2001, 2004, 2006, 2008, 2011, 2013, 2016, 2019, 2021],
        'year_fn': set_year_from_id(1),
        'color': '#cc0000'
    },
    'NLCD_forest': {
        'description': 'NLCD landcover product. Selected product classes are ' +
            'deciduous forest (41), evergreen forest (42), and mixed forest (43).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2019_REL/NLCD')
            .merge(ee.ImageCollection('USGS/NLCD_RELEASES/2021_REL/NLCD')),
        'band': 'landcover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [41, 42, 43],
        'years': [2001, 2004, 2006, 2008, 2011, 2013, 2016, 2019, 2021],
        'year_fn': set_year_from_id(1),
        'color': '#e81213'
    },
    'NLCD_canopy_10': {
        'description': 'NLCD percent_tree_cover product. Layer contains all ' +
            'pixels with a value greater than 10% (i.e. tree canopy % within ' +
            'pixel is greater than 10%).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'percent_tree_cover',
        'pixel_size': 30,
        'map_mode': 'threshold',
        'threshold': 10,
        'years': [2011, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#a61c01'
    },
    'NLCD_canopy_20': {
        'description': 'NLCD percent_tree_cover product. Layer contains all ' +
            'pixels with a value greater than 20% (i.e. tree canopy % within ' +
            'pixel is greater than 20%).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'percent_tree_cover',
        'pixel_size': 30,
        'map_mode': 'threshold',
        'threshold': 20,
        'years': [2011, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#c83f24'
    },
    'NLCD_canopy_60': {
        'description': 'NLCD percent_tree_cover product. Layer contains all ' +
            'pixels with a value greater than 60% (i.e. tree canopy % within ' +
            'pixel is greater than 60%).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'percent_tree_cover',
        'pixel_size': 30,
        'map_mode': 'threshold',
        'threshold': 60,
        'years': [2011, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#dd7e6b'
    },
    'NLCD_canopy_80': {
        'description': 'NLCD percent_tree_cover product. Layer contains all ' +
            'pixels with a value greater than 80% (i.e. tree canopy % within ' +
            'pixel is greater than 80%).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'percent_tree_cover',
        'pixel_size': 30,
        'map_mode': 'threshold',
        'threshold': 80,
        'years': [2011, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#e6b8af'
    },
    'NLCD_canopy_perc': {
        'description': 'NLCD percent_tree_cover product. All pixels included, ' +
            'visualized as a percentage from 0-100%.',
        'source': 
            ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL').map(
                function(image) { 
                  return ee.Image(image).toFloat().divide(100); 
                }),
        'band': 'percent_tree_cover',
        'pixel_size': 30,
        'map_mode': 'fractional',
        'years': [2011, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#7e0100'
    },
    'LCMAP_trees': {
        'description': 'LCMAP LCPRI (Primary Land Cover) product. ' +
            'Selected product class is trees (4)',
        'source': 
            ee.ImageCollection('projects/sat-io/open-datasets/LCMAP/LCPRI'),
        'band': 'b1',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [4],
        'years': range(1985, 2021),
        'year_fn': set_year_from_id(2),
        'color': '#B63F7B'
    },
    'LCMAP_trees_woodywet': {
        'description': 'LCMAP primary and secondary. Selected product classes are ' +
            'trees (4) LCPRI or wetland (6) from LCPRI and trees (4) from LCSEC.',
        'source': 
            ee.ImageCollection('projects/sat-io/open-datasets/LCMAP/LCPRI')
                .map(function(img) {
                    var img2 = ee.ImageCollection('projects/sat-io/open-datasets/LCMAP/LCSEC')
                        .filter(ee.Filter.date(img.date()))
                        .first();
                    var mask_pri = img.eq(4).unmask();
                    var mask_sec = img.eq(6).and(img2.eq(4)).unmask();
                  return ee.Image(mask_pri.add(mask_sec).gt(0))}),
        'band': 'b1',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1],
        'years': range(1985, 2021),
        'year_fn': set_year_from_id(2),
        'color': '#C6749F'
    },
    'LCMS_trees': {
        'description': 'LCMS landcover product. Selected product class is ' +
            'Trees (1).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2022-8'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1],
        'years': range(1985, 2022),
        'year_fn': set_year_from_id(3),
        'color': '#37761D'
    },
    'LCMS_trees_shrubs_mix': {
        'description': 'LCMS landcover product. Selected product classes are ' + 
            'Trees (1) and Shrubs & Trees Mix (3).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2022-8'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1, 3],
        'years': range(1985, 2022),
        'year_fn': set_year_from_id(3),
        'color': '#6aa84f'
    },
    'LCMS_all_trees_mixes': {
        'description': 'LCMS landcover product. Selected product classes are ' +
            'Trees (1), Shrubs & Trees Mix (3), Grass/Forb/Herb & Trees Mix (4),' +
            'and Barren & Trees Mix (5).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2022-8'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1, 3, 4, 5],
        'years': range(1985, 2022),
        'year_fn': set_year_from_id(3),
        'color': '#284e13'
    },
    'LCMS_forest': {
        'description': 'LCMS landuse product. Selected product class is forest (3).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2022-8'),
        'band': 'Land_Use',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [3],
        'years': range(1985, 2022),
        'year_fn': set_year_from_id(3),
        'color': '#0F6e5C'
    },
    'ESRI_2020_trees': {
        'description': 'ESRI 2020 Global Land Use Land Cover product. Selected ' +
            'product class is trees',
        'source': ee.ImageCollection(ee.ImageCollection(
            'projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m')
                .mosaic()),
        'band': 'b1',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [2],
        'years': [2020],
        'year_fn': function(image) { return image.set('year', 2020); },
        'color': '#9E5C19'
    },
    'ESRI_annual_trees': {
        'description': 'ESRI Annual Global Land Use Land Cover product. Selected ' +
            'product class is trees (2).',
        'source': ee.ImageCollection.fromImages(range(2017, 2022)
              .map(function(year) {
                return ee.Image(ee.ImageCollection("projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m_TS")
                    .filter(ee.Filter.calendarRange(year, year + 1, 'year'))
                    .mosaic())
                    .set('year', year);
              })),
        'band': 'b1',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [2],
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#F50908'
    },
    'ESA_trees': {
        'description': 'ESA WorldCover Landcover product. Selected product ' +
            'class is trees (10).',
        'source': ee.ImageCollection.fromImages(
            [
              ee.ImageCollection('ESA/WorldCover/v100').mosaic().set('year', 2020), 
              ee.ImageCollection('ESA/WorldCover/v200').mosaic().set('year', 2021)
            ]),
        'band': 'Map',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [10],
        'years': [2020, 2021],
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#795AA4'
    },
    'MODIS_1_IGBP': {
        'description': 'MODIS LC_Type1 product: Annual International Geosphere-Biosphere ' +
            'Programme (IGBP) classification. Selected forest product ' +
            'classes are (1-5).',
        'source' : ee.ImageCollection('MODIS/061/MCD12Q1'),
        'band': 'LC_Type1',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4, 5],
        'years': range(2001, 2021),
        'year_fn': set_year_from_id(0),
        'color': '#083763'
    },
    'MODIS_2_UMD': {
        'description': 'MODIS LC_Type2 product: Annual University of Maryland (UMD) ' +
            'classification. Selected forest product classes are (1-5).',
        'source' : ee.ImageCollection('MODIS/061/MCD12Q1'),
        'band': 'LC_Type2',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4, 5],
        'years': range(2001, 2021),
        'year_fn': set_year_from_id(0),
        'color': '#083763'
    },
    'MODIS_3_LAI': {
        'description': 'MODIS LC_Type3 product: Annual Leaf Area Index (LAI) ' +
            'classification. Selected forest product classes are (5-8).',
        'source' : ee.ImageCollection('MODIS/061/MCD12Q1'),
        'band': 'LC_Type3',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [5, 6, 7, 8],
        'years': range(2001, 2021),
        'year_fn': set_year_from_id(0),
        'color': '#3c85c6'
    },
    'MODIS_4_BGC': {
        'description': 'MODIS LC_Type4 product: Annual BIOME-Biogeochemical Cycles (BGC) ' +
            'classification. Selected forest product classes are (1-4).',
        'source' : ee.ImageCollection('MODIS/061/MCD12Q1'),
        'band': 'LC_Type4',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4],
        'years': range(2001, 2021),
        'year_fn': set_year_from_id(0),
        'color': '#0000FF'
    },
    'MODIS_5_PFT': {
        'description': 'MODIS LC_Type5 product: Annual Plant Functional Types ' +
            'classification. Selected forest product classes are (1-4).',
        'source' : ee.ImageCollection('MODIS/061/MCD12Q1'),
        'band': 'LC_Type5',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4],
        'years': range(2001, 2021),
        'year_fn': set_year_from_id(0),
        'color': '#9fc5e8'
    },
    'Hansen_GFC': {
        'description': 'Hansen Global Forest Cover Treecover2000 product for ' +
            'year 2000, visualized as percentage from 0-100. Years 2001-2020 ' +
            'calculated by subtracting respective lossyear data from Treecover2000.',
        'source': ee.ImageCollection(ee.List.sequence(1, 21).iterate(
            function(year_index, collection) {
              year_index = ee.Number(year_index);
              var latest_year = ee.ImageCollection(collection).first();
              var loss_mask_this_year = 
                  ee.Image('UMD/hansen/global_forest_change_2021_v1_9')
                  .select('lossyear')
                  .eq(year_index)
                  .unmask()
                  .not();
              var this_year = latest_year.select('treecover2000')
                  .multiply(loss_mask_this_year);

              this_year = this_year.set('year', year_index.add(2000));
              return ee.ImageCollection(this_year).merge(collection);
            },
            ee.ImageCollection(
                ee.Image('UMD/hansen/global_forest_change_2022_v1_10')
                    .toFloat()
                    .divide(100)
                    .set('year', 2000)
                    .select('treecover2000')))),
        'map_mode': 'fractional',
        'pixel_size': 30,
        'band': 'treecover2000',
        'years': range(2000, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#F2C231'
    },
    'DW_trees_gs_mode': {
        'description': 'Dynamic World, mode composite for Northern Hemisphere growing season.',
        'source': ee.ImageCollection(range(2016, 2022)
            // This .map is JavaScript *not* EE
            .map(function(year) {
              return ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
                  .filterDate(year + '-06-01', year + '-10-01')
                  .select('label')
                  .reduce(ee.Reducer.mode())
                  .rename('label')
                  .set('year', year);
            })),
        'band': 'label',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [1],
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#CF9FFF'
    },
    'DW_trees_annual_mode': {
        'description': 'Dynamic World, annual model composite.',
        'source': ee.ImageCollection(range(2016, 2022)
            // This .map is JavaScript *not* EE
            .map(function(year) {
              return ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
                  .filterDate(year + '-01-01', (year + 1) + '-01-01')
                  .select('label')
                  .reduce(ee.Reducer.mode())
                  .rename('label')
                  .set('year', year);
            })),
        'band': 'label',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [1],
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#A65FED'
    },
    'DW_trees_prob_10': {
        'description': 'Dynamic World, annual mean. Average probability trees greater than 0.10.',
        'source': ee.ImageCollection(range(2016, 2022)
            // This .map is JavaScript *not* EE
            .map(function(year) {
              return ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
                  .filterDate(year + '-01-01', (year + 1) + '-01-01')
                  .select('trees')
                  .reduce(ee.Reducer.mean())
                  .rename('trees')
                  .set('year', year);
            })),
        'band': 'trees',
        'pixel_size': 10,
        'map_mode': 'threshold',
        'threshold': 0.10,
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#5A7510'
    },
    'DW_trees_prob_25': {
        'description': 'Dynamic World, annual mean. Average probability trees greater than 0.25.',
        'source': ee.ImageCollection(range(2016, 2022)
            // This .map is JavaScript *not* EE
            .map(function(year) {
              return ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
                  .filterDate(year + '-01-01', (year + 1) + '-01-01')
                  .select('trees')
                  .reduce(ee.Reducer.mean())
                  .rename('trees')
                  .set('year', year);
            })),
        'band': 'trees',
        'pixel_size': 10,
        'map_mode': 'threshold',
        'threshold': 0.25,
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#94B04C'
    },
    'DW_trees_prob_50': {
        'description': 'Dynamic World, annual mean. Average probability trees greater than 0.50.',
        'source': ee.ImageCollection(range(2016, 2022)
            // This .map is JavaScript *not* EE
            .map(function(year) {
              return ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
                  .filterDate(year + '-01-01', (year + 1) + '-01-01')
                  .select('trees')
                  .reduce(ee.Reducer.mean())
                  .rename('trees')
                  .set('year', year);
            })),
        'band': 'trees',
        'pixel_size': 10,
        'map_mode': 'threshold',
        'threshold': 0.50,
        'years': range(2017, 2022),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#C1D48F'
    },
};

// Build a server-side dictionary. This involves pre-applying the
// "year_fn" function.
var post_extract_dict = {};

var keys = Object.keys(SUMMARY_DICT);
for (var i = 0; i < keys.length; ++i) {
  var key = keys[i];
  var value = SUMMARY_DICT[key];
  
  post_extract_dict[key] = value;
  var cur_config = post_extract_dict[key];
  cur_config['source'] = cur_config['source'].map(value['year_fn']);
  delete cur_config['year_fn'];
}

post_extract_dict = ee.Dictionary(post_extract_dict);

var FIA_DICT = ee.Dictionary({
  'FIA_forest' : {color: '666666'},
  'FIA_forest_upper' : {color: '666666'},
  'FIA_forest_lower' : {color: '666666'},
  'FIA_timberland': {color: 'B7B7B7'},
  'FIA_timberland_upper': {color: 'B7B7B7'},
  'FIA_timberland_lower': {color: 'B7B7B7'},
  'EPA_forested': {color: '000000'},
  'NRI_grazed': {color: '82016d'},
  'NRI_notgrazed': {color: 'bd029e'},
  'NRI_total': {color: 'fb02d3'}
  
});

var STATES_DICT = {
  'CONUS': 'CONUS',
  'ALABAMA': 'AL',
  'ARIZONA':  'AZ',
  'ARKANSAS': 'AR',
  'CALIFORNIA': 'CA',
  'COLORADO': 'CO',
  'CONNECTICUT': 'CT',
  'DELAWARE': 'DE',
  'FLORIDA': 'FL',
  'GEORGIA': 'GA',
  'IDAHO': 'ID',
  'ILLINOIS': 'IL',
  'INDIANA': 'IN',
  'IOWA': 'IA',
  'KANSAS': 'KS',
  'KENTUCKY': 'KY',
  'LOUISIANA': 'LA',
  'MAINE': 'ME',
  'MARYLAND': 'MD',
  'MASSACHUSETTS': 'MA',
  'MICHIGAN': 'MI',
  'MINNESOTA': 'MN',
  'MISSISSIPPI': 'MS',
  'MISSOURI': 'MO',
  'MONTANA': 'MT',
  'NEBRASKA': 'NE',
  'NEVADA': 'NV',
  'NEW_HAMPSHIRE': 'NH',
  'NEW_JERSEY': 'NJ',
  'NEW_MEXICO': 'NM',
  'NEW_YORK': 'NY',
  'NORTH_CAROLINA': 'NC',
  'NORTH_DAKOTA': 'ND',
  'OHIO': 'OH',
  'OKLAHOMA': 'OK',
  'OREGON': 'OR',
  'PENNSYLVANIA': 'PA',
  'RHODE_ISLAND': 'RI',
  'SOUTH_CAROLINA': 'SC',
  'SOUTH_DAKOTA': 'SD',
  'TENNESSEE': 'TN',
  'TEXAS': 'TX',
  'UTAH': 'UT',
  'VERMONT': 'VT',
  'VIRGINIA': 'VA',
  'WASHINGTON': 'WA',
  'WEST_VIRGINIA': 'WV',
  'WISCONSIN': 'WI',
  'WYOMING': 'WY',
};


// ---------- EXPORTS ------------
exports.SUMMARY_DICT = post_extract_dict;
exports.SUMMARY_DICT_CLIENT = SUMMARY_DICT;
exports.FIA_DICT = FIA_DICT;
exports.STATES_DICT = STATES_DICT;