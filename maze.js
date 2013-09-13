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

  function add_maze_cell(point, parent_cell_index) {
    var x = point.x * params.cell_size + border_width;
    var y = point.y * params.cell_size + border_width;
    maze_cells.push({'x': x, 'y': y, parent_cell: parent_cell_index});
    return maze_cells.length - 1;
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

  function fill_cell(index, color) {
    var cell = maze_cells[index];
    context.fillStyle = cell.color || color; 
    context.fillRect(cell.x, cell.y, grid_size, grid_size);
  }

  var cur_cell_index = 0;
  function render() {
    if (cur_cell_index < maze_cells.length) {
      var cur = (new Date()).getTime(); 
      if (cur - last > 10) {
        var cell = maze_cells[cur_cell_index];
        /*context.fillStyle = params.current_cell_color;
        if (cur_cell_index == 0) {
          context.fillStyle = params.goal_cell_color;
        }
        context.fillRect(cell.x, cell.y, grid_size, grid_size);*/
        fill_cell(cur_cell_index, cur_cell_index == 0 ? params.goal_cell_color : params.current_cell_color);

        if (cur_cell_index > 1) {
          //var cell = maze_cells[cur_cell_index - 1];
          //context.fillStyle = cell.color || params.cell_color;
          //context.fillRect(cell.x, cell.y, grid_size, grid_size);
          fill_cell(cur_cell_index - 1, params.cell_color);
        }
        last = cur;
        cur_cell_index++;
      }

      requestAnimFrame(render);
    }
  }

  function mark_path(from_cell_index) {
    var cell = maze_cells[from_cell_index];
    while (cell.parent_cell !== undefined) {
      maze_cells[cell.parent_cell[1]].color = params.hint_color;
      maze_cells[cell.parent_cell[0]].color = params.hint_color;
      cell.color = from_cell_index == 0 ? params.goal_cell_color : params.hint_color;
      cell = maze_cells[cell.parent_cell[0]];
    }
  }

  function draw_maze_internal(current_point, parent_cell_index) {
    var cur_cell_index = add_maze_cell(current_point, parent_cell_index);

    mark_visited(current_point);

    var neighbors = get_neighbors(current_point);

    while (neighbors.length > 0) {

      var r = Math.floor(Math.random() * neighbors.length);
      var random_neighbor = neighbors[r];

      var wall_cell = midpoint(current_point, random_neighbor);
      var cell_index = add_maze_cell(wall_cell, parent_cell_index);

      draw_maze_internal(random_neighbor, [cell_index, cur_cell_index]);

      neighbors = get_neighbors(current_point);
    }
  }

  draw_maze_internal({x: 0, y: 0});
  mark_path(maze_cells.length - 2);

  render();

  console.log("done");
}
