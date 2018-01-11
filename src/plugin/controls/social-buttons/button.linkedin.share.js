/**
 * LinkedIn Share
 * Copyright 2014, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "linkedin-share";

	button.verification.container = '.IN-widget';
	button.verification.timeout = 5000;

	button._defaults = {

		// URL of the page to share.
		url: null,

		// Count box position (none, horizontal, vertical)
		counter: 'right'
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.options.counter = 'top';
		} else {
			if( !this.groupOptions.counters ) {
				this.options.counter = 'none';
			}
		}

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.linkedinShare;
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-linkedin-share', function(e, url) {

			if( self.url !== self.urlPrepare(url) ) {
				return;
			}

			self.unlock("button", self.name, self.url);
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<script type="IN/Share" data-onsuccess="OPanda_LinkedinShare_Callback" data-success="OPanda_LinkedinShare_Callback" data-onSuccess="OPanda_LinkedinShare_Callback"></script>');
		if( this.options.counter ) {
			this.button.attr("data-counter", this.options.counter);
		}
		this.button.attr("data-url", this.url);

		this.button.appendTo($holder);

		IN.init();
		if( IN.parse ) {
			IN.parse(this.button[0]);
		}

		// #SLJQ-26: A fix for the LinkedIn button.
		// We unlock content after closing the share dialog.

		$holder.click(function() {
			setTimeout(function() {

				if( !$.pandalocker.sdk.linkedin._activePopup ) {
					return;
				}
				var winref = $.pandalocker.sdk.linkedin._activePopup;
				$.pandalocker.sdk.linkedin._activePopup = false;

				// waiting until the window is closed
				var pollTimer = setInterval(function() {
					if( !winref || winref.closed !== false ) {
						clearInterval(pollTimer);
						$(document).trigger('onp-sl-linkedin-share', [self.url]);
					}
				}, 200);
			}, 200);
		});
	};

	$.pandalocker.controls["social-buttons"]["linkedin-share"] = button;

})(__$onp);
