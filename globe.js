function graticule10(step) {
  // graticule that doesn't draw verticals in lower thresholds
  var epsilon = 1e-6,
      x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = step, dy = step,
      X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
      x = graticuleX(y0, y1, 2.5), y = graticuleY(x0, x1, 2.5),
      X = graticuleX(Y0, Y1, 2.5), Y = graticuleY(X0, X1, 2.5);

  function graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [x, y];
      });
    };
  }

  function graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
    return function(y) {
      return x.map(function(x) { return [x, y]; });
    };
  }

  var coords = d3.range(Math.ceil(X0 / DX) * DX, X1, DX)
    .map(X)
    .concat(
      d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)
    )
    .concat(
      d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return Math.abs(x % DX) > epsilon;
      }).map(x)
    )
    .concat(
      d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) {
        return Math.abs(y % DY) > epsilon;
      }).map(y)
    )
  ;
  return {
    type: "MultiLineString",
    coordinates: coords
  };
}

function getAngleToNextMeridian(coords, step, projection) {
  var nextLong = [coords[0] + 20, coords[1]];

  var A = projection(coords);
  var B = projection(nextLong);

  // console.log(A, B, coords, mer);
  var opp = B[0] - A[0];
  var adj = B[1] - A[1];

  var angle = Math.atan(opp/adj);
  if (Number.isFinite(angle)) {
    var res = (angle, opp, adj);
    console.log(res);
    return res;
  }
  return 0;
  // var angle = ;    //, opp, adj);
  // // console.log(coords);
  // if (coords[0] == 40) {
  //   console.log('Angle', angle, coords, A, B, opp, adj);
  // }
  // return ? angle : 0;
}

function getPointToNextMeridian(coords, step, projection) {
  var nextLong = [coords[0] + step, coords[1]];

  // var A = projection(coords);
  var B = projection(nextLong);
  return B;
}


function svgTrans(rev) {
  return 'translate(' + rev[0] + ',' + rev[1] + ') ';
}

function svgRot(angle) {
  return 'rotate(' + angle + ') ';
}

var width = 960,
    height = 800;

var projection = d3.geo.stereographic()
  .scale(345)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);

var path = d3.geo.path().projection(projection);

var step = 20;
// var graticule = graticule10(step);
var graticule = d3.geo.graticule();
graticule.step([step, step]);
graticule.majorStep([90, 360]);   // removes graticule lines from arctic

var minorGraticule = d3.geo.graticule();
minorGraticule.step([5, 5]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("path")
  .datum(
    {type: "Sphere"}
  )
  .attr("class", "water")
  .attr("d", path);

svg.selectAll('path.lines')
  .data(graticule.lines())
  .enter()
  .append("path")
  .attr("class", "lines")
  .attr("d", path)
  // .exit()
;

svg.selectAll('path.sublines')
  .data(minorGraticule.lines())    // .lines())
  .enter()
  .append("path")
  .attr("class", "sublines")
  .attr("d", path)
  // .exit()
;

// Calculate the center meridian for the sphere. It serves to calculate
// clipping of coordinate labels
var bbox = svg.node().getBBox();
var p = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
var cp = projection.invert(p);   // lon, lat
var arc = {
  type: 'LineString',
  coordinates: [[cp[0], -80], [cp[0], 80]]
}

var latitudes = [];
for (var i = -180; i <= 180; i+=step) {
  for (var j = -180; j <= 180; j+=step) {
    var p = {
      type: 'Point',
      coordinates: [i, j]
    };
    latitudes.push(p);
  }
}

svg.selectAll('circle')
  .data(latitudes)
  .enter()
  .append('circle')
  .attr('class', 'checkpoint')
  .attr('r', 1)
  .attr('transform', function(d) {
    var p = getPointToNextMeridian(d.coordinates, 20, projection);
    var lon = d.coordinates[0];
    var lat = d.coordinates[1]
    return svgTrans(p);
  })
;

svg.selectAll('text')
  .data(latitudes)
  .enter().append("text")
  .text(function(d) {
    var coord = d.coordinates;
    var lon, lat;

    if (coord[0] > 0) {
      lon = coord[0] + "°E";
    } else if (coord[0] < 0) {
      lon = coord[0] + "°W";
    }

    if (coord[1] > 0) {
      lat = coord[1] + "°N";
    } else if (coord[1] < 0) {
      lat = coord[1] + "°S";
    }
    return [lon, lat].join('|');
  })
  .attr("class", "label")
  .attr("style", function(d) {
    return 'text-anchor: start';
    // return (d.coordinates[0][1] == d.coordinates[1][1]) ? "text-anchor: start" : "text-anchor: middle";
  })
  .attr("id", function(d) {
  })
  .attr("dx", 0)
  .attr("dy", 0)
  .attr('display', function(d) {
    // var rev = projection(d.coordinates);
    var b = path.bounds(d);
    // console.log(b, d.coordinates);
    function ip(c) {
      return Number.isFinite(c) && c >= 0;
    }
    if (!(b[0].every(ip) && b[1].every(ip))) return 'none';

    var lon = d.coordinates[0]
    if ((cp[0] - lon) >= 90) return 'none';
    if ((cp[0] - lon) <= -90) return 'none';

    return  'inline';
  })
  .attr('transform', function(d) {
    var lon = d.coordinates[0];
    var lat = d.coordinates[1]
    // var p = [lon + 1, lat >= 0 ? lat + 1 : lat +1];

    // console.log(p);
    // var rev = projection(p);

    var rev = projection(d.coordinates);
    if (Number.isFinite(rev[0]) && Number.isFinite(rev[1])) {
      var angle = getAngleToNextMeridian(d.coordinates, step, projection);
      return svgTrans(rev) + svgRot(angle);
    }
  })
;

svg.append("path")
  .datum(graticule.outline)
  .attr("class", "graticule outline")
  .attr("d", path);

// svg.append("path")
//   .data([arc])
//   .attr("class", "greatarc")
//   .attr("d", path);
