function draw_three_branch_tree(context, params) {
  function deg_to_rad(deg) {
    return deg * Math.PI / 180.0;
  }

  function draw_line(point1, point2) {
    context.beginPath();
    context.moveTo(point1.x, point1.y);
    context.lineTo(point2.x, point2.y);
    context.stroke();
  }

  function get_next_point(point, theta, branch_length) {
    var rad = deg_to_rad(theta);
    var delta_x = Math.cos(rad) * branch_length;
    var delta_y = Math.sin(rad) * branch_length;

    return {
      x: point.x + delta_x,
      y: point.y + delta_y
    };
  }

  function draw_tree(point, branch_length, depth, start_angle) {
    if (depth <= 0) {
      return;
    }

    var angles = [start_angle - params.branch_angle, start_angle, start_angle + params.branch_angle];

    for (var i = 0; i < angles.length; i++) {
      var angle = angles[i];
      var point2 = get_next_point(point, angle, branch_length);

      draw_line(point, point2);

      draw_tree(point2, branch_length / 2.0, depth - 1, angle);
    }
  }
  
  draw_line(params.initial_point, {x: params.initial_point.x, y: params.initial_point.y + params.trunk_length});

  draw_tree(params.initial_point, params.trunk_length / 2, params.max_depth, params.start_angle);
}
