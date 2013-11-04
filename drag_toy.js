function draw_drag_toy() {
  var $canvas = $("#drag_toy");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var chain = new DraggableChain([
    new Link(5, 100, 100, 'brown', 'black'),
    new Link(5, 150, 150, 'brown', 'black'),
    new Link(5, 200, 200, 'brown', 'black'),
    new Link(5, 250, 250, 'brown', 'black'),
  ]);

  chain.update();

  var mouseX = 0, mouseY = 0;
  var mousePressed = false;
  var ctrlPressed = false;

  $canvas.mousedown(function(e){
    mousePressed = true;
    ctrlPressed = e.ctrlKey;
    chain.update();
    if (ctrlPressed && !chain.dragging) {
      chain.new_link.x = e.offsetX;
      chain.new_link.y = e.offsetY;
      for (var i = 0; i < chain.new_link.neighbors.length; i++) {
        chain.new_link.neighbors[i].neighbors.push(chain.new_link);
      }
      chain.links.push(chain.new_link); 
      chain.set_new_link();
      chain.update();
    }
  }).mousemove(function(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    if (mousePressed) {
      chain.update();
    }
  }).mouseup(function(){
    mousePressed = false;
    chain.dragging = false;
    chain.update();
  });

  function draw_circle(radius, centerX, centerY, fillColor, strokeColor) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = strokeColor;
    context.stroke();
  }

  function Link(radius, x, y, fillColor, strokeColor) {
    var startX = 0, startY = 0;
    this.dragging = false;
    this.x = x;
    this.y = y;
    this.neighbors = [];
    this.moved = false;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;

    function update() {
      if (mousePressed) {
        var left = this.x - radius;
        var right = this.x + radius;
        var top = this.y - radius;
        var bottom = this.y + radius;
        if (!this.dragging) {
          // offset from center of circle where the mouse was clicked
          startX = mouseX - this.x;
          startY = mouseY - this.y;
        }
        if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
          if (ctrlPressed) {
            chain.new_link.neighbors = [this];
          }
          this.dragging = true;
        }
      } else {
        this.dragging = false;
      }

      if (this.dragging) {
        this.move_to_point(mouseX - startX, mouseY - startY);
      }

      for (var i = 0; i < this.neighbors.length; i++) {
        var neighbor = this.neighbors[i];
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(neighbor.x, neighbor.y);
        context.stroke();
      }
      draw_circle(radius, this.x, this.y, this.fillColor, this.strokeColor);
    }

    function move_to_point(x, y) {
      if (this.moved) {
        return;
      }

      var oldx = this.x;
      var oldy = this.y;
      this.x = x;
      this.y = y;
      this.moved = true;

      for (var i = 0; i < this.neighbors.length; i++) {
        var neighbor = this.neighbors[i];
        var adj = this.x - neighbor.x;
        var opp = this.y - neighbor.y;
        var hyp = Math.sqrt(Math.pow(oldx - neighbor.x, 2) + Math.pow(oldy - neighbor.y, 2));
        var theta = Math.atan2(opp, adj);
        var new_adj = Math.cos(theta) * hyp;
        var new_opp = Math.sin(theta) * hyp;
        /*neighbor.x = this.x - new_adj;
        neighbor.y = this.y - new_opp;*/

        neighbor.move_to_point(this.x - new_adj, this.y - new_opp);

      }

    }

    this.update = update.bind(this);
    this.move_to_point = move_to_point.bind(this);
  }

  function DraggableChain(links) {
    this.links = links;

    function set_new_link() {
      this.new_link = new Link(5, 0, 0, 'white', 'black');
    }

    for (var i = 0; i < links.length; i++) {
      if (i > 0) {
        links[i].neighbors.push(links[i - 1]);
      }
      if (i < links.length - 1) {
        links[i].neighbors.push(links[i + 1]);
      }
    }

    function update() {
      for (var i = 0; i < chain.links.length; i++) {
        chain.links[i].moved = false;
      }
      context.fillStyle = "gray";
      context.fillRect(0, 0, 500, 500);

      for (var i = 0; i < this.links.length; i++) {
        this.links[i].update();
        this.dragging = this.dragging || this.links[i].dragging;
      }
    }

    this.update = update.bind(this);
    this.set_new_link = set_new_link.bind(this);

    this.set_new_link();
  }
}
