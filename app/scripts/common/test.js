var section = $('.section');

$(window).scroll(function(){
  var scrollTop = -($(window).scrollTop());
  var speed = section.data('speed');
  var coords = "50%" + scrollTop / speed + "px";

  section.css('background-position', coords);
});