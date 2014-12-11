function init_canvas(id, bgcolor, fgcolor) {
  var canvas = document.getElementById(id);
  var context = canvas.getContext('2d');
  context.fillStyle = bgcolor;
  context.fillRect(0, 0, $(canvas).width(), $(canvas).height());
  context.fillStyle = fgcolor;
  context.strokeStyle = fgcolor;
  
  return context;
}
