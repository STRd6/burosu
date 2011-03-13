Bro = (I) ->
  I ||= {}
  
  $.reverseMerge I,
    sprite: Sprite.fromPixieId 12256
    vDepth: 1
    bSpray: 1

  self = GameObject(I) 

