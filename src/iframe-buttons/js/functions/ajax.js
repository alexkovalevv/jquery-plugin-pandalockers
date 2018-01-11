if( typeof(updateQueryStringParameter) === "undefined" ) {
	throw Error('Функция ajax зависит от функции updateQueryStringParameter');
}

function ajax(method, url, data, callback) {

	var bodyData = '';

	if( data ) {
		for( key in data ) {
			if( !data.hasOwnProperty(key) ) {
				continue;
			}

			if( method.toLowerCase() === 'GET'.toLowerCase() ) {
				url = updateQueryStringParameter(url, key, encodeURIComponent(data[key]));
			}

			if( method.toLowerCase() === 'POST'.toLowerCase() ) {
				bodyData = updateQueryStringParameter(bodyData, key, encodeURIComponent(data[key]));
			}
		}
	}

	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest,
		xhr = new XHR();

	xhr.open(method, url, true);
	xhr.responseType = 'json';

	if( method.toLowerCase() === 'POST'.toLowerCase() ) {
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	}

	xhr.onload = function() {
		callback && callback(this.response);
	};

	xhr.onerror = function() {
		console.log("[Error]: Произшла ошибка во время выполенния ajax запроса, код ошибки:" + this.status);
		sendMessage && sendMessage('error', {code: 'request_status_code_' + this.status});
	};

	xhr.send(bodyData.replace('?', ''));
}
