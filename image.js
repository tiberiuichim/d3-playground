var text = "Lorem ipsum dolor";

var width = 960;
var height = 500;
var step = [20, 20];

var graticule = d3.geo.graticule();
graticule.step(step);

var projection = d3.geo.stereographic() ;
projection
  .scale(345)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);

var mercatproj = d3.geo.mercator();
mercatproj
  .scale(345)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);

var path = d3.geo.path().projection(projection);

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("/countries.geo.json", main);

function main(error, world) {
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

  var raster = svg.append("g");
  var image = raster.insert("image");

  makeTextImage(text, "label", function(url) {
    image.attr("href", url);
  });

}

// function rescaleImageToMercatorCoords(){
// }

function makeTextImage(text, klass, callback) {   // , parent
  // creates an image with text, returns it as data URL
  var svg = d3.select("body").insert("svg");
  var textn = svg.insert("text");
  textn
    .text(text)
    .attr("class", klass)
    .attr("dx", 0)
    .attr("text-anchor", "start")
    .attr("style", "fill: black; font-size: 1em; font-family:Arial,Helvetica;")
  ;
  var bbox = textn.node().getBBox();
  textn.attr("dy", bbox.height);
  svg
    .attr("height", bbox.height - bbox.y)   // account for text symbols under
    .attr("width", bbox.width)
  ;
  serialize(svg, callback);
}


function serialize(svg, callback) {
  // var copy = svg.cloneNode(true);

  var node = svg.node();
  var width = svg.attr("width");
  var height = svg.attr("height");
  // console.log('width', width, 'height', height);

  var DOMURL = window.URL || window.webkitURL || window;

  var data = (new XMLSerializer()).serializeToString(node);
  // var data = svg.node().outerHTML;
  // console.log("data", data);
  var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
  var url = DOMURL.createObjectURL(svgBlob);

  var canvas = d3.select("body").insert("canvas");
  canvas.attr("width", width).attr("height", height);
  var ctx = canvas.node().getContext("2d");

  var img = new Image;
  img.onload = function () {
    // console.log(ctx);
    ctx.drawImage(this, 0, 0);
    DOMURL.revokeObjectURL(url);
    var url = canvas.node().toDataURL();
    console.log("url", url);
    callback(url);
  };
  img.src = url;
}


// var tile = d3.tile()
//   .size([width, height])
// ;


// var tiles = tile
//   .scale(345)
//   .translate([width / 2, height / 2])();
// var image = raster
//   // .attr("transform", stringify(tiles.scale, tiles.translate))
//   .selectAll("image")
//   .data(tiles, function(d) { return d; });


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

