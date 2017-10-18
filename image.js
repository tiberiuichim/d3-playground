var text = "Lorem ipsum dolor";

function makeTextImage(text, klass, parent) {
  var svg = d3.select('body').insert('svg');
  var textn = svg.insert('text');
  textn
    .text(text)
    .attr('class', klass)
    .attr('dx', 0)
    .attr('text-anchor', 'start')
  ;
  var bbox = textn.node().getBBox();
  textn.attr('dy', bbox.height);
  svg
    // .attr('height', bbox.height + bbox.height/10)   // account for text symbols under
    // .attr('width', bbox.width)
  ;
  console.log("BBox", bbox);
  var url = serialize(svg);

  return url;

  // var img = parent.insert('image')
  //   .attr('href', url)
  //   .attr('dx', 0)
  //   .attr('dy', 0)
  // ;
  //
  // return img
}

function serialize(svg) {
  // var copy = svg.cloneNode(true);

  var node = svg.node();
  var DOMURL = window.URL || window.webkitURL || window;

  var data = (new XMLSerializer()).serializeToString(node);
  var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
  var url = DOMURL.createObjectURL(svgBlob);

  return url;
}

var width = 960,
    height = 500;

var projection = d3.geo.stereographic() ;

projection
  .scale(345)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);

var path = d3.geo.path().projection(projection);

var graticule = d3.geo.graticule();

var tile = d3.tile()
  .size([width, height])
;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("/countries.geo.json", function(error, world) {
  var countries = world.features;
  console.log(countries);

  svg.append("path")
    .datum(
      {
        type: "Sphere"
      }
    )
    .attr("class", "water")
    .attr("d", path);

  svg.selectAll("path.lines")
    .data(graticule.lines())
    .enter()
    .append("path")
    .attr("class", "lines")
    .attr("d", path)
  ;

  var raster = svg.append('g');

  var tiles = tile
    .scale(345)
    .translate([width / 2, height / 2])
  ();
  var image = raster
    // .attr("transform", stringify(tiles.scale, tiles.translate))
    .selectAll("image")
    .data(tiles, function(d) { return d; });

  image.enter().append("image")
      .attr("xlink:href", function(d) {
        return makeTextImage(text, 'label', svg);
        // return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
      })
      .attr("x", function(d) { return d[0] * 256; })
      .attr("y", function(d) { return d[1] * 256; })
      .attr("width", 256)
      .attr("height", 256);

  // var textimg = makeTextImage(text, 'label', svg);

});





// textimg.attr('dy', textimg.height());

// console.log(serialize(svg.node));
// var d = serialize(svg);
// console.log(d);

// svg.insert("image")
//   .attr('dx', 20)
//   .attr('dy', 80)
//   .attr('href', d)
//   .attr('width', 100)
//   .attr('height', 100)
// ;


// function onload() {
//   var dx = image.width,
//       dy = image.height;
//
//   context.drawImage(image, 0, 0, dx, dy);
//
//   var sourceData = context.getImageData(0, 0, dx, dy).data,
//       target = context.createImageData(width, height),
//       targetData = target.data;
//
//   for (var y = 0, i = -1; y < height; ++y) {
//     for (var x = 0; x < width; ++x) {
//       var p = projection.invert([x, y]), λ = p[0], φ = p[1];
//       if (λ > 180 || λ < -180 || φ > 90 || φ < -90) { i += 4; continue; }
//       var q = ((90 - φ) / 180 * dy | 0) * dx + ((180 + λ) / 360 * dx | 0) << 2;
//       targetData[++i] = sourceData[q];
//       targetData[++i] = sourceData[++q];
//       targetData[++i] = sourceData[++q];
//       targetData[++i] = 255;
//     }
//   }
//
//   context.clearRect(0, 0, width, height);
//   context.putImageData(target, 0, 0);
// }
// var canvas = d3.select("body")
//   .append("canvas")
//   .attr('id', 'mycanvas')
//   .attr("width", width)
//   .attr("height", height);
//
// var context = canvas.node().getContext("2d");

// var image = new Image;
// image.onload = onload;
// image.src = "readme-blue-marble.jpg";

// var latitudes = [[10,20]];   // , [30, 40]];

// svg.selectAll("text")
//   .data(latitudes)
//   .enter().append("text")
//   .text(function(d) {
//     return d.join("|");
//   })
//   .attr("class", "label")
//   .attr("dx", 20)
//   .attr("dy", 40)
// ;

