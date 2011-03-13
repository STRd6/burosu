bro = Bro()
girl = Girl()

dialog = null
 
Game.draw (canvas) ->
  canvas.fill "#fff"
  bro.draw(canvas)
  girl.draw(canvas)
  dialog?.draw(canvas) unless dialog?.complete()

Game.update () ->
  bro.update()
  girl.update()
  dialog?.update()

Game.keydown 'space', ->
  dialog = DialogBox(
    text: "Hey baby. What are your deep V lvls?       "
  )
