window.bro = Bro()
window.girl = Girl()

dialog = null
 
Game.draw (canvas) ->
  canvas.fill "#fff"
  girl.draw(canvas)
  bro.draw(canvas)
  
  if dialog?.complete() && Game.keydown 'space'
    dialog = null
    if bro.bSpray() > 1 && dialog == null
      dialog = DialogBox(
        text: "Over 69,000!"
        textColor: "pink"
      )
  else
    dialog?.draw(canvas)

Game.update () ->
  bro.update()
  girl.update()
  dialog?.update()

Game.keydown 'space', ->
  if dialog == null
    dialog = DialogBox(
      text: "Hey baby. What are your deep V lvls?"
    )
  
  
