function draw_maze(context, params) {
  var last = (new Date()).getTime();

  window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  function deg_to_rad(deg) {
    return deg * Math.PI / 180.0;
  }

  /*function draw_line(point1, point2) {
    context.beginPath();
    context.moveTo(point1.x, point1.y);
    context.lineTo(point2.x, point2.y);
    context.stroke();
  }*/

  if (context.canvas.width != context.canvas.height) {
    console.log("canvas width and height must be the same for maze drawing");
    return;
  }

  var grid_size = params.cell_size / 2;
  var border_width = grid_size / 2;
  var maze_width = context.canvas.width / params.cell_size; 
  var maze_cells = [];

  var grid = {};
  var path = [];

  /*function fill_all() {
    for (var i = 0; i < maze_width; i++) {
      for (var j = 0; j < maze_width; j++) {
        var x = i * params.cell_size + border_width;
        var y = j * params.cell_size + border_width;
        context.fillRect(x, y, grid_size, grid_size);
      }
    }
  }*/

  function midpoint(point1, point2) {
    return {x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2};
  }

  function add_maze_cell(point, goal_cell) {
    var x = point.x * params.cell_size + border_width;
    var y = point.y * params.cell_size + border_width;
    maze_cells.push({'x': x, 'y': y});
  }

  function visited(point) {
    return grid[point.x + "," + point.y] !== undefined;
  }

  function mark_visited(point) {
    grid[point.x + "," + point.y] = {};
  }

  function on_grid(point) {
    return point.x >= 0 && point.y >= 0 && point.x < maze_width && point.y < maze_width;
  }

  function get_neighbors(point) {
    var possible_neighbors = [
      {x: point.x + 1, y: point.y}, // east
      {x: point.x, y: point.y + 1}, // south
      {x: point.x - 1, y: point.y}, // west
      {x: point.x, y: point.y - 1} // north
    ];

    var neighbors = [];
    for (var i = 0; i < possible_neighbors.length; i++) {
      if (on_grid(possible_neighbors[i]) && !visited(possible_neighbors[i])) {
        neighbors.push(possible_neighbors[i]);
      }
    }

    return neighbors;
  }

  function render() {
    if (maze_cells.length > 0) {
      var cur = (new Date()).getTime(); 
      if (cur - last > 10) {
        context.fillStyle = params.cell_color;
        var cell = maze_cells.shift();
        context.fillRect(cell.x, cell.y, grid_size, grid_size);
        last = cur;
      }

      requestAnimFrame(render);
    }
  }

  function draw_maze_internal(current_point) {
    add_maze_cell(current_point);

    mark_visited(current_point);

    var neighbors = get_neighbors(current_point);

    while (neighbors.length > 0) {

      var r = Math.floor(Math.random() * neighbors.length);
      var random_neighbor = neighbors[r];

      var wall_cell = midpoint(current_point, random_neighbor);
      add_maze_cell(wall_cell);

      draw_maze_internal(random_neighbor);

      neighbors = get_neighbors(current_point);
    }
  }

  draw_maze_internal({x: 0, y: 0});

  render();
}
