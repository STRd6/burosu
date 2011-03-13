function DialogBox(I) {
  I = I || {};
  
  $.reverseMerge(I, {
    backgroundColor: "#000",
    blinkRate: 8,
    cursor: true,
    cursorWidth: 10,
    height: 480,
    lineHeight: 16,
    paddingX: 24,
    paddingY: 24,
    text: "",
    textColor: "#080",
    width: 640,
    x: 0,
    y: 0
  });
  
  I.textWidth = I.width - 2*(I.paddingX);
  I.textHeight = I.height - 2*(I.paddingY);
  
  var blinkCount = 0;
  var cursorOn = true;
  
  var pageOffset = 0;
  var displayChars = 0;
  
  return {
    complete: function() {
      return displayChars >= I.text.length - 1;
    },
    
    draw: function(canvas) {
      //TODO: A lot of the logic in here should be moved into the
      // update method and pre-computed.
      var textStart = Point(I.paddingX, I.paddingY + I.lineHeight);
      
      canvas.withTransform(Matrix.translation(I.x, I.y), function() {
        canvas.fillColor(I.backgroundColor);
        canvas.fillRect(0, 0, I.width, I.height);
        
        canvas.fillColor(I.textColor);
        
        var pageCharCount = 0;
        var displayText = I.text.substr(pageOffset, displayChars);
        
        var piecesRemaining = displayText.split(' ');
        var lineWidth = 0;
        var line = 0;
        
        while(piecesRemaining.length > 0) {
          var currentLine = piecesRemaining.shift();
          
          while((canvas.measureText(currentLine) <= I.textWidth) && (piecesRemaining.length > 0)) {
            var proposedLine = currentLine + " " + piecesRemaining[0];
            
            if(canvas.measureText(proposedLine) <= I.textWidth) {
              piecesRemaining.shift();
              currentLine = proposedLine;
            } else {
              break;
                ;//NOOP
            }
          }
          
          pageCharCount += currentLine.length;
          
          canvas.fillText(currentLine, textStart.x, textStart.y + line * I.lineHeight);
          lineWidth = canvas.measureText(currentLine);
          
          if(line * I.lineHeight < I.textHeight) {
            line += 1;
          } else {
            pageOffset += pageCharCount + line;
            line = 0;
            pageCharCount = 0;
            displayChars = 0;
            break;
              ;
          }
        }
        
        if(cursorOn && I.cursor) {
          canvas.fillRect(textStart.x + lineWidth, textStart.y + (line - 2) *I.lineHeight, I.cursorWidth, I.lineHeight);
        }
      });
      
    },
    
    flush: function() {
      displayChars = I.text.length;
    },
    
    setText: function(text) {
      pageOffset = 0;
      displayChars = 0;
      I.text = text;
    },
    
    update: function() {
      displayChars += 1;
      blinkCount += 1;
      
      if(blinkCount >= I.blinkRate) {
        blinkCount = 0;
        cursorOn = !cursorOn;
      }
    }
  };
};
(function($) {
  /**
  * Bindable module
  * @name Bindable
  * @constructor
  */
  function Bindable() {
    
    var eventCallbacks = {};
    
    return {
      /**
      * The bind method adds a function as an event listener.
      *
      * @name bind
      * @methodOf Bindable#
      *
      * @param {String} event The event to listen to.
      * @param {Function} callback The function to be called when the specified event
      * is triggered.
      */
      bind: function(event, callback) {
        eventCallbacks[event] = eventCallbacks[event] || [];
        
        eventCallbacks[event].push(callback);
      },
      
      unbind: function(event, callback) {
        eventCallbacks[event] = eventCallbacks[event] || [];
        
        if(callback) {
          eventCallbacks.remove(callback);
        } else {
          eventCallbacks[event] = [];
        }
      },
      /**
      * The trigger method calls all listeners attached to the specified event.
      *
      * @name trigger
      * @methodOf Bindable#
      *
      * @param {String} event The event to trigger.
      */
      trigger: function(event) {
        var callbacks = eventCallbacks[event];
        
        if(callbacks && callbacks.length) {
          var self = this;
          $.each(callbacks, function(i, callback) {
            callback(self);
          });
        }
      },
    };
  }
  
  window.Bindable = Bindable;
}(jQuery));
;
var Bounded;
Bounded = function(I) {
  I || (I = {});
  return {
    bounds: function(xOffset, yOffset) {
      return {
        x: I.x + (xOffset || 0),
        y: I.y + (yOffset || 0),
        width: I.width,
        height: I.height
      };
    },
    centeredBounds: function() {
      return {
        x: I.x + I.width / 2,
        y: I.y + I.height / 2,
        xw: I.width / 2,
        yw: I.height / 2
      };
    },
    center: function() {
      return Point(I.x + I.width / 2, I.y + I.height / 2);
    }
  };
};;
function KeyHandler(I) {
  I = I || {};
  
  $.reverseMerge(I, {
    keydown: {},
    keyheld: {},
    keyup: {},
  });
  
  return {
    /**
    * @returns true if event should be passed on to other handlers.
    */
    keydown: function(key) {
      if(I.keydown[key]) {
        return I.keydown[key]();
      } else {
        return true;
      }
    },
    
    keyheld: function(key) {
      if(I.keyheld[key]) {
        return I.keyheld[key]();
      } else {
        return true;
      }
    },
    
    keyup: function(key) {
      if(I.keyup[key]) {
        return I.keyup[key]();
      } else {
        return true;
      }
    }
  };
};
var GameUtil;
GameUtil = {
  readImageData: function(data, callback) {
    var ctx, getPixelColor, img;
    getPixelColor = function(imageData, x, y) {
      var index;
      index = (x + y * imageData.width) * 4;
      return [imageData.data[index + 0], imageData.data[index + 1], imageData.data[index + 2]].invoke("toColorPart").join('');
    };
    ctx = document.createElement('canvas').getContext('2d');
    img = new Image();
    img.onload = function() {
      var colors, imageData;
      ctx.drawImage(img, 0, 0);
      imageData = ctx.getImageData(0, 0, img.width, img.height);
      colors = [];
      img.height.times(function(y) {
        return img.width.times(function(x) {
          return colors.push(getPixelColor(imageData, x, y));
        });
      });
      return callback({
        colors: colors,
        width: img.width,
        height: img.height
      });
    };
    return (img.src = data);
  }
};;
var SpeechBox;
SpeechBox = function(I) {
  var addLine, chars, counter, grad, line, self, stringLine, text;
  I || (I = {});
  $.reverseMerge(I, {
    backgroundColor: 'rgb(175, 175, 175)',
    strokeColor: '#000',
    strokeWidth: 5,
    textColor: 'rgb(0, 0, 0)',
    textDelay: 1,
    gradient: true,
    height: 50,
    padding: 15,
    width: 400,
    text: "This is a test blah blah blh blah This is a test blah blah blah blah This is a test blah blah blah blah This is a test blah blah blah blah",
    x: 50,
    y: 40
  });
  chars = I.text.split("");
  text = [[]];
  line = 1;
  addLine = function() {
    line++;
    return (text[line - 1] = []);
  };
  stringLine = function(line) {
    return text[line - 1].join("");
  };
  counter = 0;
  if (I.gradient) {
    grad = Game.canvas.createLinearGradient(0, 0, 0, 3 * I.height);
    grad.addColorStop(0, I.backgroundColor);
    grad.addColorStop(1, 'rgb(0, 0, 0)');
  }
  return (self = {
    draw: function(canvas) {
      if (I.gradient) {
        canvas.context().fillStyle = grad;
      } else {
        canvas.fillColor(I.backgroundColor);
      }
      canvas.strokeColor(I.strokeColor);
      canvas.fillRoundRect(I.x + I.strokeWidth / 2, I.y + I.strokeWidth / 2, I.width - I.strokeWidth, I.height, 20, I.strokeWidth);
      canvas.fillColor(I.textColor);
      return (line).times(function(i) {
        return canvas.fillText(stringLine(i + 1), I.x + I.padding, I.y + (15 * (i + 1)));
      });
    },
    update: function() {
      var currentChar;
      counter = (counter + 1) % I.textDelay;
      if (counter <= 0) {
        currentChar = chars.shift();
        text[line - 1].push(currentChar);
        return Game.canvas.measureText(stringLine(line)) > I.width - I.padding * 2 ? addLine() : null;
      }
    }
  });
};;
var Collidable;
Collidable = function(I) {
  I || (I = {});
  return {
    solid_collision: function(other) {
      if (other.solid && other.bounds) {
        if (Collision.rectangular(self, other)) {
          self.trigger('collision');
          return other.trigger('collision');
        }
      }
    }
  };
};;
var CellularAutomata;
CellularAutomata = function(I) {
  var currentState, get, neighbors, nextState, self;
  I || (I = {});
  $.reverseMerge(I, {
    cellUpdate: function(row, col, value, neighbors) {
      var neighborCounts;
      neighborCounts = neighbors.sum();
      return +((value + neighborCounts) >= 5);
    },
    initializeCell: function(row, col) {
      return rand() < 0.45;
    },
    outsideValue: function(row, col) {
      return 1;
    },
    width: 32,
    height: 32
  });
  currentState = [];
  nextState = [];
  get = function(row, col) {
    if (((0 <= row) && (row < I.height)) && ((0 <= col) && (col < I.width))) {
      return currentState[row][col];
    } else {
      return I.outsideValue(row, col);
    }
  };
  neighbors = function(row, col) {
    return [get(row - 1, col - 1), get(row - 1, col), get(row - 1, col + 1), get(row, col - 1), get(row, col + 1), get(row + 1, col - 1), get(row + 1, col), get(row + 1, col + 1)];
  };
  I.height.times(function(row) {
    currentState[row] = [];
    return I.width.times(function(col) {
      return (currentState[row][col] = I.initializeCell(row, col));
    });
  });
  self = {
    data: function() {
      return currentState;
    },
    get: function(row, col) {
      return currentState[row][col];
    },
    update: function(updateFn) {
      I.height.times(function(row) {
        return (nextState[row] = currentState[row].map(function(value, col) {
          return updateFn ? updateFn(row, col, value, neighbors(row, col)) : I.cellUpdate(row, col, value, neighbors(row, col));
        }));
      });
      currentState = nextState;
      return (nextState = []);
    }
  };
  return self;
};;
var Drawable;
/**
The Drawable module is used to provide a simple draw method to the including
object.

@name Drawable
@constructor
@param {Object} I Instance variables
*/
Drawable = function(I) {
  I || (I = {});
  return {
    /**
    Draw this object on the canvas. It uses the x and y instance attributes to position
    and the sprite instance attribute to determine what to draw.

    @name draw
    @methodOf Drawable#

    @param canvas
    */
    draw: function(canvas) {
      if (I.transform) {
        return canvas.withTransform(Matrix.translation(I.x + I.width / 2, I.y + I.height / 2).concat(I.transform).concat(Matrix.translation(-I.width / 2, -I.height / 2)), function(canvas) {
          if (I.sprite) {
            return I.sprite.draw(canvas, 0, 0);
          } else if (I.color) {
            canvas.fillColor(I.color);
            return canvas.fillRect(0, 0, I.width, I.height);
          }
        });
      } else {
        if (I.sprite) {
          return I.sprite.draw(canvas, I.x, I.y);
        } else if (I.color) {
          canvas.fillColor(I.color);
          return canvas.fillRect(I.x, I.y, I.width, I.height);
        }
      }
    }
  };
};;
(function($) {
  var specialKeys = {
    8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 
    19: "pause", 20: "capslock", 27: "esc", 32: "space", 
    33: "pageup", 34: "pagedown", 35: "end", 36: "home", 
    37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
    96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
    104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
    112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 
    118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 
    144: "numlock", 145: "scroll", 188: ",", 191: "/", 224: "meta"
  };
  
  $(function() {
    /**
    * @name Game
    */
    window.Game = (function () {
      var keydownListeners = {};
      var keyheldListeners = {};
      var keyupListeners = {};
      
      var prevKeysDown = {};
      var keysDown = {};
      var keysUp = {};
      
      var step = 0;
      var score = 0;
      
      var drawCallback = $.noop;
      
      var self = {
        draw: function(fn) {
          drawCallback = fn;
        },
        
        exec: function(command) {
          var result = '';

          try {
            result = eval(command);
          } catch(e) {
            result = e.message;
          }
          
          return result;
        },
        
        keydown: function(key, fn) {
          if(fn) {
            keydownListeners[key] = keydownListeners[key] || [];
            
            keydownListeners[key].push(fn);
          } else {
            return prevKeysDown[key];
          }
        },
        
        keyheld: function(key, fn) {
          keyheldListeners[key] = keyheldListeners[key] || [];
          
          keyheldListeners[key].push(fn);
        },
        
        keyup: function(key, fn) {
          keyupListeners[key] = keyupListeners[key] || [];
          
          keyupListeners[key].push(fn);
        },
        
        score: function(val) {
          if (val !== undefined) {
            score += val;      
            return self;
          } else {
            return score;
          }    
        },
        
        setFramerate: function(newValue) {
          self.stop();
          
          setInterval(function() {
            checkInputs();
            self.trigger('update');
          
            drawCallback(canvas);
          
            step += 1;
          }, 1000 / newValue);
        },        
        
        step: function() {
          return step;
        },
        
        stop: function() {
          clearInterval(loopInterval);
        },
        
        update: function(fn) {
          self.unbind('update');
          self.bind('update', fn);
        },
        
        width: App.width,
        height: App.height
      };
      
      $.extend(self, Bindable());
      
      function triggerListener(listener) {
        listener();
      }
      
      function checkInputs() {
        var listeners;
        
        $.each(keysDown, function(key, down) {
          listeners = null;
          if(prevKeysDown[key] && !keysUp[key]) {
            listeners = keyheldListeners[key];
          } else if(down || (keysUp[key] && !prevKeysDown[key])) {
            listeners = keydownListeners[key];
          }
          
          if(listeners) {
            listeners.each(triggerListener);
          }
        });
        
        $.each(keysUp, function(key, up) {
          listeners = null;
          listeners = keyupListeners[key];
          
          if(listeners) {
            listeners.each(triggerListener);
          }
        });
        
        prevKeysDown = {};
        $.each(keysDown, function(key, down) {
          if(down) {
            prevKeysDown[key] = true;
          }
        });
        keysUp = {};
      }
      
      var loopInterval = setInterval(function() {
        checkInputs();
        self.trigger('update');
        
        drawCallback(canvas);
        
        step += 1;
      }, 33.3333);
      
      function keyName(event) {
        return specialKeys[event.which] ||
          String.fromCharCode(event.which).toLowerCase();
      }
      
      $(document).bind("keydown", function(event) {
        keysDown[keyName(event)] = true;
        if(/textarea|select/i.test( event.target.nodeName ) || event.target.type === "text" || event.target.type === "password") {
          // Don't prevent default
        } else {
          event.preventDefault();
        }
      });
      
      $(document).bind("keyup", function(event) {
        keysDown[keyName(event)] = false;
        keysUp[keyName(event)] = true;
        if(/textarea|select/i.test( event.target.nodeName ) || event.target.type === "text" || event.target.type === "password") {
          // Don't prevent default
        } else {
          event.preventDefault();
        }
      });
      
      return self;
    }());
    
    var canvas = $("canvas").powerCanvas();
    
    canvas.font("bold 1em consolas, 'Courier New', 'andale mono', 'lucida console', monospace");
    
    Game.canvas = canvas;
  });
}(jQuery));


;
var Heavy;
Heavy = function(I) {
  I || (I = {});
  $.reverseMerge(I, {
    gravity: 0.2,
    maxSpeed: 5
  });
  return {
    before: {
      update: function() {
        return (I.velocity = I.velocity.add(Point(0, I.gravity)));
      }
    }
  };
};;
var DebugConsole;
DebugConsole = function() {
  var REPL, container, input, output, repl, runButton;
  REPL = function(input, output) {
    var print;
    print = function(message) {
      return output.append($("<li />", {
        text: message
      }));
    };
    return {
      run: function() {
        var code, result, source;
        source = input.val();
        try {
          code = CoffeeScript.compile(source, {
            bare: true
          });
          if (code.indexOf("var") === 0) {
            code = code.substring(code.indexOf("\n"));
          }
          result = eval(code);
          print(" => " + (result));
          return input.val('');
        } catch (error) {
          return error.stack ? print(error.stack) : print(error.toString());
        }
      }
    };
  };
  container = $("<div />", {
    "class": "console"
  });
  input = $("<textarea />");
  output = $("<ul />");
  runButton = $("<button />", {
    text: "Run"
  });
  repl = REPL(input, output);
  container.append(output).append(input).append(runButton);
  return $(function() {
    runButton.click(function() {
      return repl.run();
    });
    return $("body").append(container);
  });
};;
var Durable;
Durable = function(I) {
  $.reverseMerge(I, {
    duration: -1
  });
  return {
    before: {
      update: function() {
        return I.duration !== -1 && (I.age >= I.duration) ? (I.active = false) : null;
      }
    }
  };
};;
var Rotatable;
Rotatable = function(I) {
  I || (I = {});
  $.reverseMerge(I, {
    rotation: 0,
    rotationalVelocity: 0
  });
  return {
    before: {
      update: function() {
        return I.rotation += I.rotationalVelocity;
      }
    }
  };
};;
var Movable;
Movable = function(I) {
  $.reverseMerge(I, {
    acceleration: Point(0, 0),
    velocity: Point(0, 0)
  });
  return {
    before: {
      update: function() {
        var _ref, currentSpeed;
        I.velocity = I.velocity.add(I.acceleration);
        if (typeof (_ref = I.maxSpeed) !== "undefined" && _ref !== null) {
          currentSpeed = I.velocity.magnitude();
          if (currentSpeed > I.maxSpeed) {
            I.velocity = I.velocity.scale(I.maxSpeed / currentSpeed);
          }
        }
        I.x += I.velocity.x;
        return I.y += I.velocity.y;
      }
    }
  };
};;
(function() {
  function LoaderProxy() {
    return {
      draw: $.noop,
      fill: $.noop,
      frame: $.noop,
      update: $.noop,
      width: null,
      height: null
    };
  }
  
  function Sprite(image, sourceX, sourceY, width, height) {
    sourceX = sourceX || 0;
    sourceY = sourceY || 0;
    width = width || image.width;
    height = height || image.height;
    
    return {
      draw: function(canvas, x, y) {
        canvas.drawImage(
          image,
          sourceX,
          sourceY,
          width,
          height,
          x,
          y,
          width,
          height
        );
      },
      
      fill: function(canvas, x, y, width, height, repeat) {
        repeat = repeat || "repeat";
        var pattern = canvas.createPattern(image, repeat);
        canvas.fillColor(pattern);
        canvas.fillRect(x, y, width, height);
      },
      
      width: width,
      height: height
    };
  };
  
  Sprite.load = function(url, loadedCallback) {
    var img = new Image();
    var proxy = LoaderProxy();
    
    img.onload = function() {
      var tile = Sprite(this);
      
      $.extend(proxy, tile);
      
      if(loadedCallback) {
        loadedCallback(proxy);
      }
    };
    
    img.src = url;
    
    return proxy;
  };
 
  var pixieSpriteImagePath = "http://s3.amazonaws.com/images.pixie.strd6.com/sprites/";
  
  function fromPixieId(id, callback) {
    return Sprite.load(pixieSpriteImagePath + id + "/original.png", callback);
  };
  
  window.Sprite = function(name, callback) {
    var id = App.Sprites[name];
    if(id) {
      return fromPixieId(id, callback);
    } else {
      warn("Could not find sprite named: '" + name + "' in App.");
    }
  };
  window.Sprite.EMPTY = window.Sprite.NONE = LoaderProxy();
  window.Sprite.fromPixieId = fromPixieId;
  window.Sprite.fromURL = Sprite.load;
}());;
var Hittable;
Hittable = function(I, self) {
  I || (I = {});
  $.reverseMerge(I, {
    health: 25
  });
  return {
    hit: function() {
      I.health--;
      if (I.health < 0) {
        return self.destroy();
      }
    }
  };
};;
var Emitter;
Emitter = function(I) {
  var self;
  self = GameObject(I);
  return self.include(Emitterable);
};;
var GameObject;
GameObject = function(I) {
  var autobindEvents, defaultModules, modules, self;
  I || (I = {});
  $.reverseMerge(I, {
    age: 0,
    active: true,
    color: "#880",
    created: false,
    destroyed: false,
    spriteName: null,
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    solid: false,
    includedModules: [],
    excludedModules: []
  });
  if (I.spriteName) {
    I.sprite = Sprite(I.spriteName, function(sprite) {
      I.width = sprite.width;
      return (I.height = sprite.height);
    });
  }
  self = Core(I).extend({
    update: function() {
      I.age += 1;
      self.trigger('step');
      return I.active;
    },
    draw: $.noop,
    position: function() {
      return Point(I.x, I.y);
    },
    collides: function(bounds) {
      return Collision.rectangular(I, bounds);
    },
    destroy: function() {
      if (!(I.destroyed)) {
        self.trigger('destroy');
      }
      I.destroyed = true;
      return (I.active = false);
    }
  });
  defaultModules = [Bindable, Bounded, Drawable, Durable, Movable];
  modules = defaultModules.concat(I.includedModules.invoke('constantize'));
  modules = modules.without(I.excludedModules.invoke('constantize'));
  modules.each(function(Module) {
    return self.include(Module);
  });
  self.attrAccessor("solid");
  autobindEvents = ['create', 'destroy', 'step'];
  autobindEvents.each(function(eventName) {
    var event;
    return (event = I[eventName]) ? (typeof event === "function" ? self.bind(eventName, event) : self.bind(eventName, eval("(function(self) {" + (event) + "})"))) : null;
  });
  if (!(I.created)) {
    self.trigger('create');
  }
  I.created = true;
  $(document).bind('mousedown', function(event) {
    return ((I.x <= event.offsetX) && (event.offsetX <= I.x + I.width)) && ((I.y <= event.offsetY) && (event.offsetY <= I.y + I.height)) ? self.trigger('click') : null;
  });
  return self;
};;
(function() {
  var Map, fromPixieId;
  Map = function(data, entityCallback) {
    var loadEntities, spriteLookup, tileHeight, tileWidth;
    tileHeight = data.tileHeight;
    tileWidth = data.tileWidth;
    spriteLookup = {};
    data.tileset.each(function(tileData, i) {
      return (spriteLookup[i] = Sprite.fromURL(tileData.src));
    });
    loadEntities = function() {
      if (!(entityCallback)) {
        return null;
      }
      return data.layers.each(function(layer, layerIndex) {
        if (!(layer.name.match(/entities/i))) {
          return null;
        }
        return layer.tiles.each(function(row, y) {
          return row.each(function(tileIndex, x) {
            var entityData;
            if (spriteLookup[tileIndex]) {
              entityData = $.extend({
                layer: layerIndex,
                sprite: spriteLookup[tileIndex],
                tileIndex: tileIndex,
                x: x * tileWidth,
                y: y * tileHeight
              }, data.tileset[tileIndex] == null ? undefined : data.tileset[tileIndex].properties);
              return entityCallback(entityData);
            }
          });
        });
      });
    };
    loadEntities();
    return $.extend(data, {
      draw: function(canvas, x, y) {
        return canvas.withTransform(Matrix.translation(x, y), function() {
          return data.layers.each(function(layer) {
            if (layer.name.match(/entities/i)) {
              return null;
            }
            return layer.tiles.each(function(row, y) {
              return row.each(function(tileIndex, x) {
                var sprite;
                return (sprite = spriteLookup[tileIndex]) ? sprite.draw(canvas, x * tileWidth, y * tileHeight) : null;
              });
            });
          });
        });
      }
    });
  };
  window.Tilemap = function(name, callback, entityCallback) {
    return fromPixieId(App.Tilemaps[name], callback, entityCallback);
  };
  fromPixieId = function(id, callback, entityCallback) {
    var proxy, url;
    url = ("http://pixie.strd6.com/s3/tilemaps/" + (id) + "/data.json");
    proxy = {
      draw: $.noop
    };
    $.getJSON(url, function(data) {
      $.extend(proxy, Map(data, entityCallback));
      return (typeof callback === "function" ? callback(proxy) : undefined);
    });
    return proxy;
  };
  window.Tilemap.fromPixieId = fromPixieId;
  return (window.Tilemap.load = function(options) {
    return options.pixieId ? fromPixieId(options.pixieId, options.complete, options.entity) : null;
  });
})();;
var Collision;
Collision = {
  rectangular: function(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  },
  rayRectangle: function(source, direction, target) {
    var areaPQ0, areaPQ1, hit, p0, p1, t, tX, tY, xval, xw, yval, yw;
    xw = target.xw;
    yw = target.yw;
    if (source.x < target.x) {
      xval = target.x - xw;
    } else {
      xval = target.x + xw;
    }
    if (source.y < target.y) {
      yval = target.y - yw;
    } else {
      yval = target.y + yw;
    }
    if (direction.x === 0) {
      p0 = Point(target.x - xw, yval);
      p1 = Point(target.x + xw, yval);
      t = (yval - source.y) / direction.y;
    } else if (direction.y === 0) {
      p0 = Point(xval, target.y - yw);
      p1 = Point(xval, target.y + yw);
      t = (xval - source.x) / direction.x;
    } else {
      tX = (xval - source.x) / direction.x;
      tY = (yval - source.y) / direction.y;
      if ((tX < tY || ((-xw < source.x - target.x) && (source.x - target.x < xw))) && !((-yw < source.y - target.y) && (source.y - target.y < yw))) {
        p0 = Point(target.x - xw, yval);
        p1 = Point(target.x + xw, yval);
        t = tY;
      } else {
        p0 = Point(xval, target.y - yw);
        p1 = Point(xval, target.y + yw);
        t = tX;
      }
    }
    if (t > 0) {
      areaPQ0 = direction.cross(p0.subtract(source));
      areaPQ1 = direction.cross(p1.subtract(source));
      return areaPQ0 * areaPQ1 < 0 ? (hit = direction.scale(t).add(source)) : null;
    }
  }
};;
(function() {
  var Animation, fromPixieId;
  Animation = function(data) {
    var activeAnimation, advanceFrame, currentSprite, spriteLookup;
    spriteLookup = {};
    activeAnimation = data.animations[0];
    currentSprite = data.animations[0].frames[0];
    advanceFrame = function(animation) {
      var frames;
      frames = animation.frames;
      return (currentSprite = frames[(frames.indexOf(currentSprite) + 1) % frames.length]);
    };
    data.tileset.each(function(spriteData, i) {
      return (spriteLookup[i] = Sprite.fromURL(spriteData.src));
    });
    return $.extend(data, {
      draw: function(canvas, x, y) {
        return canvas.withTransform(Matrix.translation(x, y), function() {
          return data.animations.each(function(animation) {
            return activeAnimation === animation ? spriteLookup[currentSprite].draw(canvas, 0, 0) : null;
          });
        });
      },
      update: function() {
        return advanceFrame(activeAnimation);
      },
      active: function(name) {
        if (name !== undefined) {
          return data.animations.each(function(animation) {
            if (name === animation.name) {
              currentSprite = animation.frames[0];
              return (activeAnimation = animation);
            }
          });
        } else {
          return activeAnimation;
        }
      }
    });
  };
  window.Animation = function(name, callback) {
    return fromPixieId(App.Animations[name], callback);
  };
  fromPixieId = function(id, callback) {
    var proxy, url;
    url = ("http://pixie.strd6.com/s3/animations/" + (id) + "/data.json");
    proxy = {
      active: $.noop,
      draw: $.noop
    };
    $.getJSON(url, function(data) {
      $.extend(proxy, Animation(data));
      return callback(proxy);
    });
    return proxy;
  };
  window.Animation.fromPixieId = fromPixieId;
  return (window.Animation.load = function(options) {
    return options.pixieId ? fromPixieId(options.pixieId, options.complete) : null;
  });
})();;
var Emitterable;
Emitterable = function(I, self) {
  var n, particles;
  I || (I = {});
  $.reverseMerge(I, {
    batchSize: 1,
    emissionRate: 1,
    color: "blue",
    width: 0,
    height: 0,
    generator: {},
    particleCount: Infinity,
    particleData: {
      acceleration: Point(0, 0.1),
      age: 0,
      color: "blue",
      duration: 30,
      height: 2,
      maxSpeed: 2,
      offset: Point(0, 0),
      sprite: false,
      spriteName: false,
      velocity: Point(-0.25, 1),
      width: 2
    }
  });
  particles = [];
  n = 0;
  return {
    before: {
      draw: function(canvas) {
        return particles.invoke("draw", canvas);
      },
      update: function() {
        I.batchSize.times(function() {
          var center, particleProperties;
          if (n < I.particleCount && rand() < I.emissionRate) {
            center = self.center();
            particleProperties = $.reverseMerge({
              x: center.x,
              y: center.y
            }, I.particleData);
            $.each(I.generator, function(key, value) {
              return I.generator[key].call ? (particleProperties[key] = I.generator[key](n, I)) : (particleProperties[key] = I.generator[key]);
            });
            particleProperties.x += particleProperties.offset.x;
            particleProperties.y += particleProperties.offset.y;
            particles.push(GameObject(particleProperties));
            return n += 1;
          }
        });
        particles = particles.select(function(particle) {
          return particle.update();
        });
        return n === I.particleCount && !particles.length ? (I.active = false) : null;
      }
    }
  };
};