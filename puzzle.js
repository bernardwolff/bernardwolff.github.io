function draw_puzzle() {
  var puzzle_width = 400;
  var puzzle_height = 400;
  var cell_width = 100;
  var overlap_allowed = 10;
  
  var $canvas = $("#puzzle");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var mousePressed = false;
  var ctrlPressed = false;

  $canvas.mousedown(function(e){
    mousePressed = true;
    ctrlPressed = e.ctrlKey;
    //var x = e.offsetX;
    //var y = e.offsetY;
    var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    puzzle.mousedown(x, y);
    puzzle.update();
  }).mousemove(function(e) {
    //var x = e.offsetX;
    //var y = e.offsetY;
    var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    puzzle.mousemove(x, y);
    if (mousePressed) {
      puzzle.update();
    }
  }).mouseup(function(){
    mousePressed = false;
    puzzle.dragging = false;
    puzzle.mouseup();
    puzzle.update();
  });

  var puzzle = new Puzzle([
      new Piece([
        new Cell(0, 1, cell_width, 'teal', 'black'),
        new Cell(1, 1, cell_width, 'teal', 'black'),
      ]),
      new Piece([
        new Cell(2, 0, cell_width, 'yellow', 'black'),
        new Cell(2, 1, cell_width, 'yellow', 'black'),
        new Cell(3, 1, cell_width, 'yellow', 'black'),
      ]),
      new Piece([
        new Cell(1, 2, cell_width, 'green', 'black'),
        new Cell(1, 3, cell_width, 'green', 'black'),
      ]),
      new Piece([
        new Cell(2, 2, cell_width, 'white', 'black', 0, 0),
        new Cell(2, 3, cell_width, 'white', 'black', 0, 1),
        new Cell(3, 3, cell_width, 'white', 'black', 1, 1),
      ]),
      //new Piece([new Cell(1, 1, cell_width, 'teal', 'black')]),
      //new Piece([new Cell(2, 2, cell_width, 'goldenrod', 'black')]),
  ], puzzle_width, puzzle_height, cell_width);

  puzzle.update();

  function Puzzle(pieces, width, height) {
    this.pieces = pieces;
    this.width = width;
    this.height = height;
    this.background_color = 'gray';
    this.moves = 0;
    this.active_piece = null;
    this.solved = false;

    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].puzzle = this;
    }

    this.mousedown = (function(x, y) {
      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].mousedown(x, y);
      }
    }).bind(this);

    this.mouseup = (function() {
      if (this.active_piece !== null) {
        this.active_piece.mouseup();
        this.moves++;
        this.solved = this.active_piece.in_goal_location();
        this.set_active_piece(null);
        //console.log(this.moves + " moves");
      }
    }).bind(this);

    this.mousemove = (function(x, y) {
      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].mousemove(x, y);
      }      
    }).bind(this);

    this.update = (function() {
      context.fillStyle = this.background_color;
      context.fillRect(0, 0, this.width, this.height);

      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].update();
      }
      context.fillStyle = "black";
      context.font = "bold 12px sans-serif";
      context.textBaseline = "top";
      var text = this.moves + " moves";
      if (this.solved) {
        context.fillStyle = "red";
        context.font = "bold 20px sans-serif";
        text = "solved in " + text + "!";
      }
      context.fillText(text, 0, 0);
    }).bind(this);

    this.check_overlap = (function(piece) {
      for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].check_overlap(piece)) {
          return true;
        }
      }
      return false;
    }).bind(this);

    this.set_active_piece = (function(piece) {
      this.active_piece = piece;
      var index = this.pieces.indexOf(piece);
      if (index > -1) {
        this.pieces.splice(index, 1);
        this.pieces.push(piece);
      }
    });
  }

  function Piece(cells) {
    this.cells = cells;
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].piece = this;
    }

    this.update = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].draw();
        this.dragging = this.dragging || this.cells[i].dragging;
      }
    }).bind(this);

    this.mousemove = (function(mouseX, mouseY) {
      for (var i = 0; i < this.cells.length; i++) {
        cells[i].mousemove(mouseX, mouseY);
      }
    }).bind(this);

    this.mousedown = (function(mouseX, mouseY) {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].mousedown(mouseX, mouseY);
      }
    }).bind(this);

    this.mouseup = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].mouseup();
      }
      this.snap_into_place();
      if (this.puzzle.check_overlap(this)) {
        this.moveback();
        return;
      }
      this.save_last_pos();
    }).bind(this);

    this.moveback = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].x = this.cells[i].last_x;
        this.cells[i].y = this.cells[i].last_y;
      }
    });

    this.move = (function(distanceX, distanceY) {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].move(distanceX, distanceY);
      }
      /*if (this.puzzle.check_overlap(this)) {
        this.overlaps = true;
        if (Math.abs(distanceY) >= Math.abs(distanceX)) {
          for (var i = 0; i < this.cells.length; i++) {
            this.cells[i].move(-distanceX, 0);
          }
          if (this.puzzle.check_overlap(this)) {
            for (var i = 0; i < this.cells.length; i++) {
              this.cells[i].move(0, -distanceY);
            }
          }
          //this.snap_into_place_x();
        } else {
          for (var i = 0; i < this.cells.length; i++) {
            this.cells[i].move(0, -distanceY);
          }
          if (this.puzzle.check_overlap(this)) {
            for (var i = 0; i < this.cells.length; i++) {
              this.cells[i].move(-distanceX, 0);
            }
          }
          //this.snap_into_place_y();
        }
      }*/
    }).bind(this);

    this.check_overlap = (function(piece) {
      if (piece === this) {
        return false;
      }
      for (var i = 0; i < this.cells.length; i++) {
        var c1 = this.cells[i];
        for (var j = 0; j < piece.cells.length; j++) {
          var c2 = piece.cells[j];
          if (c1.check_overlap(c2) || c2.check_overlap(c1)) {
            return true;
          }
        }
      }
      return false;
    }).bind(this);

    function round_coords(x, y) {
      return {
        x: Math.round(x / cell_width) * cell_width,
        y: Math.round(y / cell_width) * cell_width,
      };
    }

    this.snap_into_place = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        var rounded_coords = round_coords(this.cells[i].x, this.cells[i].y);
        this.cells[i].x = rounded_coords.x;
        this.cells[i].y = rounded_coords.y;
      }
    });

    this.save_last_pos = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].last_x = this.cells[i].x;
        this.cells[i].last_y = this.cells[i].y;
      }
    });

    this.in_goal_location = (function() {
      var ret = true;
      for (var i = 0; i < this.cells.length; i++) {
        ret = ret && this.cells[i].in_goal_location();
      }
      return ret;
    });

    this.update();
  }

  function Cell(x, y, width, fillColor, borderColor, goal_x, goal_y) {
    this.width = width;
    this.x = x * this.width;
    this.y = y * this.width;
    this.last_x = this.x;
    this.last_y = this.y;
    this.fillColor = fillColor;
    this.borderColor = borderColor;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.goal_x = goal_x * this.width;
    this.goal_y = goal_y * this.width;

    this.mousedown = (function(mouseX, mouseY) {
      var left = this.x;
      var right = left + this.width;
      var top = this.y;
      var bottom = top + this.width;
      if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
        //console.log('drag start ' + mouseX + ', ' + mouseY + ' this.x=' + this.x + ', this.y=' + this.y);
        // offset from the upper-left corner of the cell
        this.startX = mouseX - this.x;
        this.startY = mouseY - this.y;
        this.dragging = true;
        this.piece.puzzle.set_active_piece(this.piece);
      }
    }).bind(this);

    this.mousemove = (function(mouseX, mouseY) {
      if (this.dragging) {
        this.moved = false;
        var newX = mouseX - this.startX;
        var newY = mouseY - this.startY;

        this.piece.move(newX - this.x, newY - this.y);
      }
    }).bind(this);

    this.mouseup = (function() {
      this.dragging = false;
    }).bind(this);

    this.draw = (function() {
      context.fillStyle = this.fillColor;
      context.fillRect(this.x, this.y, this.width, this.width);
    }).bind(this);

    this.move = (function(distanceX, distanceY) {
      this.x = this.x + distanceX;
      this.y = this.y + distanceY;
    }).bind(this);

    this.check_overlap = (function(cell) {
      var dx = Math.abs(cell.x - this.x);
      var dy = Math.abs(cell.y - this.y);
      var full_overlap = dx == 0 && dy == 0;
      //var partial_overlap = dx >= overlap_allowed && dx < this.width - overlap_allowed && dy >= overlap_allowed && dy < this.width - overlap_allowed ;
      var partial_overlap = dx >= 0 && dx < this.width && dy >= 0 && dy < this.width;
      return full_overlap || partial_overlap;
    }).bind(this);

    this.in_goal_location = (function() {
      if (this.goal_x === undefined || this.goal_y === undefined) {
        return false;
      }
      return this.goal_x == this.x && this.goal_y == this.y;
    });
  }
}
