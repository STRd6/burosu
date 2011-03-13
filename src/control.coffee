Control = (I) ->
  I ||= {}

  $.reverseMerge I,
    player: null
  
  speed = 5
  
  speeds = {
    "up": Point(0, -speed)
    "down": Point(0, speed)
    "left": Point(-speed, 0)
    "right": Point(speed, 0)
  }
  
  currentVelocity = Point(0, 0)
  
  $.each(speeds, (key, value) ->
    Game.keydown key, ->
      currentVelocity = currentVelocity.add(value)
      currentVelocity.x = currentVelocity.x.clamp(-5, 5)
      currentVelocity.y = currentVelocity.y.clamp(-5, 5)
      
    Game.keyheld key, -> 
      currentVelocity = currentVelocity.add(value)
      currentVelocity.x = currentVelocity.x.clamp(-5, 5)
      currentVelocity.y = currentVelocity.y.clamp(-5, 5)
      
    Game.keyup key, -> 
      currentVelocity = Point(0, 0)
  )
      
  update: ->
    I.player.move(currentVelocity)