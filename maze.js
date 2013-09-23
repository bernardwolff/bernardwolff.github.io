function draw_maze(context, params) {
  var _this = this;
  this.max_depth_index = 0;
  this.maze_cells = [];
  this.hint_color = params.hint_color;
  this.hint_on = false;
  var last = (new Date()).getTime();
  var max_depth = 0;
  var grid_size = params.cell_size / 2;
  var border_width = grid_size / 2;
  var maze_width = context.canvas.width / params.cell_size; 
  var grid = {};
  var cur_cell_index = 0;

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
    _this.maze_cells.push({'x': x, 'y': y, parent_cell: parent_cell_index, color: params.cell_color});
    return _this.maze_cells.length - 1;
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

  this.fill_cell = function(index, color) {
    var cell = _this.maze_cells[index];
    if (cell !== undefined) {
      context.fillStyle = color || cell.color; 
      context.fillRect(cell.x, cell.y, grid_size, grid_size);
    }
  }

  function render() {
    if (cur_cell_index < _this.maze_cells.length) {
      var cur = (new Date()).getTime(); 
      if (cur - last > 10) {
        _this.fill_cell(cur_cell_index);
        _this.fill_cell(cur_cell_index + 1, params.current_cell_color);
        last = cur;
        cur_cell_index++;
      }

      requestAnimFrame(render);
    }
  }

  this.traverse_path = function (from_cell_index, action) {
    _this.hint_on = !_this.hint_on;
    var index = from_cell_index;
    var cell = _this.maze_cells[index];
    while (cell.parent_cell !== undefined) {
      index = cell.parent_cell;
      cell = _this.maze_cells[index];
      if (cell.parent_cell === undefined) {
        break;
      }
      cell.color = _this.hint_on ? params.hint_color : params.cell_color;
      action(index);
    }
  }

  function max(a, b) {
    return a > b ? a : b;
  }

  function draw_maze_internal(current_point, parent_cell_index, depth) {
    var cur_cell_index = add_maze_cell(current_point, parent_cell_index);

    if (depth > max_depth) {
      _this.max_depth_index = cur_cell_index;
      max_depth = depth;
    }

    mark_visited(current_point);

    var neighbors = get_neighbors(current_point);

    while (neighbors.length > 0) {

      var r = Math.floor(Math.random() * neighbors.length);
      var random_neighbor = neighbors[r];

      var wall_cell = midpoint(current_point, random_neighbor);
      var cell_index = add_maze_cell(wall_cell, cur_cell_index);

      draw_maze_internal(random_neighbor, cell_index, depth + 1);

      neighbors = get_neighbors(current_point);
    }
  }

  draw_maze_internal({x: 0, y: 0}, undefined, 0);
  /*this.traverse_path(_this.max_depth_index, function(index) {
    // no-op
  });*/
  _this.maze_cells[_this.max_depth_index].color = params.start_cell_color;
  _this.maze_cells[0].color = params.goal_cell_color;
  render();

  return this;
}
