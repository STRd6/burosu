Bro = (I) ->
  I ||= {}
  
  $.reverseMerge I,
    sprite: Sprite.fromPixieId 12256 

  self = GameObject(I) 

