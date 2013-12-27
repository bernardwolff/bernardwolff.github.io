function draw_puzzle() {
  var puzzle_width = 400;
  var puzzle_height = 400;
  var cell_width = 100;
  
  var $canvas = $("#puzzle");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var mousePressed = false;
  var ctrlPressed = false;

  $canvas.mousedown(function(e){
    mousePressed = true;
    ctrlPressed = e.ctrlKey;
    puzzle.mousedown(e.offsetX, e.offsetY);
  }).mousemove(function(e) {
    puzzle.mousemove(e.offsetX, e.offsetY);
    if (mousePressed) {
      puzzle.update();
    }
  }).mouseup(function(){
    mousePressed = false;
    puzzle.dragging = false;
    puzzle.mouseup();
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
        new Cell(2, 2, cell_width, 'white', 'black'),
        new Cell(2, 3, cell_width, 'white', 'black'),
        new Cell(3, 3, cell_width, 'white', 'black'),
      ]),
  ], puzzle_width, puzzle_height, cell_width);

  puzzle.update();

  function Puzzle(pieces, width, height) {
    this.pieces = pieces;
    this.width = width;
    this.height = height;
    this.background_color = 'gray';

    for (var i = 0; i < this.pieces.length; i++) {
      this.pieces[i].puzzle = this;
    }

    this.mousedown = (function(x, y) {
      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].mousedown(x, y);
      }
    }).bind(this);

    this.mouseup = (function() {
      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].mouseup();
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
    }).bind(this);

    this.check_overlap = (function(piece) {
      for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].check_overlap(piece)) {
          return true;
        }
      }
      return false;
    }).bind(this);
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
    }).bind(this);

    this.move = (function(distanceX, distanceY) {
      if (this.puzzle.check_overlap(this)) {
        return;
      }
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].move(distanceX, distanceY);
      }
    }).bind(this);

    this.check_overlap = (function(piece) {
      if (piece === this) {
        return false;
      }
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < piece.cells.length; j++) {
          if (this.cells[i].check_overlap(piece.cells[j])) {
            return true;
          }
        }
      }
      return false;
    }).bind(this);

    this.update();
  }

  function Cell(x, y, width, fillColor, borderColor) {
    this.width = width;
    this.x = x * this.width;
    this.y = y * this.width;
    this.fillColor = fillColor;
    this.borderColor = borderColor;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;

    this.mousedown = (function(mouseX, mouseY) {
      var left = this.x;
      var right = left + this.width;
      var top = this.y;
      var bottom = top + this.width;
      if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
        console.log('drag start ' + mouseX + ', ' + mouseY);
        // offset from the upper-left corner of the cell
        this.startX = mouseX - this.x;
        this.startY = mouseY - this.y;
        this.dragging = true;
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
      //return cell.x > this.x && cell.x < this.x + this.width
      return false;
    }).bind(this);
  }
}
