/*
 * requestAnimationFrame.js
 * JavaScript implementation of the requestAnimationFrame API.
 *
 * @author Cedric Vivier (@neonux)
 * @license MIT
*/

(function (window) {

var FRAME_DELAY = 1000 / 60; /* target 60 FPS */

var _interval = null;
var _animationTime = 0;

var _id = 0;
var _requests = {};


function animationTime() {
	return _animationTime;
}

function requestAnimationFrame(callback, element) {
	if (_interval === null) {
		_interval = setInterval(trigger, FRAME_DELAY);
	}

	_requests[++_id] = {
		element: element,
		callback: callback //TODO: wrap callback to optimize reuse case by shadowing rAF
	}
	return _id;
}

function cancelRequestAnimationFrame(id) {
	delete _requests[id];
}

function isElementWithinViewport(element) {
	//TODO:element.offsetTop window.pageYOffset..
	return true;
}

function trigger() {
	var id;
	var request;

	_animationTime = Date.now();

	for (id in _requests) {
		request = _requests[id];
		if (isElementWithinViewport(request.element)) {
			delete _requests[id];
			request.callback.call(request.element); //TODO: spec!!
		}
	}
	id = -1;
	for (id in _requests) {};
	if (id === -1) { // no active request
		clearInterval(_interval);
		_interval = null;
	}
}


// setup/normalize shims as necessary
switch (window.requestAnimationFrameJS) {
case "force":
	window.animationTime = animationTime;
	window.requestAnimationFrame = requestAnimationFrame;
	window.cancelRequestAnimationFrame = cancelRequestAnimationFrame;
	break;
case "auto":
default:
	window.animationTime = window.mozAnimationTime || window.webkitAnimationTime || animationTime;
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrame;
	window.cancelRequestAnimationFrame = window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || cancelRequestAnimationFrame;
	break;
}

/* FIXME: this is a bit too aggressve
if (window.requestAnimationFrame === requestAnimationFrame)
	// shim set! pause on window blur (user switched tab or minimized window)
	window.onblur = function () { clearInterval(_interval); _interval = null; };
	window.onfocus = function () { _interval = setInterval(trigger, FRAME_DELAY); };
}*/

// wraps current implementations so that they always bind `this' to element when calling the callback
if (window.requestAnimationFrame !== requestAnimationFrame) {
	var impl = window.requestAnimationFrame;
	window.requestAnimationFrame = function requestAnimationFrame(callback, element) {
		impl(function wrappedCallback() { callback.call(element); }, element);
	}
}
})(window);

