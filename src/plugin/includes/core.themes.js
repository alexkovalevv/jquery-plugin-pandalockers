/**
 * Themes Presets
 * Copyright 2014, OnePress, http://byonepress.com
 *
 * @since 1.0.0
 * @pacakge core

 * @!obfuscator:false
 * @!preprocess:true
 * @!priority:90
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {

	if( !$.pandalocker.themes ) {
		$.pandalocker.themes = {};
	}

	// Theme: Great Attractor

	$.pandalocker.themes['great-attractor'] = {};

	// Theme: Friendly Giant

	$.pandalocker.themes['friendly-giant'] = {

		theme: {
			fonts: [
				{
					name: 'Open Sans',
					styles: ['400', '700']
				}
			]
		}
	};

	// Theme: Dark Force

	$.pandalocker.themes['dark-force'] = {

		theme: {
			fonts: [
				{
					name: 'Montserrat',
					styles: ['400', '700']
				}
			]
		}
	};

	// Theme: Starter

	$.pandalocker.themes['starter'] = {

		socialButtons: {
			layout: 'horizontal',
			counter: true,
			flip: false
		}
	};

	// Theme: Secrets

	$.pandalocker.themes['secrets'] = {

		socialButtons: {
			layout: 'horizontal',
			counter: true,
			flip: true
		}
	};

	// @if build=='premium'
	// Theme: Dandyish

	$.pandalocker.themes['dandyish'] = {

		socialButtons: {
			unsupported: ['twitter-follow'],
			layout: 'vertical',
			counter: true,
			flip: false
		}
	};

	// Theme: Glass

	$.pandalocker.themes['glass'] = {

		socialButtons: {
			layout: 'horizontal',
			counter: true,
			flip: false
		}
	};

	// Theme: Flat

	$.pandalocker.themes['flat'] = {

		socialButtons: {
			layout: 'horizontal',
			counter: true,
			flip: true
		}
	};
	// @endif;

})(__$onp);