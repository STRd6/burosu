bro = Bro()
girl = Girl()
 
Game.draw (canvas) ->
  canvas.fill "#F00"
  bro.draw(canvas)
  girl.draw(canvas)

Game.update () ->
  bro.update()
  girl.update()

