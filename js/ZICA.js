
ZICA = {
	version:'0.1',
	author: 'Zeljko Ivanovic'
};

ZICA.boxIntersection = function (a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x) && (a.y < b.y + b.height && a.y + a.height > b.y);
};

/** 
 * Returns a new value which is clamped between low and high. 
 */
ZICA.clamp = function(n, low, high)
{
	if (n < low)
		return low;
		
	if (n > high)
		return high;
		
	return n;
}

ZICA.Keys = ["Left Mouse Button", "Right Mouse Button", "Escape", "Enter", "Tab", "Shift", "Control", "Space", "Left", "Up", "Right", "Down", "Delete", "App Menu Key", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

var State;(function (State) {State[State["stopped"] = 1] = "stopped";State[State["running"] = 2] = "running"; State[State["paused"] = 3] = "paused";})(State || (State = {}));
ZICA.State = State;

/**
ZICA.Vect2d, ZICA.Animator & ZICA.Action (and their extends) are modified classes from the copperlitch open source library
https://github.com/Sebmaster/copperlicht
https://www.ambiera.com/copperlicht/

CopperLicht License
Copyright © 2009-2020 Nikolaus Gebhardt

This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it subject to the following restrictions:

If you use this software in a product, an acknowledgment in the product documentation is necessary.
Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
This notice may not be removed or altered from any source distribution.
*/


// START OF THE mltext.js LIBRARY
// Library: mllib.js
// Desciption: Extends the CanvasRenderingContext2D that adds two functions: mlFillText and mlStrokeText.
//
// The prototypes are:
//
// function mlFillText(text,x,y,w,h,vAlign,hAlign,lineheight);
// function mlStrokeText(text,x,y,w,h,vAlign,hAlign,lineheight);
//
// Where vAlign can be: "top", "center" or "button"
// And hAlign can be: "left", "center", "right" or "justify"
// Author: Jordi Baylina. (baylina at uniclau.com)
// License: GPL
// Date: 2013-02-21

function mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, fn) {

    // The objective of this part of the code is to generate an array of words. 
    // There will be a special word called '\n' that indicates a separation of paragraphs.
    text = String(text);
	text = text.replace(/\r/g, '');
    var words = [];
    var inLines = text.split('\n');
    var i;
    for (i=0; i < inLines.length; i++)
    {
    	if (i) words.push('\n');
    	words = words.concat( inLines[i].split(' ') );
    }
    // words now contains the array.


    // Next objective is generate an array of lines where each line has a property 
    // called Words with all the words that fits in the line. Each word contains 2 fields:
    // .word for the actual word and .l for the length o the word.
    // If the line is the last line of a paragraps, the property EndOfParagraph will be true
    var sp = this.measureText(' ').width;
    var lines = [];
    var actualline = 0;
    var actualsize = 0;
    var wo;
    lines[actualline] = {};
    lines[actualline].Words = [];
    i = 0;
    while (i < words.length) {
        var word = words[i];
        if (word == "\n") {
            lines[actualline].EndParagraph = true;
            actualline++;
            actualsize = 0;
            lines[actualline] = {};
            lines[actualline].Words = [];
            i++;
        } else {
            wo = {};
            wo.l = this.measureText(word).width;
            if (actualsize === 0) {

                // If the word does not fit in one line, we split the word
                while (wo.l > w) {
                    word = word.slice(0, word.length - 1);
                    wo.l = this.measureText(word).width;
                }

                wo.word = word;
                lines[actualline].Words.push(wo);
                actualsize = wo.l;
                if (word != words[i]) {
                    // if a single letter does not fit in one line, just return without painting nothing.
                    if (word === "") return;
                    words[i] = words[i].slice(word.length, words[i].length);
                } else {
                    i++;
                }
            } else {
                if (actualsize + sp + wo.l > w) {
                    lines[actualline].EndParagraph = false;
                    actualline++;
                    actualsize = 0;
                    lines[actualline] = {};
                    lines[actualline].Words = [];
                } else {
                    wo.word = word;
                    lines[actualline].Words.push(wo);
                    actualsize += sp + wo.l;
                    i++;
                }
            }
        }
    }
    if (actualsize === 0) lines.pop(); // We remove the last line if we have not added any thing here.

    // The last line will be allways the last line of a paragraph even if it does not end with a  /n
    if(lines[actualline])
	lines[actualline].EndParagraph = true;


    // Now we remove any line that does not fit in the heigth.
    var totalH = lineheight * lines.length;
    while (totalH > h) {
        lines.pop();
        totalH = lineheight * lines.length;
    }

    // Now we calculete where we start draw the text.
    var yy;
    if (vAlign == "bottom") {
        yy = y + h - totalH + lineheight;
    } else if (vAlign == "center") {
        yy = y + h / 2 - totalH / 2 + lineheight;
    } else {
        yy = y + lineheight;
    }

    var oldTextAlign = this.textAlign;
    this.textAlign = "left"; // we will draw word by word.

	var maxWidth = 0;
    for (var li in lines) {
    	if (!lines.hasOwnProperty(li)) continue;
        var totallen = 0;
        var xx, usp;


        for (wo in lines[li].Words) {
            if (!lines[li].Words.hasOwnProperty(wo)) continue;
            totallen += lines[li].Words[wo].l;
        }
        // Here we calculate the x position and the distance betwen words in pixels 
        if (hAlign == "center") {
            usp = sp;
            xx = x + w / 2 - (totallen + sp * (lines[li].Words.length - 1)) / 2;
        } else if ((hAlign == "justify") && (!lines[li].EndParagraph)) {
            xx = x;
            usp = (w - totallen) / (lines[li].Words.length - 1);
        } else if (hAlign == "right") {
            xx = x + w - (totallen + sp * (lines[li].Words.length - 1));
            usp = sp;
        } else { // left
            xx = x;
            usp = sp;
        }
        for (wo in lines[li].Words) {
	    	if (!lines[li].Words.hasOwnProperty(wo)) continue;
            if (fn == "strokeText" || fn=="fillStrokeText") {
                this.strokeText(lines[li].Words[wo].word, xx, yy);
            }
            if (fn == "fillText" || fn=="fillStrokeText") {
                this.fillText(lines[li].Words[wo].word, xx, yy);
            }
            xx += lines[li].Words[wo].l + usp;
        }
        maxWidth = Math.max(maxWidth, xx);
        yy += lineheight;
    }
    this.textAlign = oldTextAlign;

    return {
    	width: maxWidth,
    	height: totalH,
    };
}

(function mlInit() {
    CanvasRenderingContext2D.prototype.mlFunction = mlFunction;

    CanvasRenderingContext2D.prototype.mlFillText = function (text, x, y, w, h, vAlign, hAlign, lineheight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, "fillText");
    };

    CanvasRenderingContext2D.prototype.mlStrokeText = function (text, x, y, w, h, vAlign, hAlign, lineheight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, "strokeText");
    };

    CanvasRenderingContext2D.prototype.mlFillStrokeText = function (text, x, y, w, h, vAlign, hAlign, lineheight) {
        return this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, "fillStrokeText");
    };

})();

// for touch devices
var touchToMouse = function(event) {
    if (event.touches.length > 1) return; //allow default multi-touch gestures to work
    var touch = event.changedTouches[0];
    var type = "";
    
    switch (event.type) {
    case "touchstart": 
        type = "mousedown"; break;
    case "touchmove":  
        type="mousemove";   break;
    case "touchend":   
        type="mouseup";     break;
    default: 
        return;
    }
    
    // https://developer.mozilla.org/en/DOM/event.initMouseEvent for API
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
            touch.screenX, touch.screenY, 
            touch.clientX, touch.clientY, false, 
            false, false, false, 0, null);
    
	//event.preventDefault();
    touch.target.dispatchEvent(simulatedEvent);
    
};
//document.ontouchstart = touchToMouse;
//document.ontouchmove = touchToMouse;
//document.ontouchend = touchToMouse;

/**
 * 2d vector class, used for example for texture coordinates.
 * @class 2d vector class, used for example for texture coordinates.
 * @constructor
 * @param {Number} x x coordinate. Can be null.
 * @param {Number} y y coordinate.
 */
ZICA.Vect2d = function(x, y)
{
	if (x == null)
	{
		this.X = 0;
		this.Y = 0;
	}
	else
	{
		this.X = x;
		this.Y = y;
	}
}

/**
 * X coordinate of the vector
 * @public
 * @type Number
 */
ZICA.Vect2d.prototype.X = 0;

/**
 * Y coordinate of the vector
 * @public
 * @type Number 
 */
ZICA.Vect2d.prototype.Y = 0;

/**
 * Sets all 2 coordinates to new values
 * @private
 */
ZICA.Vect2d.prototype.set = function(x,y)
{
	this.X = x;
	this.Y = y;
}

/**
 * Creates a copy of this vector and returns it
 * @public
 * @type Vect2d
 */
ZICA.Vect2d.prototype.clone = function()
{
	return new ZICA.Vect2d(this.X,this.Y);
}
ZICA.Vect2d.prototype.add = function(other)
{
	return new ZICA.Vect2d(this.X+other.X, this.Y+other.Y);
}

ZICA.Vect2d.prototype.multiplyWithVect = function(v)
{
	return new ZICA.Vect2d(this.X * v.X, this.Y * v.Y);
}
ZICA.Vect2d.prototype.multiplyWithScal = function(v)
{
	return new ZICA.Vect2d(this.X*v, this.Y*v);
}
ZICA.Vect2d.prototype.multiplyThisWithScal = function(v)
{
	this.X *= v;
	this.Y *= v;
}
ZICA.Vect2d.prototype.getLength = function()
{
	return Math.sqrt(this.X*this.X + this.Y*this.Y );
}
ZICA.Vect2d.prototype.setLength = function(n)
{
	var l = this.X*this.X + this.Y*this.Y;
	if (l > -0.0000001 && l < 0.0000001)
		return;
		
	l = n / Math.sqrt(l);
	this.X *= l;
	this.Y *= l;
}
ZICA.Vect2d.prototype.substract = function(other)
{
	return new ZICA.Vect2d(this.X-other.X, this.Y-other.Y);
}

ZICA.Vect2d.prototype.normalize = function()
{
	var l = this.X*this.X + this.Y*this.Y;
	if (l > -0.0000001 && l < 0.0000001)
		return;
		
	l = 1.0 / Math.sqrt(l);
	this.X *= l;
	this.Y *= l;
}
ZICA.Vect2d.prototype.addToThis = function(other)
{
	this.X += other.X;
	this.Y += other.Y;
}

ZICA.Vect2d.prototype.equals = function(other)
{
	return (this.X == other.X) && (this.Y == other.Y);
}

ZICA.Vect2d.prototype.equalsZero = function()
{
	return (this.X == 0) && (this.Y == 0);
}
ZICA.Vect2d.prototype.getDistanceTo = function(v)
{
	var x = v.X - this.X;
	var y = v.Y - this.Y;
	
	return Math.sqrt(x*x + y*y);
}

////////////////////////////////////////////////////////
///////ZICA.Animator
//////////////////////////////////////////////////////

ZICA.Animator = function()
{
	this.Type = -1;
}

/** 
 * Returns the type of the animator.
 * Usual values are 'none', 'camerafps', etc. See the concreate animator implementations for type strings.
 * @public
 */
ZICA.Animator.prototype.getType = function()
{
	return '';
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.Animator.prototype.animateNode = function(n, timeMs)
{
	return false;
}		

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseDown = function(event) 
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onClick = function(event) 
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseWheel = function(delta) 
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseUp = function(event) 
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseMove = function(event)
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseOut = function(event)
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * @public
 */
ZICA.Animator.prototype.onMouseOver = function(event)
{
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input.
 * Returns false if the event has not been processed.
 * @public
 */
ZICA.Animator.prototype.onKeyDown = function(event)
{
	return false;
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * Returns false if the event has not been processed.
 * @public
 */
ZICA.Animator.prototype.onKeyUp = function(event)
{
	return false;
}

/**
 * Event handler called by the engine so the animator can react to mouse and key input
 * Returns false if the event has not been processed.
 * @public
 */
ZICA.Animator.prototype.onKeyPress = function(event)
{
	return false;
}
/**
 * Event handler called by the engine so the animator can react when the entity was called by another entity
 * @public
 */
ZICA.Animator.prototype.onCollision = function(event)
{
}
/**
 * Resets the animator, if supported
 * @private
 */
ZICA.Animator.prototype.reset = function(event) 
{
}


/**
 * @private
 */
ZICA.Animator.prototype.findActionByType = function(type)
{
	return null;
}


/**
 * Creates an exact, deep copy of this animator
 * @public
 */
ZICA.Animator.prototype.createClone = function()
{
	return null;
}

/////////////////////////////////////////////////////
//AnimatorFlyCircle
/////////////////////////////////////////////////////

/**
 * Scene node animator making {@link ZICA.Entity}s move in a circle
 * @constructor
 * @public
 * @extends ZICA.Animator
 * @class Scene node animator making {@link ZICA.Entity}s move in a circle
 * @param {ZICA.Vect2d} center 2d position of the center of the circle
 * @param {Number} radius radius of the circle
 * @param {Number} speed movement speed, for example 0.1
 */
ZICA.AnimatorFlyCircle = function(obj)//center, radius, direction, speed)
{
	this.Center = obj.Center;
	this.Direction = obj.Direction;
	this.VecU = new ZICA.Vect2d();
	this.VecV = new ZICA.Vect2d();
	this.StartTime = Date.now();//ZICA.CLTimer.getTime();
	this.Speed = obj.Speed;
	this.Radius = obj.Radius;
	
}		
ZICA.AnimatorFlyCircle.prototype = new ZICA.Animator();

/** 
 * Returns the type of the animator.
 * For the AnimatorFlyCircle, this will return 'flycircle'.
 * @public
 */
ZICA.AnimatorFlyCircle.prototype.getType = function()
{
	return 'flycircle';
}

/** 
 * @private
 */
ZICA.AnimatorFlyCircle.prototype.createClone = function()
{
	var a = new ZICA.AnimatorFlyCircle({});
	a.Center = this.Center.clone();
	a.Direction = this.Direction;
	a.VecU = this.VecU.clone();
	a.VecV = this.VecV.clone();
	a.Speed = this.Speed;
	a.Radius = this.Radius;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorFlyCircle.prototype.animateNode = function(n, timeMs)
{
	var timeMs = Date.now();
	var diff = (timeMs-this.StartTime);

	if (diff != 0)
	{
		var t = diff * this.Speed;

		var newX  = this.Radius * Math.cos(t * (Math.PI/180));
		var newY = this.Radius * Math.sin(t * (Math.PI/180));
		
		// to place the square correctly we must add the calculated
		// new x and y values to the circle center
		var x = newX + this.Center.X - n.width/2;
		var y = newY + this.Center.Y - n.height/2;
		n.x = x;
		n.y = y;
	
		return true;
	}
	
	return false;
};

/////////////////////////////////////////////////////////////////////////////////////////
// Animator2DJumpNRun
/////////////////////////////////////////////////////////////////////////////////////////

ZICA.Animator2DJumpNRun = function(obj)
{
	this.ForwardKeyDown = false;
	this.BackKeyDown = false;
	this.PressedJump = false;
	this.LastTime = null;
	this.JumpForce = 0;
	this.JumpLengthMs = 1000;
	
	this.StandAnimation = '';
	this.WalkLeftAnimation = '';
	this.WalkRightAnimation = '';
	//this.JumpAnimation = '';
	
	this.Speed = obj.Speed;
	this.JumpSpeed = obj.JumpSpeed;
	this.JumpLengthMs = obj.JumpLengthMs;
	this.PauseAfterJump = obj.PauseAfterJump;
	
	this.StandAnimation = obj.StandAnimation;
	this.WalkLeftAnimation = obj.WalkLeftAnimation;
	this.WalkRightAnimation = obj.WalkRightAnimation;
	//this.JumpAnimation = obj.JumpAnimation;
	
};

ZICA.Animator2DJumpNRun.prototype = new ZICA.Animator();

/** 
 * Returns the type of the animator.
 * For the Animator2DJumpNRun, this will return '2djumpnrun'.
 * @private
 */
ZICA.Animator2DJumpNRun.prototype.getType = function()
{
	return '2djumpnrun';
};

/** 
 * @private
 */
ZICA.Animator2DJumpNRun.prototype.createClone = function()
{
	var a = new ZICA.Animator2DJumpNRun({});
	a.Speed = this.Speed;
	a.JumpSpeed = this.JumpSpeed;
	a.JumpLengthMs = this.JumpLengthMs;
	a.PauseAfterJump = this.PauseAfterJump;
	
	a.StandAnimation = this.StandAnimation;
	a.WalkLeftAnimation = this.WalkLeftAnimation;
	a.WalkRightAnimation = this.WalkRightAnimation;
	//a.JumpAnimation = this.JumpAnimation;
	
	return a;
};

ZICA.Animator2DJumpNRun.prototype.animateNode = function(node, timeMs)
{
	var timeMs = Date.now();
	var bFalling = false;
	// get the time since the last frame
	
	if (this.LastTime == null)
	{
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		this.InitPos = new ZICA.Vect2d(node.x,node.y);//ccbGetSceneNodeProperty(node, 'Position');
		this.InitRotation = node.angle;//ccbGetSceneNodeProperty(node, 'Rotation');
		return false;
	}
	
	this.LastNodeUsed = node;
	
	var delta = timeMs - this.LastTime;
	this.LastTime = timeMs;
	if (delta > 200) delta = 200;
	
	// move 
	
	var pos = new ZICA.Vect2d(node.x,node.y);//ccbGetSceneNodeProperty(node, 'Position');
	
	if (this.ForwardKeyDown)
	{
		pos.X += this.Speed * delta;
		node.animation = this.WalkRightAnimation;
		//node.angle = this.InitRotation;//ccbSetSceneNodeProperty(node, 'Rotation', this.InitRotation);
	}
	else
	if (this.BackKeyDown)
	{
		pos.X -= this.Speed * delta;
		node.animation = this.WalkLeftAnimation;
		//node.angle = this.InitRotation - 180;//ccbSetSceneNodeProperty(node, 'Rotation', this.InitRotation.x, this.InitRotation.y - 180, this.InitRotation.z);
	}
	else
	{
		// not walking, stand
		node.animation = this.StandAnimation;
	}
	
	var a = node.getAnimatorOfType('collisionresponse');
	if (a)bFalling = a.isFalling();
	
	var flag = true;
	if(this.PauseAfterJump && bFalling)flag = false
	
	// jump if jump was pressed
	
	if (this.PressedJump && this.JumpForce == 0 && flag)
	{
		this.PressedJump = false;
		this.JumpForce = this.JumpLengthMs;
	}
		
	if (this.JumpForce > 0)
	{
		pos.Y -= this.JumpSpeed * delta;
		this.JumpForce -= delta;
		
		if (this.JumpForce < 0) 
			this.JumpForce = 0;
	}
	
	
	// set position
	node.x = pos.X;
	node.y = pos.Y;
	return true;
};

/**
 * @private
 */
ZICA.Animator2DJumpNRun.prototype.onKeyDown = function(evt)
{
	return this.onKeyEvent(evt.keyCode, true);
};

/**
 * @private
 */
ZICA.Animator2DJumpNRun.prototype.onKeyUp = function(evt)
{
	return this.onKeyEvent(evt.keyCode, false);
};

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
ZICA.Animator2DJumpNRun.prototype.onKeyEvent = function(key, pressed)
{
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40

	if (key == 37 || key == 40)
		this.BackKeyDown = pressed;
	else	
	if (key == 39 || key == 38)
		this.ForwardKeyDown = pressed;
		
	// jump when space pressed
	
	if (key == 32 && pressed)
		this.PressedJump = true;
}


// mouseEvent: 0=mouse moved, 1=mouse wheel moved, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse down
ZICA.Animator2DJumpNRun.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{
	// we currently don't support move event. But for later use maybe.
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorTopDownMovement
/////////////////////////////////////////////////////////////////////////////////////////

ZICA.AnimatorTopDownMovement = function(obj)
{
	this.UpKeyDown = false;
	this.DownKeyDown = false;
	this.LeftKeyDown = false;
	this.RightKeyDown = false;
	
	//this.PressedJump = false;
	this.LastTime = null;
	//this.JumpForce = 0;
	//this.JumpLengthMs = 1000;
	
	this.StandAnimation = '';
	this.WalkLeftAnimation = '';
	this.WalkRightAnimation = '';
	this.WalkUpAnimation = '';
	this.WalkDownAnimation = '';
	//this.JumpAnimation = '';
	
	this.Speed = obj.Speed;
	/* this.JumpSpeed = obj.JumpSpeed;
	this.JumpLengthMs = obj.JumpLengthMs;
	this.PauseAfterJump = obj.PauseAfterJump; */
	
	this.StandAnimation = obj.StandAnimation;
	this.WalkLeftAnimation = obj.WalkLeftAnimation;
	this.WalkRightAnimation = obj.WalkRightAnimation;
	this.WalkUpAnimation = obj.WalkUpAnimation;
	this.WalkDownAnimation = obj.WalkDownAnimation;
	//this.JumpAnimation = obj.JumpAnimation;
	
};

ZICA.AnimatorTopDownMovement.prototype = new ZICA.Animator();

/** 
 * Returns the type of the animator.
 * For the AnimatorTopDownMovement, this will return 'topdownmovement'.
 * @private
 */
ZICA.AnimatorTopDownMovement.prototype.getType = function()
{
	return 'topdownmovement';
};

/** 
 * @private
 */
ZICA.AnimatorTopDownMovement.prototype.createClone = function()
{
	var a = new ZICA.AnimatorTopDownMovement({});
	a.Speed = this.Speed;
	/* a.JumpSpeed = this.JumpSpeed;
	a.JumpLengthMs = this.JumpLengthMs;
	a.PauseAfterJump = this.PauseAfterJump; */
	
	a.StandAnimation = this.StandAnimation;
	a.WalkLeftAnimation = this.WalkLeftAnimation;
	a.WalkRightAnimation = this.WalkRightAnimation;
	a.WalkUpAnimation = this.WalkUpAnimation;
	a.WalkDownAnimation = this.WalkDownAnimation;
	//a.JumpAnimation = this.JumpAnimation;
	
	return a;
};

ZICA.AnimatorTopDownMovement.prototype.animateNode = function(node, timeMs)
{
	var timeMs = Date.now();
	var bFalling = false;
	// get the time since the last frame
	
	if (this.LastTime == null)
	{
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		this.InitPos = new ZICA.Vect2d(node.x,node.y);
		return false;
	}
	
	this.LastNodeUsed = node;
	
	var delta = timeMs - this.LastTime;
	this.LastTime = timeMs;
	if (delta > 200) delta = 200;
	
	// move 
	
	var pos = new ZICA.Vect2d(node.x,node.y);
	
	if(this.RightKeyDown || this.LeftKeyDown || this.UpKeyDown || this.DownKeyDown)
	{	
		if (this.RightKeyDown)
		{
			pos.X += this.Speed * delta;
			node.animation = this.WalkRightAnimation;
		}
		if (this.LeftKeyDown)
		{
			pos.X -= this.Speed * delta;
			node.animation = this.WalkLeftAnimation;
		}
		if (this.DownKeyDown)
		{
			pos.Y += this.Speed * delta;
			node.animation = this.WalkDownAnimation;
		}
		if (this.UpKeyDown)
		{
			pos.Y -= this.Speed * delta;
			node.animation = this.WalkUpAnimation;
			
		}
	}
	else
	{
		// not walking, stand
		node.animation = this.StandAnimation;
	}
	
	/* var a = node.getAnimatorOfType('collisionresponse');
	if (a)bFalling = a.isFalling();
	
	var flag = true;
	if(this.PauseAfterJump && bFalling)flag = false
	
	// jump if jump was pressed
	
	if (this.PressedJump && this.JumpForce == 0 && flag)
	{
		this.PressedJump = false;
		this.JumpForce = this.JumpLengthMs;
	}
		
	if (this.JumpForce > 0)
	{
		pos.Y -= this.JumpSpeed * delta;
		this.JumpForce -= delta;
		
		if (this.JumpForce < 0) 
			this.JumpForce = 0;
	} */
	
	
	// set position
	node.x = pos.X;
	node.y = pos.Y;
	return true;
};

/**
 * @private
 */
ZICA.AnimatorTopDownMovement.prototype.onKeyDown = function(evt)
{
	return this.onKeyEvent(evt.keyCode, true);
};

/**
 * @private
 */
ZICA.AnimatorTopDownMovement.prototype.onKeyUp = function(evt)
{
	return this.onKeyEvent(evt.keyCode, false);
};

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
ZICA.AnimatorTopDownMovement.prototype.onKeyEvent = function(key, pressed)
{
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40
	
	if (key == 37 || key == 65)
		this.LeftKeyDown = pressed;
	if (key == 38 || key == 87)
		this.UpKeyDown = pressed;
	if (key == 39 || key == 68)
		this.RightKeyDown = pressed;
	if (key == 40 || key == 83)
		this.DownKeyDown = pressed;
	if (key == 37 || key == 40)
		this.BackKeyDown = pressed;
	
	// jump when space pressed
	
	//if (key == 32 && pressed)
	//	this.PressedJump = true;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Keyboard controlled animator
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorKeyboardControlled = function(obj)
{
	this.lastAnimTime = 0;
	//this.SMGr = scene;
	
	this.MoveSpeed = 0;
	this.RunSpeed = 0;
	this.RotateSpeed = 0;
	this.JumpSpeed = 0;
	this.PauseAfterJump = false;
	
	this.UseAcceleration = false;
	this.AccelerationSpeed = 0;
	this.DecelerationSpeed = 0;
	
	this.FollowSmoothingSpeed = 15;
	this.AdditionalRotationForLooking = 0; //new ZICA.Vect2d();
	
	this.StandAnimation = "";
	this.WalkAnimation = "";
	this.JumpAnimation = "";
	this.RunAnimation = "";

	this.LastAnimationTime = Date.now();//ZICA.CLTimer.getTime();	
	this.LastJumpTime = this.LastAnimationTime;
	this.WasMovingLastFrame = false;		
	this.ShiftIsDown = false;		
	
	this.Registered = false;
	
	this.leftKeyDown = false;
	this.rightKeyDown = false;
	this.upKeyDown = false;
	this.downKeyDown = false;
	this.jumpKeyDown = false;
	
	this.AcceleratedSpeed = 0;
	this.AccelerationIsForward = false;
	
	this.firstUpdate = true;
	this.DisableWithoutActiveCamera = false;
	
	
	this.MoveSpeed = obj.MoveSpeed;
	this.RunSpeed = obj.RunSpeed;
	this.RotateSpeed = obj.RotateSpeed;
	this.JumpSpeed = obj.JumpSpeed;
	
	this.UseAcceleration = obj.UseAcceleration;
	this.AccelerationSpeed = obj.AccelerationSpeed;
	this.DecelerationSpeed = obj.DecelerationSpeed;
	
	this.PauseAfterJump = obj.PauseAfterJump;
	
	this.StandAnimation = obj.StandAnimation;
	this.WalkAnimation = obj.WalkAnimation;
	this.JumpAnimation = obj.JumpAnimation;
	this.RunAnimation = obj.RunAnimation;
	
	this.AdditionalRotationForLooking = obj.AdditionalRotationForLooking;
	//this.Engine = engine;
	//engine.registerAnimatorForKeyUp(this);
	//engine.registerAnimatorForKeyDown(this);
}		
ZICA.AnimatorKeyboardControlled.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorTimer, this will return 'keyboardcontrolled'.
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.getType = function()
{
	return 'keyboardcontrolled';
}

/** 
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.createClone = function()
{
	var a = new ZICA.AnimatorKeyboardControlled({});
	a.MoveSpeed = this.MoveSpeed;
	a.RunSpeed = this.RunSpeed;
	a.RotateSpeed = this.RotateSpeed;
	a.JumpSpeed = this.JumpSpeed;				
	a.FollowSmoothingSpeed = this.FollowSmoothingSpeed;
	a.AdditionalRotationForLooking = this.AdditionalRotationForLooking;		
	a.StandAnimation = this.StandAnimation;
	a.WalkAnimation = this.WalkAnimation;
	a.JumpAnimation = this.JumpAnimation;
	a.RunAnimation = this.RunAnimation;
	a.UseAcceleration = this.UseAcceleration;
	a.AccelerationSpeed = this.AccelerationSpeed;
	a.DecelerationSpeed = this.DecelerationSpeed;
	a.DisableWithoutActiveCamera = this.DisableWithoutActiveCamera;
			
	return a;
}

/** 
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.setKeyBool = function(down, code)
{
	// 37 = left arrow key
	// 38 = up arrow key
	// 39 = right arrow key
	// 40 = down arrow key
	// 65 = a or A
	// 87 = w or W
	// 68 = d or D
	// 83 = s or S
	// 32 = space

	if (code == 37 || code == 65 )
	{
		this.leftKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.rightKeyDown = false;
		return true;
	}
		
	if (code == 39 || code == 68 )
	{
		this.rightKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.leftKeyDown = false;
		return true;
	}
		
	if (code == 38 || code == 87 )
	{
		this.upKeyDown = down;			
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.downKeyDown = false;
		return true;
	}
		
	if (code == 40 || code == 83 )
	{
		this.downKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.upKeyDown = false;
		return true;
	}
	
	if (code == 32)
	{
		// jump key
		this.jumpKeyDown = down;
		return true;
	}
	
	return false;
}

/**
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.onKeyDown = function(evt)
{
	this.ShiftIsDown = (evt.shiftKey == 1);
	return this.setKeyBool(true, evt.keyCode);
}

/**
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.onKeyUp = function(evt)
{
	this.ShiftIsDown = (evt.shiftKey == 1);
	return this.setKeyBool(false, evt.keyCode);
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.SceneNode} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorKeyboardControlled.prototype.animateNode = function(node, timeMs)
{
	var timeMs = Date.now();
	var timeDiff = timeMs - this.lastAnimTime;			
	if (timeDiff > 250)
		timeDiff = 250;
	
	this.lastAnimTime = timeMs;
		
	var bChanged = false;
		
	this.LastAnimationTime = timeMs;
	
	// disable if user wants disabled without active camera following the object we are controlling
	
	if (this.DisableWithoutActiveCamera)
	{
		var cam = node.scene.getActiveCamera();
		if (cam != null)
		{
			var an = cam.getAnimatorOfType('3rdpersoncamera');
			if (an != null)
			{
				if (!(an.NodeToFollow === node))
					return false;
			}
			else
				return false;
		}
	}

	// Update rotation

	//var currentRot = node.angle;	

	if (this.leftKeyDown)
	{
		node.angle -= timeDiff * this.RotateSpeed * 0.001;
		bChanged = true;
	}

	if (this.rightKeyDown)
	{
		node.angle += timeDiff * this.RotateSpeed * 0.001;
		bChanged = true;
	}

	// move forward/backward

	//var pos = node.Pos;

	/* var matrot = new ZICA.Matrix4();
	matrot.setRotationDegrees(currentRot);
	var directionForward = new ZICA.Vect3d(0,0,1);

	var matrot2 = new ZICA.Matrix4();
	matrot2.setRotationDegrees(this.AdditionalRotationForLooking);
	matrot = matrot.multiply(matrot2);

	matrot.rotateVect(directionForward); */
	var x = Math.cos((node.angle + this.AdditionalRotationForLooking)*Math.PI/180);
	var y = Math.sin((node.angle + this.AdditionalRotationForLooking)*Math.PI/180);
	
	var directionForward = new ZICA.Vect2d(x,y);

	var bRun = this.ShiftIsDown;
	var speed = (bRun ? this.RunSpeed : this.MoveSpeed) * timeDiff;
	var origSpeed = 0;
			
	var bBackward = this.downKeyDown;
	var bForward = this.upKeyDown;
	
	if (this.UseAcceleration && timeDiff)
	{
		if (bForward || bBackward)
		{
			// accelerate normally 

			if (this.AccelerationIsForward != bForward)
			{
				// user change direction.
				if (this.DecelerationSpeed == 0)
					this.AcceleratedSpeed *= -1.0; //  We need to invert the force so he has to work against it
				else
					this.AcceleratedSpeed = 0.0; // no deceleration, stop immediately
			}

			this.AccelerationIsForward = !bBackward;

			origSpeed = speed / timeDiff;
			this.AcceleratedSpeed += (this.AccelerationSpeed) * origSpeed * (timeDiff / 1000.0);
			if (this.AcceleratedSpeed > origSpeed) this.AcceleratedSpeed = origSpeed;

			speed = this.AcceleratedSpeed * timeDiff;
		}
		else
		{
			// no key pressed, decellerate

			if (this.DecelerationSpeed == 0.0)
				this.AcceleratedSpeed = 0;
			else
			{
				origSpeed = speed / Number(timeDiff);
				this.AcceleratedSpeed -= (this.DecelerationSpeed) * origSpeed * (timeDiff / 1000.0);
				if (this.AcceleratedSpeed < 0) this.AcceleratedSpeed = 0;
				speed = this.AcceleratedSpeed * timeDiff;
			}
		}
	}

	directionForward.setLength(speed);

	if (bForward || bBackward || (this.UseAcceleration && this.AcceleratedSpeed != 0))
	{
		var moveVect = directionForward.clone();

		if (bBackward || (!(bForward || bBackward) && !this.AccelerationIsForward))
			moveVect.multiplyThisWithScal(-1.0);
		
		var pos = new ZICA.Vect2d(node.x,node.y);
		pos.addToThis(moveVect);
		node.x = pos.X;
		node.y = pos.Y
		//node.Pos.addToThis(moveVect);
		
		bChanged = true;
		this.WasMovingLastFrame = true;
	}
	
	if (bForward || bBackward)
	{
		this.setAnimation(node, bRun ? 3 : 1, bBackward);

		this.WasMovingLastFrame = true;
		bChanged = true;
	}
	else
	{
		// no key pressed
		
		// stand animation, only if not falling

		var bFalling = false;

		var a = node.getAnimatorOfType('collisionresponse');
		if (a)
			bFalling = a.isFalling();
		
		if (!bFalling && (this.hasAnimationType(node, 1) || this.hasAnimationType(node, 3) || this.hasAnimationType(node, 2)))
			this.setAnimation(node, 0, false);
	}

	// jump

	// For jumping, we find the collision response animator attached to our camera
	// and if it's not falling, we tell it to jump.
	if (this.jumpKeyDown)
	{
		var b = node.getAnimatorOfType('collisionresponse');
		if (b && !b.isFalling())
		{
			var minJumpTime = 0;
			if (Game.scene.gravity != 0)
				minJumpTime = Math.floor((this.JumpSpeed * (1.0 / Game.scene.gravity)) * 2000);

			if (!this.PauseAfterJump ||
				(this.PauseAfterJump && (timeMs - this.LastJumpTime) > minJumpTime))
			{
				b.jump(this.JumpSpeed);
				this.setAnimation(node, 2, false);

				this.LastJumpTime = timeMs;
				
				bChanged = true;
			}
		}
	}
	
	return bChanged;
}

/**
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.getAnimationNameFromType = function(n)
{
	switch(n)
	{
	case 0: return this.StandAnimation;
	case 1:  return this.WalkAnimation;
	case 2:  return this.JumpAnimation;
	case 3:  return this.RunAnimation;
	}

	return "";
}

/** 
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.hasAnimationType = function(node, animationType)
{
	return this.setAnimation(node, animationType, false, true);
}

/** 
 * @private
 */
ZICA.AnimatorKeyboardControlled.prototype.setAnimation = function(node, animationType, breverse, testIfIsSetOnly)
{
	if(testIfIsSetOnly){
		if(node.animation == this.getAnimationNameFromType(animationType));
		return true;
	}
	
	node.animation = this.getAnimationNameFromType(animationType);
	return true;
	
	if (!node || node.getType() != 'animatedmesh')
		return false;

	// find mesh and node type

	var animatedMesh = node;
			
	var skinnedmesh = animatedMesh.Mesh; // as SkinnedMesh;
	if (!skinnedmesh)
		return false;

	// find range for animation
	
	var range = skinnedmesh.getNamedAnimationRangeByName(this.getAnimationNameFromType(animationType));
		
	if (range)
	{
		var wantedFPS = 1.0 * range.FPS;
		if (breverse)
			wantedFPS *= -1.0;
			
		if (testIfIsSetOnly)
		{
			return animatedMesh.EndFrame == range.End &&
			       animatedMesh.StartFrame == range.Begin;
		}
			
		if (!(animatedMesh.EndFrame == range.End &&
			 animatedMesh.StartFrame == range.Begin &&
			 ZICA.equals(animatedMesh.FramesPerSecond, wantedFPS)))
		{			
			animatedMesh.setFrameLoop(range.Begin, range.End);
			if (wantedFPS)
				animatedMesh.setAnimationSpeed(wantedFPS);
				
			animatedMesh.setLoopMode(animationType == 0 || animationType == 1  || animationType == 3);
		}
			
		return false;
	}
	else
	{
		// note: temporary bug fix. The flash animation player is
		// not able to stop an animation at (0,0), so we stop at (1,1)
		if (!testIfIsSetOnly)
		{
			animatedMesh.setFrameLoop(1, 1);
			animatedMesh.setLoopMode(false);
		}
	}

	return false;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Game AI Animator
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorGameAI = function(obj)
{
	// constants for the commands (from coppercube editor):
	// private static const EMT_PLAYER:int = 0;
	// private static const EMT_STAND_STILL:int = 1;
	// private static const EMT_RANDOMLY_PATROL:int = 2;
	
	// private static const EMT_DO_NOTHING:int = 0;
	// private static const EMT_REACH_POSITION:int = 1;
	// private static const EMT_ATTACK_ITEM:int = 2;
	// private static const EMT_DIE_AND_STOP:int = 3;
	
	// private static const EAT_STAND:int = 0;
	// private static const EAT_WALK:int = 1;
	// private static const EAT_ATTACK:int = 2;
	// private static const EAT_DIE:int = 3;
		
	this.AIType = 0
	this.MovementSpeed = 0;
	this.ActivationRadius = 0;
	this.CanFly = false;
	this.Health = 100;
	this.PatrolWaitTimeMs = 3000;
	this.PathIdToFollow = -1;
	this.Tags = "";
	this.AttacksAIWithTags = "";
	this.PatrolRadius = 100;
	this.RotationSpeedMs = 0;
	this.AdditionalRotationForLooking = -90;//new ZICA.Vect3d();
	this.RotationForLooking = false;
	this.StandAnimation = "";
	this.WalkAnimation = "";
	this.DieAnimation = "";
	this.AttackAnimation = "";
	
	this.ActionHandlerOnAttack = null;
	this.ActionHandlerOnActivate = null;
	this.ActionHandlerOnHit = null;
	this.ActionHandlerOnDie = null;
	
	// runtime data
	
	this.CurrentCommand = 0;

	this.NextAttackTargetScanTime = 0;
	this.LastPatrolStartTime = 0;

	this.CurrentCommandTargetPos = null;
	this.CurrentCommandStartTime = 0;
	this.CurrentCommandTicksDone = 0;
	this.CurrentCommandExpectedTickCount = 0;
	this.BeginPositionWhenStartingCurrentCommand = 0;	
	this.HandleCurrentCommandTargetNode = null;
	this.AttackCommandExecuted = false;
	this.Activated = false;
	this.CurrentlyShooting = false; // flag to be queried shoot action
	this.CurrentlyShootingLine = new Object();//ZICA.Line3d(); // data to be queried shoot action
	this.NextPathPointToGoTo = 0;
			
	this.TheObject = null;
	this.LastTime = 0;
	this.StartPositionOfActor = new ZICA.Vect2d();
	
	this.NearestSceneNodeFromAIAnimator_NodeOut = null;
	this.NearestSceneNodeFromAIAnimator_maxDistance = 0;
	
	this.AIType = ['This is the Player','Stand Still','Randomly Patrol'].indexOf(obj.Mode);
	
	this.PatrolRadius = obj.PatrolRadius;
	this.PatrolWaitTimeMs = obj.PatrolWaitTimeMs;
	
	this.PathIdToFollow = obj.PathIdToFollow;
	
	this.Health = obj.Health;
	this.MovementSpeed = obj.MovementSpeed;
	this.Tags = obj.Tags;
	this.AttacksAIWithTags = obj.AttacksActorsWithTags;
	this.CanFly = obj.CanFly;
	this.ActivationRadius = obj.ActivationRadius;
	
	this.StandAnimation = obj.StandAnimation;
	this.WalkAnimation = obj.WalkAnimation;
	this.DieAnimation = obj.DieAnimation;
	this.AttackAnimation = obj.AttackAnimation;
	
	this.ActionHandlerOnAttack = obj.ActionOnAttack;
	this.ActionHandlerOnActivate = obj.ActionOnActivate;
	this.ActionHandlerOnHit = obj.ActionOnHit;
	this.ActionHandlerOnDie = obj.ActionOnDie;
	
	this.AdditionalRotationForLooking = obj.AdditionalRotationForLooking;
	this.RotationForLooking = obj.RotationForLooking;

}		
ZICA.AnimatorGameAI.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorGameAI, this will return 'gameai'.
 * @private
 */
ZICA.AnimatorGameAI.prototype.getType = function()
{
	return 'gameai';
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.createClone = function()
{
	var a = new ZICA.AnimatorGameAI({});
	a.AIType = this.AIType;
	a.MovementSpeed = this.MovementSpeed;
	a.ActivationRadius = this.ActivationRadius;
	a.CanFly = this.CanFly;
	a.Health = this.Health;
	a.Tags = this.Tags;
	a.AttacksAIWithTags = this.AttacksAIWithTags;
	a.PatrolRadius = this.PatrolRadius;
	a.RotationSpeedMs = this.RotationSpeedMs;
	a.PathIdToFollow = this.PathIdToFollow;
	a.PatrolWaitTimeMs = this.PatrolWaitTimeMs;
	a.AdditionalRotationForLooking = this.AdditionalRotationForLooking;
	a.RotationForLooking = this.RotationForLooking;
	a.StandAnimation = this.StandAnimation;
	a.WalkAnimation = this.WalkAnimation;
	a.DieAnimation = this.DieAnimation;
	a.AttackAnimation = this.AttackAnimation;
	
	a.ActionHandlerOnAttack = this.ActionHandlerOnAttack ? this.ActionHandlerOnAttack.createClone() : null;
	a.ActionHandlerOnActivate = this.ActionHandlerOnActivate ? this.ActionHandlerOnActivate.createClone() : null;
	a.ActionHandlerOnHit = this.ActionHandlerOnHit ? this.ActionHandlerOnHit.createClone() : null;
	a.ActionHandlerOnDie = this.ActionHandlerOnDie ? this.ActionHandlerOnDie.createClone() : null;
			
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.SceneNode} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorGameAI.prototype.animateNode = function(node, timeMs)
{
	var timeMs = Date.now();
	
	if (node == null)
		return false;
		
	var diff = timeMs - this.LastTime;
	if (diff > 150) diff = 150;
	this.LastTime = timeMs;
	
	var characterSize = 0;			
	var changedNode = false;
	
	if (!(this.TheObject === node))
	{
		this.TheObject = node;
		this.StartPositionOfActor = new ZICA.Vect2d(node.x,node.y);//node.getAbsolutePosition();
	}
			
	var currentPos = new ZICA.Vect2d(node.x,node.y);// node.getAbsolutePosition();
	
	if (this.CurrentCommand == 3) //EMT_DIE_AND_STOP)
	{
		// do nothing
	}
	else
	if (this.CurrentCommand == 1) //EMT_REACH_POSITION)
	{
		// check if we reached the position

		characterSize = this.getCharacterWidth(node);
		if (this.CurrentCommandTargetPos.substract(currentPos).getLength() < characterSize)
		{
			// target reached.

			this.CurrentCommand = 0; //EMT_DO_NOTHING;
			this.setAnimation(node, 0); //EAT_STAND);
			changedNode = true;
		}
		else
		{
			// not reached position yet
			// check if we possibly hit a wall. This can be done easily by getting the moving speed and 
			// checking the start position and start time

			var cancelled = false;

			if (this.CurrentCommandTicksDone > 2)
			{
				var expectedLengthMoved = this.CurrentCommandTicksDone * (this.MovementSpeed / 1000.0);
				var lengthMoved = this.BeginPositionWhenStartingCurrentCommand.substract(currentPos).getLength();

				if ( lengthMoved * 1.2 < expectedLengthMoved )
				{
					// cancel movement, moved twice as long as we should have already.
					this.CurrentCommand = 0; //EMT_DO_NOTHING;
					this.setAnimation(node, 0); //EAT_STAND);
					cancelled = true;
				}
			}	

			if (!cancelled)
			{
				// move on to the position

				this.CurrentCommandTicksDone += diff;

				var movementVec = this.CurrentCommandTargetPos.substract(currentPos);
				movementVec.setLength((this.MovementSpeed / 1000.0) * diff);
				
				if (!this.CanFly)
					movementVec.Y = 0;

				//node.Pos.addToThis(movementVec); 
				
				node.x += movementVec.X;
				node.y += movementVec.Y;
			}

			// additionally, animate looking direction

			changedNode = this.animateRotation(node, (timeMs - this.CurrentCommandStartTime), 
				this.CurrentCommandTargetPos.substract(currentPos), this.RotationSpeedMs);
		}
	}
	else
	if (this.CurrentCommand == 2) //EMT_ATTACK_ITEM)
	{
		// attack enemy in the middle of the animation

		this.CurrentCommandTicksDone += diff;

		if (!this.AttackCommandExecuted && 
			this.CurrentCommandTicksDone > (this.CurrentCommandExpectedTickCount / 2))
		{
			// execute attack action

			this.CurrentlyShooting = true;
			
			if (this.ActionHandlerOnAttack)
				this.ActionHandlerOnAttack.execute(node);

			this.CurrentlyShooting = false;
			this.AttackCommandExecuted = true;
			changedNode = true;
		}

		if (this.CurrentCommandTicksDone > this.CurrentCommandExpectedTickCount)
		{
			// finished
			this.CurrentCommand = 0; //EMT_DO_NOTHING;
		}
		else
		{
			// rotate to attack target
			changedNode = this.animateRotation(node, (timeMs - this.CurrentCommandStartTime), 
				this.CurrentCommandTargetPos.substract(currentPos), 
				Math.min(this.RotationSpeedMs, this.CurrentCommandExpectedTickCount));
		}
	}
	else
	if (this.CurrentCommand == 0) //EMT_DO_NOTHING)
	{
		// see if we can check for the target

		// now do high level ai calculation here
		
		if (this.AIType == 1 || //EMT_STAND_STILL ||
			this.AIType == 2 ||  //EMT_RANDOMLY_PATROL) 
			this.AIType == 3 )
		{							
			var attackTargetNode = this.scanForAttackTargetIfNeeded(timeMs, currentPos);
			
			
			if (attackTargetNode != null)
			{	
				// found an attack target
				var weaponDistance = this.getAttackDistanceFromWeapon();

				if (!this.Activated && this.ActionHandlerOnActivate)
					this.ActionHandlerOnActivate.execute(node);
				this.Activated = true;
				changedNode = true;
				
				var pos = new ZICA.Vect2d(attackTargetNode.x,attackTargetNode.y);
				if (pos.getDistanceTo(currentPos) < weaponDistance)
				{
					// attack target is in distance to be attacked by our weapon. Attack now, but
					// first check if there is a wall between us.
					if (this.isNodeVisibleFromNode(attackTargetNode, node))
					{
						// attack target is visible, attack now
						this.CurrentlyShootingLine.Start = new ZICA.Vect2d(node.getCenter().x,node.getCenter().y);
						this.CurrentlyShootingLine.End = new ZICA.Vect2d(attackTargetNode.getCenter().x,attackTargetNode.getCenter().y);
						
						this.attackTarget( node, attackTargetNode, new ZICA.Vect2d(attackTargetNode.x,attackTargetNode.y), currentPos, timeMs );
					}
					else
					{
						// attack target is not visible. move to it.
						this.moveToTarget( node, new ZICA.Vect2d(attackTargetNode.x,attackTargetNode.y), currentPos, timeMs );
					}
				}
				else
				{
					// attack target is not in distance to be attacked by the weapon. move to it.
					this.moveToTarget( node, new ZICA.Vect2d(attackTargetNode.x,attackTargetNode.y), currentPos, timeMs );
				}
			}
			else
			{
				// no attack target found. Do something idle, maybe patrol a bit.
				if ( this.AIType == 2 || this.AIType == 3) //EMT_RANDOMLY_PATROL or EMT_FOLLOW_PATH_ROUTE)
				{
					if (!this.LastPatrolStartTime || timeMs > this.LastPatrolStartTime + this.PatrolWaitTimeMs)
					{
						characterSize = this.getCharacterWidth(node);
						var newPos = null;
						
						if (this.AIType == 3)
						{
							// find next path point to go to
							/* var path = null;
							
							if (this.PathIdToFollow != -1 && this.TheSceneManager != null)
								path = this.TheSceneManager.getSceneNodeFromId(this.PathIdToFollow);
								
							if (path != null && path.getType() == 'path')
							{
								if (this.NextPathPointToGoTo >= path.getPathNodeCount())
									this.NextPathPointToGoTo = 0;
								
								newPos = path.getPathNodePosition(this.NextPathPointToGoTo);
							}
							
							++this.NextPathPointToGoTo; */
						}
						else
						{						
							// find random position to patrol to

							var walklen = this.PatrolRadius;
							this.LastPatrolStartTime = timeMs;
							newPos = new ZICA.Vect2d((Math.random() - 0.5) * walklen,(Math.random() - 0.5)* walklen);
							
							newPos.addToThis(this.StartPositionOfActor);

							if (!this.CanFly)
								newPos.Y = this.StartPositionOfActor.Y;
							
						}

						if (!(newPos.substract(currentPos).getLength() < characterSize))
						{
							// move to patrol target
							this.moveToTarget( node, newPos, currentPos, timeMs );
							changedNode = true;
						}
					}
				}
			}
		}
	}
	
	return changedNode;
}



/** 
 * returns if rotation changed, returns true/false
 * @private
 */ 
ZICA.AnimatorGameAI.prototype.animateRotation = function(node, timeSinceStartRotation, 
								 lookvector, rotationSpeedMs)
{
	if(!this.RotationForLooking)return false;
	
	if(node.type == 'entity'){
			
			//var interpol = Math.min(timeSinceStartRotation, rotationSpeedMs) / rotationSpeedMs;
			//interpol = ZICA.clamp(interpol, 0.0, 1.0);
			
			node.angle = (Math.atan2(lookvector.X, -lookvector.Y)*180/Math.PI);
			node.angle += this.AdditionalRotationForLooking;
	}
		
	return false;
	
	if (!node)
		return false;

	var isCamera = (node.getType() == 'camera');
	if (isCamera)
		return false;

	if (!this.CanFly)
		lookvector.Y = 0;
		
	var matrot = new ZICA.Matrix4();
	matrot.setRotationDegrees(lookvector.getHorizontalAngle());
	var matrot2 = new ZICA.Matrix4();
	matrot2.setRotationDegrees(this.AdditionalRotationForLooking);
	matrot = matrot.multiply(matrot2);

	// matrot now is the wanted rotation, now interpolate with the current rotation
	var wantedRot = matrot.getRotationDegrees();
	var currentRot = node.Rot.clone();					

	var interpol = Math.min(timeSinceStartRotation, rotationSpeedMs) / rotationSpeedMs;
	interpol = ZICA.clamp(interpol, 0.0, 1.0);

	//node->setRotation(wantedRot.getInterpolated(currentRot, interpol));

	wantedRot.multiplyThisWithScal( ZICA.DEGTORAD);
	currentRot.multiplyThisWithScal( ZICA.DEGTORAD);
	
	var q1 = new ZICA.Quaternion();
	q1.setFromEuler(wantedRot.X, wantedRot.Y, wantedRot.Z);
	
	var q2 = new ZICA.Quaternion();
	q2.setFromEuler(currentRot.X, currentRot.Y, currentRot.Z);
	
	q2.slerp(q2, q1, interpol);
	q2.toEuler(wantedRot);

	wantedRot.multiplyThisWithScal( ZICA.RADTODEG);
	
	if (node.Rot.equals(wantedRot))
		return false;
		
	node.Rot = wantedRot;
	return true;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.moveToTarget = function(node, target, currentPos, now)
{	
	this.CurrentCommand = 1; //EMT_REACH_POSITION;
	this.CurrentCommandTargetPos = target;
	this.CurrentCommandStartTime = now;
	this.BeginPositionWhenStartingCurrentCommand = currentPos;
	this.CurrentCommandTicksDone = 0;
	this.CurrentCommandExpectedTickCount = 0; // invalid for this command
	this.setAnimation(node, 1); //EAT_WALK);
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.attackTarget = function(node, targetnode, target, currentPos, now)
{
	this.CurrentCommand = 2; //EMT_ATTACK_ITEM;
	this.CurrentCommandTargetPos = target;
	this.CurrentCommandStartTime = now;
	this.HandleCurrentCommandTargetNode = targetnode;
	this.BeginPositionWhenStartingCurrentCommand = currentPos;
	this.CurrentCommandTicksDone = 0;
	this.CurrentCommandExpectedTickCount = 500; // seems to be a nice default value
	this.AttackCommandExecuted = false;

	var animDuration = this.setAnimation(node, 2);//EAT_ATTACK);

	if (animDuration != 0)
	{
		this.CurrentCommandExpectedTickCount = animDuration;
	}
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.aiCommandCancel = function(node)
{
	this.CurrentCommand = 0; //EMT_DO_NOTHING;
	this.setAnimation(node, 0); //EAT_STAND);
}


/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.die = function(node, currentPos, now)
{
	this.CurrentCommand = 3; //EMT_DIE_AND_STOP;
	this.CurrentCommandStartTime = now;
	this.BeginPositionWhenStartingCurrentCommand = currentPos;
	this.CurrentCommandTicksDone = 0;
	this.CurrentCommandExpectedTickCount = 500; // seems to be a nice default value

	var animDuration = this.setAnimation(node, 3); //EAT_DIE);
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.isNodeVisibleFromNode = function(node1, node2)
{
	if (!node1 || !node2)
		return false;

	// instead of checking the positions of the nodes, we use the centers of the boxes of the nodes
	
	var pos1 = node1.getCenter();
	var pos2 = node2.getCenter();
	
	// if this is a node with collision box enabled, move the test start position outside of the collision box (otherwise the test would collide with itself)

	if (this.TheObject == node2)
	{
		if (node2.type == 'entity')
		{
			if (node2.DoesCollision)
			{
				var extendLen = node2.width * 0.5;
				var vect = pos2.substract(pos1);
				vect.normalize();
				vect.multiplyThisWithScal( extendLen + (extendLen * 0.02));
				pos1.addToThis(vect);
			}
		}
	}

	return this.isPositionVisibleFromPosition(pos1, pos2);
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.isPositionVisibleFromPosition = function(pos1, pos2)
{
	//odje traba sudarnu tacku nac!!!
	/* if (this.World.getCollisionPointWithLine(pos1, pos2, true, null, true) != null)
	{
		return false;
	} */

	return true;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.getNearestSceneNodeFromAIAnimatorAndDistance = function(node, 
															  currentpos,
															  tag)
{
	if(node.type == 'scene')node.visible = true;//... 
	
	if (!node || !node.visible)
		return;
	
	// check if the node is in the max distance

	var isMatching = false;
	var dist = currentpos.getDistanceTo(new ZICA.Vect2d(node.x,node.y));	

	if (dist < this.NearestSceneNodeFromAIAnimator_maxDistance && node.type != 'scene')
	{
		// find ai animator in the node
	
		var ainode = node.getAnimatorOfType('gameai');

		if (ainode && tag != "" &&
			!(ainode === this) &&
			ainode.isAlive() )
		{
			// check if animator tags are the ones we need
			isMatching = ainode.Tags.indexOf(tag) != -1;
		}
	}

	if (isMatching)
	{
		this.NearestSceneNodeFromAIAnimator_maxDistance = dist;
		this.NearestSceneNodeFromAIAnimator_NodeOut = node;
	}

	// search children of the node
	if(node.children)
	for (var i = 0; i<node.children.length; ++i)
	{				
		var child = node.children[i];
		this.getNearestSceneNodeFromAIAnimatorAndDistance(child, currentpos, tag);
	}
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.scanForAttackTargetIfNeeded = function(timems, currentpos)
{
	if (this.ActivationRadius <= 0 || !this.TheObject || this.AttacksAIWithTags.length == 0)
		return null;

	if (!this.NextAttackTargetScanTime || timems > this.NextAttackTargetScanTime)
	{	
		
		this.NearestSceneNodeFromAIAnimator_maxDistance = this.ActivationRadius;
		this.NearestSceneNodeFromAIAnimator_NodeOut = null;
		
		this.getNearestSceneNodeFromAIAnimatorAndDistance(Game.scene,
													 currentpos, this.AttacksAIWithTags );

		this.NextAttackTargetScanTime = timems + 500 + (Math.random() * 1000);

		return this.NearestSceneNodeFromAIAnimator_NodeOut;	
	}

	return null;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.getAttackDistanceFromWeapon = function()
{
	var ret = 1000;

	if (this.ActionHandlerOnAttack)
	{
		var action = this.ActionHandlerOnAttack.findAction('Shoot');
		if (action)
			ret = action.WeaponRange;
	}

	return ret;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.getCharacterWidth = function(node)
{
	
	if (node != null)
		return 10;

	return node.width;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.getAnimationNameFromType = function(t)
{
	switch(t)
	{
	case 0: return this.StandAnimation;
	case 1: return this.WalkAnimation;
	case 2: return this.AttackAnimation;
	case 3: return this.DieAnimation;
	}

	return "";
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.setAnimation = function(node, animationType)
{
	if(node.animations)
	node.animation = this.getAnimationNameFromType(animationType);
	
	return true;
	
	if (!node || node.getType() != 'animatedmesh')
		return 0;

	// find mesh and node type

	var animatedMesh = node;
			
	var skinnedmesh = animatedMesh.Mesh; // as SkinnedMesh;
	if (!skinnedmesh)
		return 0;

	// find range for animation
	
	var range = skinnedmesh.getNamedAnimationRangeByName(this.getAnimationNameFromType(animationType));
		
	if (range)
	{
		animatedMesh.setFrameLoop(range.Begin, range.End);
		if (range.FPS != 0)
			animatedMesh.setAnimationSpeed(range.FPS);
		animatedMesh.setLoopMode(animationType == 1 || animationType == 0); //animationType == EAT_WALK || animationType == EAT_STAND);
		
		return (range.End - range.Begin) * range.FPS * 1000;
	}
	else
	{
		// note: temporary bug fix. The flash animation player is
		// not able to stop an animation at (0,0), so we stop at (1,1)
		animatedMesh.setFrameLoop(1, 1);
		animatedMesh.setLoopMode(false);
	}

	return 0;
}
	
/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.isCurrentlyShooting = function()
{
	return this.CurrentlyShooting;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.getCurrentlyShootingLine = function()
{
	return this.CurrentlyShootingLine;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.isAlive = function()
{
	return this.Health > 0;
}

/** 
 * @private
 */
ZICA.AnimatorGameAI.prototype.OnHit = function(damage, node)
{
	if (!node)
		return;

	if (this.Health == 0)
		return; // already dead

	this.Health -= damage;
	if (this.Health < 0)
		this.Health = 0;

	if (this.Health == 0)
	{
		if (this.ActionHandlerOnDie != null) 
			this.ActionHandlerOnDie.execute(node);

		this.die(node, new ZICA.Vect2d(node.x,node.y), 0);
	}
	else
	{
		if (this.ActionHandlerOnHit != null)
			this.ActionHandlerOnHit.execute(node);
	}
}		



/**
 * @private
 */
ZICA.AnimatorGameAI.prototype.findActionByType = function(type)
{
	var ret = null;
	
	if (this.ActionHandlerOnAttack)
	{
		ret = this.ActionHandlerOnAttack.findAction(type);
		if (ret)
			return ret;
	}
	
	if (this.ActionHandlerOnActivate)
	{
		ret = this.ActionHandlerOnActivate.findAction(type);
		if (ret)
			return ret;
	}
	
	if (this.ActionHandlerOnHit)
	{
		ret = this.ActionHandlerOnHit.findAction(type);
		if (ret)
			return ret;
	}
	
	if (this.ActionHandlerOnDie)
	{
		ret = this.ActionHandlerOnDie.findAction(type);
		if (ret)
			return ret;
	}
	
	return null;
}

/////////////////////////////////////////////////////
//AnimatorRotation
/////////////////////////////////////////////////////

/**
 * Scene node animator making {@link ZICA.Entity}s rotate
 * @constructor
 * @public
 * @extends ZICA.Animator
 * @class  Scene node animator making {@link ZICA.Entity}s rotate
 * @param speed {ZICA.Vect2d} vector defining the RotationSpeed in each direction
 */
ZICA.AnimatorRotation = function(obj)
{
		this.Rotation = obj.Speed;
		
	this.StartTime = Date.now();//ZICA.CLTimer.getTime();
	
	this.RotateToTargetAndStop = false; // for setRotateToTargetAndStop
	this.RotateToTargetEndTime = 0; // for setRotateToTargetAndStop
	this.BeginRotation = null; // for setRotateToTargetAndStop
}		
ZICA.AnimatorRotation.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorRotation, this will return 'rotation'.
 * @public
 */
ZICA.AnimatorRotation.prototype.getType = function()
{
	return 'rotation';
}

/** 
 * @private
 */
ZICA.AnimatorRotation.prototype.createClone = function()
{
	var a = new ZICA.AnimatorRotation({});
	a.Rotation = this.Rotation;
	a.StartTime = this.StartTime;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param timeMs: The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorRotation.prototype.animateNode = function(n, timeMs)
{
	var timeMs = Date.now();
	var difftime = timeMs - this.StartTime;

	if (!this.RotateToTargetAndStop)
	{
		if (difftime != 0)
		{
			n.angle += this.Rotation*(difftime / 10.0);
			//n.Rot.addToThis( this.Rotation.multiplyWithScal(difftime / 10.0) );
			
			this.StartTime = timeMs;
			return true;
		}
	}
	else
	{
		// rotate to a target rotation and then stop
		
		if (this.RotateToTargetEndTime - this.StartTime == 0)
			return false;

		var interpol = (timeMs - this.StartTime) / (this.RotateToTargetEndTime - this.StartTime);
		if (interpol > 1.0)
		{
			// end reached, destroy this animator
			//n.Rot = this.Rotation.clone();
			n.angle = this.Rotation;
			n.removeAnimator(this);
		}
		else
		{
			// interpolate 
			n.angle = this.BeginRotation + ((this.Rotation - this.BeginRotation) * interpol);	
			
			return true;
		}
	}
	
	return false;
}

/**
 * Makes the animator rotate the scene node to a specific target and then stop there
 * @private
 */
ZICA.AnimatorRotation.prototype.setRotateToTargetAndStop = function(targetRot, beginRot, timeForMovement)
{		
	this.RotateToTargetAndStop = true;
	this.Rotation = targetRot;
	this.BeginRotation = beginRot;
	this.RotateToTargetEndTime = this.StartTime + timeForMovement;
}	
//////////////////////////////////////////////////////
//+ AnimatorFollowPath
//////////////////////////////////////////////////////	
/**
 * Scene node animator making {@link ZICA.Entity}s move along a path.
 * Uses {@link ZICA.Entity} to define the path.
 * @constructor
 * @public
 * @extends ZICA.Animator
 * @class  Scene node animator making {@link ZICA.Entity}s move along a path, uses {@link ZICA.PathSceneNode} to define the path.
 * @param scene The scene the animator is in
 */
ZICA.AnimatorFollowPath = function(obj)
{
	this.TimeNeeded = 5000;
	this.LookIntoMovementDirection = false;
	this.OnlyMoveWhenCameraActive = true;
	this.TimeDisplacement = 0;
	this.EndMode = 0; //ZICA.AnimatorFollowPath.EFPFEM_START_AGAIN;
	
	this.StartTime = 0;
	this.LastObject = null;

	this.PathToFollow = null; // string!
	this.AdditionalRotation = null; 	
	
	this.LastPercentageDoneActionFired = 0;
	this.bActionFired = false;
	
	this.PathToFollow = obj.PathToFollow;
	if(this.PathToFollow)
		if(this.PathToFollow.length)
			this.PathToFollow.forEach(function(item, index, arr){
				var array = item.split(',');
				arr[index] = new ZICA.Vect2d(Number(array[0]),Number(array[1]));	
			});
		
	this.TimeNeeded = obj.TimeNeeded;
	this.LookIntoMovementDirection = obj.LookIntoMovementDirection;
	this.AdditionalRotation = obj.AdditionalRotation;
	this.TimeDisplacement = obj.TimeDisplacement;
	this.EndMode = (obj.EndMode == 'Start Again')?0:1;
}		
ZICA.AnimatorFollowPath.prototype = new ZICA.Animator();

/** 
 * Constant for {@link AnimatorFollowPath.EndMode}, specifying to start the movement again when the end of the path has been reached.
 * @const 
 * @public
 */
ZICA.AnimatorFollowPath.EFPFEM_START_AGAIN = 0;

/** 
 * Constant for {@link AnimatorFollowPath.EndMode}, specifying to start the movement again when the end of the path has been reached.
 * @const 
 * @public
 */
ZICA.AnimatorFollowPath.EFPFEM_STOP = 1;

/** 
 * Constant for {@link AnimatorFollowPath.EndMode}, specifying to start the movement again when the end of the path has been reached.
 * @const 
 * @private
 */
ZICA.AnimatorFollowPath.EFPFEM_SWITCH_TO_CAMERA = 2;


/** 
 * Returns the type of the animator.
 * For the AnimatorFollowPath, this will return 'followpath'.
 * @public
 */
ZICA.AnimatorFollowPath.prototype.getType = function()
{
	return 'followpath';
}


/** 
 * @private
 */
ZICA.AnimatorFollowPath.prototype.createClone = function()
{
	var a = new ZICA.AnimatorFollowPath({});
	a.TimeNeeded = this.TimeNeeded;
	a.LookIntoMovementDirection = this.LookIntoMovementDirection;
	a.OnlyMoveWhenCameraActive = this.OnlyMoveWhenCameraActive;
	a.PathToFollow = this.PathToFollow.slice();
	a.TimeDisplacement = this.TimeDisplacement;
	a.AdditionalRotation = this.AdditionalRotation;
	a.EndMode = this.EndMode;
	a.CameraToSwitchTo = this.CameraToSwitchTo;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}

/**
 * Sets the options for animating the node along the path
 * @public
 * @param endmode {Number} Mode specifying what should happen when the end of the path has been reached.
 * Can be {@link ZICA.AnimatorFollowPath.EFPFEM_START_AGAIN} or {@link ZICA.AnimatorFollowPath.EFPFEM_STOP} 
 * @param timeNeeded {Number} Time in milliseconds needed for following the whole path, for example 10000 for 10 seconds.
 * @param lookIntoMovementDirection {Boolean} true if the node should look into the movement direction or false 
 * if not.
 * 
 */
ZICA.AnimatorFollowPath.prototype.setOptions = function(endmode, timeNeeded, lookIntoMovementDirection)
{
	this.EndMode = endmode;
	this.LookIntoMovementDirection = lookIntoMovementDirection;
	this.TimeNeeded = timeNeeded;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.SceneNode} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorFollowPath.prototype.animateNode = function(n, timeMs)
{
	var timeMs = Date.now();
	
	if (n == null || !this.TimeNeeded)
		return false;

	if (!(n === this.LastObject))
	{
		this.setNode(n);
		return false;
	}

	//this.linkWithPath();
		
	var changed = false;
	var cam = null;

	if (!this.StartTime)
	{
		// use start time of scene
		this.StartTime = Date.now();//this.Manager.getStartTime();
	}	

	var percentageDone = (timeMs - this.StartTime + this.TimeDisplacement) / this.TimeNeeded;

	// when path finished, do what set in settings
	if (percentageDone > 1.0)
	{
		switch(this.EndMode)
		{
		case ZICA.AnimatorFollowPath.EFPFEM_START_AGAIN:
			percentageDone = percentageDone % 1.0;
			break;
		case ZICA.AnimatorFollowPath.EFPFEM_STOP:
			percentageDone = 1.0;
			break;
		case ZICA.AnimatorFollowPath.EFPFEM_SWITCH_TO_CAMERA:
			percentageDone = 1.0;
			if (!this.SwitchedToNextCamera)
			{
				this.switchToNextCamera();
				this.SwitchedToNextCamera = true;
			}
			break;
		case 3: // EFPFEM_START_AGAIN_AND_DO_ACTION
			if (percentageDone > this.LastPercentageDoneActionFired + 1.0 && this.TheActionHandler != null)
			{
				this.TheActionHandler.execute(n);
				this.LastPercentageDoneActionFired = percentageDone;
			}
			percentageDone = percentageDone % 1.0;
			break;
		case 4: // EFPFEM_STOP_AND_DO_ACTION
			percentageDone = 1.0;
			if (!this.bActionFired && this.TheActionHandler != null)
			{
				this.TheActionHandler.execute(n);
				this.bActionFired = true;
			}
			break;
		}
	}
	else
		this.SwitchedToNextCamera = false;
	
	// advance node on path
	var q = percentageDone*(this.PathToFollow.length-1);
	
	var a = Math.floor(q);
	var b = Math.ceil(q);
	var percentage = q-a;
	
	var posA = this.PathToFollow[a];
	var posB = this.PathToFollow[b];
	
	var dir = posB.substract(posA);
	dir.multiplyThisWithScal(percentage);
	
	var pos = posA.add(dir);
	changed = !pos.equals(new ZICA.Vect2d(n.x,n.y));
	
	n.x = pos.X;
	n.y = pos.Y;
	
	if (this.LookIntoMovementDirection && this.PathToFollow.length)
	{
		// set lookat target of moving object
		dir.normalize();
		
		if(n.type == 'entity'){
			n.angle = Math.atan2(dir.X, -dir.Y)*180/Math.PI;
			n.angle += this.AdditionalRotation;
		}
				
	}			
	
	return changed;
}		

/**
* @private
*/
ZICA.AnimatorFollowPath.prototype.setNode = function(n)
{
	this.LastObject = n;

}

/**
 * @private
 */
ZICA.AnimatorFollowPath.prototype.findActionByType = function(type)
{
	if (this.TheActionHandler)
		return this.TheActionHandler.findAction(type);
	
	return null;
}
//////////////////////////////////////////////////////
//+ AnimatorFlyStraight
//////////////////////////////////////////////////////

/**
 * Scene node animator making {@link ZICA.Entity}s move along straight line between two points.
 * @constructor
 * @public
 * @extends ZICA.Animator
 * @class Scene node animator making {@link ZICA.Entity}s move along straight line between two points.
 * @param {ZICA.Vect2d} start Start 2d position of the line
 * @param {ZICA.Vect2d} end End 2d position of the line
 * @param {Number} timeForWay Time for moving along the whole line in milliseconds. For example 2000 for 2 seconds.
 * @param {Boolean} loop set to true for looping along the line, false for stopping movement when the end has been reached.
 * @param {Boolean} deleteMeAfterEndReached set to true if the animator should delete itself after the end has been reached.
 * @param {Boolean} animateCameraTargetInsteadOfPosition if the animated node is a camera, set to true to animate the camera target instead of the position of the camera.
 */
ZICA.AnimatorFlyStraight = function(obj)
{
	//start, end, timeforway, loop, deleteMeAfterEndReached, animateCameraTargetInsteadOfPosition
	
	this.Start = new ZICA.Vect2d(0,0);	
	this.End = new ZICA.Vect2d(40,40);
	this.StartTime = Date.now();//ZICA.CLTimer.getTime();
	this.TimeForWay = 3000;
	this.Loop = false;
	this.DeleteMeAfterEndReached = false;
	this.AnimateCameraTargetInsteadOfPosition = false;
	
	this.TestShootCollisionWithBullet = false;
	this.ShootCollisionNodeToIgnore = null;
	this.ShootCollisionDamage = 0;
	this.DeleteSceneNodeAfterEndReached = false;
	this.ActionToExecuteOnEnd = false;
	this.ExecuteActionOnEndOnlyIfTimeSmallerThen = 0;
	
	
	
		if(obj.Start)
		this.Start = obj.Start.clone();
		
		if(obj.End)
		this.End = obj.End.clone();
		
		if(obj.TimeForWay)
		this.TimeForWay = obj.TimeForWay;

		if(obj.Loop)
		this.Loop = obj.Loop;	
	
	
	this.recalculateImidiateValues();
	
	if (obj.deleteMeAfterEndReached)
		this.DeleteMeAfterEndReached = obj.deleteMeAfterEndReached;
	if (obj.animateCameraTargetInsteadOfPosition)
		this.AnimateCameraTargetInsteadOfPosition = obj.animateCameraTargetInsteadOfPosition;	
}		
ZICA.AnimatorFlyStraight.prototype = new ZICA.Animator();



/** 
 * Returns the type of the animator.
 * For the AnimatorFlyStraight, this will return 'flystraight'.
 * @public
 */
ZICA.AnimatorFlyStraight.prototype.getType = function()
{
	return 'flystraight';
}

/** 
 * @private
 */
ZICA.AnimatorFlyStraight.prototype.createClone = function()
{
	var a = new ZICA.AnimatorFlyStraight({});
	a.Start = this.Start.clone();
	a.End = this.End.clone();
	a.Vector = this.Vector.clone();
	a.WayLength = this.WayLength;
	a.TimeFactor = this.TimeFactor;
	a.TimeForWay = this.TimeForWay;
	a.Loop = this.Loop;
	a.AnimateCameraTargetInsteadOfPosition = this.AnimateCameraTargetInsteadOfPosition;
	a.DeleteSceneNodeAfterEndReached = this.DeleteSceneNodeAfterEndReached;
	a.ActionToExecuteOnEnd = this.ActionToExecuteOnEnd ? this.ActionToExecuteOnEnd.createClone() : null;
	a.ExecuteActionOnEndOnlyIfTimeSmallerThen = this.ExecuteActionOnEndOnlyIfTimeSmallerThen;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorFlyStraight.prototype.animateNode = function(n, event)
{
	var timeMs = Date.now();
	
	var t = (timeMs-this.StartTime);
	var endReached = false;

	if (t != 0)
	{
		var pos = this.Start.clone();

		if (!this.Loop && t >= this.TimeForWay)
		{
			pos = this.End.clone();
			endReached = true;
		}
		else
		{
			pos.addToThis(this.Vector.multiplyWithScal( (t % this.TimeForWay) * this.TimeFactor));
		}
			
		if (this.AnimateCameraTargetInsteadOfPosition)
		{
			/* if (n.getType() == 'camera')
			{
				n.setTarget(pos);
				
				var animfps = n.getAnimatorOfType('camerafps');
				if (animfps != null)
					animfps.lookAt(pos);
			} */
		}
		else
		{
			//n.Pos = pos;
			n.x = pos.X;
			n.y = pos.Y;
		}
		
		if (this.TestShootCollisionWithBullet && this.StartTime != timeMs)  // the node must not be in the exact same frame it was created in,
																			// otherwise, we risk an endless loop if the bullet is shot in the onHit handler
		{
			endReached = this.doShootCollisionTest(n) || endReached;
		}
		
		if (endReached)
		{
			/* if (n.scene)
				n.scene.LastBulletImpactPosition = n.Pos.clone();
						
			if (this.ActionToExecuteOnEnd)
			{
				var runAction = true;
				if (this.ExecuteActionOnEndOnlyIfTimeSmallerThen > 0 && t > this.ExecuteActionOnEndOnlyIfTimeSmallerThen)
					runAction = false;
				
				if (runAction)
					this.ActionToExecuteOnEnd.execute(n);
			} */
				
			if (this.DeleteMeAfterEndReached)
				n.removeAnimator(this);
				
			/* if (this.DeleteSceneNodeAfterEndReached && n.scene)
				n.scene.addToDeletionQueue(n, 0); */
		}
		
		return true;
	}
	
	return false;
}	

/**
 * @private
 */
ZICA.AnimatorFlyStraight.prototype.doShootCollisionTest = function(bulletNode)	
{
	if (!bulletNode)
		return false;

	bulletNode.updateAbsolutePosition();
	var box = bulletNode.getTransformedBoundingBox();

	var hit = false;

	var nodes = bulletNode.scene.getAllSceneNodesWithAnimator('gameai');

	for (var i=0; i<nodes.length; ++i)
	{				
		if (nodes[i] === this.ShootCollisionNodeToIgnore)
			continue;
			
		var enemyAI = nodes[i].getAnimatorOfType('gameai');

		if (enemyAI && !enemyAI.isAlive()) // don't test collision against dead items
			continue;

		if (box.intersectsWithBox(nodes[i].getTransformedBoundingBox()))
		{
			// hit found
			enemyAI.OnHit(this.ShootCollisionDamage, nodes[i]);
			hit = true;
			break;
		}
	}

	return hit;
}

/**
 * @private
 */
ZICA.AnimatorFlyStraight.prototype.recalculateImidiateValues = function()
{
	this.Vector = this.End.substract(this.Start);
	this.WayLength = this.Vector.getLength();
	this.Vector.normalize();
	this.TimeFactor = this.WayLength / this.TimeForWay;
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorCameraFollow
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorCameraFollow = function(obj)
{
	//this.delay  = obj.Delay;
	this.StartTime = Date.now();
	
}		
ZICA.AnimatorCameraFollow.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorCameraFollow, this will return 'camerafollow'.
 * @private
 */
ZICA.AnimatorCameraFollow.prototype.getType = function()
{
	return 'camerafollow';
}

/** 
 * @private
 */
ZICA.AnimatorCameraFollow.prototype.createClone = function()
{
	var a = new ZICA.AnimatorCameraFollow({});
	//a.delay = this.delay;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorCameraFollow.prototype.animateNode = function(n, event)
{
	var timeMs = Date.now();
	var t = (timeMs-this.StartTime);

	//if(this.et >= this.delay)
		
		Game.scene.x = n.x + n.width/2;
		Game.scene.y = n.y + n.height/2;	
	
}

//////////AnimatorOnClick////////////////////////
/**
 * @constructor
 * @public
 * @extends ZICA.Animator
 * @class  Scene node animator which invokes actons when the scene node has been clicked.
 * @param scene {ZICA.Scene} The scene of the animator.
 * @param engine {ZICA} an instance of the 2d engine
 * @param register {Boolean} (optional) set to true to prevent registering at the scene using registerSceneNodeAnimatorForEvents
 */
ZICA.AnimatorOnClick = function(obj)
{
	this.Registered = false;
	this.Occluded = obj.NoClickWhenOccluded; 
	this.TheActionHandler = obj.Action;

}		
ZICA.AnimatorOnClick.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnClick, this will return 'onclick'.
 * @public
 */
ZICA.AnimatorOnClick.prototype.getType = function()
{
	return 'onclick';
}


/** 
 * @private
 */
ZICA.AnimatorOnClick.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnClick();
	a.BoundingBoxTestOnly = this.BoundingBoxTestOnly;
	a.CollidesWithWorld = this.CollidesWithWorld;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnClick.prototype.animateNode = function(n, timeMs)
{
	var done = this.Registered;
	this.Registered = false;
	return done;
}

/**
 * @private
 */
ZICA.AnimatorOnClick.prototype.onClick = function(event , n) 
{	
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnClick.prototype.checkOccluded = function(n,event){
	
	if(!this.Occluded)return false;
	
	var i;
	if(n.isScene)i = 0;
	else i = Game.entityList.indexOf(n) + 1;
	
	for (var _i = i, _a = Game.entityList; _i < _a.length; _i++) {
	 
			var ent_1 = _a[_i];
			var flag = Game.pointInBox(event,ent_1);
			
			if(flag && (ent_1.priority >= n.priority || n.isScene))
				return true;
	}
	
	return false;
}

/**
 * @private
 */
ZICA.AnimatorOnClick.prototype.invokeAction = function(node)
{
	if (this.TheActionHandler)
		this.TheActionHandler.execute(node);
}

/**
 * @private
 */
ZICA.AnimatorOnClick.prototype.findActionByType = function(type)
{
	if (this.TheActionHandler)
		return this.TheActionHandler.findAction(type);
	
	return null;
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorOnFirstFrame
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnFirstFrame = function(obj)
{
	this.TheActionHandler = obj.Action;
	
}		
ZICA.AnimatorOnFirstFrame.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnFirstFrame, this will return 'onfirstframe'.
 * @private
 */
ZICA.AnimatorOnFirstFrame.prototype.getType = function()
{
	return 'onfirstframe';
}

/** 
 * @private
 */
ZICA.AnimatorOnFirstFrame.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnFirstFrame({});
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnFirstFrame.prototype.animateNode = function(n, event)
{	
	if(Game.scene.firstFrame)
		if (this.TheActionHandler)
			this.TheActionHandler.execute(n);
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorOnEveryFrame
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnEveryFrame = function(obj)
{
	this.TheActionHandler = obj.Action;
	
}		
ZICA.AnimatorOnEveryFrame.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnEveryFrame, this will return 'oneveryframe'.
 * @private
 */
ZICA.AnimatorOnEveryFrame.prototype.getType = function()
{
	return 'oneveryframe';
}

/** 
 * @private
 */
ZICA.AnimatorOnEveryFrame.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnEveryFrame({});
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnEveryFrame.prototype.animateNode = function(n, event)
{
	if (this.TheActionHandler)
	this.TheActionHandler.execute(n);
}


//////////AnimatorOnMouse////////////////////////
/**
 * @constructor
 * @public
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnMouse = function(obj)
{
	this.Registered = false;
	this.Occluded = obj.NoClickWhenOccluded;
	this.type = obj.MouseEvent;
	this.TheActionHandler = obj.Action;

}		
ZICA.AnimatorOnMouse.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnMouseAnimatorOnMouse, this will return 'onmouse'.
 * @public
 */
ZICA.AnimatorOnMouse.prototype.getType = function()
{
	return 'onmouse';
}


/** 
 * @private
 */
ZICA.AnimatorOnMouse.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnMouse({});
	a.type = this.type;
	a.CollidesWithWorld = this.CollidesWithWorld;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnMouse.prototype.animateNode = function(n, timeMs)
{
	var done = this.Registered;
	this.Registered = false;
	return done;
}

/**
 * @private
 */
ZICA.AnimatorOnMouse.prototype.onClick = function(event , n) 
{	
	if(this.type != 'Mouse Click')return;
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnMouse.prototype.onMouseDown = function(event , n) 
{	
	if(this.type != 'Mouse Down')return;
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnMouse.prototype.onMouseUp = function(event , n) 
{	
	if(this.type != 'Mouse Up')return;
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnMouse.prototype.onMouseOver = function(event , n) 
{	
	if(this.type != 'Mouse Over')return;
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnMouse.prototype.onMouseOut = function(event , n) 
{	
	if(this.type != 'Mouse Out')return;
	this.Registered = true;
	
	if(this.checkOccluded(n,event))return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnMouse.prototype.checkOccluded = function(n,event){
	
	if(!this.Occluded)return false;
	
	var i;
	if(n.isScene)i = 0;
	else i = Game.entityList.indexOf(n) + 1;
	
	for (var _i = i, _a = Game.entityList; _i < _a.length; _i++) {
	 
			var ent_1 = _a[_i];
			var flag = Game.pointInBox(event,ent_1);
			
			if(flag && (ent_1.priority >= n.priority || n.isScene))
				return true;
	}
	
	return false;
}

/**
 * @private
 */
ZICA.AnimatorOnMouse.prototype.findActionByType = function(type)
{
	if (this.TheActionHandler)
		return this.TheActionHandler.findAction(type);
	
	return null;
}

//////////AnimatorOnKey////////////////////////
/**
 * @public
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnKey = function(obj)
{
	this.Registered = false; 
	//this.KeyCode = Number('0x' + (ZICA.Keys.indexOf(obj.Key) + 1));
	this.Key = obj.Key;
	this.KeyEvent = obj.KeyEvent;
	this.TheActionHandler = obj.Action;

}		
ZICA.AnimatorOnKey.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnKey, this will return 'onkey'.
 * @public
 */
ZICA.AnimatorOnKey.prototype.getType = function()
{
	return 'onkey';
}


/** 
 * @private
 */
ZICA.AnimatorOnKey.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnKey({});
	a.Key = this.Key;
	a.KeyEvent = this.KeyEvent;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnKey.prototype.animateNode = function(n, event)
{
	var done = this.Registered;
	this.Registered = false;
	return done;
}

/**
 * @private
 */
ZICA.AnimatorOnKey.prototype.onKeyUp = function(event , n) 
{	
	this.Registered = true;
	
	if(this.KeyEvent != 'Key Pressed Up')return;
	if(Game.Keys[this.Key.toLowerCase()] != event.which)return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnKey.prototype.onKeyDown = function(event , n) 
{	
	this.Registered = true;
	
	if(this.KeyEvent != 'Key Pressed Down')return;
	if(Game.Keys[this.Key.toLowerCase()] != event.which)return;
	
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

ZICA.AnimatorOnKey.prototype.onKeyPress = function(event , n) 
{	
	this.Registered = true;
	
	if(this.KeyEvent != 'Key Pressed')return;
	if(Game.Keys[this.Key.toLowerCase()] != event.which)return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);
	
}

/**
 * @private
 */
ZICA.AnimatorOnKey.prototype.findActionByType = function(type)
{
	if (this.TheActionHandler)
		return this.TheActionHandler.findAction(type);
	
	return null;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Timer animator
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorTimer = function(obj)
{
	this.TimeLastTimed = 0;
	this.TheActionHandler = obj.Action;
	this.TickEverySeconds = obj.IntervalMS;
	this.TimeLastTimed = Date.now();//ZICA.CLTimer.getTime();
}		
ZICA.AnimatorTimer.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorTimer, this will return 'timer'.
 * @private
 */
ZICA.AnimatorTimer.prototype.getType = function()
{
	return 'timer';
}

/** 
 * @private
 */
ZICA.AnimatorTimer.prototype.createClone = function()
{
	var a = new ZICA.AnimatorTimer({});
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	a.TimeLastTimed = this.TimeLastTimed;
	a.TickEverySeconds = this.TickEverySeconds;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorTimer.prototype.animateNode = function(n, event)
{
	var timeMs = event.timeElapsed;
	
	if (n == null)
		return false;

	if (this.TickEverySeconds > 0)
	{
		var now = Date.now();//ZICA.CLTimer.getTime();

		if (now - this.TimeLastTimed > this.TickEverySeconds)
		{
			this.TimeLastTimed = now;
			
			if (this.TheActionHandler)
				this.TheActionHandler.execute(n);					
			return true;
		}
	}	
	return false;
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorOnProximity
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnProximity = function(obj)
{
	this.NodeInside = false;
	this.NodesInside = [];
	
	this.TheActionHandler = obj.Action;
	this.NearToNodes = obj.NearToNodes;
	this.TriggeredWhen = obj.TriggeredWhen;
	
	//'Leaves Radius','Enters Radius'
}		
ZICA.AnimatorOnProximity.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnProximity, this will return 'onproximity'.
 * @private
 */
ZICA.AnimatorOnProximity.prototype.getType = function()
{
	return 'onproximity';
}

/** 
 * @private
 */
ZICA.AnimatorOnProximity.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnProximity({});
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	a.NearToNodes = this.NearToNodes;
	a.TriggeredWhen = this.TriggeredWhen;
	a.NodeInside = this.NodeInside;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnProximity.prototype.animateNode = function(n, event)
{
	
	if(this.TriggeredWhen != 'Leaves Radius')return;
	
	if(this.NodeInside){
		
		for (var _i = 0, _a = Game.entityList; _i < _a.length; _i++) {
			var ent = _a[_i];
			
			if(ent != n)
				if(ZICA.boxIntersection(n,ent))return;	
		}
		
		
		if (this.TheActionHandler)
			this.TheActionHandler.execute(n);
		
		this.NodeInside = false;
		
	}
}

ZICA.AnimatorOnProximity.prototype.onCollision = function(event , n)
{
	
	this.NodeInside = true;
	
	if(this.TriggeredWhen != 'Enters Radius')return;
	
	if(this.NearToNodes != null)
	if(event.other.name != this.NearToNodes) return;
	
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);	
		
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorOnProximity
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorOnProximity = function(obj)
{
	this.NodeInside = false;
	this.NodesInside = [];
	
	this.TheActionHandler = obj.Action;
	this.NearToNodes = obj.NearToNodes;
	
	this.TriggeredWhen = obj.TriggeredWhen;
	
	//'Leaves Radius','Enters Radius'
}		
ZICA.AnimatorOnProximity.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorOnProximity, this will return 'onproximity'.
 * @private
 */
ZICA.AnimatorOnProximity.prototype.getType = function()
{
	return 'onproximity';
}

/** 
 * @private
 */
ZICA.AnimatorOnProximity.prototype.createClone = function()
{
	var a = new ZICA.AnimatorOnProximity({});
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	a.NearToNodes = this.NearToNodes;
	a.TriggeredWhen = this.TriggeredWhen;
	a.NodeInside = this.NodeInside;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorOnProximity.prototype.animateNode = function(n, event)
{
	
	if(this.TriggeredWhen != 'Leaves Radius')return;
	
	if(this.NodeInside){
		
		var ent = Game.getEntityById(this.NearToNodes);
		if(!ent)return;
		
		if(ZICA.boxIntersection(n,ent))return;
		
		if (this.TheActionHandler)
			this.TheActionHandler.execute(n);
		
		this.NodeInside = false;
		
	}
}

ZICA.AnimatorOnProximity.prototype.onCollision = function(event , n)
{
	
	this.NodeInside = true;
	
	if(this.TriggeredWhen != 'Enters Radius')return;
	
	//if(this.NearToNodes != null)
	//if(event.other.name != this.NearToNodes) return;
	if(event.other.__guid != this.NearToNodes) return;
	
	if (this.TheActionHandler)
		this.TheActionHandler.execute(n);	
		
}
/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorCollisionResponse
/////////////////////////////////////////////////////////////////////////////////////////

ZICA.AnimatorCollisionResponse = function(obj)
{
	this.AffectedByGravity = obj.AffectedByGravity;
	this.Node = null;
	this.LastAnimationTime = null;
	this.LastPosition = new ZICA.Vect2d(0,0);
	this.Falling = false;
	this.FallStartTime = 0;
	this.JumpForce = 0;
		
	this.reset();
}		
ZICA.AnimatorCollisionResponse.prototype = new ZICA.Animator();

/** 
 * Returns the type of the animator.
 * For the AnimatorCollisionResponse, this will return 'collisionresponse'.
 * @public
 */
ZICA.AnimatorCollisionResponse.prototype.getType = function()
{
	return 'collisionresponse';
}

/** 
 * @private
 */
ZICA.AnimatorCollisionResponse.prototype.createClone = function()
{
	var a = new ZICA.AnimatorCollisionResponse({});
	//a.Radius = this.Radius.clone();
	a.AffectedByGravity = this.AffectedByGravity;
	return a;
}


/**
 * Resets the collision system. Use this for example to make it possible to set a scene node postition
 * while moving through walls: Simply change the position of the scene node and call reset() to this
 * animator afterwards.
 * @public
 */
ZICA.AnimatorCollisionResponse.prototype.reset = function()
{
	this.Node = null;
	this.LastAnimationTime = Date.now();//ZICA.CLTimer.getTime();
}	

/**
 * Returns if the scene node attached to this animator is currently falling
 * @public
 */
ZICA.AnimatorCollisionResponse.prototype.isFalling = function()
{
	return this.Falling;
}	

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorCollisionResponse.prototype.animateNode = function(n, timeMs)
{
	var timeMs = Date.now();
	var difftime = (timeMs-this.LastAnimationTime);
		
	if (difftime > 150) difftime = 150;
	if (difftime == 0)
		return false;	
		
	this.LastAnimationTime = timeMs;
	
	if (!(this.Node === n))
	{
		this.Node = n;
		this.LastPosition = new ZICA.Vect2d(n.x,n.y);//n.Pos.clone();
		return false;
	}
	
	//var velY = -Game.scene.gravity;
	
	var changed = Math.abs(this.LastPosition.Y - n.y)>0.5;
	
	if (this.JumpForce > 0)
	{
		n.y -= (this.JumpForce * 0.001 * difftime);
			
		this.JumpForce -= difftime;
		if (this.JumpForce < 0) this.JumpForce = 0;		
	}
	
	if(this.AffectedByGravity)
		n.physicType = 'dynamic';
	else
		n.physicType = 'kinematic';
	
	//n.velY = -velY;
	
	if(changed){
		if (!this.Falling)
				this.FallStartTime = timeMs;
		this.Falling = true;
	}
	else {
		
		this.Falling = false;
	}
	
	this.LastPosition = new ZICA.Vect2d(n.x,n.y);
	
	return false;
}		
/** 
 * @private
 */
ZICA.AnimatorCollisionResponse.prototype.jump = function(jumpspeed)
{
	if (this.JumpForce == 0)
		this.JumpForce = jumpspeed * 100;
}
ZICA.AnimatorCollisionResponse.prototype.onCollision = function(event , n)
{
	//0up 1down 2left 3right
	
	Game.resolveElastic(n,event.other);
	
}
/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorCollide
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorCollide = function(obj)
{
	//this.NodeInside = false;
	
}		
ZICA.AnimatorCollide.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorCollide, this will return 'collide'.
 * @private
 */
ZICA.AnimatorCollide.prototype.getType = function()
{
	return 'collide';
}

/** 
 * @private
 */
ZICA.AnimatorCollide.prototype.createClone = function()
{
	var a = new ZICA.AnimatorCollide({});
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorCollide.prototype.animateNode = function(n, event)
{
	
}

ZICA.AnimatorCollide.prototype.onCollision = function(event , n)
{
	n.x = n.prevX;
	n.y = n.prevY;		
}

/////////////////////////////////////////////////////////////////////////////////////////
// AnimatorPhysicsEngine
/////////////////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @class
 * @private
 * @extends ZICA.Animator
 */
ZICA.AnimatorPhysicsEngine = function(obj)
{
	this.shape = obj.Shape;
	this.mass = obj.Mass;
	this.position = obj.Position;
	this.size = obj.Size;
	this.autoSize = obj.autoSize;
	this.radius = obj.Radius;
	this.length = obj.length;
	
}		
ZICA.AnimatorPhysicsEngine.prototype = new ZICA.Animator();


/** 
 * Returns the type of the animator.
 * For the AnimatorPhysicsEngine, this will return 'physicsengine'.
 * @private
 */
ZICA.AnimatorPhysicsEngine.prototype.getType = function()
{
	return 'physicsengine';
}

/** 
 * @private
 */
ZICA.AnimatorPhysicsEngine.prototype.createClone = function()
{
	var a = new ZICA.AnimatorPhysicsEngine({});
	a.shape = this.shape;
	a.mass = this.mass;
	a.position = this.position;
	a.size = this.size;
	a.autoSize = this.autoSize;
	a.radius = this.radius;
	a.length = this.length;
	return a;
}


/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @private
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorPhysicsEngine.prototype.animateNode = function(n, event)
{
	if(!n.body){
		
		if(this.autoSize){
			this.size = new ZICA.Vect2d(n.width,n.height);
			this.radius = Math.min(n.width,n.height);
			this.length = Math.max(n.width,n.height);	
		}
		
		n.body = new p2.Body({
		mass: this.mass,
		position: [n.x + this.position.X  , n.y + this.position.Y],
		angle: n.angle*Math.PI/180
		});	
		
		var shape;
		
		if(this.shape ==  "Circle")
			shape = new p2.Circle({ radius: this.radius });
		if(this.shape ==  "Box")
			shape = new p2.Box({ width: this.size.X, height: this.size.Y });
		if(this.shape ==  "Capsule")
			shape = new p2.Capsule({ radius: this.radius, length: this.length });

		if(shape)n.body.addShape(shape);
		
		Game.scene.world.addBody(n.body);
		
		
	}else{
		
		n.x = n.body.position[0];
		n.y = n.body.position[1];
		
		n.angle = n.body.angle*180/Math.PI;
	}
	
}

///////////////////////////////////////////////////////
// AnimatorAnimateTexture
///////////////////////////////////////////////////////

ZICA.AnimatorAnimateTexture = function(obj)//textures, timeperframe, donotloop)
{
	this.MyStartTime = Date.now();//0;
	
	this.Textures = obj.Textures;
	this.TimePerFrame = obj.TimePerFrame;
	this.Loop = obj.Loop;

}
	
ZICA.AnimatorAnimateTexture.prototype = new ZICA.Animator();

/** 
 * Returns the type of the animator.
 * For the AnimatorAnimateTexture, this will return 'animatetexture'.
 * @public
 */
ZICA.AnimatorAnimateTexture.prototype.getType = function()
{
	return 'animatetexture';
}

/** 
 * @private
 */
ZICA.AnimatorAnimateTexture.prototype.createClone = function()
{
	var a = new ZICA.AnimatorAnimateTexture({});
	a.Textures = this.Textures;
	a.Loop = this.Loop;
	a.TimePerFrame = this.TimePerFrame;
	return a;
}

/**
 * Animates the scene node it is attached to and returns true if scene node was modified.
 * @public
 * @param {ZICA.Entity} n The Scene node which needs to be animated this frame.
 * @param {Integer} timeMs The time in milliseconds since the start of the scene.
 */
ZICA.AnimatorAnimateTexture.prototype.animateNode = function(n, event)
{
	if (n == null || this.Textures == null)
		return false;
		
	var changedSomething = false;
	var timeMs = Date.now();//event.timeElapsed;
	
	if (this.Textures.length)
	{
		var startTime = (this.MyStartTime == 0) ? 0 : this.MyStartTime;
		
		var t = (timeMs - startTime);
		var endTime = startTime + (this.TimePerFrame * this.Textures.length);

		var idx = 0;
		if (!this.Loop && timeMs >= endTime)
			idx = this.Textures.length - 1;
		else
		{
			if (this.TimePerFrame > 0)
				idx = Math.floor((t/this.TimePerFrame) % this.Textures.length);
			else
				idx = 0;
		}

		if (idx < this.Textures.length)
		{
			n.image = this.Textures[idx];
			changedSomething = true;
		}
	}
	
	return changedSomething;
}

/** 
 * @private
 */
ZICA.AnimatorAnimateTexture.prototype.reset = function()
{
	this.MyStartTime = Date.now();
}



//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------------
// Action 
// ---------------------------------------------------------------------
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////


/**
 * @constructor
 * @private
 */
ZICA.Action = function()
{
}

/**
 * @private
 */
ZICA.Action.prototype.execute = function(node)
{
}

/**
 * @private
 */
ZICA.Action.prototype.createClone = function()
{
	return null;
}

/////////ActionHandler//////////

/**
 * @constructor
 * @private
 * @class
 */
ZICA.ActionHandler = function(array) //,scene
{
	if(!array)array = [];
	
	this.Actions = array;
}

/**
 * @private
 */
ZICA.ActionHandler.prototype.execute = function(node)
{
	for (var i=0; i<this.Actions.length; ++i)
	{
		 this.Actions[i].execute(node);
	}
}

/**
 * @private
 */
ZICA.ActionHandler.prototype.addAction = function(a)
{
	if (a == null)
		return;
		
	this.Actions.push(a);
}

/**
 * @private
 */
ZICA.ActionHandler.prototype.findAction = function(type)
{
	for (var i=0; i<this.Actions.length; ++i)
	{
		var a = this.Actions[i];
		if (a.Type == type)
			return a;
	}
	
	return null;
}

/**
 * @private
 */
ZICA.ActionHandler.prototype.createClone = function()
{
	var c = new ZICA.ActionHandler();
	
	for (var i=0; i<this.Actions.length; ++i)
	{
		var a = this.Actions[i];
		if (a.createClone != null)
			c.addAction(a.createClone());
	}
	
	return c;
}


// ---------------------------------------------------------------------
// Action ExecuteJavaScript
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ExecuteJavaScript = function(obj)
{
	this.Type = 'ExecuteJavaScript';	
	this.JScript = obj.JavaScript;
}

/**
 * @private
 */
ZICA.Action.ExecuteJavaScript.prototype.createClone = function()
{
	var a = new ZICA.Action.ExecuteJavaScript();
	a.JScript = this.JScript;
	return a;
}

/**
 * @private
 */
ZICA.Action.ExecuteJavaScript.prototype.execute = function(currentNode)
{
	this.eval.call(currentNode,this.JScript);
	
}

/**
 * @private
 */
ZICA.Action.ExecuteJavaScript.prototype.eval = function(JScript)
{
	try{
		eval(JScript);
	}catch(e){
		Game.error(e);
	}
}

// ---------------------------------------------------------------------
// Action MakeSceneNodeInvisible
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.MakeSceneNodeInvisible = function(obj)
{
	this.InvisibleMakeType = ['Make Invisible' , 'Make Visible' , 'Toggle Visiblilty'].indexOf(obj.InvisibleMakeType);
	this.SceneNodeToMakeInvisible = obj.SceneNodeToMakeInvisible;
	this.ChangeCurrentSceneNode = obj.SceneNodeToMakeInvisible == null;
	this.Type = 'MakeSceneNodeInvisible';	
}

/**
 * @private
 */
ZICA.Action.MakeSceneNodeInvisible.prototype.createClone = function()
{
	var a = new ZICA.Action.MakeSceneNodeInvisible({});
	a.InvisibleMakeType = this.InvisibleMakeType;
	a.SceneNodeToMakeInvisible = this.SceneNodeToMakeInvisible;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
		
	return a;
}

/**
 * @private
 */
ZICA.Action.MakeSceneNodeInvisible.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToMakeInvisible != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToMakeInvisible);

	if (nodeToHandle)
	{
		switch(this.InvisibleMakeType)
		{
		case 0: //EIT_MAKE_INVISIBLE:
			nodeToHandle.visible = false;
			break;
		case 1: //EIT_MAKE_VISIBLE:
			nodeToHandle.visible = true;
			break;
		case 2: //EIT_TOGGLE_VISIBILITY:
			{
				nodeToHandle.visible = !nodeToHandle.visible;
			}
			break;
		}
	}
}

// ---------------------------------------------------------------------
// Action ChangeSceneNodeScale
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodeScale = function(obj)
{
	this.Type = 'ChangeSceneNodeScale';	
	
	switch(obj.ScaleChangeType)
	{
		case 'Set absoulte scale':
		this.ScaleChangeType = 0;
		break;
		case 'Scale by the vector' :
		this.ScaleChangeType = 1;
		break;
		case 'Set relative scale':
		this.ScaleChangeType = 2;
		break;
	}
	
	this.SceneNodeToChangeScale = obj.SceneNodeToChangeScale;
	if(obj.SceneNodeToChangeScale == null)this.ChangeCurrentSceneNode = true;
	this.Size = obj.Size.clone();
}	

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeScale.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodeScale({});
	a.ScaleChangeType = this.ScaleChangeType;
	a.SceneNodeToChangeScale = this.SceneNodeToChangeScale;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.Size = this.Size.clone();
		
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeScale.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChangeScale != -1)
		nodeToHandle =  Game.getEntityById(this.SceneNodeToChangeScale);

	if (nodeToHandle)
	{
		switch(this.ScaleChangeType)
		{
		case 0: //EIT_ABSOLUTE_SCALE:
			nodeToHandle.width = this.Size.X;
			nodeToHandle.height = this.Size.Y;
			break;
		case 1: //MULTIPLY_SCALE:
			nodeToHandle.width *= this.Size.X;
			nodeToHandle.height *= this.Size.Y;
			break;
		case 2: //EIT_RELATIVE_SCALE:
			nodeToHandle.width += this.Size.X;
			nodeToHandle.height += this.Size.Y;
			break;

		}
	}
}

// ---------------------------------------------------------------------
// Action ChangeSceneNodeRotation
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodeRotation = function(obj)
{
	this.Type = 'ChangeSceneNodeRotation';
	
	this.RotationChangeType = obj.RotationChangeType == 'Set absoulte rotation'? 0: 1; 
	this.SceneNodeToChangeRotation = obj.SceneNodeToChangeRotation;
	if(obj.SceneNodeToChangeRotation == null)this.ChangeCurrentSceneNode = true;
	this.Angle = obj.Angle;
	this.RotateAnimated = obj.RotateAnimated;
	this.TimeNeededForRotationMs = obj.TimeNeededForRotationMs;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeRotation.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodeRotation({});
	a.RotationChangeType = this.RotationChangeType;
	a.SceneNodeToChangeRotation = this.SceneNodeToChangeRotation;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.Angle = this.Angle;
	a.RotateAnimated = this.RotateAnimated;
	a.TimeNeededForRotationMs = this.TimeNeededForRotationMs;
	
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeRotation.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChangeRotation != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChangeRotation);

	if (nodeToHandle)
	{
		var finalRot = null;
		
		switch(this.RotationChangeType)
		{
		case 0://EIT_ABSOLUTE_ROTATION:
			finalRot = this.Angle;
			break;
		case 1://EIT_RELATIVE_ROTATION:
			finalRot = nodeToHandle.angle + this.Angle;
			break;
		}
		
		if (finalRot)
		{
			if (!this.RotateAnimated)
			{
				// not animated, set rotation directly
				nodeToHandle.angle = finalRot;
			}
			else
			{
				// rotate animated to target TO DO!!!
				var anim = new ZICA.AnimatorRotation({});
				anim.setRotateToTargetAndStop(finalRot, nodeToHandle.angle, this.TimeNeededForRotationMs);
										
				nodeToHandle.addAnimator(anim);
			}
		}
	}
}

// ---------------------------------------------------------------------
// Action ChangeSceneNodePosition
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodePosition = function(obj)
{
	this.UseAnimatedMovement = obj.UseAnimatedMovement;//false;
	this.TimeNeededForMovementMs = obj.TimeNeededForMovementMs //false;
	
	this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
	if(obj.SceneNodeToChangePosition == null)this.ChangeCurrentSceneNode = true;
	
	
	if(obj.PositionChangeType == 0){
		this.PositionChangeType = 0;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
		this.Vector = obj.Position.clone();
	}
	
	if(obj.PositionChangeType == 1){
		this.PositionChangeType = 1;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
		this.Vector = obj.Vector.clone();
	}
	
	if(obj.PositionChangeType == 2){
		this.PositionChangeType = 2;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
		this.Vector = obj.Position.clone();
		this.SceneNodeRelativeTo = obj.SceneNodeRelativeTo;
		if(obj.SceneNodeRelativeTo == null)this.RelativeToCurrentSceneNode = true;
	}
	
	if(obj.PositionChangeType == 3){
		this.PositionChangeType = 3;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
		this.Vector = obj.Percentage.clone();
		this.SceneNodeRelativeTo = obj.SceneNodeRelativeTo;
		if(obj.SceneNodeRelativeTo == null)this.RelativeToCurrentSceneNode = true;
	}
	
	if(obj.PositionChangeType == 4){
		this.PositionChangeType = 4;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
		this.Vector = obj.MinPosition.clone();
		this.Area3DEnd = obj.MaxPosition.clone();
	}
	
	if(obj.PositionChangeType == 5){
		this.PositionChangeType = 5;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
	}
	
	if(obj.PositionChangeType == 6){
		this.PositionChangeType = 6;
		this.Vector = obj.Vector;
		//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
	}

	this.Type = 'ChangeSceneNodePosition';	
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePosition.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodePosition({});
	a.PositionChangeType = this.PositionChangeType;
	a.SceneNodeToChangePosition = this.SceneNodeToChangePosition;
	a.SceneNodeRelativeTo = this.SceneNodeRelativeTo;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.RelativeToCurrentSceneNode = this.RelativeToCurrentSceneNode;
	a.Vector = this.Vector ? this.Vector.clone() : null;
	a.Area3DEnd = this.Area3DEnd ? this.Area3DEnd.clone() : null;
	a.UseAnimatedMovement = this.UseAnimatedMovement;
	a.TimeNeededForMovementMs = this.TimeNeededForMovementMs;
		
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePosition.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChangePosition != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChangePosition);

	if (nodeToHandle)
	{
		var finalpos = null;
		
		switch(this.PositionChangeType)
		{
		case 0: //EIT_ABSOLUTE_POSITION:
			finalpos = this.Vector.clone();
			break;
		case 1://EIT_RELATIVE_POSITION:
			finalpos = new ZICA.Vect2d(nodeToHandle.x + this.Vector.X,nodeToHandle.y + this.Vector.Y);
			break;
		case 2://EIT_RELATIVE_TO_SCENE_NODE:
			{
				var nodeRelativeTo = null;
				if (this.RelativeToCurrentSceneNode)
					nodeRelativeTo = currentNode;
				else
				if (this.SceneNodeRelativeTo != -1)
					nodeRelativeTo = Game.getEntityById(this.SceneNodeRelativeTo);

				if (nodeRelativeTo)
					finalpos = new ZICA.Vect2d(nodeRelativeTo.x + this.Vector.X,nodeRelativeTo.y + this.Vector.Y);
			}
			break;
		case 3: //EIT_RELATIVE_IN_FACING_DIRECTION:
			{
				var nodeRelativeTo = null;
				if (this.RelativeToCurrentSceneNode)
					nodeRelativeTo = Game;
				else
				if (this.SceneNodeRelativeTo != -1)
					nodeRelativeTo = Game.getEntityById(this.SceneNodeRelativeTo);

				if (nodeRelativeTo)
					finalpos = new ZICA.Vect2d(nodeRelativeTo.x + nodeRelativeTo.width*this.Vector.X/100, nodeRelativeTo.y + nodeRelativeTo.height*this.Vector.Y/100);
			}
			break;
		case 4: //EIT_RANDOM_POSITION:
			{
				
				finalpos = new ZICA.Vect2d();
				finalpos.X = this.Vector.X + (Math.random() * (this.Area3DEnd.X - this.Vector.X));
				finalpos.Y = this.Vector.Y + (Math.random() * (this.Area3DEnd.Y - this.Vector.Y));
				
			}
			break;
		case 5: //EIT_RELATIVE_TO_LAST_BULLET_IMPACT:
			{	
				finalpos = new ZICA.Vect2d(Game.controls.mouse.x,Game.controls.mouse.y);
			}
			break;
		case 6: //EIT_RELATIVE_TO_LAST_BULLET_IMPACT:
			{	
				if(Game.scene.lastBulletImpact)
				finalpos = new ZICA.Vect2d(Game.scene.lastBulletImpact.X + this.Vector.X,Game.scene.lastBulletImpact.Y + this.Vector.Y);
			}
			break;
		}
		
		if (finalpos != null)
		{
			if (this.UseAnimatedMovement && this.TimeNeededForMovementMs > 0)
			{
				// move animated to target TO DO !!!
				var anim = new ZICA.AnimatorFlyStraight({});
				anim.Start = new ZICA.Vect2d(nodeToHandle.x,nodeToHandle.y);
				anim.End = finalpos;
				anim.TimeForWay = this.TimeNeededForMovementMs;
				anim.DeleteMeAfterEndReached = true;
				anim.recalculateImidiateValues();
				
				nodeToHandle.addAnimator(anim);
			}
			else
			{
				// set position directly
				nodeToHandle.x = finalpos.X;
				nodeToHandle.y = finalpos.Y;
			}
		}
	}
}

// ---------------------------------------------------------------------
// Action ChangeSceneNodeProperty
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodeProperty = function(obj)
{
	this.Type = 'ChangeSceneNodeProperty';	
	
	this.SceneNodeToChange = obj.SceneNodeToChange;
	if(obj.SceneNodeToChange == null)this.ChangeCurrentSceneNode = true;
	this.Property = obj.Property;
	this.Value = obj.Value;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeProperty.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodeProperty({});
	a.SceneNodeToChange = this.SceneNodeToChange;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.Property = this.Property;
	a.Value = this.Value;
	
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodeProperty.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChange != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChange);

	if (nodeToHandle)
	{
		nodeToHandle[this.Property] = this.Value;
	}
}


// ---------------------------------------------------------------------
// Action ChangeSceneNodePropertyFromNode
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodePropertyFromNode = function(obj)
{
	this.Type = 'ChangeSceneNodePropertyFromNode';	
	
	this.SceneNodeToChange = obj.SceneNodeToChange;
	if(obj.SceneNodeToChange == null)this.ChangeCurrentSceneNode = true;
	this.Property = obj.Property;
	this.SceneNodeFrom = obj.SceneNodeFrom;
	if(obj.SceneNodeFrom == null)this.FromCurrentSceneNode = true;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePropertyFromNode.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodePropertyFromNode({});
	a.SceneNodeToChange = this.SceneNodeToChange;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.SceneNodeFrom = this.SceneNodeFrom;
	a.FromCurrentSceneNode = this.FromCurrentSceneNode;
	a.Property = this.Property;
	
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePropertyFromNode.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
	
	var nodeFrom = null;
	if (this.FromCurrentSceneNode)
		nodeFrom = currentNode;
	else
	if (this.SceneNodeFrom != -1)
		nodeFrom = Game.getEntityById(this.SceneNodeFrom);


	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChange != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChange);

	if (nodeToHandle)
	{
		nodeToHandle[this.Property] = nodeFrom[this.Property];
	}
}

// ---------------------------------------------------------------------
// Action ChangeSceneNodePropertyVariable
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeSceneNodePropertyVariable = function(obj)
{
	this.Type = 'ChangeSceneNodePropertyVariable';	
	
	this.SceneNodeToChange = obj.SceneNodeToChange;
	if(obj.SceneNodeToChange == null)this.ChangeCurrentSceneNode = true;
	this.Property = obj.Property;
	this.Variable = obj.Variable;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePropertyVariable.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeSceneNodePropertyVariable({});
	a.SceneNodeToChange = this.SceneNodeToChange;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.Property = this.Property;
	a.Variable = this.Variable;
	
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeSceneNodePropertyVariable.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChange != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChange);

	if (nodeToHandle)
	{
		if(Game.hasVariable(this.Variable))
		nodeToHandle[this.Property] = Game.getVariable(this.Variable);
	}
}

// ---------------------------------------------------------------------
// Action ActionRestartScene
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.SwitchToScene = function(obj)
{
	this.Scene = obj.SceneId;//obj.Scene;
	this.ResetScene = obj.ResetScene;
	this.Type = 'SwitchToScene';	
}

/**
 * @private
 */
ZICA.Action.SwitchToScene.prototype.createClone = function()
{
	var a = new ZICA.Action.SwitchToScene({});
	a.Scene = this.Scene;
	a.ResetScene = this.ResetScene;
	return a;
}

/**
 * @private
 */
ZICA.Action.SwitchToScene.prototype.execute = function(currentNode)
{
	//var scene = Game.getSceneByName(this.Scene);
	var scene = Game.getScene(this.Scene);
	
	if(scene)
	Game.switchToScene(scene,this.ResetScene);
}

// ---------------------------------------------------------------------
// Action ActionRestartScene
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.RestartScene = function()
{
	this.Type = 'RestartScene';	
}

/**
 * @private
 */
ZICA.Action.RestartScene.prototype.createClone = function()
{
	var a = new ZICA.Action.RestartScene();
	return a;
}

/**
 * @private
 */
ZICA.Action.RestartScene.prototype.execute = function(currentNode)
{
	if (Game.scene)
		Game.switchToScene(Game.scene, true);
}

// ---------------------------------------------------------------------
// Action OpenWebpage
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.OpenWebpage = function(obj)
{
	this.Type = 'OpenWebpage';	
	this.Webpage = obj.Webpage;
	this.Target = obj.Target;
}

/**
 * @private
 */
ZICA.Action.OpenWebpage.prototype.createClone = function()
{
	var a = new ZICA.Action.OpenWebpage({});
	a.Webpage = this.Webpage;
	a.Target = this.Target;
	return a;
}

/**
 * @private
 */
ZICA.Action.OpenWebpage.prototype.execute = function(currentNode)
{
	window.open(this.Webpage, this.Target);
}

// ---------------------------------------------------------------------
// Action OpenWebpage
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ExitApplication = function(obj)
{
	this.Type = 'ExitApplication';	
}

/**
 * @private
 */
ZICA.Action.ExitApplication.prototype.createClone = function()
{
	var a = new ZICA.Action.ExitApplication({});
	return a;
}

/**
 * @private
 */
ZICA.Action.ExitApplication.prototype.execute = function(currentNode)
{
	window.close();
}

// ---------------------------------------------------------------------
// Action SetOrChangeAVariable
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.SetOrChangeAVariable = function(obj)
{
	// variables set in loader
	var oper = ['Set(=)','Add(+)','Substract(-)','Divide(/)','Divide INT(/)','Multiply(*)','Multiply INT(*)'];
	
	this.VariableName = obj.VariableName;
	this.Operation = oper.indexOf(obj.Operation);
	this.ValueType = obj.ValueType == 'Value'?0:1;
	this.Value = obj.Value;
	
	this.Type = 'SetOrChangeAVariable';	
}

/**
 * @private
 */
ZICA.Action.SetOrChangeAVariable.prototype.createClone = function()
{
	var a = new ZICA.Action.SetOrChangeAVariable({});
	a.VariableName = this.VariableName;
	a.Operation = this.Operation;
	a.ValueType = this.ValueType;
	a.Value = this.Value;
	return a;
}

/**
 * @private
 */
ZICA.Action.SetOrChangeAVariable.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
				
	if (this.VariableName == null)
		return;
		
	var var1 = Game.hasVariable(this.VariableName);
	if (var1 == true)
		var1 = Game.getVariable(this.VariableName);
	else
		var1 = 0;
		
	var var2 = null;

	if (this.ValueType == 1) //EO_VARIABLE)
	{
		var2 = Game.getVariable(this.Value);	
		if (var2 == null)
			return; // operand variable not existing
	}else
		var2 = this.Value;

	
	switch(this.Operation)
	{
	case 0: //EO_SET:
		var1 = var2;
		break;
	case 1: //EO_ADD:
		var1 += var2;
		break;
	case 2: //EO_SUBSTRACT:
		var1 -= var2;
		break;
	case 3: //EO_DIVIDE:
		var1 /= var2;
		break;
	case 4: //EO_DIVIDE_INT:
		var1 = Math.round(var1 / var2);
		break;
	case 5: //EO_MULTIPLY:
		var1 *= var2;
		break;
	case 6: //EO_MULTIPLY_INT:
		var1 = Math.round(var1 * var2);
		break;
	}		

	Game.setVariable(this.VariableName , var1);
}

// ---------------------------------------------------------------------
// Action IfVariable
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.IfVariable = function(obj)
{
	var comp = ['Is equal to (=)','Is not equal to (<>)','Is bigger than (>)','Is smaller than (<)'];
	
	this.VariableName = obj.VariableName;
	this.ComparisonType = comp.indexOf(obj.ComparisonType);
	this.ValueType = obj.ValueType == 'Value'?0:1;
	this.Value = obj.Value;
	this.TheActionHandler = obj.Action;
	this.TheElseActionHandler = obj.Else;
	
	this.Type = 'IfVariable';	
}

/**
 * @private
 */
ZICA.Action.IfVariable.prototype.createClone = function()
{
	var a = new ZICA.Action.IfVariable({});
	a.VariableName = this.VariableName;
	a.ComparisonType = this.ComparisonType;
	a.ValueType = this.ValueType;
	a.Value = this.Value;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;
	a.TheElseActionHandler = this.TheElseActionHandler ? this.TheElseActionHandler.createClone() : null;
	return a;
}

/**
 * @private
 */
ZICA.Action.IfVariable.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
		
	if (this.VariableName == null)
		return;
		
	var var1 = Game.hasVariable(this.VariableName);
	if (var1 == null) // should not happen since the function above creates if not found
		return;
	
	var1 = Game.getVariable(this.VariableName);
	var var2 = null;

	if (this.ValueType == 1) //EO_VARIABLE)
	{
		var2 = Game.hasVariable(this.Value);
		if (var2 == false) // should not happen since the function above creates if not found
		return;
	
		var2 = Game.getVariable(this.Value);
	}else
		var2 = this.Value;
	
	var execute = false;

	switch(this.ComparisonType)
	{
	case 0: //EO_EQUAL:
	case 1: //EO_NOT_EQUAL:
		{
			execute = (var1 == var2)
			if (this.ComparisonType == 1) //EO_NOT_EQUAL)
				execute = !execute;	
			break;
		}
	case 2: //EO_BIGGER_THAN:
		{
			execute = var1 > var2;
		}
		break;
	case 3: //EO_SMALLER_THAN:
		{
			execute = var1 < var2;
		}
		break;
	}			
	
	if (execute)
	{
		if (this.TheActionHandler)
			this.TheActionHandler.execute(currentNode);
	}
	else
	{
		if (this.TheElseActionHandler)
			this.TheElseActionHandler.execute(currentNode);
	}
}

// ---------------------------------------------------------------------
// Action Store Load Variable
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionStoreLoadVariable = function(obj)
{
	this.Type = 'StoreLoadVariable';
	this.Load = (obj.Load == 'Load Variable')?true:false;
	this.VariableName = obj.VariableName;
}

/**
 * @private
 */
ZICA.Action.ActionStoreLoadVariable.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionStoreLoadVariable({});
	a.Load = this.Load;
	a.VariableName = this.VariableName;
	return a;
}

ZICA.Action.ActionStoreLoadVariable.prototype.setCookie = function(cookieName, value, expdays)
{
	var expdate = new Date();
	expdate.setDate(expdate.getDate() + expdays);
	var cvalue = escape(value) + ("; expires=" + expdate.toUTCString());
	document.cookie = cookieName + "=" + cvalue;
}

ZICA.Action.ActionStoreLoadVariable.prototype.getCookie = function(cookieName)
{
	var ARRcookies = document.cookie.split(";");
	for (var i=0; i<ARRcookies.length; ++i)
	{
		var cookie = ARRcookies[i];
		var equalspos = cookie.indexOf("=");
		var varname = cookie.substr(0, equalspos);
		
		varname = varname.replace(/^\s+|\s+$/g,"");
		
		if (varname == cookieName)
			return unescape(cookie.substr(equalspos+1));
	}
	
	return null;
}

/**
 * @private
 */
ZICA.Action.ActionStoreLoadVariable.prototype.execute = function(currentNode)
{
	if (this.VariableName == null || this.VariableName == "")
		return;
		
	var var1 = Game.hasVariable(this.VariableName);
	
		try
		{			
			if (this.Load)
			{
				// load
				//Game.setVariable(this.VariableName, this.getCookie(this.VariableName));
				var var2 = window.localStorage.getItem(this.VariableName);
				if(var2)
				Game.setVariable(this.VariableName, var2);
			}
			else
			{
				// save
				if(var1)
				window.localStorage.setItem(this.VariableName, Game.getVariable(this.VariableName)) 
				//this.setCookie(this.VariableName, Game.getVariable(this.VariableName), 99);
			}
		}
		catch(e)
		{
			//Debug.print("error loading/saving data");
		}
	
}

// ---------------------------------------------------------------------
// Action PlaySound
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionPlaySound = function(obj)
{
	var mode = ['Play Audio','Stop Audio','Toggle Audio'];
	
	this.SceneNodeToPlay = obj.SceneNodeToPlay;
	if(obj.SceneNodeToPlay == null)this.PlayCurrentSceneNode = true;
	this.Mode = mode.indexOf(obj.Mode);
	this.Type = 'PlaySound';	
}

/**
 * @private
 */
ZICA.Action.ActionPlaySound.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionPlaySound({});
	a.SceneNodeToPlay = this.SceneNodeToPlay;
	a.PlayCurrentSceneNode = this.PlayCurrentSceneNode;;
	a.Mode = this.Mode;
	return a;
}

/**
 * @private
 */
ZICA.Action.ActionPlaySound.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
	
	var nodeToHandle = null;
	if (this.PlayCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToPlay != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToPlay);
	
	if (nodeToHandle)
	{
		if(!nodeToHandle.__audio)return;
		
		if(Game.scene.firstFrame)
			nodeToHandle.__draw(Game.drawContext);	
		
		nodeToHandle.__audio.currentTime = 0;
		
		if(this.Mode == 0)
			nodeToHandle.playAudio();
		else if(this.Mode == 1)
			nodeToHandle.stopAudio();
		else
			nodeToHandle.__audio.paused?nodeToHandle.playAudio():nodeToHandle.stopAudio();
	}
}

// ---------------------------------------------------------------------
// Action ResumeSound
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionResumeSound = function(obj)
{
	var mode = ['Resume Audio','Pause Audio','Toggle Audio'];
	
	this.SceneNodeToPlay = obj.SceneNodeToPlay;
	if(obj.SceneNodeToPlay == null)this.PlayCurrentSceneNode = true;
	this.Mode = mode.indexOf(obj.Mode);
	this.Type = 'PlaySound';	
}

/**
 * @private
 */
ZICA.Action.ActionResumeSound.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionResumeSound({});
	a.SceneNodeToPlay = this.SceneNodeToPlay;
	a.PlayCurrentSceneNode = this.PlayCurrentSceneNode;;
	a.Mode = this.Mode;
	return a;
}

/**
 * @private
 */
ZICA.Action.ActionResumeSound.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
	
	var nodeToHandle = null;
	if (this.PlayCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToPlay != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToPlay);
	
	if (nodeToHandle)
	{
		if(!nodeToHandle.__audio)return;
		
		//nodeToHandle.__audio.currentTime = 0;
		
		if(this.Mode == 0)
			nodeToHandle.playAudio();
		else if(this.Mode == 1)
			nodeToHandle.pauseAudio();
		else
			nodeToHandle.__audio.paused?nodeToHandle.playAudio():nodeToHandle.pauseAudio();
	}
}

// ---------------------------------------------------------------------
// Action StopSound
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionStopSound = function()
{
	this.Type = 'StopSound';	
}

/**
 * @private
 */
ZICA.Action.ActionStopSound.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionStopSound();
	return a;
}

/**
 * @private
 */
ZICA.Action.ActionStopSound.prototype.execute = function(currentNode)
{
	Game.stopAllSounds();
}

// ---------------------------------------------------------------------
// Action ActionDeleteSceneNode
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionDeleteSceneNode = function(obj)
{
	this.Type = 'ActionDeleteSceneNode';	
	
	this.SceneNodeToDelete = obj.SceneNodeToDelete;
	if(this.SceneNodeToDelete == null)this.DeleteCurrentSceneNode = true;
}

/**
 * @private
 */
ZICA.Action.ActionDeleteSceneNode.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionDeleteSceneNode({});
	a.SceneNodeToDelete = this.SceneNodeToDelete;
	a.DeleteCurrentSceneNode = this.DeleteCurrentSceneNode;
	a.TimeAfterDelete = this.TimeAfterDelete;

	return a;
}

/**
 * @private
 */
ZICA.Action.ActionDeleteSceneNode.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.DeleteCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToDelete != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToDelete);

	if (nodeToHandle != null)
		nodeToHandle.__removeFlag = true;
		//sceneManager.addToDeletionQueue(nodeToHandle, this.TimeAfterDelete);
}

// ---------------------------------------------------------------------
// Action RestartBehaviors
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.RestartBehaviors = function(obj)
{
	this.SceneNodeToRestart = obj.SceneNodeToRestart;
	if(this.SceneNodeToRestart == null)this.ChangeCurrentSceneNode = true;
	this.Type = 'RestartBehaviors';	
}

/**
 * @private
 */
ZICA.Action.RestartBehaviors.prototype.createClone = function()
{
	var a = new ZICA.Action.RestartBehaviors({});
	a.SceneNodeToRestart = this.SceneNodeToRestart;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;

	return a;
}

/**
 * @private
 */
ZICA.Action.RestartBehaviors.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToRestart != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToRestart);

	if (nodeToHandle)
	{
		for (var i = 0; i<nodeToHandle.animators.length; ++i)
		{
			var a = nodeToHandle.animators[i];
			if (a != null)
				a.reset();
		}
	}
}

// ---------------------------------------------------------------------
// Action ActionCloneSceneNode
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionCloneSceneNode = function(obj)
{
	this.SceneNodeToClone = obj.SceneNodeToClone;
	if(this.SceneNodeToClone == null)this.CloneCurrentSceneNode = true;
	this.TheActionHandler = obj.ActionToDoWhitClone;
	
	this.Type = 'ActionCloneSceneNode';	
}

/**
 * @private
 */
ZICA.Action.ActionCloneSceneNode.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionCloneSceneNode({});
	a.SceneNodeToClone = this.SceneNodeToClone;
	a.CloneCurrentSceneNode = this.CloneCurrentSceneNode;
	a.TheActionHandler = this.TheActionHandler ? this.TheActionHandler.createClone() : null;

	return a;
}

/**
 * @private
 */
ZICA.Action.ActionCloneSceneNode.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.CloneCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToClone != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToClone);

	if (nodeToHandle)
	{
		// clone
		var cloned = Game.cloneEntity(nodeToHandle);
		
		if (cloned != null)
		{
			// run action on clone
	
			if (this.TheActionHandler)
				this.TheActionHandler.execute(cloned);
		}
	}
}

// ---------------------------------------------------------------------
// Action SetSceneNodeAnimation
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.SetSceneNodeAnimation = function(obj)
{
	this.SceneNodeToChangeAnim = obj.SceneNodeToChangeAnim;
	if(this.SceneNodeToChangeAnim == null)this.ChangeCurrentSceneNode = true;
	this.Loop = obj.Loop;
	this.AnimName = obj.AnimName;
	
	this.Type = 'SetSceneNodeAnimation';
}

/**
 * @private
 */
ZICA.Action.SetSceneNodeAnimation.prototype.createClone = function()
{
	var a = new ZICA.Action.SetSceneNodeAnimation({});
	a.SceneNodeToChangeAnim = this.SceneNodeToChangeAnim;
	a.ChangeCurrentSceneNode = this.ChangeCurrentSceneNode;
	a.Loop = this.Loop;
	a.AnimName = this.AnimName;
		
	return a;
}

/**
 * @private
 */
ZICA.Action.SetSceneNodeAnimation.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.ChangeCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToChangeAnim != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToChangeAnim);

	if (nodeToHandle)
	{
		// set animation
		
		var animatedMesh = nodeToHandle;
		animatedMesh.animation = this.AnimName;
		animatedMesh.animLoop = this.Loop;

	}
}

// ---------------------------------------------------------------------
// Action ActionPlayMovie
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionPlayMovie = function(obj)
{
	this.Type = 'ActionPlayMovie';	
	this.PlayLooped = obj.PlayLooped;
	this.VideoFileName = obj.VideoFileName;
	this.AutoPlay = obj.AutoPlay;
	this.SceneNodeToPlayAt = obj.SceneNodeToPlayAt;
	if(this.SceneNodeToPlayAt == null)this.PlayAtCurrentSceneNode = true;
	
	this.ActionHandlerFinished = obj.ActionOnFinished;
	this.ActionHandlerFailed = obj.ActionOnFailed;
}

/**
 * @private
 */
ZICA.Action.ActionPlayMovie.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionPlayMovie();
	a.PlayLooped = this.PlayLooped;
	a.AutoPlay = this.AutoPlay;
	a.VideoFileName = this.VideoFileName;
	a.SceneNodeToPlayAt = this.SceneNodeToPlayAt;
	a.PlayAtCurrentSceneNode = this.PlayAtCurrentSceneNode;
	
	a.ActionHandlerFinished = this.ActionHandlerFinished ? this.ActionHandlerFinished.createClone() : null;
	a.ActionHandlerFailed = this.ActionHandlerFailed ? this.ActionHandlerFailed.createClone() : null;
		
	return a;
}

/**
 * @private
 */
ZICA.Action.ActionPlayMovie.prototype.execute = function(currentNode, sceneManager)
{
	if (!currentNode)
		return;

	var nodeToHandle = null;
	if (this.PlayAtCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToPlayAt != -1)
		nodeToHandle = Game.scene.getEntityById(this.SceneNodeToPlayAt);
	
	// create video stream
	
	 nodeToHandle.stream = new ZICA.VideoStream(this.VideoFileName)
	
	if (nodeToHandle.stream != null && this.AutoPlay)
	{
		nodeToHandle.stream.play(this.PlayLooped);
	}
}

// ---------------------------------------------------------------------
// Action ActionVideoCommand
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ActionVideoCommand = function(obj)
{
	this.Type = 'ActionVideoCommand';	
	
	this.SceneNodeToPlayAt = obj.SceneNodeToChange;
	if(this.SceneNodeToPlayAt == null)this.PlayAtCurrentSceneNode = true;
	this.Command = ['Play','Pause','Stop','Resume'].indexOf(obj.Command);
	
}

/**
 * @private
 */
ZICA.Action.ActionVideoCommand.prototype.createClone = function()
{
	var a = new ZICA.Action.ActionPlayMovie({});
	a.Command = this.Command;
	a.SceneNodeToPlayAt = this.SceneNodeToPlayAt;
	a.PlayAtCurrentSceneNode = this.PlayAtCurrentSceneNode;
	return a;
}

/**
 * @private
 */
ZICA.Action.ActionVideoCommand.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
	
	var nodeToHandle = null;
	if (this.PlayAtCurrentSceneNode)
		nodeToHandle = currentNode;
	else
	if (this.SceneNodeToPlayAt != -1)
		nodeToHandle = Game.getEntityById(this.SceneNodeToPlayAt);
	
		
	if (nodeToHandle.stream != null)
	{
		switch(this.Command)
		{
		case 0: // play
			{
				nodeToHandle.stream.play(this.PlayLooped);
			}
			break;
		case 1: // pause
			nodeToHandle.stream.pause();
			break;
		case 2: // stop
			nodeToHandle.stream.stop();
			break;
		}	
	}
}

// ---------------------------------------------------------------------
// Playing video stream
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.VideoStream = function(filename)
{
	this.filename = filename;
	this.videoElement = null;
	this.handlerOnVideoEnded = null;
	this.handlerOnVideoFailed = null;
	this.readyToShow = false;
	this.playBackEnded = false;
	this.stopped = false;
	this.state = 0; // 0=stopped, 1=loading, 2=playing, 3=paused
	this.playLooped = false;
	this.isError = false;
	
	this.videoBufferReady = function()
	{
		this.state = 2; // playing
		
		// start video
		this.videoElement.play();
		this.readyToShow = true;
			
	}
	
	this.videoPlaybackDone = function()
	{
		this.state = 0; // 0=stopped, 1=loading, 2=playing, 3=paused
		this.playBackEnded = true;
	}
	
	this.errorHappened = function()
	{
		this.state = 0;
		this.playBackEnded = true;
		this.isError = true;
	}
		
	this.play = function(playLooped)
	{
		if (this.state == 2 || this.state == 1) // playing or loading
			return;
			
		if (this.videoElement)
		{
			if (this.state == 3) // paused
			{
				// unpause
				this.videoElement.play();
				this.state = 2;
				this.playBackEnded = false;
				return;
			}
			else
			if (this.state == 0) // stopped
			{
				this.videoElement.currentTime = 0;
				this.videoElement.play();
				this.state = 2;
				this.playBackEnded = false;
				return;
			}
		}
		
		var v = document.createElement('video');
		
		var me = this;
		
		this.videoElement = v;
		this.playLooped = playLooped;
		
		v.addEventListener("canplaythrough", function() { me.videoBufferReady(); }, true);
		v.addEventListener("ended", function() { me.videoPlaybackDone(); }, true);
		v.addEventListener("error", function() { me.errorHappened(); }, true);
		
		v['preload'] = "auto";
		v.src = Game.assets[filename]; // works with .ogv and .mp4
		v.style.display = 'none';
		
		if (this.playLooped)			
			v.loop = true;
			
		this.state = 1; // loading
		
		// create placeholder texture
	}
	
	this.pause = function()
	{
		if (this.state != 2)
			return;
			
		this.videoElement.pause();
		this.state = 3;
	}
	
	this.stop = function()
	{
		if (this.state != 2)
			return;
			
		this.videoElement.pause();
		this.state = 0;	
	}
	
	this.updateVideoTexture = function()
	{
		if (!this.readyToShow)
			return;
			
		if (this.state != 2) // playing
			return;			
		
	}
	
	this.hasPlayBackEnded = function()
	{
		if (this.state == 0) // 0=stopped, 1=loading, 2=playing, 3=paused
			return true;
			
		return this.playBackEnded;
	}
}

// ---------------------------------------------------------------------
// Action Shoot
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.Shoot = function(obj)
{
	this.ShootType = 0;
	this.Damage = 0;
	this.BulletSpeed = 0.0;
	this.SceneNodeToUseAsBullet = -1;
	this.WeaponRange = 100.0;
	this.Type = 'Shoot';	
	this.SceneNodeToShootFrom = -1;
	this.SceneNodeToShootTo = -1; 
	this.ShootToCameraTarget = false;
	this.AdditionalDirectionRotation = null;
	this.ActionHandlerOnImpact = null;
	this.ShootDisplacement = new ZICA.Vect2d();
	
	this.ShootType = (obj.ShootType == 'Direcly hit, no bullet')?0:1;
	this.Damage = obj.Damage;
	this.SceneNodeToUseAsBullet = obj.SceneNodeToUseAsBullet;
	this.BulletSpeed = obj.BulletSpeed;
	this.WeaponRange = obj.WeaponRange;
	this.ActionHandlerOnImpact = obj.ActionOnImpact;
	this.SceneNodeToShootFrom = obj.SceneNodeToShootFrom;
	this.AdditionalDirectionRotation = obj.AdditionalDirectionRotation;
	this.ShootDisplacement = obj.ShootDisplacement;
	
	this.ShootTo = ['DirectionRotation','CameraTarget','SceneNode'].indexOf(obj.ShootTo);
	
	if(this.ShootTo == 1)
		this.ShootToCameraTarget = true;
	if(this.ShootTo == 2)
		this.SceneNodeToShootTo = obj.SceneNodeToShootTo;
		
}

/**
 * @private
 */
ZICA.Action.Shoot.prototype.createClone = function()
{
	var a = new ZICA.Action.Shoot({});
	a.ShootType = this.ShootType;
	a.Damage = this.Damage;
	a.BulletSpeed = this.BulletSpeed;
	a.SceneNodeToUseAsBullet = this.SceneNodeToUseAsBullet;
	a.WeaponRange = this.WeaponRange;
	a.SceneNodeToShootFrom = this.SceneNodeToShootFrom;
	a.SceneNodeToShootTo = this.SceneNodeToShootTo;
	a.ShootToCameraTarget = this.ShootToCameraTarget;
	a.ShootTo = this.ShootTo;
	a.AdditionalDirectionRotation = this.AdditionalDirectionRotation;
	a.ActionHandlerOnImpact = this.ActionHandlerOnImpact ? this.ActionHandlerOnImpact.createClone(): null;
	a.ShootDisplacement = this.ShootDisplacement.clone();
		
	return a;
}

/**
 * @private
 */
ZICA.Action.Shoot.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;
	
	// calculate ray, depending on how we were shot: If shot by an AI, use its target.
	// it not, use the active camera and shoot into the center of the screen.

	var ray = new Object();
	var rayFound = false;
	var shooterNode = null;
	var cam = null; // temp variable, used multiple times below
	
	if (this.SceneNodeToShootFrom != null)
	{
		var userSpecifiedNode = Game.getEntityById(this.SceneNodeToShootFrom);
		
		if (userSpecifiedNode != null)
		{
			rayFound = true;
			shooterNode = userSpecifiedNode;
			
			// ray.Start = userSpecifiedNode.getTransformedBoundingBox().getCenter();
			
			ray.Start = new ZICA.Vect2d(userSpecifiedNode.x,userSpecifiedNode.y);
			ray.Start.addToThis(this.ShootDisplacement);
		}
	}
	else{
		shooterNode = currentNode;
		
		ray.Start = new ZICA.Vect2d(shooterNode.x,shooterNode.y);
		ray.Start.addToThis(this.ShootDisplacement);
	}
	
	if (this.ShootTo == 1)
	{
		// in order to shoot to the camera target, we need to collide the camera with the world and
		// all AIs to test were to shoot at
		var camVect = new ZICA.Vect2d(Game.scene.x,Game.scene.y);
		camVect = camVect.substract(ray.Start);
		camVect.normalize();
		ray.End = camVect;
	}
	if(this.ShootTo == 0)
	{
		if (typeof this.AdditionalDirectionRotation == 'number')
		{
			ray.End = new ZICA.Vect2d(Math.cos(this.AdditionalDirectionRotation*Math.PI/180),Math.sin(this.AdditionalDirectionRotation*Math.PI/180));
		}

	}
	if(this.ShootTo == 2)
	{
		var nodeTo = null;
		if(this.SceneNodeToShootTo != -1)
			nodeTo = Game.getEntityById(this.SceneNodeToShootTo);
		
		if(nodeTo){
			var dirVect = new ZICA.Vect2d(nodeTo.getCenter().x,nodeTo.getCenter().y);
			dirVect = dirVect.substract(ray.Start);
			dirVect.normalize();
			ray.End = dirVect;
		}
	}

	//console.log(ray);
	// decide if we do a bullet or direct shot

	if (this.ShootType == 1) //ESIT_BULLET)
	{
		var bulletTemplate = null;

		if (this.SceneNodeToUseAsBullet != -1)
			bulletTemplate = Game.getEntityById(this.SceneNodeToUseAsBullet);
		else 
			bulletTemplate = currentNode;
		
		if (bulletTemplate)
		{
			// create bullet now

			var cloned = bulletTemplate.clone();
		
			if (cloned != null)
			{
				cloned.x = ray.Start.X;
				cloned.y = ray.Start.Y;
				cloned.position = 'absoulte';
				cloned.visible = true;
				cloned.isBullet = true;
				cloned.name = "";
				
				cloned.ray = ray;
				cloned.WeaponRange = this.WeaponRange;
				cloned.Damage = this.Damage;
				cloned.shooterNode = shooterNode;
				cloned.bulletTemplate = bulletTemplate;
				cloned.ActionHandlerOnImpact = this.ActionHandlerOnImpact;
				// rotate to target
				//cloned.angle = this.AdditionalDirectionRotation;

				// move to target

				var speed = this.BulletSpeed;
				if (speed == 0) speed = 1.0;
				
				cloned.velX = ray.End.X * speed;
				cloned.velY = ray.End.Y * speed;
				
				Game.scene.addEntity(cloned);
				
				cloned.__onUpdate = function(event){
					
					var a = new ZICA.Vect2d(this.x,this.y);
					var b = this.ray.Start.clone();
					var vect = a.substract(b);
					var length = vect.getLength();
					
					if(length >= this.WeaponRange)
						this.__removeFlag = true;
					
				}
				
				
				cloned.__onCollision = function(event){
					var other = event.other;
					
					if((!other.isBullet) && (other != this.shooterNode) && (other != this.bulletTemplate)){
						
						Game.scene.lastBulletImpact = new ZICA.Vect2d(this.x,this.y);
						this.__removeFlag = true;
						
						if (this.ActionHandlerOnImpact)
							this.ActionHandlerOnImpact.execute(other);	
						
						var targetanimAi = other.getAnimatorOfType('gameai');
						if (targetanimAi)
						targetanimAi.OnHit(this.Damage, other);
					}
				}
				
			}
		}
	}
	else
	if (this.ShootType == 0) //EST_DIRECT)
	{
		for(var i = 0; i<= this.WeaponRange; i++){
			
			var end = ray.End.clone();
			end.multiplyThisWithScal(i)
			var point = ray.Start.add(end);
			point.x = point.X;
			point.y = point.Y;
			
			for(var ii = 0; ii<= Game.scene.children.length-1;ii++){
				var node = Game.scene.children[ii];
			
				if(Game.pointInBox(point,node)){
					
					if((!node.isBullet) && (node != shooterNode)){
						
						Game.scene.lastBulletImpact = new ZICA.Vect2d(point.X,point.Y);
						
						if (this.ActionHandlerOnImpact)
							this.ActionHandlerOnImpact.execute(node);
						
						var targetanimAi = other.getAnimatorOfType('gameai');
						if (targetanimAi)
						targetanimAi.OnHit(this.Damage, node);
						
						i = Infinity;
						break;
					}
				}
					
			}
				
		}

	} // end direct shot
}

// ---------------------------------------------------------------------
// Action ChangeCameraPosition
// ---------------------------------------------------------------------

/**
 * @private
 * @constructor
 * @class
 */
ZICA.Action.ChangeCameraPosition = function(obj)
{
	this.UseAnimatedMovement = obj.UseAnimatedMovement;//false;
	this.TimeNeededForMovementMs = obj.TimeNeededForMovementMs //false;
	this.center = obj.Center;
	//this.SceneNodeToChangePosition = obj.SceneNodeToChangePosition;
	this.Vector = obj.Position.clone();
	this.SceneNodeRelativeTo = obj.SceneNodeRelativeTo;
	if(obj.SceneNodeRelativeTo == null)this.RelativeToCurrentSceneNode = true;
	

	this.Type = 'ChangeCameraPosition';	
}

/**
 * @private
 */
ZICA.Action.ChangeCameraPosition.prototype.createClone = function()
{
	var a = new ZICA.Action.ChangeCameraPosition({});

	a.SceneNodeRelativeTo = this.SceneNodeRelativeTo;
	a.RelativeToCurrentSceneNode = this.RelativeToCurrentSceneNode;
	a.Vector = this.Vector ? this.Vector.clone() : null;
	a.center = this.center;
	a.UseAnimatedMovement = this.UseAnimatedMovement;
	a.TimeNeededForMovementMs = this.TimeNeededForMovementMs;
		
	return a;
}

/**
 * @private
 */
ZICA.Action.ChangeCameraPosition.prototype.execute = function(currentNode)
{
	if (!currentNode)
		return;

	var nodeToHandle = Game.scene;
	
	if (nodeToHandle)
	{
		var finalpos = null;
	
		var nodeRelativeTo = null;
		if (this.RelativeToCurrentSceneNode)
			nodeRelativeTo = currentNode;
		else
		if (this.SceneNodeRelativeTo != -1)
			nodeRelativeTo = Game.getEntityById(this.SceneNodeRelativeTo);

		if (nodeRelativeTo){
			
			var x = nodeRelativeTo.x;
			var y = nodeRelativeTo.y;
			
			if(this.center){
				x += nodeRelativeTo.width/2;
				y += nodeRelativeTo.height/2;
			}
			
			finalpos = new ZICA.Vect2d(x + this.Vector.X,y + this.Vector.Y);
		}
		
		if (finalpos != null)
		{
			if (this.UseAnimatedMovement && this.TimeNeededForMovementMs > 0)
			{

				var anim = new ZICA.AnimatorFlyStraight({});
				anim.Start = new ZICA.Vect2d(nodeToHandle.x,nodeToHandle.y);
				anim.End = finalpos;
				anim.TimeForWay = this.TimeNeededForMovementMs;
				anim.DeleteMeAfterEndReached = true;
				anim.recalculateImidiateValues();
				
				nodeToHandle.addAnimator(anim);
			}
			else
			{
				// set position directly
				nodeToHandle.x = finalpos.X;
				nodeToHandle.y = finalpos.Y;
			}
		}
	}
}

ZICA.Camera = function(context, settings) {
        settings = settings || {};
        this.distance = 1000.0;
        this.lookAt = [0, 0];
        this.context = context;
        this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
        this.viewport = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0,
            scale: [1.0, 1.0]
        };
		
        //this.addListeners();
        this.updateViewport();
		this.hasBegin = false;
    };

    ZICA.Camera.prototype.begin = function() {
		this.hasBegin = true;
        this.context.save();
		//this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.applyScale();
        this.applyTranslation();
    }

    ZICA.Camera.prototype.end = function() {
		this.hasBegin = false;
        this.context.restore();
    }

    ZICA.Camera.prototype.applyScale = function() {
        this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
    }

    ZICA.Camera.prototype.applyTranslation = function() {
        this.context.translate(-this.viewport.left, -this.viewport.top);
    }

    ZICA.Camera.prototype.updateViewport = function() {
		//var scene = Game.scene || Editor.scene;
        this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
        this.viewport.width = this.context.canvas.width;// this.distance * Math.tan(this.fieldOfView);
        this.viewport.height = this.context.canvas.height;//this.viewport.width / this.aspectRatio;
        this.viewport.left = this.lookAt[0] - (this.viewport.width / 2.0);
        this.viewport.top = this.lookAt[1] - (this.viewport.height / 2.0);
        this.viewport.right = this.viewport.left + this.viewport.width;
        this.viewport.bottom = this.viewport.top + this.viewport.height;
        this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
        this.viewport.scale[1] = this.context.canvas.height / this.viewport.height;
    }

    ZICA.Camera.prototype.zoomTo = function(z) {
        this.distance = z;
        this.updateViewport();
    }

    ZICA.Camera.prototype.moveTo = function(x, y) {
        this.lookAt[0] = x;
        this.lookAt[1] = y;
        this.updateViewport();
    }
	
	ZICA.Camera.prototype.set = function(x,y){
		var scene = Game.scene || Editor.scene;
		
		if(x < (this.viewport.width / 2.0))x = this.viewport.width / 2.0;
		if(y < (this.viewport.height / 2.0))y = this.viewport.height / 2.0;
		
		if(x > scene.width - (this.viewport.width / 2.0)) x = scene.width - (this.viewport.width / 2.0);
		if(y > scene.height - (this.viewport.height / 2.0)) y = scene.height - (this.viewport.height / 2.0);
		
		scene.x = x;
		scene.y  = y;
		
		if(this.hasBegin)this.end();
		this.moveTo(x,y);
		this.begin();
		//if(Editor)Editor.update();
	}

    ZICA.Camera.prototype.screenToWorld = function(x, y, obj) {
        obj = obj || {};
        obj.x = (x / this.viewport.scale[0]) + this.viewport.left;
        obj.y = (y / this.viewport.scale[1]) + this.viewport.top;
        return obj;
    }

    ZICA.Camera.prototype.worldToScreen = function(x, y, obj) {
        obj = obj || {};
        obj.x = (x - this.viewport.left) * (this.viewport.scale[0]);
        obj.y = (y - this.viewport.top) * (this.viewport.scale[1]);
        return obj;
    }

    ZICA.Camera.prototype.addListeners = function() {
        // Zoom and scroll around world
		var self = this;
		
      /*   window.onwheel = function(e) {
            if (e.ctrlKey) {
                // Your zoom/scale factor
                let zoomLevel = self.distance - (e.deltaY * 20);
                if (zoomLevel <= 1) {
                    zoomLevel = 1;
                }

                self.zoomTo(zoomLevel);
            } else {
                // Your track-pad X and Y positions
                var x = self.lookAt[0] + (e.deltaX * 2);
                var y = self.lookAt[1] + (e.deltaY * 2);

                //this.moveTo(x, y);
				self.set(x,y);
            }
        }; */
		
		window.addEventListener("keydown", function(e) {
			var scene = Game.scene || Editor.scene;
			
			if(e.keyCode == 37){
				scene.x -= 5;
				Editor.update();
				Editor.sceneGui.updateDisplay();
			}
			if(e.keyCode == 38){
				scene.y -= 5;
				Editor.update();
				Editor.sceneGui.updateDisplay();
			}
			if(e.keyCode == 39){
				scene.x += 5;
				Editor.update();
				Editor.sceneGui.updateDisplay();
			}
			if(e.keyCode == 40){
				scene.y += 5;
				Editor.update();
				Editor.sceneGui.updateDisplay();
			}
			
			//self.set(scene.x,scene.y);
	  
	}, false);


        // Center camera on "R"
        window.addEventListener('keydown', e => {
            if (e.key === 'r' && e.ctrlKey) {
				e.preventDefault();
                this.zoomTo(1000);
                //this.moveTo(0, 0);
				this.set(0,0);
				Editor.update();
				Editor.sceneGui.updateDisplay();
            }
        });
		
		var down=false;
		var x=0;
		var y=0;
		var x1=0;
		var y1=0;
		var canvas = document.getElementById('field');

		canvas.addEventListener('mousedown',function(e){
			if(event.which != 3)return;
			
			down = true;
			
			x = e.clientX;
			y = e.clientY
			
			x1 = Editor.scene.x;
			y1 = Editor.scene.y;
			
			
		});

		canvas.addEventListener('mouseup',function(e){
			if(event.which != 3)return;
			down = false;
			canvas.style.cursor = '';
			Editor.isMoving = false;
		});

		canvas.addEventListener('mousemove',function(e){
			if(event.which != 3)return;
			if (down) {
				Editor.isMoving = true;
				canvas.style.cursor = 'move';
				var sx = (x - e.clientX);
				var sy = (y - e.clientY);
				var s = Editor.camera.worldToScreen(Editor.scene.x,Editor.scene.y);
			   Editor.scene.x = x1 + sx;
			   Editor.scene.y = y1 + sy;
			    
			   Editor.update();
			   Editor.sceneGui.updateDisplay();
			}
		});

		canvas.addEventListener('mouseleave',function(e){
			if(event.which != 3)return;
			down = false;
		});
    }


        ZICA.Entity = function() {
            //user-defined entity name
            this.name = "";
			//type
			this.type = 'entity';
			// Type represents the collision detector's handling
			this.physicType = 'kinematic'; //'kinematic','dynamic'
			this.isEntity = true;
			//attachmen;
			this.attachTo = null;
            //position
			this.position = 'absolute';
			//relative 
			this.X = 0;
			this.Y = 0;
			//absolute
            this.x = 0;
            this.y = 0;
            //size
            this.width = 50;
            this.height = 50;
			// Store a half size for quicker calculations
			this.halfWidth = this.width * .5;
			this.halfHeight = this.height * .5;
			//rotate
			this.angle = 0;
			//visible
			this.visible = true;
			//locked for editor
			this.locked = false;
			//disabled 
			this.disabled = false;
			//image
			this.drawImage = true;
			this.aspectRatio = false;
			this.image = '';
			
			//audio 
			this.loop = false;
			this.muted = false;
			this.autoplay = true;
			this.volume = 1;
			this.audio = '';
			this.audio2d = false;
			this.distance = 300;
			
			//ui
			this.element = '';
			//animators 
			this.animators = '[]';
			
			//animation
			this.animLoop = true;
			this.animations = {};
			this.animation = '';
			this.fps = 12;
			this.elapsed = 0;
			this.__then = Date.now();
			
			/* this.animation = '';
			this.animAutoplay = false;
			this.animLoop = true; */
			
			//ui element 
			//this.element = null;
			//draw text 
			this.drawText = true;
			this.text = "";
            this.font = "Arial";
			this.fontSize =  15; //"12pt";
			this.fontBold = false;
			this.fontItalic = false;
			//this.fontUnderline = false;
			this.fontColor = "rgba(255,0,0,1)";
			this.textAlign = 'center';
			this.verticalAlign = 'top';
			this.lineHeight = 15;
            //velocity
            this.velX = 0;
            this.velY = 0;
			// Acceleration
			this.ax = 0;
			this.ay = 0;
			//Restitution
			this.restitution = .2;
			//opacity
			this.opacity = 1;
			//draw color 
			this.drawColor = true;
            //color the entity will be drawn
            this.color = "rgba(0,0,0,1)";
            //border
			this.drawBorder = false;
			this.borderWidth = 2.5;
			this.borderColor = "rgba(255,0,0,1)";
			this.borderStyle = 'solid';
			//higher means it will be drawn on top of other objects
            this.priority = 1;
            //whether or not the entity is being blocked by another (should be set manually through collision)
            this.blockedUp = false;
            this.blockedDown = false;
            this.blockedLeft = false;
            this.blockedRight = false;
            //stores the previous position (note: in __onUpdate(), these will be the same as x and y)
            this.prevX = 0;
            this.prevY = 0;
            //whether or not to check collisions for this entity
            this.collides = true;
			this.collision = true;
            //internal flag for removing this entity at/after the next __onUpdate()
            this.__image = new Image();
			//audio buffer
			this.__audio = new Audio();
			//video buffer
			this.stream = null;
			//element
			this.__element = null;
			//element properties
			
			//button
			this.hoverColor = 'rgba(255,0,0,1)';
			this.toggle = false;
			
			//checkbox
			this.checked = false;
			
			//slider
			this.min = 0;
			this.max = 100;
			this.value = 0;
			
			//textfield
			this.placeholder = 'Enter text...';
			this.readOnly = false;
			
			//select,radiogroup,buttongroup
			this.selected = '';
			this.selectedIndex = 0;
			
			//progressbar 
			this.animated = false;
			this.barColor = 'rgba(255,0,0,1)';
			
			//starrating
			this.rate = 0;
			
			//html view 
			this.html = '';
			
			//link 
			this.linkColor = 'rgba(255,0,0,1)';
			this.activeColor = 'rgba(0,0,255,1)';
			this.visitedColor = 'rgba(140,21,222,1)';
			this.linkURL = '#';
			this.linkTarget = '_blank';
			
			//scrollbar horizontal 
			this.size = 10;
			this.seekSpeed = 'slow'
			
			//select option 
			this.options = [];
			
			this.__removeFlag = false;
            this.__guid = this.__generateGUID();
            //this.__collisionBounds = { type: enums_1.CollisionType.rectangle };
			
			// Update the bounds of the object to recalculate
			// the half sizes and any other pieces
			this.updateBounds();
		}
        /**
         * Sets an entity's remove flag. Will be removed before or after the entity updates next
         **/
        ZICA.Entity.prototype.remove = function () {
            this.__removeFlag = true;
        };
        /**
         * Returns whether or not an entity is removed from the game world
         **/
        ZICA.Entity.prototype.isRemoved = function () {
            return this.__removeFlag;
        };
        /**
         * Creates a copy of the entity.
         * Object members are attempted to be copied by JSON.parse(JSON.stringify(obj)).
         **/
        ZICA.Entity.prototype.clone = function () {
            var ent = this;
			var clonedAnimators = ent.cloneAnimators();
			var cloned = ent.constructor.constructEntity(ent);
			cloned.__guid = cloned.__generateGUID();
			cloned.animators = clonedAnimators;
			//Game.entityList.push(cloned);
			return cloned;
        };
		//Kontraverzan je nemoj ga kroisiti
        ZICA.Entity.prototype.duplicate = function () {
            var result = new ZICA.Entity();
            for (var key in this) {
                if (typeof this[key] == "object") {
                    var objCopy = JSON.parse(JSON.stringify(this[key]));
                    result[key] = objCopy;
                }
                else
                    result[key] = this[key];
            }
            return result;
        };
        ZICA.Entity.prototype.__onGameStart = function (event) { };
        ZICA.Entity.prototype.__onUpdate = function (event) { };
        ZICA.Entity.prototype.__onCollision = function (event) { };
        ZICA.Entity.prototype.__draw = function (drawContext) {
            
			if(!this.visible)return; 
			
			if(this.beforeDraw)this.beforeDraw.call(this,drawContext);
				
			if(this.position == 'absolute')
				this.__updateFromAbsolute();
				
			if(this.position == 'fixed')
				this.__updateFromFixed();
			
			/* if(this.attachTo){
				var obj = Editor.scene.getEntityByUID(this.attachTo);
				this.x = obj.x + (obj.x  - this.aX);
				this.y = obj.y + (obj.y  - this.aY);	
			} */
			
			drawContext.save();
			drawContext.translate(this.x + (this.width/2), this.y+ (this.height/2));        
			drawContext.rotate( this.angle * Math.PI / 180 );
			drawContext.translate(-this.x + (-this.width/2), -this.y+ (-this.height/2));
			
			drawContext.globalAlpha = this.opacity;
			
			
			
			if(this.drawColor){	
			drawContext.fillStyle = this.color;
            drawContext.fillRect(this.x, this.y, this.width, this.height);
			}
			
			if(this.__audio instanceof Audio == false) this.__audio = new Audio();
			
			if(Game.state == 2){
				
				this.__audio.muted = this.muted;
				this.__audio.loop = this.loop;
				this.__audio.autoplay = this.autoplay;
				
				//this.__audio.playbackRate = this.playbackRate;
				
				if(this.audio2d){
					var p1 = new ZICA.Vect2d(this.x,this.y);
					var cp = new ZICA.Vect2d(Game.scene.x,Game.scene.y);
					
					var d1 = this.distance;
					var d2 = p1.getDistanceTo(cp);
					
					var muply = d2/d1;
					muply>1?muply = 1:0;
					muply = 1-muply;
					
					Game.print(muply);
					this.__audio.volume = this.volume*muply;
					
				}else{
					this.__audio.volume = this.volume;
				}
				
				if(this.__audio.name != this.audio){	
						this.__audio.name = this.audio;
						
						if(this.audio)
						this.__audio.src = (this.audio in Game.assets)?Game.assets[this.audio]:'';
						else 
						this.__audio.src = '';	
				}
			
			}
						
			//if(this.drawImage){
				
				/* if(Game)
				if(!(this.image in Game.assets)){
					obj.image = ''; 
				} */
				
				if(this.__image instanceof Image == false) this.__image = new Image();
				
				if(this.__image.name != this.image){	
					this.__image.name = this.image;
					
					if(this.image)
					this.__image.src = (this.image in Game.assets)?Game.assets[this.image]:'';
					else 
					this.__image.src = '';	
				}
				
				if(this.aspectRatio){
					
					if(this.drawImage){
						
						var w = this.__image.naturalWidth;
						var h = this.__image.naturalHeight;
						var scale = Math.min(this.width / w, this.height / h);
						
						var cx = Game.camera.viewport.left;
						var cy = Game.camera.viewport.top;
						
						drawContext.save();
						
						drawContext.setTransform(scale, 0, 0, scale, this.x-cx + (this.width/2),this.y-cy + (this.height/2));
						drawContext.rotate( this.angle * Math.PI / 180 );
						drawContext.drawImage(this.__image, -w / 2, -h / 2, w, h);
						drawContext.restore();
					}
					//var aspect = this.calculateAspectRatio();
					//drawContext.drawImage(this.__image, this.x, this.y, aspect.width, aspect.height);
					
				}else
					//drawContext.filter = 'blur(4px)'; 
					if(this.drawImage)
					drawContext.drawImage(this.__image, this.x, this.y, this.width, this.height);
				
			//}
			
			if(this.__video instanceof Image == false) this.__video = new Image();
				
				
				if(this.aspectRatio){
					
					if(this.stream){
						
						var w = this.__video.naturalWidth;
						var h = this.__video.naturalHeight;
						var scale = Math.min(this.width / w, this.height / h);
						
						var cx = Game.camera.viewport.left;
						var cy = Game.camera.viewport.top;
						
						drawContext.save();
						
						drawContext.setTransform(scale, 0, 0, scale, this.x-cx + (this.width/2),this.y-cy + (this.height/2));
						drawContext.rotate( this.angle * Math.PI / 180 );
						drawContext.drawImage(this.stream.videoElement, -w / 2, -h / 2, w, h);
						drawContext.restore();
					}
					//var aspect = this.calculateAspectRatio();
					//drawContext.drawImage(this.__image, this.x, this.y, aspect.width, aspect.height);
					
				}else
					//drawContext.filter = 'blur(4px)'; 
					if(this.stream)
						if(this.stream.videoElement)
							drawContext.drawImage(this.stream.videoElement, this.x, this.y, this.width, this.height);
				
			
			var now = Date.now();
		    this.elapsed = Math.abs(now - this.__then);
			var interval = 1000/this.fps;
			
		   if((this.elapsed > interval) && Game.isRunning())
		   {
			this.updateAnimation();
			this.__then = now - (this.elapsed % interval);
		   }
		   
		   this.drawAnimation(drawContext);
		   
			if(this.element){	
				
				if(this.element == 'button'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Button) )
					this.__element = new ZICA.UI.Button(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'slider'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Slider))
					this.__element = new ZICA.UI.Slider(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'checkbox'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.CheckBox))
					this.__element = new ZICA.UI.CheckBox(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'radio'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Radio))
					this.__element = new ZICA.UI.Radio(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'buttongroup'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.ButtonGroup))
					this.__element = new ZICA.UI.ButtonGroup(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'radiogroup'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.RadioGroup))
					this.__element = new ZICA.UI.RadioGroup(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
				
				if(this.element == 'textfield'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.TextField))
					this.__element = new ZICA.UI.TextField(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'progressbar'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.ProgressBar))
					this.__element = new ZICA.UI.ProgressBar(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'spinner'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Spinner))
					this.__element = new ZICA.UI.Spinner(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'starrating'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.StarRating))
					this.__element = new ZICA.UI.StarRating(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'htmlview'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.HtmlView))
					this.__element = new ZICA.UI.HtmlView(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'link'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Link))
					this.__element = new ZICA.UI.Link(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
				if(this.element == 'scrollbarhorizontal'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.ScrollBarHorizontal))
					this.__element = new ZICA.UI.ScrollBarHorizontal(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'scrollbarvertical'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.ScrollBarVertical))
					this.__element = new ZICA.UI.ScrollBarVertical(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
				if(this.element == 'select'){
					
					if(!this.__element || !(this.__element instanceof ZICA.UI.Select))
					this.__element = new ZICA.UI.Select(this);
					
					if(this.__element)this.__element.draw(drawContext)
				}
			
			}else{
				if(this.__element)this.__element = null;
			}
			
			if(this.drawText){
			//drawContext.stroke();
			drawContext.fillStyle = this.fontColor;
			var font = (this.fontItalic?'italic ':'') + (this.fontBold?' bold ':'') + this.fontSize +'px '+ this.font;
			font = font.trim();
			font = font.replace('  ',' ');
			drawContext.font = font;
			var marginLeft = 0;
			var txt = this.text;
			if(this.element == 'textfield'){
				var marginLeft = 5;
				
				while(drawContext.measureText(txt).width > this.width - marginLeft){
					if(txt.length)
					txt = txt.substring(1);
					else break;
				}
			}
			drawContext.mlFillText(txt, this.x + marginLeft, this.y, this.width, this.height, this.verticalAlign, this.textAlign, this.lineHeight);
			this.textWidth = drawContext.measureText(txt).width + marginLeft;
			//drawContext.textAlign = 'center';
			//drawContext.textBaseline = 'middle'; 
            //drawContext.fillText(this.text, this.x + (this.width/2), this.y+ (this.height/2));
			}
			
			if(this.drawBorder){
			drawContext.lineWidth = this.borderWidth;
			drawContext.strokeStyle = this.borderColor;
			if(this.borderStyle == 'dashed'){
				var max = Math.max(this.width,this.height);
				var min = Math.min(this.width,this.height);
				drawContext.setLineDash([max/10,min/10]);
			}
			drawContext.strokeRect(this.x+this.borderWidth/2, this.y + this.borderWidth/2, this.width - this.borderWidth, this.height - this.borderWidth);
			}
			
			drawContext.restore();
			
			if(this.afterDraw)this.afterDraw.call(this,drawContext);			
		
		};
		
/* 		//Round rect func
		ZICA.Entity.prototype.drawBorderRect =
		function (xx, yy, ww, hh, rad, fill, stroke) {
			correctRadius(rad, ww, hh);
			if (typeof(rad) === "undefined") rad = 0;
			if (typeof(rad) === "number") rad = {tr:rad,tl:rad,bl:rad,br:rad};
			this.beginPath();
			this.moveTo(xx, yy);
			this.arcTo(xx + ww, yy, xx + ww, yy + hh, rad.tr);
			this.arcTo(xx + ww, yy + hh, xx, yy + hh, rad.br);
			this.arcTo(xx, yy + hh, xx, yy, rad.bl);
			this.arcTo(xx, yy, xx + ww, yy, rad.tl);
			if (stroke) this.stroke();  // Default to no stroke
			if (fill || typeof(fill) === "undefined") this.fill();  // Default to fill
		};
		ZICA.Entity.prototype.correctRadius = function(r, w, h) {
		  if (r.tl + r.tr > w) {
			r.tl -= (r.tl + r.tr - w) / 2;
			r.tr = w - r.tl;
		  }
		  if (r.bl + r.br > w) {
			r.br -= (r.br + r.bl - w) / 2;
			r.bl = w - r.br;
		  }
		  if (r.tl + r.bl > h) {
			r.tl -= (r.tl + r.bl - h) / 2;
			r.bl = h - r.tl;
		  }
		  if (r.tr + r.br > h) {
			r.tr -= (r.tr + r.br - h) / 2;
			r.br = h - r.tr;
		  }
		 } */
		 
        /**
         * Recalculates the bounds that an entity will use for collision detection.
         * Ran during collision checks as well as right after a collision is made
         **/
      /*   ZICA.Entity.prototype.__recalculateCollisionBounds = function (compVars) {
            if (!this.collides)
                return null;
            var rectBounds = this.__collisionBounds;
            var comp = compVars.comp;
            var prevComp = compVars.prevComp;
            var velComp = compVars.velComp;
            var sizeComp = compVars.sizeComp;
            var dirs = compVars.dirs;
            //set up custom bounding boxes using previous and current positions to account for high entity speeds
            var bbox = {
                type: enums_1.CollisionType.rectangle,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
            rectBounds.x = this.x;
            rectBounds.y = this.y;
            rectBounds.width = this.width;
            rectBounds.height = this.height;
            rectBounds[comp] = Math.min(this[comp], this[prevComp]);
            rectBounds[sizeComp] = Math.abs(this[prevComp] - this[comp]) + this[sizeComp];
        }; */
		
		ZICA.Entity.prototype.playAudio = function(){
			if(this.__audio.duration == this.__audio.currentTime)this.__audio.currentTime = 0;
			this.__audio.play();
		};
		
		ZICA.Entity.prototype.pauseAudio = function(){
		
			this.__audio.pause();
		};
		
		ZICA.Entity.prototype.stopAudio = function(){
			
			this.__audio.pause();
			this.__audio.currentTime = 0;
			
		};
		
		ZICA.Entity.prototype.__updateFromFixed = function(){
			var camera = Game.camera;
			this.x = camera.viewport.left + this.X;
			this.y = camera.viewport.top + this.Y;
		};
		
		ZICA.Entity.prototype.__updateFromAbsolute = function(){
			var camera = Game.camera;
			this.X = -camera.viewport.left + this.x;
			this.Y = -camera.viewport.top + this.y;
		};
		
		ZICA.Entity.prototype.calculateAspectRatio = function(){
			
			 var ratio = Math.min(this.width / this.__image.width, this.height / this.__image.height);
			 return { width: this.__image.width*ratio, height: this.__image.height*ratio }; 
			
		};
		ZICA.Entity.prototype.getCenter = function(){
			var x = this.x + this.width/2;
			var y = this.y + this.height/2
			return {x:x ,y:y};
		};
		
		// Update bounds includes the rect's
		// boundary updates
		ZICA.Entity.prototype.updateBounds = function(){
			this.halfWidth = this.width * .5;
			this.halfHeight = this.height * .5;
		};

		// Getters for the mid point of the rect
		ZICA.Entity.prototype.getMidX = function(){
			return this.halfWidth + this.x;
		};

		ZICA.Entity.prototype.getMidY = function(){
			return this.halfHeight + this.y;
		};

		// Getters for the top, left, right, and bottom
		// of the rectangle
		ZICA.Entity.prototype.getTop = function(){
			return this.y;
		};
		ZICA.Entity.prototype.getLeft = function(){
			return this.x;
		};
		ZICA.Entity.prototype.getRight = function(){
			return this.x + this.width;
		};
		ZICA.Entity.prototype.getBottom = function(){
			return this.y + this.height;
		};
	
        ZICA.Entity.prototype.__getCollisionBounds = function () { return this.__collisionBounds; };
        /**
         * Generate a pseudo GUID randomly (not guaranteed to be unique). Thanks guid.us!
         **/
        ZICA.Entity.prototype.__generateGUID = function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        };
		
		ZICA.Entity.prototype.removeAnimator = function(anim){
			
			var index = this.animators.indexOf(anim);
			
			if(index)
				this.animators.splice(index,1);
			
		};
		
		ZICA.Entity.prototype.addAnimator = function(anim){
			
			if(typeof this.animators == 'string')
				this.animators = [];
				
			if(anim)
			this.animators.push(anim);
		};
		
		// get animator by type
		ZICA.Entity.prototype.getAnimatorOfType = function(type)
		{
		  if(!this.animators.length)return;
		  
		  for(var anim in  this.animators)
			  if(this.animators[anim].getType() == type)
				  return this.animators[anim];
		};
		
		ZICA.Entity.prototype.cloneAnimators = function(){
			
			if(!Array.isArray(this.animators))return [];
			
			var animators = [];
			
			for (var i = 0; i<this.animators.length; ++i)
			{
				var a = this.animators[i];
				if (a != null)
					animators.push(a.createClone());
			}
			
			return animators;
		}
		/////////////////////////////////////////////////
		// add animation
		ZICA.Entity.prototype.addAnimation = function(animation)
	   {
		  this.animations[animation.id] = animation;
	   };
	   ZICA.Entity.prototype.createAnimation = function(sy, width, height, frameCount, id)
	   {
		  var obj = {};
		  obj.sy = sy;
		  obj.width = width;
		  obj.height = height;
		  obj.frameCount = frameCount;
		  obj.frame = 0;
		  obj.id = id;
		  
		  return obj;
	   };
	   ZICA.Entity.prototype.removeAnimation = function(id)
	   {
		  return delete this.animations[id];
	   };
		// get animation by id
	   ZICA.Entity.prototype.getAnimationbyId = function(id)
	   {
		  return this.animations[id]?this.animations[id]:null;
	   };
	   // get all ids of animations
	   ZICA.Entity.prototype.getAnimations = function(){
		   var arr = [];
		   arr.push('');
		   
		   for(var i in this.animations){
				if(i)arr.push(i);
		   }
		   return arr;
	   };
	   // set animation
	    ZICA.Entity.prototype.setAnimation = function(id)
	   {
		   this.animation =  id;
		   
		   if(id)
		   this.animations[id].frame = 0;
		  //this.currentAnimation = this.getAnimationbyId(id);
	   };
	   // update animation
	    ZICA.Entity.prototype.updateAnimation = function()
	   {
		   var self = this.animations[this.animation];
		   if(!self)return;
		 
		   if((self.frame >= self.frameCount-1) && this.animLoop == false) return;
			
		   self.frame = (self.frame + 1) % self.frameCount;
		  
	   };
		// draw animtion
	   ZICA.Entity.prototype.drawAnimation = function(context)
	   {
			var self = this.animations[this.animation];
		    if(!self)return;
			
			  context.drawImage(this.__image, self.frame*self.width, self.sy, self.width, self.height, this.x, this.y, this.width, this.height);
			  
		  //this.currentAnimation.drawFrame(context, this.__image, this.x, this.y);
	   }
        /**
         * Take an object that looks like an entity and make a new BaseEntity with all of its properties
         *   properly applied and copied.
         * Can be used to duplicate any entity, though not "deep" if any members are reference types.
         **/
        ZICA.Entity.constructEntity = function (ent) {
            var result = new ZICA.Entity();
            for (var key in ent) {
                if (key === '__image' || key == '__element')
                    continue;
                if (key.substring(0, 4) == "__on" && key.substring(key.length - 6) == "String") {
                    //all function strings will be of the form __<FuncName>String
                    var memName = key.substring(0, key.lastIndexOf("String"));
                    var func = new Function("event", ent[key]);
                    result[memName] = func;
                }
                result[key] = ent[key];
            }
            return result;
        };
    
   
    ZICA.Keys = {
		//Mouse and Touch
		leftButton:1,
		middleButton:2,
		rightButton:3,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        zero: 48,
        one: 49,
        two: 50,
        three: 51,
        four: 52,
        five: 53,
        six: 54,
        seven: 55,
        eight: 56,
        nine: 57,
        numPadZero: 96,
        numPadOne: 97,
        numPadTwo: 98,
        numPadThree: 99,
        numPadFour: 100,
        numPadFive: 101,
        numPadSix: 102,
        numPadSeven: 103,
        numPadEight: 104,
        numPadNine: 105,
        numPadAsterisk: 106,
        numPadPlus: 107,
        numPadMinus: 109,
        numPadPeriod: 110,
        numPadForwardSlash: 111,
        minus: 189,
        equals: 187,
        space: 32,
        enter: 13,
        shift: 16,
        crtl: 17,
        alt: 18,
        tab: 9,
        capsLock: 20,
        backspace: 8,
        escape: 27,
        insert: 45,
        delete: 46,
        end: 35,
        home: 36,
        pageUp: 33,
        pageDown: 34,
        comma: 188,
        period: 190,
        forwardSlash: 191,
        backSlash: 220,
        semicolon: 186,
        apostrophe: 222,
        leftBracket: 219,
        rightBracket: 221,
        backTick: 192,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
    };
	
	
       ZICA.Scene =  function() {
            //id 
			this.id = 0;
			//type
			this.type = 'scene';
			//
			this.isScene = true;
			//uid 
			this.uId = this.__generateGUID();
            //user-defined entity name
            this.name = "";
			//IS active 
			this.active = false;
			//gravity
			this.gravity = 10;
			//camera positon
			this.x = 0;
			this.y = 0;
			//camera Mode
			this.useCamera = false;
            //world size 
            this.width = 400;
            this.height = 400;
			//drawMap
			this.drawMap = true;
			//map
			this.map = '';
			//opacity
			this.opacity = 1;
			//draw color 
			this.drawColor = true;
			//backgroundColor
			this.color = 'rgba(0,0,0,1)';
			//backgroundImage
			this.drawImage = true;
			this.aspectRatio = false;
			this.image = "";
			this.__image = new Image();
			this.__map = new Image();
			//children
			this.children = [];
			//first-frame;
			this.firstFrame = true;
			
			//Animators
			this.animators = '[]'
			
			this.animations = {};
			
			this.__onGameStartString = '';
			this.__onUpdateString = '';
			this.__onCollisionString = '';
        }
		
	ZICA.Scene.prototype.__generateGUID = function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        };
		
	ZICA.Scene.prototype.addEntity = function(n)
		{
			if (n)
			{
				/* n.scene = this.scene;
					
				if (n.Parent)
					n.Parent.removeChild(n);
				n.Parent = this; */
				//n.parent = this;
				this.children.push(n);
			}
		}
		
		ZICA.Scene.prototype.removeEntity = function(n)
		{
			for (var i = 0; i<this.children.length; ++i)
			{
				if (this.children[i] === n)
				{
					//n.Parent = null;
					this.children.splice(i, 1);
					return;
				}
			}
		}
        ZICA.Scene.prototype.getEntityByName = function (name) {
			
			for (var i = 0; i<this.children.length; ++i)
			{
				if (this.children[i].name === name)
				{
					return this.children[i];
				}
			}
            
        };
		
		 ZICA.Scene.prototype.getEntityByUID = function (uid) {
			
			for (var i = 0; i<this.children.length; ++i)
			{
				if (this.children[i].__guid === uid)
				{
					return this.children[i];
				}
			}
            
        };
		
		ZICA.Scene.prototype.getEntity = function (index) {
			
			for (var i = 0; i<this.children.length; ++i)
			{
				if (i === index)
				{
					return this.children[i];
				}
			}
            
        };
		
		ZICA.Scene.prototype.getEntitiesByName = function (name) {
			var entities = [];
			for (var i = 0; i<this.children.length; ++i)
			{
				if (this.children[i].name === name)
				{
					entities.push(this.children[i]);
					
				}
			}
			
			return entities;
            
        };
		ZICA.Scene.prototype.duplicate = function () {
            var result = new ZICA.Scene();
            for (var key in this) {
                if (typeof this[key] == "object") {
                    var objCopy = JSON.parse(JSON.stringify(this[key]));
                    result[key] = objCopy;
                }
                else
                    result[key] = this[key];
            }
            return result;
        };
		
		ZICA.Scene.prototype.removeAnimator = function(anim){
			
			var index = this.animators.indexOf(anim);
			
			if(index)
				this.animators.splice(index,1);
			
		};
		
		ZICA.Scene.prototype.addAnimator = function(anim){
			
			if(anim)
			this.animators.push(anim);
		};
		
		// get animator by type
		ZICA.Scene.prototype.getAnimatorOfType = function(type)
		{
		  if(!this.animators.length)return;
		  
		  for(var anim in  this.animators)
			  if(this.animators[anim].getType() == type)
				  return this.animators[anim];
		};
		
		ZICA.Scene.prototype.moveCameraAt = function(obj){
			
			if(obj.isEntity) var pos = obj.getCenter();
			else pos = {x:obj.x,y:obj.y};
			 
			 this.x = pos.x;
			 this.y = pos.y;
		};
		
		ZICA.Scene.prototype.getCameraPostion = function(){
			return {x:this.x,y:this.y};
		};
		
		ZICA.Scene.prototype.__onGameStart = function (event) { };
        ZICA.Scene.prototype.__onUpdate = function (event) { };
        ZICA.Scene.prototype.__onCollision = function (event) { };
		ZICA.Scene.prototype.__draw = function (drawContext) {
            
			var camera = Game.camera;
			
		   drawContext.clearRect(0, 0, drawContext.canvas.width, drawContext.canvas.height);
           
		   if(this.beforeDraw)this.beforeDraw.call(this,drawContext);
		   
		   if(this.drawMap){
				
				if(this.__map instanceof Image == false) this.__map = new Image();
				
				if(this.__map.name != this.map){	
					this.__map.name = this.map;
					
					if(this.map)
					this.__map.src = (this.map in Game.assets)?Game.assets[this.map]:'';
					else 
					this.__map.src = '';	
				}
				
				
				drawContext.drawImage(this.__map, 0,0 ,this.width, this.height);
		   }
		   camera.end();
		   drawContext.globalAlpha = this.opacity;
		   
		   //scene background
		   if(this.drawColor){
			   
			drawContext.fillStyle = this.color;
            drawContext.fillRect(0, 0, drawContext.canvas.width, drawContext.canvas.height);
			
		   }
			/* if(this.drawBorder){
			
			drawContext.lineWidth = this.borderWidth;
			drawContext.strokeStyle = this.borderColor;
			drawContext.strokeRect(this.x, this.y, this.width, this.height);
			
			} */
			
			//drawContext.fillStyle = this.color;
            //drawContext.fillRect(this.x, this.y, this.width, this.height);
			
			
			
			if(this.drawImage){
				
				if(this.__image instanceof Image == false) this.__image = new Image();
				
				if(this.__image.name != this.image){	
					this.__image.name = this.image;
					
					if(this.image)
					this.__image.src = (this.image in Game.assets)?Game.assets[this.image]:'';
					else 
					this.__image.src = '';	
				}
				
				if(!this.aspectRatio)
				drawContext.drawImage(this.__image, 0,0 ,drawContext.canvas.width, drawContext.canvas.height);
				else{
					var w = this.__image.naturalWidth;
					var h = this.__image.naturalHeight;
					var canvas = drawContext.canvas;
					// Get the min scale to fit the image to the canvas
					var scale = Math.min(canvas.width / w, canvas.height / h);

					// Set the transform to scale the image, and center to the canvas
					drawContext.save();
					drawContext.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);

					// draw the image offset by half its width and height to center and fit
					drawContext.drawImage(this.__image, -w / 2, -h / 2, w, h);
					drawContext.restore();
				}
			}	
				
				/* if(this.aspectRatio){
					
					var aspect = this.calculateAspectRatio();
					drawContext.drawImage(this.__image, this.x, this.y, aspect.width, aspect.height);
					
				}else
					//drawContext.filter = 'blur(4px)'; 
					drawContext.drawImage(this.__image, this.x, this.y, this.width, this.height);
				
			} */
			
			drawContext.globalAlpha = 1;
			camera.begin();
			
			if(this.afterDraw)this.afterDraw.call(this,drawContext);
		};
		/* ZICA.Scene.prototype.constructScene = function () {
            var result = new ZICA.Scene();
            for (var key in this) {
				
				if(key == 'children'){
				result.children = [];
					for (var i = 0; i < this.children.length; i++) {
					var copied = this.children[i].constructor.constructEntity(this.children[i]);
					delete copied.__guid;
					result.children.push(copied);
					}
				}
				
                if (typeof this[key] == "object") {
					if(key == 'children') continue;
                    var objCopy = JSON.parse(JSON.stringify(this[key]));
                    result[key] = objCopy;
                }
                else
                    result[key] = this[key];
            }
            return result;
        };
		
		ZICA.Scene.prototype.constructScene1 = function () {
            
			var result = {};
			
				for (var key in this) {
					
				if(key == 'children'){
				result.children = [];
					for (var i = 0; i < this.children.length; i++) {
					var copied = this.children[i].constructor.constructEntity(this.children[i]);
					delete copied.__guid;
					result.children.push(copied);
					}
				}
				if (typeof this[key] == "function") continue;
                if (typeof this[key] == "object") continue;
				else
                    result[key] = this[key];
			
                
            }
            return result;
        }; */
		
		
		    ZICA.Scene.constructScene = function (ent) {
				
				//var ko = require("./entity");
				var entity_1 = ZICA.Entity;
				
            var result = new ZICA.Scene();
            for (var key in ent) {
                
				if(key == 'children'){
				    result.children = [];
					for (var i = 0; i < ent.children.length; i++) {
					var copied = entity_1.constructEntity(ent.children[i]);
					result.children.push(copied);
					}
				}else{
				
					result[key] = ent[key];
					if (key.substring(0, 4) == "__on" && key.substring(key.length - 6) == "String") {
                    //all function strings will be of the form __<FuncName>String
                    var memName = key.substring(0, key.lastIndexOf("String"));
                    var func = new Function("event", ent[key]);
                    result[memName] = func;
                }
				
				}
            }
            return result;
        };
		
		
    
        ZICA.GameRunner = function (canvas) {
            var _this = this;
            //stores all entities in the game world
			
			this.name = '';
			this.version = '';
			this.author = '';
			this.description = '';
			this.assets = {};
			this.autoSize = false;
			this.autoResize = false;
			this.pointerLock = false;
			this.fullScreen = false;
			this.icon = '';
			this.logo = '';
			this.showProgress = true;
			
			//reference to p2 physics engine
			window.p2 = null;
			
			//canvas viewport
			this.x = 0;
			this.y = 0;
			this.width = 400;
			this.height = 400;
			
			//Variables
			this.variables = {};
			
			this.scene = null;
			this.scenes = [];
			
			this.__globalString = "";
			this.__global = function(event){};
			
            this.entityList = [];
            //whether the game is running, paused, or stopped
            this.state = ZICA.State.stopped;
            this.firstFrame = true;
			this.startTime = 0;
            //object containing 
            this.controls = new ZICA.GameRunner.Controls();
            this.canvas = canvas;
            this.drawContext = canvas.getContext("2d");
            
			this.width = canvas.width;//canvas.width = canvas.parentElement.clientWidth;
            this.height = canvas.height;//canvas.height = canvas.parentElement.clientHeight;
			canvas.tabIndex = 1;
			canvas.focus();
           
		   this.drawContext.textBaseline = "top";
			
			this.Keys = ZICA.Keys;
			
			this.intervals = [];
			
            canvas.addEventListener("keydown", function (e) { _this.onKeyDown(e);});
            canvas.addEventListener("keyup", function (e) { _this.onKeyUp(e); });
			canvas.addEventListener("keypress", function (e) { _this.onKeyPress(e); });
			
			canvas.addEventListener("mousedown", function (e) { _this.onMouseDown(e); });
            canvas.addEventListener("mouseup", function (e) { _this.onMouseUp(e); });
			canvas.addEventListener("mousemove", function (e) { _this.onMouseMove(e); });
            canvas.addEventListener("click", function (e) { _this.onMouseClick(e); });
			
			canvas.addEventListener("touchstart", function (e) { _this.onMouseDown(e); });
            canvas.addEventListener("touchend", function (e) { _this.onMouseUp(e); });
			canvas.addEventListener("touchmove", function (e) { _this.onMouseMove(e); });
			
			/* canvas.addEventListener("touchstart", touchToMouse);
            canvas.addEventListener("touchend", touchToMouse);
			canvas.addEventListener("touchmove", touchToMouse); */
			
			//canvas.addEventListener("keyup", function (e) { _this.onKeyUp(e); });
      
	  }
		 /**
         * Starts the game
         **/
        ZICA.GameRunner.prototype.startApp = function () {
            var _this = this;
            if (this.state != ZICA.State.stopped)
                return;
			
			
			if(this.fullScreen)this.fullscreen();
			
			if(this.autoResize){
				this.canvas.style.height = '100%';
				this.canvas.style.width  = '100%';
			}
			
			this.camera = new ZICA.Camera(this.drawContext);
			/* if(this.autoSize && this.fullScreen){
			this.width = window.innerWidth;
			this.height = window.innerWidth;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			} */
			
			this.firstFrame = true;
			//this.scene.firstFrame = true;
			
            this.entityList = this.scene.children;
			//this.recalcPriority();
			
            this.state = ZICA.State.running;
			
			//code check
			this.tryUserFunc(function () { Game.__global(null); });
			
			var scene = this.scene;
			
			if(p2)
			scene.world = new p2.World({gravity:[0, scene.gravity]});
			
			this.tryUserFunc(function () { scene.__onGameStart(null); });
			
            var _loop_1 = function (ent) {
                this_1.tryUserFunc(function () { ent.__onGameStart(null); });
            };
			
			//initAnimators
			this.tryUserFunc(function () { Game.initAnimators(); });
			
            var this_1 = this;
            //run first frame entity code if it's the start
            for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                _loop_1(ent);
            }
			
			this.resetTimer();			
            requestAnimationFrame(function () { _this.update(); });
        };
		 /**
         * Starts the game from data
         **/
        ZICA.GameRunner.prototype.startFromData = function (data) {
			
			var self = this;
			self.constructor.constructApp(data,self);
		
			self.canvas.width = self.width;
			self.canvas.height = self.height;
			window.onresize = function(){self.resize();};
			self.resize();
			document.body.style.background = 'none';
			if(self.progress)
			self.progress.parentElement.removeChild(self.progress);
			
			self.startApp();
		};
		 /**
         * Starts the game from file
         **/
        ZICA.GameRunner.prototype.startFromFile = function (fname) {
			
			var self = this;
			
			var rawFile = new XMLHttpRequest();
			rawFile.open("GET", fname, true);
			
			rawFile.onprogress  = function(evt){

				if ( evt.lengthComputable ) {
					/* var complete = evt.loaded / evt.total;
					var percentComplete =  complete * 100;
					console.log( complete );
					self.progress.value = complete;
					console.log( percentComplete + "%" ); */
				}
			};
			
			rawFile.onerror  = function(e){
				if(!self.progress)return;
				
				self.progress.innerHTML = '<b>Error loading data!!!</b>';
				self.progress.className = 'error';
				
			};
			
			rawFile.onreadystatechange = function ()
			{
				if(rawFile.readyState === 4)
				{
					if(rawFile.status === 200 || rawFile.status == 0)
					{
						var txt = rawFile.responseText;
						var data = JSON.parse(txt);
						
						self.constructor.constructApp(data,self);
					
						self.canvas.width = self.width;
						self.canvas.height = self.height;
						window.onresize = function(){self.resize();};
						self.resize();
						document.body.style.background = 'none';
						if(self.progress)
						self.progress.parentElement.removeChild(self.progress);
						
						self.startApp();	
					}
					else rawFile.onerror();
				}
			}
			
			rawFile.send(null);
			
		};
		 /**
         * Resize canvas 
         **/
		ZICA.GameRunner.prototype.resize = function(){
				
			if(!this.autoSize)return;
			
			var rect = this.canvas.parentNode.getClientRects()[0];
			
			this.width = rect.width;
			this.height = rect.height;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			
		}
        /**
         * Starts the game
         **/
       /*  ZICA.GameRunner.prototype.start = function (scene) {
            var _this = this;
            if (this.state != ZICA.State.stopped)
                return;
            this.entityList = scene.children;
            this.state = ZICA.State.running;
            var _loop_1 = function (ent) {
                this_1.tryUserFunc(function () { ent.__onGameStart(null); });
            };
            var this_1 = this;
            //run first frame entity code if it's the start
            for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                _loop_1(ent);
            }
            requestAnimationFrame(function () { _this.update(); });
        }; */
		
		ZICA.GameRunner.prototype.pauseSounds = function(scene){
			
			scene.pausedSongs = [];
				
				for (var _i = 0, _a = scene.children; _i < _a.length; _i++) {
					var ent = _a[_i];
					
					if(ent.__audio instanceof Audio)
					{	
						if(!ent.__audio.paused){
							ent.pauseAudio();
							scene.pausedSongs.push(ent);
						}
					}
				}
		};
		
		ZICA.GameRunner.prototype.resumeSounds = function(scene){
			
			if(scene.pausedSongs)
			for(var i = 0; i<= scene.pausedSongs.length-1;i++){
				
				scene.pausedSongs[i].playAudio();
			}
			
			scene.pausedSongs = [];
			
		};
		
		ZICA.GameRunner.prototype.stopSounds = function(scene){
			
			scene.pausedSongs = [];
				
				for (var _i = 0, _a = scene.children; _i < _a.length; _i++) {
					var ent = _a[_i];
					
					if(ent.__audio instanceof Audio)
					{	
						ent.stopAudio();
						ent.__audio = null;
					}
				}
		};
		
		ZICA.GameRunner.prototype.stopAllSounds = function(){
			
			var scene = this.scene;
			
			scene.pausedSongs = [];
				
				for (var _i = 0, _a = scene.children; _i < _a.length; _i++) {
					var ent = _a[_i];
					
					if(ent.__audio instanceof Audio)
					{	
						ent.stopAudio();
					}
				}
		};
		
		/* ZICA.GameRunner.prototype.pauseAllSounds = function(){
			this.pausedSongs = [];
			
			for(var i = 0; i<= this.scenes.length-1;i++){
				
				for (var _i = 0, _a = this.scenes[i].children; _i < _a.length; _i++) {
					var ent = _a[_i];
					
					if(ent.__audio instanceof Audio)
					{	
						if(!ent.__audio.paused){
							ent.pauseAudio();
							this.pausedSongs.push(ent);
						}
					}
				}
			
			}
			
		};
		ZICA.GameRunner.prototype.resumeAllSounds = function(){
			
			if(this.pausedSongs)
			for(var i = 0; i<= this.pausedSongs.length-1;i++){
				
				this.pausedSongs[i].playAudio();
			}
			
		};
		ZICA.GameRunner.prototype.stopAllSounds = function(){
			
			for(var i = 0; i<= this.scenes.length-1;i++){
				
				for (var _i = 0, _a = this.scenes[i].children; _i < _a.length; _i++) {
					var ent = _a[_i];
					
					if(ent.__audio instanceof Audio)
					{
						ent.stopAudio();
						ent.__audio = null;
					}
				}
			
			}
			
		}; */
        /**
         * Stops the game
         **/
        ZICA.GameRunner.prototype.stop = function () {
           
		    this.state = ZICA.State.stopped;
			this.stopSounds(this.scene);
			this.controls.keyData = {};
			this.controls.mouse = {};
			this.clearIntervals();
			
			//this.drawContext.clearRect(0,0,this.canvas.width,this.canvas.height);
        };
        /**
         * Pauses the game
         **/
        ZICA.GameRunner.prototype.pause = function () {
            if (this.state == ZICA.State.running) {
                this.state = ZICA.State.paused;
				
				//this.pauseAllSounds();
				this.pauseSounds(this.scene);
            }
        };
        /**
         * Unpauses the game
         **/
        ZICA.GameRunner.prototype.unpause = function () {
            if (this.state == ZICA.State.paused) {
                this.state = ZICA.State.running;
				//this.resumeAllSounds();
				this.resumeSounds(this.scene);
            }
        };
        /**
         * Returns whether or not the game is running
         **/
        ZICA.GameRunner.prototype.isRunning = function () { return this.state == ZICA.State.running; };
        /**
         * Returns true if the game is paused
         **/
        ZICA.GameRunner.prototype.isPaused = function () { return this.state == ZICA.State.paused; };
        /**
         * Returns true if the game is stopped
         **/
        ZICA.GameRunner.prototype.isStopped = function () { return this.state == ZICA.State.stopped; };
        /**
         * Runs the main game loop
         **/
        ZICA.GameRunner.prototype.update = function () {
			
			if(this.preventDefault){
				this.preventDefault = false;
				return;
			}
            var _this = this;
			
			if (this.isRunning()) {
				 
			//check pointerLock
			if(this.pointerLock && this.state == 2)this.canvas.style.cursor = 'none';else this.canvas.style.cursor = '';
			//set camera
			this.camera.set(this.scene.x,this.scene.y);
			//clear screen
            this.scene.__draw(this.drawContext);
			//update scene 
			var scene = this.scene;
			
			
			var event = this.updateTimer();
			this.tryUserFunc(function () { scene.__onUpdate(event); });
			this.tryUserFunc(function () { _this.updateAnimators(scene,event); });
			
			var fixedTimeStep = 1 / 60; // seconds
			var maxSubSteps = 10; // Max sub steps 
			var deltaTime = event.deltaTime;
			
			if(scene.world)
			scene.world.step(fixedTimeStep, deltaTime, maxSubSteps);
			
			 }
			 
		   //if we aren't paused, update, move, and collide all entities
            if (this.isRunning()) {
				
				var event = this.currentTimer();
				
                for (var i = 0; i < this.entityList.length; i++) {
                    var ent = this.entityList[i];
                    if (!ent.__removeFlag /* && ent.visible */) {
                        this.tryUserFunc(function () { _this.entityList[i].__onUpdate(event); });
						this.tryUserFunc(function () { _this.updateAnimators(_this.entityList[i],event); });	
                    }
                    if (ent.__removeFlag) {
                        this.entityList.splice(i, 1);
                        i--;
                    }
                }
                this.moveAndCollideEntities();
            }
            //recalc priority
			var renderList = this.entityList.slice();
			this.recalcPriority(renderList);
			//draw them all
            for (var _i = 0, _a = renderList; _i < _a.length; _i++) {
                var ent_1 = _a[_i];
                ent_1.__draw(this.drawContext);
            }
			
			//this.camera.set(this.scene.x,this.scene.y);
            
			//update whether or not keys were pressed last frame
            //(allows isHeldOneFrame() to work)
            this.controls.updateKeyData();
            this.firstFrame = false;
			this.scene.firstFrame = false;
            //schedule a update call next frame if needed
            if (!this.isStopped())
                requestAnimationFrame(function () { _this.update(); });
			else
				this.drawContext.clearRect(0,0,this.canvas.width,this.canvas.height);
		};
		ZICA.GameRunner.prototype.cloneEntity = function(ent){
			
			if(!ent)return null;
			
			// clone
			var clonedAnimators = ent.cloneAnimators();
			var cloned = ent.constructor.constructEntity(ent);
			cloned.__guid = cloned.__generateGUID();
			cloned.animators = clonedAnimators;
			Game.entityList.push(cloned);
			return cloned;
			
		};
        /**
         * Adds an entity to the game world and reorders all entities based on their priority property
         **/
        ZICA.GameRunner.prototype.addEntity = function (ent) {
			//ent.parent = this.scene;
            this.entityList.push(ent);
            //this.recalcPriority();
        };
        /**
         * Sort entityList in ascending order based on their priority property.
         **/
        /* ZICA.GameRunner.prototype.recalcPriority1 = function () {
            var list = this.entityList;
            setTimeout(function () {
                list.sort(function (a, b) {
                    return a.priority - b.priority;
                });
            }, 0);
        }; */
		
		/**
         * Sort entityList in ascending order based on their priority property.
         **/
        ZICA.GameRunner.prototype.recalcPriority = function (list) {
         
			list.sort(function (a, b) { 
			return a.priority - b.priority;
			});
			
        };
        /**
         * Get an entity in the world by its name in O(n) time.
         **/
        ZICA.GameRunner.prototype.getEntityByName = function (s) {
            for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                if (ent.name === s)
                    return ent;
            }
            return null;
        };
		
		/**
         * Get an entity in the world by its id in O(n) time.
         **/
        ZICA.GameRunner.prototype.getEntityById = function (s) {
			
			if(s == 1) return Game.scene;
			
            for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                if (ent.__guid === s)
                    return ent;
            }
            return null;
        };
		
		  ZICA.GameRunner.prototype.getEntitiesByName = function (name) {
            var entities = [];
			for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                if (ent.name === name)
                    entities.push(ent);
            }
            return entities;
        };
		
		ZICA.GameRunner.prototype.addScene = function(scene)
		{
			if (scene)
			{
				this.scenes.push(scene);
			}
		};
		
		ZICA.GameRunner.prototype.setActiveScene = function(scene)
		{
			if (scene)
			{
				for (var i = 0; i<this.scenes.length; ++i)this.scenes[i].active = false;
				this.scene = scene;
				this.scene.active = true;
			}
		};
		
		ZICA.GameRunner.prototype.removeScene = function(scene)
		{
			for (var i = 0; i<this.scenes.length; ++i)
			{
				if (this.scenes[i] === scene)
				{
					this.scenes.splice(i, 1);
					return;
				}
			}
		};
		
		ZICA.GameRunner.prototype.resetScene = function(scene){
			
			var index = this.scenes.indexOf(scene);
			this.scenes[index] = ZICA.Scene.constructScene(this.backupScenes[index]);
			
			return this.scenes[index];
		};
		
		ZICA.GameRunner.prototype.switchToScene = function (scene,reset) {
            var _this = this;
			this.preventDefault = true;
			
			this.backupSceneTimer(this.scene);
			this.pauseSounds(this.scene);
		
            //if (this.state != ZICA.State.stopped)
               // return;
			
			if(reset)//scene.firstFrame = true;
				scene = this.resetScene(scene);
			
			this.controls = new ZICA.GameRunner.Controls();
			
			this.setActiveScene(scene);	
			this.entityList = this.scene.children;
			
			if(this.scene.firstFrame == false){
				//this.state = ZICA.State.running;
				//this.resetTimer();
				this.backupTimer(scene);
				this.resumeSounds(scene);
				
				requestAnimationFrame(function () { _this.update(); });
				return;
			}
			
            
			//this.recalcPriority();
			this.stopSounds(this.scene);
            this.state = ZICA.State.running;
			
			var scene = this.scene;
			this.tryUserFunc(function () { scene.__onGameStart(null); });
			
            var _loop_1 = function (ent) {
                this_1.tryUserFunc(function () { ent.__onGameStart(null); });
            };
			
			this.tryUserFunc(function () { Game.initAnimators(); });
			
            var this_1 = this;
            //run first frame entity code if it's the start
            for (var _i = 0, _a = this.entityList; _i < _a.length; _i++) {
                var ent = _a[_i];
                _loop_1(ent);
            }
			
			this.resetTimer();
            requestAnimationFrame(function () { _this.update(); });
        };
		
		ZICA.GameRunner.prototype.getSceneByName = function(name)
		{
			for (var i = 0; i<this.scenes.length; ++i)
			{
				if (this.scenes[i].name === name)
				{
					return this.scenes[i];
				}
			}
		};
		
		ZICA.GameRunner.prototype.getScene = function(index)
		{
			for (var i = 0; i<this.scenes.length; ++i)
			{
				if (i === index)
				{
					return this.scenes[i];
				}
			}
		};
		
		ZICA.GameRunner.prototype.setVariable = function (name, value) {
			this.variables[name] = value;
		};
		
		ZICA.GameRunner.prototype.getVariable = function (name) {
			return this.variables[name];
		};
		
		ZICA.GameRunner.prototype.hasVariable = function (name) {
			return this.variables[name]?true:false;
		};
		
		ZICA.GameRunner.prototype.removeVariable = function (name) {
			return delete this.variables[name];
		};
		
		ZICA.GameRunner.prototype.pointInBox = function (point, box) {
            return point.x > box.x && point.x < box.x + box.width && point.y > box.y && point.y < box.y + box.height;
        };
		
		ZICA.GameRunner.prototype.boxInBox = function (box, box1) {
            return box1.x > box.x && box1.y > box.y && box1.x + box1.width < box.x + box.width && box1.y + box1.height < box.y + box.height;
        };
		
		ZICA.GameRunner.prototype.updateTimer = function(){
			
			var now = new Date();
			this.timeElapsed += this.deltaTime;
			this.deltaTime = now - this.startTime;
			this.startTime = now;
				
			return {delta:this.deltaTime,timeElapsed:this.timeElapsed};
			
		};
		
		ZICA.GameRunner.prototype.resetTimer = function(){
			
			//this.firstTime = new Date();
			this.startTime = new Date();
			this.timeElapsed = 0;
			this.deltaTime = 0;
			
			//return {delta:this.deltaTime,timeElapsed = this.timeElapsed};
		};
		
		ZICA.GameRunner.prototype.currentTimer = function(){
			
			return {delta:this.deltaTime,timeElapsed : this.timeElapsed};			
		};
		
		ZICA.GameRunner.prototype.backupSceneTimer = function(scene){
			
			//scene.firstTime = this.firstTime;
			scene.timeElapsed = this.timeElapsed;
			
		};
		
		ZICA.GameRunner.prototype.backupTimer = function(scene){
			
			//this.firstTime = scene.firstTime;
			this.timeElapsed = scene.timeElapsed;
			//this.firstTime = new Date(Date.now() + scene.timeElapsed);
			
			
		};
		
		ZICA.GameRunner.prototype.print = function(text){	
			
			if(window.parent.Editor){
				window.parent.Editor.clearConsole();
				window.parent.Editor.log(text);
			}
			
		};
		
		ZICA.GameRunner.prototype.log = function(text){	
			
			if(window.parent.Editor)
				window.parent.Editor.log(text);
			
		};
		
		ZICA.GameRunner.prototype.error = function(text){	
			
			if(window.parent.Editor)
				window.parent.Editor.error(text);
			
		};
		
		ZICA.GameRunner.prototype.clearConsole = function(){	
			
			if(window.parent.Editor)
				window.parent.Editor.clearConsole();
			
		};
		
		// Enter fullscreen
		ZICA.GameRunner.prototype.fullscreen = function(){
			var canvas = this.canvas;
			
			if(canvas.RequestFullScreen){
				canvas.RequestFullScreen();
			}else if(canvas.webkitRequestFullScreen){
				canvas.webkitRequestFullScreen();
			}else if(canvas.mozRequestFullScreen){
				canvas.mozRequestFullScreen();
			}else if(canvas.msRequestFullscreen){
				canvas.msRequestFullscreen();
			}else{
				alert("This browser doesn't supporter fullscreen");
			}
		};

		// Exit fullscreen
		ZICA.GameRunner.prototype.exitFullscreen = function(){
			var canvas = this.canvas;
		
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}else{
				alert("Exit fullscreen doesn't work");
			}
		};
		
		ZICA.GameRunner.prototype.switchFullscreen = function(){
			
			var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
			(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
			(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
			(document.msFullscreenElement && document.msFullscreenElement !== null);
			
			if(isInFullScreen)this.exitFullscreen();
			else this.fullscreen();
		
		};
		
		ZICA.GameRunner.prototype.setInterval = function(func,time,self){
			if(( typeof func  != 'function'))return;
			time = Number(time);
			if(!time)return;
			
			return this.intervals.push( setInterval(function(){func.call(self)},time));
		};
		ZICA.GameRunner.prototype.clearIntervals = function(){
			for(var i = 0; i<=this.intervals.length-1;i++)clearInterval(this.intervals[i]);
			this.intervals.length = 0;		
		};
		ZICA.GameRunner.prototype.clearInterval = function(interval){
			clearInterval(interval);
		}
		
		//other-ko me udario, direction-njegov pravac
        /**
         * Handle the moving and colliding of all entities in the game world.
         *   0) reset all blocked properties to false
         *   1) update all entity x positions based on their velX
         *   2) check all entity collisions in the x direction, triggering their event hooks
         *   3) update all entity y positions based on their velY
         *   4) check all entity collisions in the y direction, triggering their event hooks
         *
         * Entities with collides=false will not be checked for collision.
         **/
        ZICA.GameRunner.prototype.moveAndCollideEntities = function () {
           
			this.step(0.05);
			this.CollideEntities();
			
        };

		// Rect collision tests the edges of each rect to
		// test whether the objects are overlapping the other
		ZICA.GameRunner.prototype.collideRect = function(collider, collidee) {

			// Store the collider and collidee edges
			var l1 = collider.getLeft();
			var t1 = collider.getTop();
			var r1 = collider.getRight();
			var b1 = collider.getBottom();
			
			var l2 = collidee.getLeft();
			var t2 = collidee.getTop();
			var r2 = collidee.getRight();
			var b2 = collidee.getBottom();
			
			// If the any of the edges are beyond any of the
			// others, then we know that the box cannot be
			// colliding
			if (b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2) {
				return false;
			}
			
			// If the algorithm made it here, it had to collide
			return true;
		};



		ZICA.GameRunner.prototype.resolveElastic =  function(player, entity) {
			// Find the mid points of the entity and player
			var pMidX = player.getMidX();
			var pMidY = player.getMidY();
			var aMidX = entity.getMidX();
			var aMidY = entity.getMidY();
			
			var STICKY_THRESHOLD = .0004;
			// To find the side of entry calculate based on
			// the normalized sides
			var dx = (aMidX - pMidX) / entity.halfWidth;
			var dy = (aMidY - pMidY) / entity.halfHeight;
			
			// Calculate the absolute change in x and y
			var absDX = Math.abs(dx);
			var absDY = Math.abs(dy);
			
			// If the distance between the normalized x and y
			// position is less than a small threshold (.1 in this case)
			// then this object is approaching from a corner
			if (Math.abs(absDX - absDY) < .1) {

				// If the player is approaching from positive X
				if (dx < 0) {

					// Set the player x to the right side
					player.x = entity.getRight();

				// If the player is approaching from negative X
				} else {

					// Set the player x to the left side
					player.x = entity.getLeft() - player.width;
				}

				// If the player is approaching from positive Y
				if (dy < 0) {

					// Set the player y to the bottom
					player.y = entity.getBottom();

				// If the player is approaching from negative Y
				} else {

					// Set the player y to the top
					player.y = entity.getTop() - player.height;
				}
				
				// Randomly select a x/y direction to reflect velocity on
				if (Math.random() < .5) {

					// Reflect the velocity at a reduced rate
					player.velX = -player.velX * entity.restitution;

					// If the object’s velocity is nearing 0, set it to 0
					// STICKY_THRESHOLD is set to .0004
					if (Math.abs(player.velX) < STICKY_THRESHOLD) {
						player.velX = 0;
					}
				} else {

					player.velY = -player.velY * entity.restitution;
					if (Math.abs(player.velY) < STICKY_THRESHOLD) {
						player.velY = 0;
					}
				}

			// If the object is approaching from the sides
			} else if (absDX > absDY) {

				// If the player is approaching from positive X
				if (dx < 0) {
					player.x = entity.getRight();

				} else {
				// If the player is approaching from negative X
					player.x = entity.getLeft() - player.width;
				}
				
				// Velocity component
				player.velX = -player.velX * entity.restitution;

				if (Math.abs(player.velX) < STICKY_THRESHOLD) {
					player.velX = 0;
				}

			// If this collision is coming from the top or bottom more
			} else {

				// If the player is approaching from positive Y
				if (dy < 0) {
					player.y = entity.getBottom();

				} else {
				// If the player is approaching from negative Y
					player.y = entity.getTop() - player.height;
				}
				
				// Velocity component
				player.velY = -player.velY * entity.restitution;
				if (Math.abs(player.velY) < STICKY_THRESHOLD) {
					player.velY = 0;
				}
			}
		};


		ZICA.GameRunner.prototype.step = function(elapsed) {
			
			var gx = 0;//GRAVITY_X * elapsed;
			var gy = this.scene.gravity * elapsed;
			var entity;
			var entities = this.entityList;
			
			var KINEMATIC = 'kinematic';
			var DYNAMIC   = 'dynamic';
			//var DISPLACE = 'displace';
			//var ELASTIC = 'elastic';
			
			for (var i = 0, length = entities.length; i < length; i++) {
				entity = entities[i];
				
				switch (entity.physicType) {
					case DYNAMIC:
						entity.velX += entity.ax * elapsed + gx;
						entity.velY += entity.ay * elapsed + gy;
						entity.x  += entity.velX * elapsed;
						entity.y  += entity.velY * elapsed;
						break;
					case KINEMATIC:
						entity.velX += entity.ax * elapsed;
						entity.velY += entity.ay * elapsed;
						entity.x  += entity.velX * elapsed;
						entity.y  += entity.velY * elapsed;
						break;
				}
				entity.updateBounds();
			}
		};

		ZICA.GameRunner.prototype.CollideEntities = function(){
			
			for (var a = 0; a < this.entityList.length; a++) {
				var entA = this.entityList[a];
				if (!entA.collides)
					continue;
				for (var b = a + 1; b < this.entityList.length; b++) {
					var entB = this.entityList[b];
					if (!entB.collides)
						continue;
					if (this.collideRect(entA, entB)) {
						var entAEvent = {
							other: entB,
							//direction: dirs[0]
						};
						var entBEvent = {
							other: entA,
						   // direction: dirs[1]
						};
						
						if(entA.collision){
							
							//this.resolveElastic(entA,entB);
							
						}
						
						this.tryUserFunc(function () { entA.__onCollision(entAEvent); });
						this.tryUserFunc(function () { entB.__onCollision(entBEvent); });
						
						var event = entAEvent;
						event.name = 'onCollision';
						Game.handleEvent(entA,event);
						
						var event = entBEvent;
						event.name = 'onCollision';
						Game.handleEvent(entB,event);
						
					}
				}
			}
			
		};
        /**
         * Attemps to call a user-defined hook in a safe manner,
         * stopping the game if an exception is thrown.
         **/
        ZICA.GameRunner.prototype.tryUserFunc = function (func) {
            try {
                func();
            }
            catch (e) {
                console.log(e);
				Game.error(e);
                this.stop();
            }
        };
		ZICA.GameRunner.prototype.getMouse = function (event) {
			
			var mouse = {x : 0, y : 0};
			var myCan = this.canvas;
			
			var bounds = myCan.getBoundingClientRect();
			// get the mouse coordinates, subtract the canvas top left and any scrolling
			mouse.x = event.clientX - bounds.left;
			mouse.y = event.clientY - bounds.top ;
              // first normalize the mouse coordinates from 0 to 1 (0,0) top left
			  // off canvas and (1,1) bottom right by dividing by the bounds width and height
		   mouse.x /=  bounds.width; 
		   mouse.y /=  bounds.height; 

		   // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution

		   mouse.x *= myCan.width;
		   mouse.y *= myCan.height;
		   
		   return mouse;
			
		};
		
		ZICA.GameRunner.prototype.handleMouseEvent = function(event){
			
			var evt = {};
			evt.x = this.controls.mouse.x;
			evt.y = this.controls.mouse.y;
			
			evt.key = event.which;
			var type = event.type;
			
			if(this.autoResize){
				
				evt.x = this.getMouse(event).x;
				evt.y = this.getMouse(event).y;
				
			}
			
			var worldPos = this.camera.screenToWorld(evt.x,evt.y);
			evt.x = worldPos.x;
			evt.y = worldPos.y;
			
			event = evt;
			
			
			if(type == 'mousedown')this.mouseBuffer = [];
			
			//draw them all
            for (var _i = -1, _a = this.entityList; _i < _a.length; _i++) {
                
				if(_i<0){
					var ent_1 = this.scene;
					var flag = true;
				}else{
					var ent_1 = _a[_i];
					var flag = this.pointInBox(evt,ent_1)
				}
				
				if(ent_1.disabled)continue;
				
				if(flag){
					
					if(type == 'mousedown'){
						if(ent_1.onmousedown)
							ent_1.onmousedown.call(ent_1,evt);
						
						event.name = 'onMouseDown';
						Game.handleEvent(ent_1,event);
						this.mouseBuffer.push(ent_1);
					}	
					if(type == 'mouseup'){
						if(ent_1.onmouseup)
							ent_1.onmouseup.call(ent_1,evt);
						
						event.name = 'onMouseUp';
						Game.handleEvent(ent_1,event);
						
						if(this.mouseBuffer.includes(ent_1)){
							evt.type = 'click';
							if(ent_1.onclick)
							ent_1.onclick.call(ent_1,evt);
						
							event.name = 'onClick';
							Game.handleEvent(ent_1,event);
						}
					}
					if(type == 'mousemove'){
						if(ent_1.onmouseover)
							ent_1.onmouseover.call(ent_1,evt);
					
						event.name = 'onMouseOver';
						Game.handleEvent(ent_1,event);
					}
				}else{
					if(type == 'mousemove'){
						if(ent_1.onmouseout)
							ent_1.onmouseout.call(ent_1,evt);
						
						event.name = 'onMouseOut';
						Game.handleEvent(ent_1,event);
					}
				};
			};	
		};
		
		ZICA.GameRunner.prototype.handleKeyEvent = function(event){
		
			var key = event.which;
			var type = event.type;
						
			//draw them all enities
            for (var _i = -1, _a = this.entityList; _i < _a.length; _i++) {
                
				if(_i<0)var ent_1 = this.scene;
				else
				var ent_1 = _a[_i];
					
					if(ent_1.disabled)continue;
					
					if(type == 'keyup'){
						if(ent_1.onkeyup)
							ent_1.onkeyup.call(ent_1,key);
						
						event.name = 'onKeyUp';
						Game.handleEvent(ent_1,event);
					}	
					if(type == 'keydown'){
						if(ent_1.onkeydown)
							ent_1.onkeydown.call(ent_1,key);
						
						event.name = 'onKeyDown';
						Game.handleEvent(ent_1,event);
					}
					if(type == 'keypress'){
						if(ent_1.onkeypress)
							ent_1.onkeypress.call(ent_1,key);		
						
						event.name = 'onKeyPress';
						Game.handleEvent(ent_1,event);
					}
			};	
		};
		
        ZICA.GameRunner.prototype.onKeyDown = function (event) {
            if (!this.isRunning())
                return;
            this.controls.handleKeyEvent(event, true);
			this.handleKeyEvent(event);
        };
        ZICA.GameRunner.prototype.onKeyUp = function (event) {
            if (!this.isRunning())
                return;
            this.controls.handleKeyEvent(event, false);
			this.handleKeyEvent(event);
        };
		ZICA.GameRunner.prototype.onKeyPress = function (event) {
            if (!this.isRunning())
                return;
			this.handleKeyEvent(event);
        };
		
		ZICA.GameRunner.prototype.onMouseDown = function (event) {
            if (!this.isRunning())
                return;
			this.handleMouseEvent(event);
            this.controls.handleKeyEvent(event, true);
        };
        ZICA.GameRunner.prototype.onMouseUp = function (event) {
            if (!this.isRunning())
                return;
			
			this.handleMouseEvent(event);
            this.controls.handleKeyEvent(event, false);
        };
		
		ZICA.GameRunner.prototype.onMouseMove = function (event) {
            if (!this.isRunning())
                return;
			this.handleMouseEvent(event);
            this.controls.handleMouseMoveEvent(event);
        };
		
		ZICA.GameRunner.prototype.onMouseClick = function (event) {
            if (!this.isRunning())
                return;
			this.handleMouseEvent(event);
        };
		ZICA.GameRunner.prototype.initAnimators = function(){
			
			var this_1 = this;
            //run first frame entity code if it's the start
            for (var _i = -1, _a = this.entityList; _i < _a.length; _i++) {
                
				if(_i<0)var ent = this.scene;
				else
				var ent = _a[_i];
			
				var code = ent.animators;
				
				if(typeof code == 'string'){
				ent.animators = [];
				eval(this.BehsToCode(JSON.parse(code)));
				}
				
                
            }
			
		};
		
		ZICA.GameRunner.prototype.updateAnimators = function(ent,event){
            
			for (var i = 0; i < ent.animators.length; i++) {
				ent.animators[i].animateNode(ent,event)
			}
			
		};
		
		ZICA.GameRunner.prototype.handleEvent = function(ent,event){
			if(ent.disabled)return;
			
			for (var i = 0; i < ent.animators.length; i++) {
				ent.animators[i][event.name](event,ent)
			}
			if(ent.__element)ent.__element.update(event);
			
			if(ent.type == 'scene' && event.name == 'onMouseDown'){
				
				var event1  = {};
				event1.name = 'blur';
				event1.x = event.x;
				event1.y = event.y;
				
				ent.children.forEach(e => {
					if(e.__element)e.__element.update(event1);
				});
				
			}
		};
		
		ZICA.GameRunner.prototype.BehsToCode = function (behs) {
				var code = '';
				
				for(var i in behs)
				
					if(behs[i].jsname) {
						code += 'ent.animators.push(new ZICA.'+ behs[i].jsname + '({';
							//var helpobj = {};
							for(var ii in behs[i]){
								if(Array.isArray(behs[i][ii])){
									
									code += "'" +ii+"'" + ':' + this.replaceAttr(behs[i][ii][0],behs[i][ii][1],behs[i][ii][2]) +',';
									//helpobj[ii] = replaceAttr(behs[i][ii][0],behs[i][ii][1]);
								
								}
							
							}
							//code += JSON.stringify(helpobj);
							code = code.substring(0,code.length-1);
							code += '}));\n';
							
					}
					
				return code;
				}
				
				ZICA.GameRunner.prototype.ActsToCode = function (acts) {
				var code = '';
				code += 'new ZICA.ActionHandler([';
				for(var i in acts)
				
					if(acts[i].jsname) {
						code += 'new ZICA.Action.'+ acts[i].jsname + '({';
							//var helpobj = {};
							for(var ii in acts[i]){
								if(Array.isArray(acts[i][ii])){
									
									code += "'" +ii+"'" + ':' + this.replaceAttr(acts[i][ii][0],acts[i][ii][1],acts[i][ii][2]) +',';
									//helpobj[ii] = replaceAttr(behs[i][ii][0],behs[i][ii][1]);
								
								}
							
							}
							//code += JSON.stringify(helpobj);
							code = code.substring(0,code.length-1);
							code += '}),';
							
					}
					if(code[code.length-1] == ',')code = code.substring(0,code.length-1);
					code += '])';
				return code;
				}
				
				ZICA.GameRunner.prototype.replaceAttr = function (type,value,id) {
					
					if(type == 'int' || type == 'float' || type == 'slider') return Number(value);
					if(type == 'bool') return value;
					if(type == 'string') return JSON.stringify(value);
					if(type == 'image') return JSON.stringify(value);
					if(type == 'color') return JSON.stringify(value);
					if(type == 'vect3d') return 'new ZICA.Vect3d('+JSON.parse(value)[0]+','+JSON.parse(value)[1]+','+JSON.parse(value)[2]+')';
					if(type == 'vect2d') return 'new ZICA.Vect2d('+JSON.parse(value)[0]+','+JSON.parse(value)[1]+')';
					
					if(type == 'action') return this.ActsToCode(value);
					
					if(type == 'combo') return JSON.stringify(value);
					if(type == 'propcombo') return JSON.stringify(value);
					if(type == 'array') return JSON.stringify(value);
					
					if(type == 'audio') return JSON.stringify(value);
					if(type == 'animation') return JSON.stringify(value);
					if(type == 'scene') return JSON.stringify(value);
					
				    if(type == 'node') return id?JSON.stringify(id):'null';
					if(type == 'hidden') return JSON.stringify(value);
					
					if(type == 'textarea') return JSON.stringify(value);
				}
		
		ZICA.GameRunner.constructApp = function (game , toGame) {
			
			var keys = ['name','version','author','description','width','height','__globalString','assets','autoSize','autoResize','pointerLock','fullScreen','icon','logo','showProgress'];
            
			var result = {};
			if(toGame) result = toGame;
			
			var active = null;
			
			//result.asset = Editor.getAsset(); 
				
            for (var key in game) {
                
				if(key == 'scenes'){
				    result.scenes = [];
					result.backupScenes = [];
					for (var i = 0; i < game.scenes.length; i++) {
					var copied = ZICA.Scene.constructScene(game.scenes[i]);
					var copied1 = ZICA.Scene.constructScene(game.scenes[i]);
					result.scenes.push(copied);
					result.backupScenes.push(copied1);
					if(copied.active)result.scene = copied;
					}
				}else{
					
				if(keys.indexOf(key) != -1)
					result[key] = game[key];
				
				if(game && key == '__globalString')
					result.__global = new Function("event", game[key]);
			
				}
            }
            return result;
        };
	
    
     ZICA.GameRunner.Controls = function() {
            //populates with data of the form {pressed, wasPressed} as each new key is pressed for the first time
            this.keyData = {};
			this.mouse = {x:0,y:0};
        }
        /**
         * Returns whether the player is holding a key.
         * Can take a string describing the key (see keys.js) or the integer keycode.
         **/
        ZICA.GameRunner.Controls.prototype.isHeld = function (key) {
            if (typeof key !== "number")
                key = ZICA.Keys[key];
            if (!(key in this.keyData)) {
                return false;
            }
            else
                return this.keyData[key].pressed;
        };
        /**
         * Returns whether the player just pressed a key this frame.
         * Can take a string describing the key (see keys.js) or the integer keycode.
         **/
        ZICA.GameRunner.Controls.prototype.isHeldOneFrame = function (key) {
            if (typeof key !== "number")
                key = ZICA.Keys[key];
            if (!(key in this.keyData)) {
                return false;
            }
            else {
                var data = this.keyData[key];
                return data.pressed && !data.wasPressed;
            }
        };
        /**
         * Update whether or not each key was pressed last frame
         **/
        ZICA.GameRunner.Controls.prototype.updateKeyData = function () {
            for (var key in this.keyData) {
                var data = this.keyData[key];
                data.wasPressed = data.pressed;
            }
        };
        /**
         * Function merging the handling of key up and key down events.
         * The engine wraps these such that a user can simply poll whether or not a key was pressed whenever they want.
         **/
        ZICA.GameRunner.Controls.prototype.handleKeyEvent = function (event, isHeldDown) {
				//console.log(event.type);
            if (!(event.which in this.keyData)) {
                this.keyData[event.which] = { pressed: isHeldDown, wasPressed: false };
            }
            else {
                this.keyData[event.which].pressed = isHeldDown;
            }
        };
		
		ZICA.GameRunner.Controls.prototype.handleMouseMoveEvent = function (event) {
			
           var Mouse = {};
			Mouse.x = 0;
			Mouse.y = 0;
			
			var elem = event.currentTarget;
				
			  
			if (event.touches){
				  
			if (event.touches.length){
				Mouse.x = parseInt(event.touches[0].pageX);
				Mouse.y = parseInt(event.touches[0].pageY);
			}
			}else{
				// mouse events
				Mouse.x = parseInt(event.clientX);
				Mouse.y = parseInt(event.clientY);
			}

			var rect = elem.getBoundingClientRect();
			Mouse.x += elem.scrollLeft - elem.clientLeft - rect.left;
			Mouse.y += elem.scrollTop - elem.clientTop - rect.top;
			this.mouse.x =  Mouse.x;
			this.mouse.y = Mouse.y;
			
			};
   
   
///////////////////////////////// ZICA.UI //////////////////////////////////////////////

ZICA.UI = {
    intersects: function(e, mouse) {
        var t = 5; //tolerance
        var xIntersect = (mouse.x + t) > e.obj.x && (mouse.x - t) < e.obj.x + e.obj.width;
        var yIntersect = (mouse.y + t) > e.obj.y && (mouse.y - t) < e.obj.y + e.obj.height;
        return  xIntersect && yIntersect;
    },
    updateStats: function(event){
		
		if(event.name == 'onMouseOver'){
			this.hovered = true;
		}else if(event.name == 'onMouseOut'){
			this.hovered = false;
			
			if(Game.controls.isHeld(ZICA.Keys.leftButton) && this.focus && !this.clicked){
				this.focus = false;
			}
			if(!Game.controls.isHeld(ZICA.Keys.leftButton) && this.clicked)this.clicked = false;
			
		}else if(event.name == 'onMouseDown'){
			this.clicked = true;
			this.focus = true;
		}else if(event.name == 'onMouseUp'){
			this.clicked = false;	
		}else if(event.name == 'onClick'){
			if(this.obj.element == 'radio'){
				this.obj.checked = true;
			}else{
				this.obj.checked = !this.obj.checked;
			}
		}else if(event.name == 'blur'){
			if(!Game.pointInBox({x:event.x,y:event.y},this.obj) && this.focus && !this.clicked){
				this.focus = false;		
			}
			
		}
		
    }
};

//////////////////////////////////////////////////////////////////////

ZICA.UI.Button = function(obj) {
    
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
   
}

ZICA.UI.Button.prototype =  Object.create(ZICA.UI);

ZICA.UI.Button.prototype.update = function(e) {
    var oldChecked = this.obj.checked;
    this.updateStats(e);
    
    if(this.obj.checked != oldChecked){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.checked;
		event.oldValue = oldChecked;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}



ZICA.UI.Button.prototype.draw = function(canvas) {
	//console.log(canvas);
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
    //set color
    if (this.hovered) {
		//draw button
		canvas.fillStyle = this.obj.hoverColor;
		if(this.clicked)canvas.globalAlpha = 0.5;
		canvas.fillRect(this.obj.x, this.obj.y, this.obj.width, this.obj.height);
		canvas.canvas.style.cursor = 'pointer';
		this.flag = true;
    } else if(this.flag) {
        //canvas.fillStyle = '#cc6633';
		canvas.canvas.style.cursor = '';
		this.flag = false;
    }
	
	if(this.obj.toggle)if(this.obj.checked){
		canvas.fillStyle = this.obj.hoverColor;
		canvas.fillRect(this.obj.x, this.obj.y, this.obj.width, this.obj.height);
    }
}

////////////////////////////////////////////////////////////////////////////////

ZICA.UI.ButtonGroup = function(obj) {
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
}

ZICA.UI.ButtonGroup.prototype =  Object.create(ZICA.UI);

ZICA.UI.ButtonGroup.prototype.update = function(e) {
    var oldSelected = this.obj.selected;
    this.updateStats(e);
    
	var obj = this.obj;
	var checkedEnt = null;
	var arr = [];
	
	Game.scene.children.forEach((ent) =>{
			if(ent.element == 'button' && ent.toggle){
				if(Game.boxInBox(obj,ent)){
					if(ent.value == obj.selected){
						checkedEnt = ent;
					}else{
						arr.push(ent);
					}
				}
			}
				
		});
	
	if(e.name == 'onClick'){
		checkedEnt = null;
		arr = [];
		Game.scene.children.forEach((ent) =>{
			if(ent.element == 'button' && ent.toggle){
				if(Game.boxInBox(obj,ent)){
					if(Game.pointInBox(e,ent)){
						checkedEnt = ent;
						obj.selected = ent.value;
					}else{
						arr.push(ent);
					}
				
				}
			}
				
		});	
	}
	
	if(checkedEnt){
			checkedEnt.checked = true; 
			arr.forEach( ent1 => {
				ent1.checked =  false;
			});
	}
	
	if(this.obj.selected != oldSelected){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.selected;
		event.oldValue = oldSelected;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}

ZICA.UI.ButtonGroup.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
  
}

///////////////////////////////////////////////////////////////////////////////

ZICA.UI.Slider = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
}


ZICA.UI.Slider.prototype = Object.create(ZICA.UI);

ZICA.UI.Slider.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
    
	//whit tolerance
	/* if(this.intersects(this,{x:event.x, y:event.y}) && event.name == 'onMouseOut' && Game.controls.isHeldOneFrame(ZICA.Keys.leftButton)){
		this.clicked = true;
	} */
	
    if (this.clicked) {
        var pos = event.x;
        pos = Math.max(pos, this.obj.x);
        pos = Math.min(pos, this.obj.x + this.obj.width);
        
        var range = this.obj.max - this.obj.min;
        var percent = (pos - this.obj.x) / this.obj.width;
        
        this.obj.value = Math.round(this.obj.min + (percent * range));
        
    }
	
	if(this.obj.value != oldValue){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.value;
		event.oldValue = oldValue;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		//Game.handleEvent(this.obj,event); problem with stack!
	}
}

ZICA.UI.Slider.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
   	//draw the bar
    canvas.fillStyle = '#000';
    canvas.fillRect(this.obj.x, this.obj.y + (this.obj.height/4), this.obj.width, this.obj.height/2);
    
    //set color
    if (this.hovered) {
        canvas.fillStyle = '#e09952';
    } else {
       canvas.fillStyle = '#cc6633';
    }
    
    //draw the slider handle
    var range = this.obj.max - this.obj.min;
    var percent = (this.obj.value - this.obj.min) / range;
    var pos = this.obj.x + (this.obj.width*percent);
    canvas.fillRect(pos-5, this.obj.y, 10, this.obj.height);
}

/////////////////////////////////////////////////////////

ZICA.UI.CheckBox = function(obj) {
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
}

ZICA.UI.CheckBox.prototype =  Object.create(ZICA.UI);

ZICA.UI.CheckBox.prototype.update = function(e) {
    var oldChecked = this.obj.checked;
    this.updateStats(e);
    
	if(this.obj.checked != oldChecked){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.checked;
		event.oldValue = oldChecked;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}

ZICA.UI.CheckBox.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
    //draw outer box
    canvas.fillStyle = '#000';
    canvas.lineWidth = 4;
    canvas.strokeRect(this.obj.x + 5, this.obj.y + 5, this.obj.height - 10, this.obj.height - 10);
    
    if (this.obj.checked) {
        //draw checkmark
		canvas.beginPath();
		  canvas.moveTo(this.obj.x+this.obj.height/6*1.25,this.obj.y+this.obj.height/3*1.25);
		  canvas.lineTo(this.obj.x+this.obj.height/3*1.25,this.obj.y+this.obj.height/2*1.25);
		  canvas.lineTo(this.obj.x+this.obj.height/1.5*1.25,this.obj.y+this.obj.height/6*1.25);
		  canvas.lineWidth = 4;
		  canvas.strokeStyle = '#00ff00';
		  canvas.stroke(); 
    } else {
		//canvas.fillStyle = '#3d3d29';
        //canvas.fillText("\u2715", this.x+10, this.y+10);
    }
}
////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.Radio = function(obj) {
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
}

ZICA.UI.Radio.prototype =  Object.create(ZICA.UI);

ZICA.UI.Radio.prototype.update = function(e) {
    var oldChecked = this.obj.checked;
    this.updateStats(e);
    
	if(this.obj.checked != oldChecked){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.checked;
		event.oldValue = oldChecked;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}

ZICA.UI.Radio.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
    //draw outer box
    canvas.fillStyle = '#000';
    canvas.lineWidth = 2;
	
	canvas.beginPath();
	canvas.arc(this.obj.x + this.obj.height/2, this.obj.y+this.obj.height/2, (this.obj.height/2)-5, 0, 2 * Math.PI);
	canvas.stroke();

    //canvas.strokeRect(this.obj.x + 5, this.obj.y + 5, this.obj.height - 10, this.obj.height - 10);
    
    if (this.obj.checked) {
        //draw inside option
		canvas.beginPath();
		  canvas.arc(this.obj.x + this.obj.height/2, this.obj.y+this.obj.height/2, (this.obj.height/2.5)-5, 0, 2 * Math.PI);
		  //canvas.lineWidth = 4;
		  canvas.fillStyle = '#00ff00';
		  canvas.fill();
		  canvas.stroke(); 
    } else {
		//canvas.fillStyle = '#3d3d29';
        //canvas.fillText("\u2715", this.x+10, this.y+10);
    }
}

////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.RadioGroup = function(obj) {
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
}

ZICA.UI.RadioGroup.prototype =  Object.create(ZICA.UI);

ZICA.UI.RadioGroup.prototype.update = function(e) {
    var oldSelected = this.obj.selected;
    this.updateStats(e);
    
	var obj = this.obj;
	var checkedEnt = null;
	var arr = [];
	
	Game.scene.children.forEach((ent) =>{
			if(ent.element == 'radio'){
				if(Game.boxInBox(obj,ent)){
					if(ent.value == obj.selected){
						checkedEnt = ent;
					}else{
						arr.push(ent);
					}
				}
			}
				
		});
	
	if(e.name == 'onClick'){
		checkedEnt = null;
		arr = [];
		Game.scene.children.forEach((ent) =>{
			if(ent.element == 'radio'){
				if(Game.boxInBox(obj,ent)){
					if(Game.pointInBox(e,ent)){
						checkedEnt = ent;
						obj.selected = ent.value;
					}else{
						arr.push(ent);
					}
				
				}
			}
				
		});	
	}
	
	if(checkedEnt){
			checkedEnt.checked = true; 
			arr.forEach( ent1 => {
				ent1.checked =  false;
			});
	}
	
	if(this.obj.selected != oldSelected){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.selected;
		event.oldValue = oldSelected;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}

ZICA.UI.RadioGroup.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
  
}

////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.TextField = function(obj) {
    
	this.obj = obj;
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.counter = 0;
	this.timeMs = new Date;
	this.pattern = /^[a-z0-9]$/i;//^[a-z0-9]$/i;
	this.flag;
   
}

ZICA.UI.TextField.prototype =  Object.create(ZICA.UI);

ZICA.UI.TextField.prototype.update = function(e) {
    var oldText = this.obj.text;
	var mode;
	
    this.updateStats(e);
	
	if(e.name == 'onKeyDown' && this.focus && !this.obj.readOnly){
		//top.console.log(e.key);
		if(e.key.length == 1){
			this.obj.text += e.key;
			mode = 'insert';
		}else if(e.key == 'Backspace'){
			if(this.obj.text.length)
			this.obj.text = this.obj.text.substring(0,this.obj.text.length-1);
			mode = 'delete';
		}
	}
    
    if(this.obj.text != oldText){
		var event = {};
		event.name = 'onInput';
		event.value = this.obj.text;
		event.oldValue = oldText;
		event.mode = mode;
		
		if(this.obj.oninput)
		this.obj.oninput.call(this.obj,event);
		Game.handleEvent(this.obj,event);
	}
}



ZICA.UI.TextField.prototype.draw = function(canvas) {
	//console.log(canvas);
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
    //set color
    if (this.hovered) {
		//draw button
		/* canvas.fillStyle = this.obj.hoverColor;
		if(this.clicked)canvas.globalAlpha = 0.5;
		canvas.fillRect(this.obj.x, this.obj.y, this.obj.width, this.obj.height); */
		
		canvas.canvas.style.cursor = 'text';
		this.flag = true;
    } else if(this.flag){
		canvas.canvas.style.cursor = '';
		this.flag = false;
    }
	
	this.obj.textAlign = 'left';
	this.obj.verticalAlign = 'center'
	this.obj.lineHeight = 15;
	
	if(this.focus){
		var newTime = new Date();
		this.counter += newTime - this.timeMs;
		this.timeMs = newTime;
		
			//pause
		if(this.counter <= 500){
			
			var w = this.obj.textWidth;
			if(w == 0)w = 5;
			if(w>=this.obj.width)w = this.obj.width-5;
			canvas.beginPath();
			canvas.moveTo(this.obj.x+w,this.obj.y+5);
			canvas.lineTo(this.obj.x+w, this.obj.y+this.obj.height-5);
			canvas.lineWidth = 1;
			canvas.strokeStyle = this.obj.fontColor;
			canvas.stroke(); 
		}else if(this.counter>500 && this.counter <=1000){
			//
		}else{
			this.counter = 0;
		}
	}
	
	if(this.obj.text == ''){
		canvas.fillStyle = '#000';
		canvas.globalAlpha = 0.5;
		var font =  this.obj.fontSize +'px '+ this.obj.font;
			font = font.trim();
			font = font.replace('  ',' ');
			canvas.font = font;
		canvas.mlFillText(this.obj.placeholder, this.obj.x+5, this.obj.y, this.obj.width, this.obj.height,'center', 'left', 15);
		
	}
}
/////////////////////////////////////////////////////////////////////////////////////
ZICA.UI.ProgressBar = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	this.counter = 0;
	this.timeMs = new Date;
	this.WAITTIME = 1000;
}	


ZICA.UI.ProgressBar.prototype = Object.create(ZICA.UI);

ZICA.UI.ProgressBar.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
	
	if(this.obj.value != oldValue){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.value;
		event.oldValue = oldValue;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		//Game.handleEvent(this.obj,event); problem with stack!
	}
}

ZICA.UI.ProgressBar.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
	var newTime = new Date();
	this.counter += newTime - this.timeMs;
	this.timeMs = newTime;
	
	if(this.counter >= this.WAITTIME){
		this.counter = this.WAITTIME;
	}
	
	var percent = 0;
	var value = this.obj.value;
	
	if(this.obj.animated){
		var diff = this.counter/this.WAITTIME;
		if(value > 100)value = 100;
		if(value < 0) value = 0;
		
		percent	= (value/100)*diff;
	}else{
		percent	= this.obj.value/100;
	}
	
	this.oldValue = value;
	
	//draw the bar
    canvas.fillStyle = this.obj.barColor;
    canvas.fillRect(this.obj.x, this.obj.y, this.obj.width*percent, this.obj.height);
	
}

//////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.Spinner = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.start = new Date;
}	


ZICA.UI.Spinner.prototype = Object.create(ZICA.UI);

ZICA.UI.Spinner.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
}

ZICA.UI.Spinner.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
	var lines = 16,  
    cW = this.obj.width,
    cH = this.obj.height;
	var x = this.obj.x;
	var y = this.obj.y;

    var rotation = parseInt(((new Date() - this.start) / 1000) * lines) / lines;
    canvas.translate(x + cW / 2, y + cH / 2);
    canvas.rotate(Math.PI * 2 * rotation);
    for (var i = 0; i < lines; i++) {

        canvas.beginPath();
        canvas.rotate(Math.PI * 2 / lines);
        canvas.moveTo(cW / 10, 0);
        canvas.lineTo(cW / 4, 0);
        canvas.lineWidth = cW / 30;
        canvas.strokeStyle = "rgba(0, 0, 0," + i / lines + ")";
        canvas.stroke();
    }

}

/////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.StarRating = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.stars = 5;
	this.hoverStar = 0;
}	


ZICA.UI.StarRating.prototype = Object.create(ZICA.UI);

ZICA.UI.StarRating.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
	
	if(this.hovered){
		this.hoverStar = Math.ceil((event.x-this.obj.x)/(this.obj.width/5));
	}else{
		this.hoverStar = 0;
	}
	
	if(this.clicked && this.hoverStar){
		this.obj.rate = this.hoverStar;
	}
}

ZICA.UI.StarRating.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	var r = this.obj.width/this.stars/2;
	var x = this.obj.x;
	var y =  this.obj.y;
	var cW = this.obj.width;
	var cH = this.obj.height;
	var ctx = canvas;
	var padding = 0;
	if(r < cH)padding = cH - r;
	for(var s = 0; s<=4; s++){
		 ctx.save();
		ctx.beginPath();
		canvas.translate((x + r + 2*r*s), y+ r + padding/4);
		ctx.moveTo(0, 0 - r);
		for (var i = 0; i < 5; i++) {
			ctx.rotate(Math.PI / 5);
			ctx.lineTo(0, 0 - (r * 0.5));
			ctx.rotate(Math.PI / 5);
			ctx.lineTo(0, 0 - r);
		}
		
		if(s<this.hoverStar){
			canvas.globalAlpha = 0.5;
			canvas.fillStyle = 'yellow';
			ctx.fill();
		}else{	
			canvas.globalAlpha = 1;
		}
		
		
		if(s+1>this.obj.rate){
			canvas.strokeStyle = 'orange';
			canvas.stroke();
		}else{	
		canvas.fillStyle = 'orange';
		ctx.fill();
		}
		ctx.restore();
		
	}

}

///////////////////////////////////////////////////////////////////////////

ZICA.UI.HtmlView = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.htmlSvg = new Image();
}	


ZICA.UI.HtmlView.prototype = Object.create(ZICA.UI);

ZICA.UI.HtmlView.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
}

ZICA.UI.HtmlView.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
	if( this.obj.html){
		
		this.htmlSvg.src = this.html_to_svg(this.obj.html);
		canvas.drawImage(this.htmlSvg, this.obj.x, this.obj.y, this.obj.width, this.obj.height);
	}
}

ZICA.UI.HtmlView.prototype.html_to_svg = function(html) {
  var data = "data:image/svg+xml;charset=utf-8," + '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.obj.width + '" height="' + this.obj.height + '">' +
    '<foreignObject width="100%" height="100%">' +
    this.html_to_xml(html) +
    '</foreignObject>' +
    '</svg>';
	
	return data;
}

ZICA.UI.HtmlView.prototype.html_to_xml = function(html) {
  var doc = document.implementation.createHTMLDocument('');
  doc.write(html);

  // You must manually set the xmlns if you intend to immediately serialize     
  // the HTML document to a string as opposed to appending it to a
  // <foreignObject> in the DOM
  doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);

  // Get well-formed markup
  html = (new XMLSerializer).serializeToString(doc.body);
  return html;
}
/////////////////////////////////////////////////////////////////////////////////////////

ZICA.UI.Link = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.visited = false;
	
}	


ZICA.UI.Link.prototype = Object.create(ZICA.UI);

ZICA.UI.Link.prototype.update = function(event) {
	this.updateStats(event);
}

ZICA.UI.Link.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
	this.obj.textAlign = 'left';
	this.obj.verticalAlign = 'top';
	this.obj.lineHeight = 15;
	
	if(this.hovered){
		canvas.canvas.style.cursor = 'pointer';
		this.underline(canvas,this.obj.text,this.obj.x,this.obj.y);
		if(this.clicked){
			this.obj.fontColor = this.obj.activeColor;
		}else{
			this.obj.fontColor = this.obj.linkColor;
		}
	} else if(this.flag){
		canvas.canvas.style.cursor = '';
		this.flag = false;
		this.obj.fontColor = this.obj.linkColor;
    }else if(!this.visited){
		if(!Game.controls.isHeld(ZICA.Keys.leftButton))
		this.obj.fontColor = this.obj.linkColor;
	}
	
	if(this.visited && !this.clicked){
		this.obj.fontColor = this.obj.visitedColor;
	}
	
	if(this.obj.checked){
		//document.location = this.linkURL;
		var link = document.createElement('a');
		//link.target = '_blank';
		link.href = this.obj.linkURL;
		link.target = this.obj.linkTarget;
		link.click();
		
		this.visited = true;
		this.obj.checked = false;
	}
	
}

ZICA.UI.Link.prototype.measureText = function(ctx, text){
  let metrics = ctx.measureText(text)
  return {
    width: Math.floor(metrics.width),
    height: Math.floor(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent),
    actualHeight: Math.floor(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
  }
}

ZICA.UI.Link.prototype.underline = function(ctx, text, x, y){
  let metrics = this.measureText(ctx, text)
  let fontSize = Math.floor(metrics.actualHeight * 1.4) // 140% the height 
  switch (ctx.textAlign) {
    case "center" : x -= (metrics.width / 2) ; break
    case "right"  : x -= metrics.width       ; break
  }
  switch (ctx.textBaseline) {
    case "top"    : y += (fontSize)     ; break
    case "middle" : y += (fontSize / 2) ; break
  }
  //ctx.save()
  if(this.obj.textWidth > this.obj.width){
	
	var breaks = Math.ceil( this.obj.textWidth / this.obj.width);
	//top.console.log(breaks);
	
  for(var i = 1; i<= breaks; i++){
		  ctx.beginPath()
		  ctx.strokeStyle = this.obj.fontColor;
		  ctx.lineWidth = Math.ceil(fontSize * 0.08)
		  ctx.moveTo(x, y + (metrics.actualHeight + metrics.height)*i)
		  //var width = this.obj.width;//(i==breaks)?this.obj.textWidth:this.obj.width
		  ctx.lineTo(x + this.obj.width , y + (metrics.actualHeight + metrics.height)*i)
		  ctx.stroke()
   }
  
  }else{
  ctx.beginPath()
  ctx.strokeStyle = this.obj.fontColor;
  ctx.lineWidth = Math.ceil(fontSize * 0.08)
  ctx.moveTo(x, y + metrics.actualHeight + metrics.height)
  ctx.lineTo(x + this.obj.textWidth + 0*metrics.width, y + metrics.actualHeight + metrics.height)
  ctx.stroke()
  }
  //ctx.restore()
}

///////////////////////////////////////////////////////////////////////////////


ZICA.UI.ScrollBarHorizontal = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.barCalor = '#000';
	this.leftButtonColor = 'rgba(0, 0, 0, 1)';
	this.rightButtonColor = '#000';
	this.barButton = 'rgba(103, 128, 159, 1)';
}


ZICA.UI.ScrollBarHorizontal.prototype = Object.create(ZICA.UI);

ZICA.UI.ScrollBarHorizontal.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
    var onBarButton = false;
	//whit tolerance
	/* if(this.intersects(this,{x:event.x, y:event.y}) && event.name == 'onMouseOut' && Game.controls.isHeldOneFrame(ZICA.Keys.leftButton)){
		this.clicked = true;
	} */
	  //set color
	
	if (this.hovered) {
        var box = {};
		
		var range = this.obj.max - this.obj.min;
		var percent = (this.obj.value - this.obj.min) / range;
		var pos = this.obj.x + (this.obj.width*percent);
	
		box.x = pos;
		box.y = this.obj.y + (this.obj.height/4);
		box.width = this.obj.size;
		box.height = this.obj.height/2;
		
		if(Game.pointInBox(event,box)){
			onBarButton = true;
			this.barButton = 'rgba(103, 128, 159, 0.7)';
		}
		else this.barButton = 'rgba(103, 128, 159, 1)';
		
    } else {
		this.barButton = 'rgba(103, 128, 159, 1)';
    }
	
    if (this.clicked /* && !onBarButton */) {
        var pos = event.x - this.obj.size/2;
        pos = Math.max(pos, this.obj.x);
        pos = Math.min(pos, this.obj.x + this.obj.width);
        
        var range = this.obj.max - this.obj.min;
        var percent = (pos - this.obj.x) / this.obj.width;
        
        this.obj.value = Math.round(this.obj.min + (percent * range)) ;
		if(this.obj.value >= this.obj.max) this.obj.value = this.obj.max;
		if(this.obj.value <= this.obj.min) this.obj.value = this.obj.min;
		
		this.barButton = 'rgba(103, 128, 159, 0.5)';
      
    }/* else if(this.clicked){
		this.barButton = 'rgba(103, 128, 159, 0.5)';
	} */
	
	//top.console.log(event.name);
	
	if(this.obj.value != oldValue){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.value;
		event.oldValue = oldValue;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		//Game.handleEvent(this.obj,event); problem with stack!
	}
}

ZICA.UI.ScrollBarHorizontal.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	var oldValue = this.obj.value;
	
	if(this.obj.size >= this.obj.width)this.obj.size = this.obj.width;
	
	var event = Game.controls.mouse;
	event = Game.camera.screenToWorld(event.x,event.y);
	
	var leftBox = {};
	leftBox.x = this.obj.x - 20;
	leftBox.y = this.obj.y + (this.obj.height/4);
	leftBox.width = 20;
	leftBox.height = this.obj.height/2;
	
	if(Game.pointInBox(event,leftBox)){
		 this.leftButtonColor = 'rgba(0, 0, 0, 0.7)';
		if(Game.controls.isHeld((ZICA.Keys.leftButton))){
			this.leftButtonColor = 'rgba(0, 0, 0, 0.6)';
			if(this.obj.seekSpeed == 'slow')this.obj.value -= 0.5;
			if(this.obj.seekSpeed == 'medium')this.obj.value -= 1;
			if(this.obj.seekSpeed == 'fast')this.obj.value -= 2;
			
			if(this.obj.value != oldValue){
				var event = {};
				event.name = 'onChange';
				event.value = this.obj.value;
				event.oldValue = oldValue;
				
				if(this.obj.onchange)
				this.obj.onchange.call(this.obj,event);
				//Game.handleEvent(this.obj,event); problem with stack!
			}
			
		}else this.leftButtonColor = 'rgba(0, 0, 0, 0.7)';
	}else{
		this.leftButtonColor = 'rgba(0, 0, 0, 1)';
	}
	if(this.obj.value <= this.obj.min) this.leftButtonColor = 'rgba(0, 0, 0, 0.8)';
	
	var rightBox = {};
	rightBox.x = this.obj.x+this.obj.width;
	rightBox.y = this.obj.y + (this.obj.height/4);
	rightBox.width = 20;
	rightBox.height = this.obj.height/2;
	
	if(Game.pointInBox(event,rightBox)){
		 this.rightButtonColor = 'rgba(0, 0, 0, 0.7)';
		if(Game.controls.isHeld((ZICA.Keys.leftButton))){
			if(this.obj.seekSpeed == 'slow')this.obj.value += 0.5;
			if(this.obj.seekSpeed == 'medium')this.obj.value += 1;
			if(this.obj.seekSpeed == 'fast')this.obj.value += 2;
			this.rightButtonColor = 'rgba(0, 0, 0, 0.6)';
			
			if(this.obj.value != oldValue){
				var event = {};
				event.name = 'onChange';
				event.value = this.obj.value;
				event.oldValue = oldValue;
				
				if(this.obj.onchange)
				this.obj.onchange.call(this.obj,event);
				//Game.handleEvent(this.obj,event); problem with stack!
			}
		}
		else this.rightButtonColor = 'rgba(0, 0, 0, 0.7)';
	}else{
		this.rightButtonColor = 'rgba(0, 0, 0, 1)';
	}
	if(this.obj.value >= this.obj.max) this.rightButtonColor = 'rgba(0, 0, 0, 0.8)';
	
   	//draw the bar
    canvas.fillStyle = this.barCalor;
    canvas.fillRect(this.obj.x, this.obj.y + (this.obj.height/4), this.obj.width, this.obj.height/2);
    
    //draw the slider handle
    var range = this.obj.max - this.obj.min;
    var percent = (this.obj.value - this.obj.min) / range;
    var pos = this.obj.x + (this.obj.width*percent);
	
	if(pos>=this.obj.x+this.obj.width-this.obj.size)pos = this.obj.x+this.obj.width-this.obj.size;
	if(pos<=this.obj.x)pos = this.obj.x;
	
	//if(pos>=this.obj.x+this.obj.width-5)pos = pos-10;
	
	canvas.fillStyle = this.barButton;
    canvas.fillRect(pos, this.obj.y + (this.obj.height/4), this.obj.size, this.obj.height/2);
	
	//left button
	canvas.fillStyle = this.leftButtonColor;
    canvas.fillRect(this.obj.x - 20, this.obj.y + (this.obj.height/4), 20, this.obj.height/2);
	
	canvas.save();
	canvas.beginPath();
	canvas.translate(this.obj.x - 20, this.obj.y + (this.obj.height/4));
	
	//ctx.beginPath();
    canvas.moveTo(5,(this.obj.height/4));
    canvas.lineTo(15,5);
    canvas.lineTo(15,(this.obj.height/2-5));
	canvas.fillStyle = 'gray';
    canvas.fill();
	canvas.restore()
	
	//right button
	canvas.fillStyle = this.rightButtonColor;
    canvas.fillRect(this.obj.x+this.obj.width, this.obj.y + (this.obj.height/4), 20, this.obj.height/2);
	
	canvas.save();
	canvas.beginPath();
	canvas.translate(this.obj.x+this.obj.width,  this.obj.y + (this.obj.height/4));
	
	
	//ctx.beginPath();
    
    canvas.moveTo(15,(this.obj.height/4));
    canvas.lineTo(5,5);
    canvas.lineTo(5,(this.obj.height/2)-5);
   
	canvas.fillStyle = 'gray';
    canvas.fill();
	canvas.restore()
}

///////////////////////////////////////////////////////////////////////////////


ZICA.UI.ScrollBarVertical = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.barCalor = '#000';
	this.leftButtonColor = 'rgba(0, 0, 0, 1)';
	this.rightButtonColor = '#000';
	this.barButton = 'rgba(103, 128, 159, 1)';
}


ZICA.UI.ScrollBarVertical.prototype = Object.create(ZICA.UI);

ZICA.UI.ScrollBarVertical.prototype.update = function(event) {
    var oldValue = this.obj.value;
	this.updateStats(event);
    var onBarButton = false;
	//whit tolerance
	/* if(this.intersects(this,{x:event.x, y:event.y}) && event.name == 'onMouseOut' && Game.controls.isHeldOneFrame(ZICA.Keys.leftButton)){
		this.clicked = true;
	} */
	  //set color
	
	if (this.hovered) {
        var box = {};
		
		var range = this.obj.max - this.obj.min;
		var percent = (this.obj.value - this.obj.min) / range;
		var pos = this.obj.y + (this.obj.height*percent);
	
		box.x = this.obj.x + (this.obj.width/4);
		box.y = pos;
		box.height = this.obj.size;
		box.width = this.obj.width/2;
		
		if(Game.pointInBox(event,box)){
			onBarButton = true;
			this.barButton = 'rgba(103, 128, 159, 0.7)';
		}
		else this.barButton = 'rgba(103, 128, 159, 1)';
		
    } else {
		this.barButton = 'rgba(103, 128, 159, 1)';
    }
	
    if (this.clicked /* && !onBarButton */) {
        var pos = event.y - this.obj.size/2;
        pos = Math.max(pos, this.obj.y);
        pos = Math.min(pos, this.obj.y + this.obj.height);
        
        var range = this.obj.max - this.obj.min;
        var percent = (pos - this.obj.y) / this.obj.height;
        
        this.obj.value = Math.round(this.obj.min + (percent * range)) ;
		if(this.obj.value >= this.obj.max) this.obj.value = this.obj.max;
		if(this.obj.value <= this.obj.min) this.obj.value = this.obj.min;
		
		this.barButton = 'rgba(103, 128, 159, 0.5)';
      
    }/* else if(this.clicked){
		this.barButton = 'rgba(103, 128, 159, 0.5)';
	} */
	
	//top.console.log(event.name);
	
	if(this.obj.value != oldValue){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.value;
		event.oldValue = oldValue;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		//Game.handleEvent(this.obj,event); problem with stack!
	}
}

ZICA.UI.ScrollBarVertical.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	var oldValue = this.obj.value;
	
	if(this.obj.size >= this.obj.height)this.obj.size = this.obj.height;
	
	var event = Game.controls.mouse;
	event = Game.camera.screenToWorld(event.x,event.y);
	
	var leftBox = {};
	leftBox.y = this.obj.y - 20;
	leftBox.x = this.obj.x + (this.obj.width/4);
	leftBox.height = 20;
	leftBox.width = this.obj.width/2;
	
	if(Game.pointInBox(event,leftBox)){
		 this.leftButtonColor = 'rgba(0, 0, 0, 0.7)';
		if(Game.controls.isHeld((ZICA.Keys.leftButton))){
			this.leftButtonColor = 'rgba(0, 0, 0, 0.6)';
			if(this.obj.seekSpeed == 'slow')this.obj.value -= 0.5;
			if(this.obj.seekSpeed == 'medium')this.obj.value -= 1;
			if(this.obj.seekSpeed == 'fast')this.obj.value -= 2;
			
			if(this.obj.value != oldValue){
				var event = {};
				event.name = 'onChange';
				event.value = this.obj.value;
				event.oldValue = oldValue;
				
				if(this.obj.onchange)
				this.obj.onchange.call(this.obj,event);
				//Game.handleEvent(this.obj,event); problem with stack!
			}
			
		}else this.leftButtonColor = 'rgba(0, 0, 0, 0.7)';
	}else{
		this.leftButtonColor = 'rgba(0, 0, 0, 1)';
	}
	if(this.obj.value <= this.obj.min) this.leftButtonColor = 'rgba(0, 0, 0, 0.8)';
	
	var rightBox = {};
	rightBox.y = this.obj.y+this.obj.height;
	rightBox.x = this.obj.x + (this.obj.width/4);
	rightBox.height = 20;
	rightBox.width = this.obj.width/2;
	
	if(Game.pointInBox(event,rightBox)){
		 this.rightButtonColor = 'rgba(0, 0, 0, 0.7)';
		if(Game.controls.isHeld((ZICA.Keys.leftButton))){
			if(this.obj.seekSpeed == 'slow')this.obj.value += 0.5;
			if(this.obj.seekSpeed == 'medium')this.obj.value += 1;
			if(this.obj.seekSpeed == 'fast')this.obj.value += 2;
			this.rightButtonColor = 'rgba(0, 0, 0, 0.6)';
			
			if(this.obj.value != oldValue){
				var event = {};
				event.name = 'onChange';
				event.value = this.obj.value;
				event.oldValue = oldValue;
				
				if(this.obj.onchange)
				this.obj.onchange.call(this.obj,event);
				//Game.handleEvent(this.obj,event); problem with stack!
			}
		}
		else this.rightButtonColor = 'rgba(0, 0, 0, 0.7)';
	}else{
		this.rightButtonColor = 'rgba(0, 0, 0, 1)';
	}
	if(this.obj.value >= this.obj.max) this.rightButtonColor = 'rgba(0, 0, 0, 0.8)';
	
   	//draw the bar
    canvas.fillStyle = this.barCalor;
    canvas.fillRect(this.obj.x + (this.obj.width/4), this.obj.y, this.obj.width/2, this.obj.height );
    
    //draw the slider handle
    var range = this.obj.max - this.obj.min;
    var percent = (this.obj.value - this.obj.min) / range;
    var pos = this.obj.y + (this.obj.height*percent);
	
	if(pos>=this.obj.y+this.obj.height-this.obj.size)pos = this.obj.y+this.obj.height-this.obj.size;
	if(pos<=this.obj.y)pos = this.obj.y;
	
	//if(pos>=this.obj.x+this.obj.width-5)pos = pos-10;
	
	canvas.fillStyle = this.barButton;
    canvas.fillRect(this.obj.x + (this.obj.width/4), pos, this.obj.width/2 , this.obj.size );
	
	//top button
	canvas.fillStyle = this.leftButtonColor;
    canvas.fillRect(this.obj.x + (this.obj.width/4),this.obj.y - 20, this.obj.width/2 , 20 );
	
	canvas.save();
	canvas.beginPath();
	canvas.translate(this.obj.x + (this.obj.width/4), this.obj.y - 20);
	
	//ctx.beginPath();
    canvas.moveTo((this.obj.width/4),5);
    canvas.lineTo(5,15);
    canvas.lineTo((this.obj.width/2-5),15);
	canvas.fillStyle = 'gray';
    canvas.fill();
	canvas.restore()
	
	//bottom button
	canvas.fillStyle = this.rightButtonColor;
    canvas.fillRect( this.obj.x + (this.obj.width/4), this.obj.y+this.obj.height, this.obj.width/2, 20 );
	
	canvas.save();
	canvas.beginPath();
	canvas.translate(this.obj.x + (this.obj.width/4), this.obj.y+this.obj.height);
	
	
	//ctx.beginPath();
    
    canvas.moveTo((this.obj.width/4),15);
    canvas.lineTo(5,5);
    canvas.lineTo((this.obj.width/2)-5,5);
   
	canvas.fillStyle = 'gray';
    canvas.fill();
	canvas.restore()
}


///////////////////////////////////////////////////////////////////////////////

ZICA.UI.Select = function(obj) {
  
    this.clicked = false;
    this.hovered = false;
	this.focus = false;
	this.flag = false;
	this.obj = obj;
	
	this.MIN_HEIGHT = 30;
	
	this.height = this.MIN_HEIGHT;
	
}


ZICA.UI.Select.prototype = Object.create(ZICA.UI);

ZICA.UI.Select.prototype.update = function(event) {
    var oldSelected = this.obj.selected;
	var hasSelect = false;
	
	this.updateStats(event);
    
	if(event.name == 'blur' && this.focus == false){
		
		if(this.obj.checked){
			
			var a = this.obj.y + this.obj.height;
			var b = event.y;
			var sub = b-a;
			
			if(sub > 0){
				var index = Math.floor(sub/30);
				
				if(this.obj.options[index] !== undefined){
					this.obj.selected = this.obj.options[index];
					hasSelect = true;
				}
			}
			
		}
		
		this.obj.checked = false;
	}
	
	if(this.obj.selected != oldSelected){
		var event = {};
		event.name = 'onChange';
		event.value = this.obj.selected;
		event.oldValue = oldSelected;
		
		if(this.obj.onchange)
		this.obj.onchange.call(this.obj,event);
		Game.handleEvent(this.obj,event);
		
		if(hasSelect){
			var event1 = {};
			event1.name = 'onSelect';
			event1.value = this.obj.selected;
			event1.oldValue = oldSelected;
			if(this.obj.onselect)this.obj.onselect.call(this.obj,event1);
		}
	}
}

ZICA.UI.Select.prototype.draw = function(canvas) {
	
	if(this.obj.disabled){
		canvas.globalAlpha = 0.5;
	}
	
	//this.obj.fontSize = 18;
	this.obj.textAlign = 'left';
	this.obj.verticalAlign = 'center';
	this.obj.lineHeight = 15;
	this.obj.drawBorder = true;
	
	if(!this.obj.selected){
		this.obj.text = ' '+this.obj.placeholder;
	}else{
		this.obj.text = ' '+ this.obj.selected;
	}
	
	if(!this.obj.checked){	
		this.height = this.MIN_HEIGHT;
		this.obj.height = this.height;	
	}else{
		this.height = this.obj.options.length*this.height;
		var opts = this.obj.options;
		
		for(var i = 0; i<= opts.length-1; i++){
			canvas.strokeStyle = '#000';
			canvas.lineWidth = 1;
			canvas.font = '25px';
			var marginLeft = 5;
    		canvas.strokeRect(this.obj.x , this.obj.y + this.MIN_HEIGHT*(i+1), this.obj.width, this.MIN_HEIGHT);
			canvas.fillStyle = this.obj.fontColor;
			canvas.mlFillText(opts[i], this.obj.x + marginLeft, this.obj.y + this.MIN_HEIGHT*(i+1), this.obj.width,this.MIN_HEIGHT, this.obj.verticalAlign, this.obj.textAlign, this.obj.lineHeight);
		}
		
	}
	
   	//draw the bar
    canvas.strokeStyle = '#000';
	canvas.lineWidth = 2;
    //canvas.strokeRect(this.obj.x + this.obj.width-20, this.obj.y , 20, this.obj.height);
	
	canvas.save();
	canvas.beginPath();
	canvas.translate(this.obj.x + this.obj.width-20, this.obj.y);
	
	canvas.lineWidth = 2;
    canvas.moveTo(10, this.obj.height-10);
    canvas.lineTo(5,10);
	 canvas.moveTo(10, this.obj.height-10);
    canvas.lineTo(15,10);
	 canvas.strokeStyle = 'rgb(0,0,0,1)';
	canvas.stroke();
    //canvas.fill();
	canvas.restore()
	
    
    //set color
    if (this.hovered) {
        canvas.fillStyle = '#e09952';
    } else {
       canvas.fillStyle = '#cc6633';
    }
}
