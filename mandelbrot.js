function draw_mandelbrot(context, params) {
  function scale_point(point) {
    var xmin = -2.5, xmax = 1, ymin = -1, ymax = 1;
    return {
      x: ((xmax - xmin) * point.x / context.canvas.width) + xmin,
        y: ((ymax - ymin) * point.y / context.canvas.height) + ymin
    };
  }

  for (var i = 0; i < context.canvas.width; i++) {
    for (var j = 0; j < context.canvas.height; j++) {
      var scaled_point = scale_point({x: i, y: j});
      var x = 0, y = 0, iteration = 0;

      while (x*x + y*y < 2*2 && iteration < params.max_iteration) {
        var xtemp = x*x - y*y + scaled_point.x;
        y = 2*x*y + scaled_point.y;
        x = xtemp;
        iteration = iteration + 1;
      }

      var color = 100 - Math.floor(255 * iteration / params.max_iteration);
      context.fillStyle = 'rgb(' + color + '%, ' + color + '%, ' + color + '%)';
      context.fillRect(i, j, 1, 1);
    }
  }
}
