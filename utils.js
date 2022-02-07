// Utility functions for ee-forests analysis.

function categorical_mask(feature) {
    var image_collection = ee.ImageCollection(
          feature.get('collection'));
    
    var mask_collection = image_collection.map(function(image) {
      var forest_classes = ee.List(feature.get('classes'));
    
      // Convert to list of 1s for remap (mask)
      var remap_mask = ee.List.repeat(1, forest_classes.length());
      
      // Remap to create image where 1=forest
      var masked_image = image
          .remap(forest_classes, remap_mask)
          .rename('forest_area')
          .selfMask();

      return masked_image;
    });
    
    return feature.set('mask_collection', mask_collection);
  }

 
function threshold_mask(feature) {
  var image_collection = ee.ImageCollection(
      feature.get('collection'));
  
  var mask_collection = image_collection.map(function(image) {  
    var threshold = ee.Number(feature.get('threshold'));
  
    // Threshold to create image where 1=forest
    var masked_image = image
        .gt(threshold)
        .rename('forest_area')
        .selfMask();
    
    return masked_image.copyProperties(image);
  });
  
  return feature.set('mask_collection', mask_collection);
}


function fractional_mask(feature) {
  var image_collection = ee.ImageCollection(
      feature.get('collection'));
  
  // Just use fractional values
  var mask_collection = image_collection
      .map(function(image) {
        return image
            .rename('forest_area')
            .selfMask()});
  
  return feature.set('mask_collection', mask_collection);
}


function add_properties(bounds, scale_factor, out_proj) {
  return function(key, value) {
    var product_dict = ee.Dictionary(value);
    
    var conversion = ee.Number(product_dict.get('pixel_size'))
        .pow(2)
        .multiply(scale_factor);
    
    var source_col = ee.ImageCollection(product_dict.get('source'))
        .filterBounds(bounds)
        .filter(ee.Filter.inList('year', product_dict.get('years')))
        .select([product_dict.get('band')])
        .map(function(image) {return image.clip(bounds.geometry())});
    
    return product_dict
      .set('product_id', key)
      .set('conversion', conversion)
      .set('collection', source_col)
      .set('bounds', bounds)
      .set('projection', out_proj);
  };
}

// ---------- EXPORTS ------------
exports.categorical_mask = categorical_mask;
exports.threshold_mask = threshold_mask;
exports.fractional_mask = fractional_mask;
exports.add_properties = add_properties;

