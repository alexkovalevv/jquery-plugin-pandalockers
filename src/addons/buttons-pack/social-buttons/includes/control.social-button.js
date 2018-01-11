/**
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:20
 * @!lang:[]
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.entity || !$.pandalocker.entity.socialButton ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	var socialButton = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	socialButton._callback = function(data) {
		if( data.event === 'loaded' ) {
			this.button.addClass('onp-button-loaded');
		}

		if( data.event === 'click' || data.event === 'processing' ) {
			this.showScreen('data-processing');
		}

		/*if( data.event === 'error' ) {
		 this.showScreen('default');
		 this.showNotice($.pandalocker.lang.errors.unexpected_error);
		 }*/
		this._extendCallback && this._extendCallback(data);
	};

	$.pandalocker.entity.socialButtonsPack = socialButton;

})(__$onp);