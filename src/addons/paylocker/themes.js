/**
 * Настройка тем для платного контента
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.06.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['paylocker']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.themes ) {
		$.pandalocker.themes = {};
	}

	$.pandalocker.themes['default'] = {
		socialButtons: {
			layout: 'horizontal',
			counter: false,
			flip: false
		}
	};

	$.pandalocker.themes['default-light'] = {
		socialButtons: {
			layout: 'horizontal',
			counter: false,
			flip: false
		}
	};

	$.pandalocker.themes['default-black'] = {
		socialButtons: {
			layout: 'horizontal',
			counter: false,
			flip: false
		}
	};

	$.pandalocker.themes['default-forest'] = {
		socialButtons: {
			layout: 'horizontal',
			counter: false,
			flip: false
		}
	};

})(jQuery);
