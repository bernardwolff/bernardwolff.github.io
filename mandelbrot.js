function draw_mandelbrot(context, params) {
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  var mandelbrot_scale = function () {
    self = this;
    self.x = {min: -2.5, max: 1};
    self.y = {min: -1, max: 1};

    self.scale_coord = function(coord, min, max, w) {
      // note: this function is not returning numbers equal to the max, need to fix
      return ((max - min) * coord / w) + min;
    };

    self.scale_point = function (point) {
      return {
        x: self.scale_coord(point.x, self.x.min, self.x.max, context.canvas.width),
          y: self.scale_coord(point.y, self.y.min, self.y.max, context.canvas.height),
      };
    };
  }

  var ms = new mandelbrot_scale();

  for (var i = 0; i < context.canvas.width; i++) {
    for (var j = 0; j < context.canvas.height; j++) {
      var scaled_point = ms.scale_point({x: i, y: j});
      var x = 0, y = 0;

      var iteration = 0;

      while (x*x + y*y < 2*2 && iteration < params.max_iteration) {
        var xtemp = x*x - y*y + scaled_point.x;
        y = 2*x*y + scaled_point.y;
        x = xtemp;
        iteration = iteration + 1;
      }

      var color = Math.floor(params.color_depth * iteration / params.max_iteration);

      context.fillStyle = '#' + pad(color.toString(16), 6);
      context.fillRect(i, j, 1, 1);
    }
  }
}
