window.bro = Bro()
window.girl = Girl()

dialog = null
 
Game.draw (canvas) ->
  canvas.fill "#fff"
  girl.draw(canvas)
  bro.draw(canvas)
  dialog?.draw(canvas) unless dialog?.complete()

Game.update () ->
  bro.update()
  girl.update()
  dialog?.update()

Game.keydown 'space', ->
  dialog = DialogBox(
    text: "Hey baby. What are your deep V lvls?"
  )
