window.bro = Bro()
window.girl = Girl()

dialog = null
 
Game.draw (canvas) ->
  canvas.fill "#fff"
  girl.draw(canvas)
  bro.draw(canvas)
  
  if dialog?.complete() && Game.keydown 'space'
    dialog?.draw(canvas)

Game.update () ->
  bro.update()
  girl.update()
  dialog?.update()

Game.keydown 'space', ->
  dialog = DialogBox(
    text: "Hey baby. What are your deep V lvls?"
  )
  
  
