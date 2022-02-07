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
    'NLCD_lc_all_forested': {
        'description': 'NLCD landcover product. Selected product classes are ' +
            'deciduous forest (41), evergreen forest (42), mixed forest (43), ' + 
            'and woody wetlands (90).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'landcover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [41, 42, 43, 90],
        'years': [1992, 2001, 2004, 2006, 2008, 2011, 2013, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#D2042D'
    },
    'NLCD_lc_upland_forest': {
        'description': 'NLCD landcover product. Selected product classes are ' +
            'deciduous forest (41), evergreen forest (42), and mixed forest (43).',
        'source': ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL'),
        'band': 'landcover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [41, 42, 43],
        'years': [1992, 2001, 2004, 2006, 2008, 2011, 2013, 2016],
        'year_fn': set_year_from_id(0),
        'color': '#D70040'
    },
    'NLCD_tcc_10': {
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
        'color': '#EE4B2B'
    },
    'NLCD_tcc_20': {
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
        'color': '#A52A2A'
    },
    'NLCD_tcc_60': {
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
        'color': '#800020'
    },
    'NLCD_tcc_80': {
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
        'color': '#DE3163'
    },
    'NLCD_tcc_fractional': {
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
        'color': '#C41E3A'
    },
    'LCMAP_lcpri_trees': {
        'description': 'LCMAP LCPRI (Primary Land Cover) product. ' +
            'Selected product class is trees (4)',
        'source': 
            ee.ImageCollection('projects/sat-io/open-datasets/LCMAP/LCPRI'),
        'band': 'b1',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [4],
        'years': range(1985, 2019),
        'year_fn': set_year_from_id(2),
        'color': '#CF9FFF'
    },
    'LCMAP_lcpri_trees_and_lcpri_wetland_lcsec_trees': {
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
        'years': range(1985, 2019),
        'year_fn': set_year_from_id(2),
        'color': '#CC3CC7'
    },
    'LCMS_lc_trees': {
        'description': 'LCMS landcover product. Selected product class is trees (1).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2020-5'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1],
        'years': range(1985, 2020),
        'year_fn': set_year_from_id(3),
        'color': '#0096FF'
    },
    'LCMS_lc_trees_and_shrubs': {
        'description': 'LCMS landcover product. Selected product classes are ' + 
            'trees (1) and shrubs (3).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2020-5'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1, 3],
        'years': range(1985, 2020),
        'year_fn': set_year_from_id(3),
        'color': '#0000FF'
    },
    'LCMS_lc_trees_and_barren': {
        'description': 'LCMS landcover product. Selected product classes are ' +
            'trees (1) and barren (5).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2020-5'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1, 5],
        'years': range(1985, 2020),
        'year_fn': set_year_from_id(3),
        'color': '#0096FF'
    },
    'LCMS_lc_all_trees': {
        'description': 'LCMS landcover product. Selected product classes are ' +
            'trees (1), shrubs (3), and barren (5).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2020-5'),
        'band': 'Land_Cover',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [1, 3, 5],
        'years': range(1985, 2020),
        'year_fn': set_year_from_id(3),
        'color': '#0047AB'
    },
    'LCMS_lu_forest': {
        'description': 'LCMS landuse product. Selected product class is forest (3).',
        'source': ee.ImageCollection('USFS/GTAC/LCMS/v2020-5'),
        'band': 'Land_Use',
        'pixel_size': 30,
        'map_mode': 'categorical',
        'classes': [3],
        'years': range(1985, 2020),
        'year_fn': set_year_from_id(3),
        'color': '#4682B4'
    },
    'ESRI_lc_trees': {
        'description': 'ESRI 2020 Global Land Use Land Cover product. Selected ' +
            'product class is forest (2).',
        'source': ee.ImageCollection(ee.ImageCollection(
            'projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m')
                .mosaic()),
        'band': 'b1',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [2],
        'years': [2020],
        'year_fn': function(image) { return image.set('year', 2020); },
        'color': '#FF8C00'
    },
    'ESA_trees': {
        'description': 'ESA WorldCover Landcover product. Selected product ' +
            'class is trees (10).',
        'source': ee.ImageCollection(
            ee.ImageCollection('ESA/WorldCover/v100').mosaic()),
        'band': 'Map',
        'pixel_size': 10,
        'map_mode': 'categorical',
        'classes': [10],
        'years': [2020],
        'year_fn': function(image) { return image.set('year', 2020); },
        'color': '#FF7F50'
    },
    'MODIS_lc_Type1': {
        'description': 'MODIS LC_Type1 product. Selected forest product ' +
            'classes are (1-5).',
        'source' : ee.ImageCollection('MODIS/006/MCD12Q1'),
        'band': 'LC_Type1',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4, 5],
        'years': range(2001, 2019),
        'year_fn': set_year_from_id(0),
        'color': '#009E60'
    },
    'MODIS_lc_Type2': {
        'description': 'MODIS LC_Type2 product. Selected forest product ' +
            'classes are (1-5).',
        'source' : ee.ImageCollection('MODIS/006/MCD12Q1'),
        'band': 'LC_Type2',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4, 5],
        'years': range(2001, 2019),
        'year_fn': set_year_from_id(0),
        'color': '#355E3B'
    },
    'MODIS_lc_Type3': {
        'description': 'MODIS LC_Type3 product. Selected forest product ' +
            'classes are (5-8).',
        'source' : ee.ImageCollection('MODIS/006/MCD12Q1'),
        'band': 'LC_Type3',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [5, 6, 7, 8],
        'years': range(2001, 2019),
        'year_fn': set_year_from_id(0),
        'color': '#50C878'
    },
    'MODIS_lc_Type4': {
        'description': 'MODIS LC_Type4 product. Selected forest product ' +
            'classes are (1-4).',
        'source' : ee.ImageCollection('MODIS/006/MCD12Q1'),
        'band': 'LC_Type4',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4],
        'years': range(2001, 2019),
        'year_fn': set_year_from_id(0),
        'color': '#4F7942'
    },
    'MODIS_lc_Type5': {
        'description': 'MODIS LC_Type5 product. Selected forest product ' + 
            'classes are (1-4).',
        'source' : ee.ImageCollection('MODIS/006/MCD12Q1'),
        'band': 'LC_Type5',
        'pixel_size': 500,
        'map_mode': 'categorical',
        'classes': [1, 2, 3, 4],
        'years': range(2001, 2019),
        'year_fn': set_year_from_id(0),
        'color': '#228B22'
    },
    'Hansen_GFC_fractional': {
        'description': 'Hansen Global Forest Cover Treecover2000 product for ' +
            'year 2000, visualized as percentage from 0-100. Years 2001-2020 ' +
            'calculated by subtracting respective lossyear data from Treecover2000.',
        'source': ee.ImageCollection(ee.List.sequence(1, 20).iterate(
            function(year_index, collection) {
              year_index = ee.Number(year_index);
              var latest_year = ee.ImageCollection(collection).first();
              var loss_mask_this_year = 
                  ee.Image('UMD/hansen/global_forest_change_2020_v1_8')
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
                ee.Image('UMD/hansen/global_forest_change_2020_v1_8')
                    .toFloat()
                    .divide(100)
                    .set('year', 2000)
                    .select('treecover2000')))),
        'map_mode': 'fractional',
        'pixel_size': 30,
        'band': 'treecover2000',
        'years': range(2000, 2020),
        // No-op, source already provides years.
        'year_fn': function(image) { return image; },
        'color': '#FFD700'
    }
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

var DICT_STATES = {
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
  'WYOMING': 'WY'
};

// ---------- EXPORTS ------------
exports.SUMMARY_DICT = post_extract_dict;
exports.DICT_STATES = DICT_STATES;