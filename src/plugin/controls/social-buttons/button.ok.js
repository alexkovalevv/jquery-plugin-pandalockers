/*!
 * Odnoklassniki Share
 * Copyright 2014, OnePress, http://byonepress.com
*/
(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "ok-share";

	button._defaults = {

		url: null,
		counter: true,

		style: {
			width: 120,
			height: 30,
			st: 'rounded',
			sz: 20,
			ck: 1
		}
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-ok-share', function(e, url) {
			if( self.url !== $.pandalocker.tools.URL.normalize(url) ) {
				return;
			}
			self.unlock("button");
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $("<div></div>").appendTo($holder);
		this.button.data('url-to-verify', self.url);

		var uniqueID = Math.floor((Math.random() * 999999) + 1);

		if( !this.options.counter ) {
			this.options.width = 70;
			this.options.nc = 1;
		}

		var buttonStyleOption = JSON.stringify(this.options.style);
		this.button.attr('id', "ok_klass_" + uniqueID);

		var checkFrameTimer = setInterval(function() {
			if( $("#ok_klass_" + uniqueID).length ) {
				window.OK.CONNECT.insertShareWidget("ok_klass_" + uniqueID, self.url, buttonStyleOption);
				clearInterval(checkFrameTimer);
				return false;
			}
		}, 1000);
	};

	$.pandalocker.controls["social-buttons"]["ok-share"] = button;

})(jQuery);