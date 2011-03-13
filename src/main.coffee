window.bro = Bro()
window.girl = Girl()

dialog = null
 
Game.draw (canvas) ->
  canvas.fill "#fff"
  girl.draw(canvas)
  bro.draw(canvas)
  
  if dialog?.complete() && Game.keydown 'space'
    log "got here"
    if bro.bSpray() > 1
      dialog = DialogBox(
        text: "Over 69,000!"
        text: "pink"
      )
    dialog = null
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
  
  
