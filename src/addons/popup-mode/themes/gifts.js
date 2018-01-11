/**
 * Расширенные настройки темы gifts
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

	// Theme: gifts

	$.pandalocker.themes['gifts'] = {
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

	/**
	 * Устанавливаем настройки по умолчанию
	 */
	$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {
		if( typeof options.theme === 'object' && options.theme.name == 'gifts' ) {
			if( options.stepToStep ) {
				if( options.groups && options.groups.order && options.groups.order.length > 2 ) {
					var fistGroup = options.groups.order[0];
					options.groups.order.length = 0;
					options.groups.order.push(fistGroup);

					console.log('Gifts theme is not supported step to step mode.');
				}
				delete options.stepToStep;
			}
		}
		return options;
	});

})(jQuery);
