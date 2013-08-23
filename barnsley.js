function draw_barnsley_fern(context, params) {
  function OnePercent(point) {
    var x = 0;
    var y = 0.16 * point.y;
    return {"x": x, "y": y};
  }

  function EightyFivePercent(point) {
    var x = (0.85 * point.x) + (0.04 * point.y);
    var y = (-0.04 * point.x) + (0.85 * point.y) + 1.6;
    return {"x": x, "y": y};
  }

  function SevenPercentFirst(point) {
    var x = (0.2 * point.x) - (0.26 * point.y);
    var y = (0.23 * point.x) + (0.22 * point.y) + 1.6;
    return {"x": x, "y": y};
  }

  function SevenPercentSecond(point) {
    var x = (-0.15 * point.x) + (0.28 * point.y);
    var y = (0.26 * point.x) + (0.24 * point.y) + 0.44;
    return {"x": x, "y": y};
  }

  var point = {"x": 0, "y": 0};
  for (var i = 0; i < 50000; i++) {
    var r = Math.floor((Math.random()*100)+1);
    if (r <= 1) {
      point = OnePercent(point);
    } else if (r <= 8) { // 2, 3, 4, 5, 6, 7, 8
      point = SevenPercentFirst(point);
    } else if (r <= 15) { // 9, 10, 11, 12, 13, 14, 15
      point = SevenPercentSecond(point);
    } else {
      point = EightyFivePercent(point);
    }

    // points are in the range -2.1820 < x < 2.6558 and 0 <= y < 9.9983.
    // after adding 3 to x: 0.818 < x < 5.6558
    var x = params.scale * (point.x + params.xoffset);
    var y = (10 * params.scale) - (params.scale * point.y) + params.yoffset;
    context.fillRect(x, y, 1, 1);
  }
}


