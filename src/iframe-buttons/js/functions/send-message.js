var postMessage = {iframe: window.name};

function setMessageParam(paramName, paramValue) {
	"use strict";

	postMessage[paramName] = paramValue;
	return postMessage;
}

function sendMessage(event, args) {
	"use strict";

	if( !event ) {
		return;
	}

	var obj = {};
	obj.event = event;

	for( var k in postMessage ) {
		if( !postMessage.hasOwnProperty(k) ) {
			continue;
		}
		obj[k] = postMessage[k]
	}

	for( var i in args ) {
		if( !args.hasOwnProperty(i) ) {
			continue;
		}
		obj[i] = args[i];
	}

	window.parent.postMessage(JSON.stringify({
		onpwgt: {
			button: obj
		}
	}), '*');
}