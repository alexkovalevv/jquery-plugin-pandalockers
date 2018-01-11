/**
 * Расширенные настройки темы glasscase
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 15.05.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!priority:10
 * @!uglify:true
 * @!lang:[]
 * @!build:['popup-mode']
 */


(function($) {
	'use strict';

	if( !$.pandalocker.themes ) {
		$.pandalocker.themes = {};
	}

	// Theme: glasscase

	$.pandalocker.themes['glasscase'] = {
		socialButtons: {
			style: 'flip',
			layout: 'horizontal',
			counter: true,
			flip: true
		},
		connectButtons: {
			style: 'dark-force',
			hoverAnimation: 'none'
		}
	};

})(jQuery);
