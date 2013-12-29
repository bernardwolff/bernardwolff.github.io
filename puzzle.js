function draw_puzzle() {
  var puzzle_width = 400;
  var puzzle_height = 400;
  var cell_width = 100;
  
  var $canvas = $("#puzzle");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var mousePressed = false;
  var ctrlPressed = false;

  var line_drawn = false;

  $canvas.mousedown(function(e){
    mousePressed = true;
    ctrlPressed = e.ctrlKey;
    puzzle.mousedown(e.offsetX, e.offsetY);
  }).mousemove(function(e) {
    puzzle.mousemove(e.offsetX, e.offsetY);
    if (mousePressed/* && !line_drawn*/) {
      puzzle.update();
    }
  }).mouseup(function(){
    mousePressed = false;
    puzzle.dragging = false;
    puzzle.mouseup();
  });

  function draw_line(x1, y1, x2, y2) {
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  // given two lines defined by four points, return the intersection of the two lines
  // line1 = (x1, y1), (x2, y2)
  // line2 = (x3, y3), (x4, y4)
  function get_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m1 = y2 == y1 ? 0 : (x2 - x1) / (y2 - y1); // slope of line1
    var m2 = y4 == y3 ? 0 : (x4 - x3) / (y4 - y3); // slope of line2
    var b1 = y1 - (m1 * x1); // y-intersect of line1
    var b2 = y3 - (m2 * x3); // y-intersect of line2

    var x = (b2 - b1) / (m1 - m2); // x-coordinate of point of intersection
    var y = m1 * x + b1; // y-coordinate of point of intersection
    
    return {x: x, y: y};
  }

  // http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  // Returns 1 if the lines intersect, otherwise 0. In addition, if the lines 
  // intersect the intersection point may be stored in the floats i_x and i_y.
  function get_line_intersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y)
  {
    var s1_x, s1_y, s2_x, s2_y, i_x, i_y;
    s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
      // Collision detected
      i_x = p0_x + (t * s1_x);
      i_y = p0_y + (t * s1_y);
      return {x: i_x, y: i_y};
    }

    return null; // No collision
  }

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
     //new Piece([new Cell(1, 1, cell_width, 'teal', 'black')]),
     //new Piece([new Cell(2, 2, cell_width, 'goldenrod', 'black')]),
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

    this.get_overlap = (function(piece) {
      for (var i = 0; i < this.pieces.length; i++) {
        var overlap = this.pieces[i].get_overlap(piece);
        if (overlap !== null) {
          return overlap;
        }
      }
      return null;
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
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].move(distanceX, distanceY);
      }
      var overlap = this.puzzle.get_overlap(this)
      if (overlap !== null) {
        for (var i = 0; i < this.cells.length; i++) {
          console.log('moving cells ' + -overlap.x + ', ' + -overlap.y);
          this.cells[i].move(-overlap.x, -overlap.y);
        }
      }
    }).bind(this);

    this.get_overlap = (function(piece) {
      if (piece === this) {
        return null;
      }
      for (var i = 0; i < this.cells.length; i++) {
        var c1 = this.cells[i];
        for (var j = 0; j < piece.cells.length; j++) {
          var c2 = piece.cells[j];
          var c1_overlap = c1.get_overlap(c2);
          if (c1_overlap !== null) {
            return c1_overlap; 
          }
        }
      }
      return null;
    }).bind(this);

    this.update();
  }

  function Cell(x, y, width, fillColor, borderColor) {
    this.width = width;
    this.x = x * this.width;
    this.y = y * this.width;
    this.old_pos = {x: x, y: y};
    this.fillColor = fillColor;
    this.borderColor = borderColor;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;

    var self = this;

    this.mousedown = (function(mouseX, mouseY) {
      var left = this.x;
      var right = left + this.width;
      var top = this.y;
      var bottom = top + this.width;
      if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
        console.log('drag start ' + mouseX + ', ' + mouseY + ' this.x=' + this.x + ', this.y=' + this.y);
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
      this.old_pos = {x: this.x, y: this.y};
      this.x = this.x + distanceX;
      this.y = this.y + distanceY;
    }).bind(this);

    this.get_overlap = (function(cell) {
      var overlap = {x: null, y: null};
      //var overlap = cell;

      var corners = [
        {x: 1, y: 1}, // top-left
        {x: cell.width + 1, y: 1}, // top-right
        {x: 1, y: cell.width - 1}, // bottom-left
        {x: cell.width - 1, y: cell.width - 1} // bottom-right
      ];

      var int1 = get_line_intersection(cell.x + 1, cell.y + 1, cell.old_pos.x + 1, cell.old_pos.y + 1,
         this.x, this.y + this.width, this.x + this.width, this.y + this.width);
      if (int1 !== null) {
        // top-left corner of cell intersected with bottom border of this
        overlap.x = int1.x;
        overlap.y = int1.y;
      }
      var int2 = get_line_intersection(cell.x + 1, cell.y + 1, cell.old_pos.x + 1, cell.old_pos.y + 1,
         this.x + this.width, this.y, this.x + this.width, this.y + this.width);
      if (int2 !== null) {
        // top-left corner of cell intersected with right border of this
        overlap.x = int2.x;
        overlap.y = int2.y;
      }
      var int3 = get_line_intersection(cell.x + cell.width - 1, cell.y + 1, cell.old_pos.x + cell.width - 1, cell.old_pos.y + 1,
         this.x, this.y, this.x, this.y + this.width);
      if (int3 !== null) {
        // top-right corner of cell intersected with left border of this
        overlap.x = int3.x - cell.width;
        overlap.y = int3.y;
      }
      var int4 = get_line_intersection(cell.x + cell.width - 1, cell.y + 1, cell.old_pos.x + cell.width - 1, cell.old_pos.y + 1,
         this.x, this.y + this.width, this.x + this.width, this.y + this.width);
      if (int4 !== null) {
        // top-right corner of cell intersected with bottom border of this
        overlap.x = int4.x - cell.width;
        overlap.y = int4.y;
      }
      var int5 = get_line_intersection(cell.x + 1, cell.y + cell.width - 1, cell.old_pos.x + 1, cell.old_pos.y + cell.width - 1,
         this.x, this.y, this.x + this.width, this.y);
      if (int5 !== null) {
        // bottom-left corner of cell intersected with top border of this
        overlap.x = int5.x;
        overlap.y = int5.y - cell.width;
      }
      var int6 = get_line_intersection(cell.x + 1, cell.y + cell.width - 1, cell.old_pos.x + 1, cell.old_pos.y + cell.width - 1,
         this.x + this.width, this.y, this.x + this.width, this.y + this.width);
      if (int6 !== null) {
        // bottom-left corner of cell intersected with right border of this
        overlap.x = int6.x;
        overlap.y = int6.y - cell.width;
      }
      var int7 = get_line_intersection(cell.x + cell.width - 1, cell.y + cell.width - 1, cell.old_pos.x + cell.width - 1, cell.old_pos.y + cell.width - 1,
         this.x, this.y, this.x, this.y + this.width);
      if (int7 !== null) {
        // bottom-right corner of cell intersected with left border of this
        overlap.x = int7.x - cell.width;
        overlap.y = int7.y - cell.width;
      }
      var int8 = get_line_intersection(cell.x + cell.width - 1, cell.y + cell.width - 1, cell.old_pos.x + cell.width - 1, cell.old_pos.y + cell.width - 1,
         this.x, this.y, this.x + this.width, this.y);
      if (int8 !== null) {
        // bottom-right corner of cell intersected with top border of this
        overlap.x = int8.x - cell.width;
        overlap.y = int8.y - cell.width;
      }

      if (overlap.x !== null && overlap.y !== null) {
        var ret = {x: overlap.x - cell.x, y: overlap.y - cell.y};
        ret.x = ret.x * -1;
        ret.y = ret.y * -1;
        return ret;
      }

      return null;

      /*var dx = cell.x - this.x;
      var dy = cell.y - this.y;
      if (dx >= 0 && dx < this.width && dy >= 0 && dy < this.width) {
        return {x: this.width - dx, y: this.width - dy}; 
      }
      if (dx < 0 && dx > -this.width && dy < 0 && dy > -this.width) {
        return {x: -dx, y: -dy}; 
      }*/
    }).bind(this);
  }
}
