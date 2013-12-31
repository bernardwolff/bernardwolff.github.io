function draw_rounded_rect(context, fillColor, borderColor, b, x, y, w, h, ne, se, sw, nw) {
    /*x = x + b/2;
    y = y + b/2;
    w = w - b;
    h = h - b;*/
    context.beginPath();
    context.moveTo(x+w/2,y);
    
    // ne corner
    context.lineTo(x + w - ne, y);
    context.arcTo(x + w, y, x + w, y + ne, ne);//corner,line end
    context.lineTo(x + w, y + h/2);
    
    // se corner
    context.lineTo(x+w, y+h/2+se);
    context.arcTo(x+w,y+h,x+w-se,y+h, se);
    context.lineTo(x+w/2,y+h);
    
    // sw corner
    context.lineTo(x+w/2-sw, y+h);
    context.arcTo(x,y+h,x,y+h/2-sw, sw);
    context.lineTo(x,y+h/2);
    
    // nw corner
    context.lineTo(x,y+h/2-nw);
    context.arcTo(x,y,x+nw,y,nw);
    context.lineTo(x+w/2,y);
    
    context.fillStyle = fillColor;
    context.fill();
    context.lineWidth = b;
    context.strokeStyle = borderColor;
    context.stroke();
}

function load_images(callback) {
  var images = {};
  var path = "puzzle";
  var extension = "png";
  var filenames = ['Black', 'Blue', 'Brown', 'Cyan', 'Gray', 'Green', 'Orange', 'Red'];
  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var num_images_loaded = 0;
    images[filename] = new Image();
    images[filename].onload = function() {
      num_images_loaded++;
      if (num_images_loaded >= filenames.length) {
        callback(images);
      }
    }
    images[filename].src = path + "/" + filename + '.' + extension;
  }
}
function draw_puzzle() {
  load_images(function(images) {
    render_puzzle(images);
  });
}
function render_puzzle(images) {
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
      // puzzle designs from http://puzzlebeast.com/slidingblock/index.html
      // Simplicity
      new Piece('teal', 'black', images["Cyan"], [
        new Cell(0, 1, null, null, 0, 0, 20, 20),
        new Cell(1, 1, null, null, 20, 20, 0, 0),
      ]),
      new Piece('yellow', 'black', images["Orange"], [
        new Cell(2, 0, null, null, 20, 0, 0, 20),
        new Cell(2, 1, null, null, 0, 0, 20, 0),
        new Cell(3, 1, null, null, 20, 20, 0, 0),
      ]),
      new Piece('green', 'black', images["Green"], [
        new Cell(1, 2, null, null, 20, 0, 0, 20),
        new Cell(1, 3, null, null, 0, 20, 20, 0),
      ]),
      new Piece('white', 'black', images['Red'], [
        new Cell(2, 2, 0, 0, 20, 0, 0, 20),
        new Cell(2, 3, 0, 1, 0, 0, 20, 0),
        new Cell(3, 3, 1, 1, 20, 20, 0, 0),
      ]),

      // Two Bits
      /*new Piece(null, null, images['Cyan'], [
        new Cell(0, 0)
      ]),
      new Piece(null, null, images['Brown'], [
        new Cell(1, 0)
      ]),
      new Piece(null, null, images['Orange'], [
        new Cell(2, 0),
        new Cell(3, 0),
        new Cell(2, 1)
      ]),
      new Piece(null, null, images['Red'], [
        new Cell(0, 1, 0, 0),
        new Cell(1, 1, 1, 0),
        new Cell(0, 2, 0, 1),
        new Cell(1, 2, 1, 1),
      ]),
      new Piece(null, null, images['Green'], [
        new Cell(3, 1),
        new Cell(3, 2),
        new Cell(3, 3),
      ]),*/
  ], puzzle_width, puzzle_height, 'gray');

  puzzle.update();

  function Puzzle(pieces, width, height, bgcolor) {
    this.pieces = pieces;
    this.width = width;
    this.height = height;
    this.background_color = bgcolor; 
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
        this.solved = this.active_piece.in_goal_location();
        this.set_active_piece(null);
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
    }).bind(this);
  }

  function Piece(fillColor, borderColor, cellImage, cells) {
    this.cells = cells;
    this.fillColor = fillColor;
    this.borderColor = borderColor;
    this.cellImage = cellImage;

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
      var has_moved = this.snap_into_place();
      if (!has_moved) {
        return;
      }
      if (this.puzzle.check_overlap(this)) {
        this.moveback();
        return;
      }

      this.save_last_pos();
      this.puzzle.moves++;
    }).bind(this);

    this.moveback = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].x = this.cells[i].last_x;
        this.cells[i].y = this.cells[i].last_y;
      }
    }).bind(this);

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
          if (c1.check_overlap(c2) /*|| c2.check_overlap(c1)*/) {
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
      var has_moved = false;
      for (var i = 0; i < this.cells.length; i++) {
        var rounded_coords = round_coords(this.cells[i].x, this.cells[i].y);
        has_moved = has_moved || rounded_coords.x != this.cells[i].last_x || rounded_coords.y != this.cells[i].last_y;
        this.cells[i].x = rounded_coords.x;
        this.cells[i].y = rounded_coords.y;
      }
      return has_moved;
    }).bind(this);

    this.save_last_pos = (function() {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].last_x = this.cells[i].x;
        this.cells[i].last_y = this.cells[i].y;
      }
    }).bind(this);

    this.in_goal_location = (function() {
      var ret = true;
      for (var i = 0; i < this.cells.length; i++) {
        ret = ret && this.cells[i].in_goal_location();
      }
      return ret;
    }).bind(this);

    this.update();
  }

  function Cell(x, y, goal_x, goal_y, ne, se, sw, nw) {
    this.width = cell_width;
    this.x = x * cell_width;
    this.y = y * cell_width;
    this.last_x = this.x;
    this.last_y = this.y;
    //this.fillColor = fillColor;
    //this.borderColor = borderColor;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.goal_x = goal_x * cell_width;
    this.goal_y = goal_y * cell_width;
    //this.image = image;

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
      if (this.piece.cellImage !== undefined && this.piece.cellImage !== null) {
        context.drawImage(this.piece.cellImage, this.x, this.y, this.width, this.width);
        return;
      }
      //context.fillStyle = this.fillColor;
      //context.fillRect(this.x, this.y, this.width, this.width);
      draw_rounded_rect(context, this.piece.fillColor, this.piece.borderColor, 2, this.x, this.y, this.width, this.width, ne, se, sw, nw);
    }).bind(this);

    this.move = (function(distanceX, distanceY) {
      this.x = this.x + distanceX;
      this.y = this.y + distanceY;
    }).bind(this);

    this.check_overlap = (function(cell) {
      var out_of_bounds = cell.x < 0 || cell.y < 0 || cell.x >= puzzle_width || cell.y >= puzzle_height; 
      if (out_of_bounds) {
        return true;
      }
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
    }).bind(this);
  }
}
