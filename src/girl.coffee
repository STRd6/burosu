Girl = (I) ->
  I ||= {}
  
  $.reverseMerge I,
    sprite: Sprite.fromPixieId 12259
    x: 50
    y: 50
    
  self = GameObject(I)