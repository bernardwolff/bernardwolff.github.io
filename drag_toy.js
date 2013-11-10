function draw_drag_toy() {
  var $canvas = $("#drag_toy");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var chain = new Chain([
    new Link(null, 5, 150, 50, 'red', 'black'),
    new Link(null, 5, 150, 100, 'purple', 'black'),
    new Link(null, 5, 150, 150, 'blue', 'black'),
    new Link(null, 5, 150, 200, 'green', 'black'),
    new Link(null, 5, 150, 250, 'yellow', 'black'),
  ]);

  var mousePressed = false;
  var ctrlPressed = false;

  $canvas.mousedown(function(e){
    mousePressed = true;
    ctrlPressed = e.ctrlKey;
    chain.mousedown(e.offsetX, e.offsetY);
  }).mousemove(function(e) {
    chain.mousemove(e.offsetX, e.offsetY);
    if (mousePressed) {
      chain.update();
    }
  }).mouseup(function(){
    mousePressed = false;
    chain.dragging = false;
    chain.mouseup();
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

  function Link(chain, radius, x, y, fillColor, strokeColor) {
    this.x = x;
    this.y = y;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.neighbors = [];
    this.moved = false;
    this.chain = chain;

    this.mousedown = (function(mouseX, mouseY) {
      var left = this.x - radius;
      var right = this.x + radius;
      var top = this.y - radius;
      var bottom = this.y + radius;
      if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
        if (ctrlPressed/* && !this.dragging*/) {
          this.chain.new_link.neighbors = [this];
          if (this.chain.last_new_link !== undefined) {
            this.neighbors.push(this.chain.last_new_link);
            this.chain.last_new_link.neighbors.push(this);
          }
        }
        //if (!chain.dragging) {
          //console.log('drag start (' + fillColor + ')');
          // offset from center of circle where the mouse was clicked
          this.startX = mouseX - this.x;
          this.startY = mouseY - this.y;
          this.dragging = true;
        //}
      }
    }).bind(this);

    this.mousemove = (function(mouseX, mouseY) {
      if (this.dragging) {
        //this.dragging = false;
        this.moved = false;
        //console.log('mouse moved, moving');
        this.move_to_point(mouseX - this.startX, mouseY - this.startY);
      }
    }).bind(this);

    this.mouseup = (function() {
      this.dragging = false;
    }).bind(this);

    this.update = (function() {
      for (var i = 0; i < this.neighbors.length; i++) {
        var neighbor = this.neighbors[i];
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(neighbor.x, neighbor.y);
        context.stroke();
      }
      draw_circle(radius, this.x, this.y, fillColor, this.strokeColor);
    }).bind(this);

    this.move_to_point = (function(x, y) {
      if (this.moved) {
        //console.log('alreaded moved (' + fillColor + ')');
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

        //console.log('moving a neighbor (' + fillColor + ')');
        neighbor.move_to_point(this.x - new_adj, this.y - new_opp);
      }
    }).bind(this);
  }

  function Chain(links) {
    this.links = links;
    for (var i = 0; i < this.links.length; i++) {
      this.links[i].chain = this;
    }

    this.set_new_link = (function() {
      var radius = 5, x = -1, y = -1, fill = 'white', stroke = 'black';
      this.new_link = new Link(this, radius, x, y, fill, stroke);
    }).bind(this);

    this.add_new_link = (function(x, y) {
      console.log('new link added at ' + x + ', ' + y);
      this.new_link.x = x;
      this.new_link.y = y;
      for (var i = 0; i < this.new_link.neighbors.length; i++) {
        this.new_link.neighbors[i].neighbors.push(this.new_link);
      }
      this.links.push(this.new_link); 
      this.last_new_link = this.new_link;
      this.update();
    }).bind(this);

    this.update = (function() {
      context.fillStyle = "gray";
      context.fillRect(0, 0, 500, 500);

      for (var i = 0; i < this.links.length; i++) {
        this.links[i].update();
        this.dragging = this.dragging || this.links[i].dragging;
      }
    }).bind(this);

    this.mousemove = (function(mouseX, mouseY) {
      for (var i = 0; i < this.links.length; i++) {
        this.links[i].moved = false;
      }
      for (var i = 0; i < links.length; i++) {
        links[i].mousemove(mouseX, mouseY);
      }
    }).bind(this);

    this.mousedown = (function(mouseX, mouseY) {
      for (var i = 0; i < links.length; i++) {
        links[i].mousedown(mouseX, mouseY);
      }
      this.update();
      if (ctrlPressed && !this.dragging) {
        chain.add_new_link(mouseX, mouseY);
        chain.set_new_link();
      }
      for (var i = 0; i < links.length; i++) {
        links[i].mousedown(mouseX, mouseY);
      }
    }).bind(this);

    this.mouseup = (function() {
      for (var i = 0; i < links.length; i++) {
        links[i].mouseup();
      }
    }).bind(this);

    this.set_neighbors = (function() {
    for (var i = 0; i < links.length; i++) {
      if (i > 0) {
        links[i].neighbors.push(links[i - 1]);
      }
      if (i < links.length - 1) {
        links[i].neighbors.push(links[i + 1]);
      }
    }}).bind(this);

    this.set_new_link();
    this.set_neighbors();
    this.update();
  }
}
