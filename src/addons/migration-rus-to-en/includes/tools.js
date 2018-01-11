/**
 * Расширяем инструменты основного плагина
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 25.05.2017
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['migration-rus-to-en']
 */
(function($) {
	'use strict';
	if( !$.pandalocker.tools ) {
		$.pandalocker.tools = {};
	}

	/**
	 * Excludes array elements if they are different
	 */
	$.pandalocker.tools.excludeDifferentArrayElements = function(arr1, arr2) {
		return $.grep(arr1, function(el) {
			return $.inArray(el, arr2) > -1;
		});
	};

	/**
	 * Comapres two objects and return result equals.
	 */
	$.pandalocker.tools.objectIsEquals = function(compare1, compare2) {
		return JSON.stringify(compare1) === JSON.stringify(compare2);
	};

	/**
	 * Converts string of the view 'fooBar' to 'foo-bar'.
	 * @param input
	 * @returns {XML|string|void}
	 */
	$.pandalocker.tools.destroyCamelCase = function(input) {
		input.charAt(0).toLowerCase();
		return input.replace(/[A-Z]/g, function(match) {
			return '-' + match.toLowerCase();
		});
	};

	/**
	 * Дабавляет метку или куку в локальное хранилище
	 * @param cookieName
	 * @param value
	 * @param expires
	 */
	$.pandalocker.tools.setStorage = function(cookieName, value, expires) {
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
					$.pandalocker.tools.cookie(cookieName, value, {
						expires: expires,
						path: "/"
					});
				}
			} else {
				$.pandalocker.tools.cookie(cookieName, value, {
					expires: expires,
					path: "/"
				});
			}
		}
		catch( e ) {
			console.log('[Warnign]: Local storage is disabled by security permissions.');
			$.pandalocker.tools.cookie(cookieName, value, {
				expires: expires,
				path: "/"
			});
		}
	};

	/**
	 * Получает метку или куку из локального хранилища
	 * @param cookieName
	 * @returns {string}
	 */
	$.pandalocker.tools.getFromStorage = function(cookieName) {
		try {
			var result = localStorage && localStorage.getItem && localStorage.getItem(cookieName);
			if( result ) {
				var unixtime = Math.round(+new Date() / 1000);
				try {
					result = JSON.parse(result);

					if( result.expires < unixtime ) {
						this.removeStorage(cookieName);
						return null;
					}
					return result.data;
				}
				catch( e ) {
					return result;
				}
			} else {
				return $.pandalocker.tools.cookie(cookieName);
			}
		}
		catch( e ) {
			console.log('[Warnign]: Local storage is disabled by security permissions.');
			return $.pandalocker.tools.cookie(cookieName);
		}

	};

	/**
	 * Удаляет метку или куку из локального хранилища
	 * @param cookieName
	 */
	$.pandalocker.tools.removeStorage = function(cookieName) {
		try {
			if( localStorage && localStorage.removeItem ) {
				localStorage.removeItem(cookieName);
			} else {
				$.pandalocker.tools.cookie(cookieName, null, {
					expires: 0,
					path: "/"
				});
			}
		}
		catch( e ) {
			console.log('[Warnign]: Local storage is disabled by security permissions.');
		}
	};

	/**
	 * Читабельное название checkDomainType
	 * Проверяет тип домена возможные варианты:
	 * русский|пуникод|обычный
	 * @param str
	 * @return {string} - домен
	 */
	$.pandalocker.tools.cdmt = function(str) {
		var uri = new $.pandalocker.tools.uri(str);

		uri.normalize();

		if( uri.is("punycode") ) {
			return 'punycode';
		}
		return 'normal';
	};

	/**
	 * Читабельное название strDecode
	 * Легкая фукнция для декодирования информации
	 * закодированной спомощью $.pandalocker.tools.see
	 * @param str
	 * @return {string} - декодированная строка
	 */
	$.pandalocker.tools.sde = function(str) {
		var res = '';
		var separateSymbols = str.split(/[a-z]{1}/i);
		for( var i = 0; i < separateSymbols.length; i++ ) {
			res += String.fromCharCode(separateSymbols[i]);
		}
		return res;
	};

	/**
	 * Читабельное название strEncode
	 * Легкая фукнция для кодирования информации
	 * @param str
	 * @return {string} - закодированная строка
	 */
	$.pandalocker.tools.see = function(str) {
		var n = '';
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		for( i = 0; i < str.length; i++ ) {
			n += str.charCodeAt(i) + possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return n;
	};

	/**
	 * Читабельное название getDomainSuffix
	 * Функция получает корневой домен, если введен поддомен к примеру
	 *
	 * Данная функция используется для лицензионного модуля
	 * @param str
	 * @return {string} - всегда возвращает корневой домен
	 */
	$.pandalocker.tools.gdms = function(str) {
		var url = new $.pandalocker.tools.uri().hostname(str).normalize().domain().toString();

		var re = /[A-z0-9-]+\.(ucoz.ru|blogspot\.[A-z]+|liveinternet\.[A-z]+|livejournal\.[A-z]+|de\.[A-z]{2}|eu\.[A-z]{2}|in\.[A-z]{2}|ru\.[A-z]{2}|co\.[A-z]{2}|org\.[A-z]{2}|com\.[A-z]{2}|[A-z0-9-]+)$/gi;
		var found = url.toString().match(re);
		return found[0];
	};

	/**
	 * Читабельное название getCurrentHost
	 * Функция получает текущий домен и если он кирилический,
	 * автоматически преобразует его в punycode
	 *
	 * Данная функция используется для лицензионного модуля
	 * @return {string} - закодированная строка
	 */
	$.pandalocker.tools.gch = function() {
		var uri = new $.pandalocker.tools.uri();
		uri.normalize();
		return uri.domain().toString();
	};

	// @if license
	/**
	 * Читабельное название eachGampModuleInit
	 * Функция хеширует текущий домен и сравнивает с заранее установленным массивом хешей,
	 * если в массиве присутствует хеш текущего домена, то фукция вернет положительный ответ.
	 *
	 * Данная функция используется для лицензионного модуля
	 * @param modules
	 * @return {bool}
	 */
	$.pandalocker.tools.egmit = function(modules) {
		var str = $.pandalocker.tools.gch();
		if( $.inArray($.pandalocker.tools.hash($.pandalocker.tools.gdms(str)), modules) < 0 ) {
			return false;
		}
		return true;
	};

})
(__$onp);