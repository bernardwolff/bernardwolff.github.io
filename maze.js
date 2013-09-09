function draw_maze(context, params) {
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

  function fill_cell(point, color) {
    var x = point.x * params.cell_size + border_width;
    var y = point.y * params.cell_size + border_width;
    context.fillStyle = color;
    context.fillRect(x, y, grid_size, grid_size);
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

  var current_point = {x: 0, y: 0};

  function draw_maze_internal(current_point) {
    fill_cell(current_point, params.cell_color);

    mark_visited(current_point);

    var neighbors = get_neighbors(current_point);

    while (neighbors.length > 0) {

      var r = Math.floor(Math.random() * neighbors.length);
      var random_neighbor = neighbors[r];

      var wall_cell = {x: (current_point.x + random_neighbor.x) / 2, y: (current_point.y + random_neighbor.y) / 2};
      fill_cell(wall_cell, params.cell_color);

      draw_maze_internal(random_neighbor);

      neighbors = get_neighbors(current_point);
    }
  }

  draw_maze_internal(current_point);
}
