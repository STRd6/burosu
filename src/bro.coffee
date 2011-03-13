Bro = (I) ->
  I ||= {}
  
  $.reverseMerge I,
    speed: 4
    sprite: Sprite.fromPixieId 12256
    vDepth: 1
    bSpray: 1
    
  currentSpeed = I.speed

  stop = ->
    I.velocity = Point(0, 0)  
 
  self = GameObject(I) 

  self.bind 'step', ->
    if keydown.shift then currentSpeed = I.speed * 2 else currentSpeed = I.speed
  
    right = left = up = down = Point(0, 0)
  
    if keydown.right
      right = Point(currentSpeed, 0)
  
    if keydown.left
      left = Point(-currentSpeed, 0)
    
    if keydown.up
      up = Point(0, -currentSpeed)
    
    if keydown.down
      down = Point(0, currentSpeed)

    I.velocity = right.add(left).add(up).add(down)
            
    stop() unless keydown.right || keydown.left || keydown.up || keydown.down
  
  self  
