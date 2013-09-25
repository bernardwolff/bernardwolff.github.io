function draw_maze(context, params) {
  var _this = this;
  this.max_depth_index = 0;
  this.maze_cells = [];
  this.hint_color = params.hint_color;
  this.hint_on = false;
  this.render_cell_index = 0;
  this.current_point = null;
  this.cell_size = params.cell_size;
  this.colors = {
    current: params.current_cell_color,
    goal: params.goal_cell_color,
    start: params.start_cell_color,
    main: params.cell_color,
    hint: params.hint_color
  };
  this.grid_size = params.cell_size / 2;
  this.border_width = _this.grid_size / 2;
  var last = (new Date()).getTime();
  var max_depth = 0;
  var maze_width = context.canvas.width / params.cell_size; 
  var grid = {};

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
    _this.maze_cells.push({'x': point.x, 'y': point.y, parent_cell: parent_cell_index, color: _this.colors.main});
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

  this.fill_cell = function(cell, color) {
    //var cell = _this.maze_cells[index];
    if (cell !== undefined) {
      var x = cell.x * _this.cell_size + _this.border_width;
      var y = cell.y * _this.cell_size + _this.border_width;
      context.fillStyle = color || cell.color; 
      context.fillRect(x, y, _this.grid_size, _this.grid_size);
    }
  }

  function render() {
    if (_this.render_cell_index < _this.maze_cells.length) {
      var cur = (new Date()).getTime(); 
      if (cur - last > 10) {
        _this.fill_cell(_this.maze_cells[_this.render_cell_index]);
        _this.fill_cell(_this.maze_cells[_this.render_cell_index + 1], _this.colors.current);
        last = cur;
        _this.render_cell_index++;
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
      cell.color = _this.hint_on ? _this.colors.hint : _this.colors.main;
      action(_this.maze_cells[index]);
    }
  }

  this.move = function (dir) {
    // neighboring cells (walls) are a half-step away
    var new_point = null;
    switch(dir) {
      case 'H':
        // left
        new_point = {x: _this.current_point.x - 0.5, y: _this.current_point.y};
        break;
      case 'J':
        // down
        new_point = {x: _this.current_point.x, y: _this.current_point.y + 0.5};
        break;
      case 'K':
        // up
        new_point = {x: _this.current_point.x, y: _this.current_point.y - 0.5};
        break;
      case 'L':
        // right
        new_point = {x: _this.current_point.x + 0.5, y: _this.current_point.y};
        break;
    }

    if (new_point !== null && visited(new_point)) {
      _this.fill_cell(_this.current_point, _this.colors.main);
      _this.current_point = new_point;
      _this.fill_cell(_this.current_point, _this.colors.current);
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
      mark_visited(wall_cell);
      var cell_index = add_maze_cell(wall_cell, cur_cell_index);

      draw_maze_internal(random_neighbor, cell_index, depth + 1);

      neighbors = get_neighbors(current_point);
    }
  }

  draw_maze_internal({x: 0, y: 0}, undefined, 0);
  /*this.traverse_path(_this.max_depth_index, function(index) {
    // no-op
  });*/
  var last_point = _this.maze_cells[_this.max_depth_index];
  _this.current_point = {x: last_point.x, y: last_point.y};
  last_point.color = _this.colors.start;
  _this.maze_cells[0].color = _this.colors.goal;
  render();

  return this;
}
