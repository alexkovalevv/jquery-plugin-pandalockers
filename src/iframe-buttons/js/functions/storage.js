if( typeof(extend) === "undefined" ) {
	throw new Error("Функция cookie является зависимой от функции extend");
}

/**
 * Обертка для работы cookie.
 * @return mixed
 */
function cookie(key, value, options) {
	// Sets cookie
	if( arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined) ) {

		options = extend({}, options);
		if( value === null || value === undefined ) {
			options.expires = -1;
		}
		if( typeof options.expires === 'number' ) {
			var days = options.expires, t = options.expires = new Date();
			t.setDate(t.getDate() + days);
		}
		value = String(value);
		return (document.cookie = [
			encodeURIComponent(key),
			'=',
			options.raw
				? value
				: encodeURIComponent(value),
			options.expires
				? '; expires=' + options.expires.toUTCString()
				: '',
			options.path
				? '; path=' + options.path
				: '',
			options.domain
				? '; domain=' + options.domain
				: '',
			options.secure
				? '; secure'
				: ''
		].join(''));
	}
	// Gets cookie.
	options = value || {};
	var decode = options.raw
		? function(s) {
		return s;
	}
		: decodeURIComponent;
	var pairs = document.cookie.split('; ');
	for( var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++ ) {
		if( decode(pair[0]) === key ) {
			return decode(pair[1] || '');
		}
	}
	return null;
}

/**
 * Получает метку или куку из локального хранилища
 * @param cookieName
 * @returns {string}
 */
function getFromStorage(cookieName) {
	try {
		var result = localStorage && localStorage.getItem && localStorage.getItem(cookieName);
		if( result ) {
			var unixtime = Math.round(+new Date() / 1000);
			result = JSON.parse(result);
			if( result.expires < unixtime ) {
				removeStorage(cookieName);
				return null;
			}
			return result.data;
		} else {
			return cookie(cookieName);
		}
	}
	catch( e ) {
		console.log('[Warnign]: Local storage is disabled by security permissions.');

		return cookie(cookieName);
	}

}

/**
 * Дабавляет метку или куку в локальное хранилище
 * @param cookieName
 * @param value
 * @param expires
 * @param cookieForce
 */
function setStorage(cookieName, value, expires, cookieForce) {
	try {
		if( localStorage && localStorage.setItem ) {
			try {
				var unixtime = Math.round(+new Date() / 1000);
				var str = {
					data: value,
					expires: expires * 86400 + unixtime
				};
				localStorage.setItem(cookieName, JSON.stringify(str));
			}
			catch( e ) {
				cookie(cookieName, value, {
					expires: expires,
					path: "/"
				});
			}
		}
		if( !localStorage || cookieForce ) {
			cookie(cookieName, value, {
				expires: expires,
				path: "/"
			});
		}
	}
	catch( e ) {
		console.log('[Warnign]: Local storage is disabled by security permissions.');

		cookie(cookieName, value, {
			expires: expires,
			path: "/"
		});
	}
}

/**
 * Удаляет метку или куку из локального хранилища
 * @param cookieName
 */
function removeStorage(cookieName) {
	try {
		if( localStorage && localStorage.removeItem ) {
			localStorage.removeItem(cookieName);
		} else {
			cookie(cookieName, null, {
				expires: 0,
				path: "/"
			});
		}
	}
	catch( e ) {
		console.log('[Warnign]: Local storage is disabled by security permissions.');

		cookie(cookieName, null, {
			expires: 0,
			path: "/"
		});
	}
}