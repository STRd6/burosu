bro = Bro()
girl = Girl()
 
Game.draw (canvas) ->
  canvas.fill "#F00"
  bro.draw(canvas)
  girl.draw(canvas)
  dialog.draw(canvas)

Game.update () ->
  bro.update()
  girl.update()
  dialog.update()

Game.keydown 'space', ->
  dialog = DialogBox(
    text: "Hey baby. What are your deep V lvls?"
  )
