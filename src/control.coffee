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
  
  meleeAttack = (weapon, target) ->
    weapon.hit(target)
  
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
   
  Game.keydown 'space', ->
    weapon = I.player.weapon()
    position = I.player.position()
    
    if weapon
      for enemy in window.enemies
        if Point.distance(position, enemy.position()) < 30
          meleeAttack(weapon, enemy)
             
      for scene in window.scenery
        if Point.distance(position, scene.position()) < 30
          meleeAttack(weapon, scene)
          
      if (weapon.powerup)
        weapon.powerup()  
          
    for weapon in window.weapons
      I.player.pickUp weapon      
    
  Game.keydown 'shift', ->
    I.player.running(true)
  
  Game.keyup 'shift', ->
    I.player.running(false)
    
  Game.keydown 'z', ->
    if (I.player.weapon()) 
      I.player.throw()
      
  update: ->
    I.player.move(currentVelocity)