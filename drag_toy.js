function draw_drag_toy() {
  var $canvas = $("#drag_toy");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  var chain = new DraggableChain([
    new Link(5, 100, 100, 'blue', '#000000'),
    new Link(5, 150, 150, 'red', '#000000'),
    new Link(5, 200, 200, 'green', '#000000'),
  ]);

  setInterval(function() {
    context.fillStyle = "gray";
    context.fillRect(0, 0, 500, 500);

    chain.update();
  }, 30);

  var mouseX = 0, mouseY = 0;
  var mousePressed = false;
  $canvas.mousemove(function(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
  })

  $(document).mousedown(function(){
    mousePressed = true;
  }).mouseup(function(){
    mousePressed = false;
  });

  function draw_circle(radius, centerX, centerY, fillColor, strokeColor) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = fillColor;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = strokeColor;
    context.stroke();
  }

  function Link(radius, x, y, fillColor, strokeColor) {
    var startX = 0, startY = 0;
    var dragging = false;
    this.x = x;
    this.y = y;
    this.neighbors = [];

    function update() {
      if (mousePressed) {
        var left = this.x - radius;
        var right = this.x + radius;
        var top = this.y - radius;
        var bottom = this.y + radius;
        if (!dragging) {
          // offset from center of circle where the mouse was clicked
          startX = mouseX - this.x;
          startY = mouseY - this.y;
        }
        if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
          dragging = true;
        }
      } else {
        dragging = false;
      }

      if (dragging) {
        var oldx = this.x;
        var oldy = this.y;
        this.x = mouseX - startX;
        this.y = mouseY - startY;

        for (var i = 0; i < this.neighbors.length; i++) {
          var neighbor = this.neighbors[i];
          var adj = this.x - neighbor.x;
          var opp = this.y - neighbor.y;
          var hyp = Math.sqrt(Math.pow(oldx - neighbor.x, 2) + Math.pow(oldy - neighbor.y, 2));
          var theta = Math.atan2(opp, adj);
          var new_adj = Math.cos(theta) * hyp;
          var new_opp = Math.sin(theta) * hyp;
          neighbor.x = this.x - new_adj;
          neighbor.y = this.y - new_opp;
        }
      }

      draw_circle(radius, this.x, this.y, fillColor, strokeColor);

    }
    this.update = update.bind(this);
  }

  function DraggableChain(circles) {
    this.circles = circles;

    for (var i = 0; i < circles.length; i++) {
      if (i > 0) {
        circles[i].neighbors.push(circles[i - 1]);
        //circles[i].left_neighbor = circles[i - 1];
      }
      if (i < circles.length - 1) {
        circles[i].neighbors.push(circles[i + 1]);
        //circles[i].right_neighbor = circles[i + 1];
      }
    }

    function update() {
      for (var i = 0; i < this.circles.length; i++) {
        var cur = this.circles[i];
        
        cur.update();

        if (i > 0) {
          var prev = this.circles[i - 1];
          context.beginPath();
          context.moveTo(prev.x, prev.y);
          context.lineTo(cur.x, cur.y);
          context.stroke();
        }
      }
    }

    this.update = update.bind(this);
  }
}
