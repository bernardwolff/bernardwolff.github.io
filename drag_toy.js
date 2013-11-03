function draw_drag_toy() {
  var $canvas = $("#drag_toy");
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  /*var draggable_segment1 =
    new DraggableSegment(new DraggableCircle(5, 200, 100, 'blue', '#000000'),
          new DraggableCircle(5, 200, 150, 'brown', '#000000'));*/

  var draggable_segment2 =
    new DraggableSegment(new DraggableCircle(5, 100, 100, 'blue', '#000000'),
          new DraggableCircle(5, 150, 150, 'brown', '#000000'));

  setInterval(function() {
    context.fillStyle = "gray";
    context.fillRect(0, 0, 500, 500);

    //draggable_segment1.update();
    draggable_segment2.update();
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

  function DraggableCircle(radius, x, y, fillColor, strokeColor) {
    var startX = 0, startY = 0;
    var drag = false;
    this.x = x;
    this.y = y;
    this.neighbors = [];

    function update() {
      if (mousePressed) {
        var left = this.x - radius;
        var right = this.x + radius;
        var top = this.y - radius;
        var bottom = this.y + radius;
        if (!drag) {
          startX = mouseX - this.x;
          startY = mouseY - this.y;
        }
        if (mouseX < right && mouseX > left && mouseY < bottom && mouseY > top){
          drag = true;
        }
      } else {
        drag = false;
      }

      if (drag) {
        var oldx = this.x;
        var oldy = this.y;
        this.x = mouseX - startX;
        this.y = mouseY - startY;

        //if (this.name == 'dc2')
        for (var i = 0; i < this.neighbors.length; i++) {
          var neighbor = this.neighbors[i];
          var adj = this.x - neighbor.x;
          var opp = this.y - neighbor.y;
          var hyp = Math.sqrt(Math.pow(oldx - neighbor.x, 2) + Math.pow(oldy - neighbor.y, 2));
          //var hyp = 140;
          //var theta = Math.atan(opp/adj);
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

  function DraggableSegment(dc1, dc2) {
    this.dc1 = dc1;
    this.dc2 = dc2;

    dc1.name = 'dc1';
    dc2.name = 'dc2';
    dc1.neighbors.push(dc2);
    dc2.neighbors.push(dc1);

    function update() {
      this.dc1.update();
      this.dc2.update();

      context.beginPath();
      context.moveTo(this.dc1.x, this.dc1.y);
      context.lineTo(this.dc2.x, this.dc2.y);
      context.stroke();
    }

    this.update = update.bind(this);
  }

  function DraggableChain(segments) {
    this.segments = segments;

  }
}
