/**
 * Google +1
 * Copyright 2014, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "google-plus";

	button._defaults = {

		// URL to plus one
		url: null,

		// Language of the button labels. By default en-US.
		// https://developers.google.com/+/plugins/+1button/#available-languages
		lang: 'en-US',
		// small, medium, standard, tall (https://developers.google.com/+/plugins/+1button/#button-sizes)
		size: 'medium',
		// Button container width in px, by default 450.
		width: null,
		// Sets the horizontal alignment of the button assets within its frame.
		align: "left",
		// google client id
		clientId: null,
		// call to action label
		calltoactionlabel: 'RECOMMEND',
		// prefilled text
		prefilltext: null
	};

	button.prepareOptions = function() {

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.googlePlus;
		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.options.size = 'tall';
		} else {
			if( !this.groupOptions.counters ) {
				this.options.annotation = 'none';
			}
		}

		if( !this.options.clientId ) {
			this.showError($.pandalocker.lang.errors.emptyGoogleClientId);
			return false;
		}

	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-google-plus', function(e, url) {

			if( self.url !== self.urlPrepare(url) ) {
				return;
			}
			self.unlock("button", self.name, self.url);
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $("<div></div>").appendTo($holder);

		this.button.attr("data-href", this.url);
		if( this.options.size ) {
			this.button.attr("data-size", this.options.size);
		}
		if( this.options.annotation ) {
			this.button.attr("data-annotation", this.options.annotation);
		}
		if( this.options.align ) {
			this.button.attr("data-align", this.options.align);
		}
		if( this.options.expandTo ) {
			this.button.attr("data-expandTo", this.options.expandTo);
		}
		if( this.options.recommendations ) {
			this.button.attr("data-recommendations", this.options.recommendations);
		}

		this.button.attr("data-callback", "OPanda_GooglePlusOne_Callback");
		this.button.addClass('g-plusone');

		var $overlay = $("<div class='onp-sl-feature-overlay g-interactivepost'></div>").appendTo($holder);

		$overlay.attr("data-contenturl", this.url);
		$overlay.attr("data-clientid", this.options.clientId);
		$overlay.attr("data-cookiepolicy", 'none');
		$overlay.attr("data-calltoactionurl", this.url);

		if( this.options.calltoactionlabel ) {
			$overlay.attr("data-calltoactionlabel", this.options.calltoactionlabel);
		}
		if( this.options.prefilltext ) {
			$overlay.attr("data-prefilltext", this.options.prefilltext);
		}

		var urlHash = $.pandalocker.tools.hash(this.url);
		var obShareCallback = "googleOnShareCallback" + urlHash;
		$overlay.attr("data-onshare", obShareCallback);

		if( !window[obShareCallback] ) {
			window[obShareCallback] = function(data) {
				if( data && data.action === 'shared' ) {
					$(document).trigger('onp-sl-google-plus', [self.url]);
				}
			};
		}

		setTimeout(function() {
			window.gapi.plusone.go($holder[0]);
			window.gapi.interactivepost.go($holder[0]);
		}, 100);
	};

	$.pandalocker.controls["social-buttons"]["google-plus"] = button;
	
})(__$onp);
