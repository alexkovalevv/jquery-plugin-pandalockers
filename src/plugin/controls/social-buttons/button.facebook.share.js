/**
 * Facebook Share Button
 * Copyright 2017, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:['en']
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "facebook-share";

	button._defaults = {

		// URL to share
		url: null,

		// button_count, button, box_count
		layout: 'button_count',
		// set to 'none' to hide the count box
		count: 'standard',
		// Language of the button labels. By default en_US.
		lang: 'en_US',
		// Button container width in px, by default 450.
		width: null,

		// if set, then use the Share Dialog
		shareDialog: false,

		// data to share
		name: null,
		caption: null,
		description: null,
		image: null,

		// unlock event
		unlock: null
	};

	button.prepareOptions = function() {

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.facebookShare;
		this.url = this._extractUrl();

		if( !this.options.appId || this.options.appId == "117100935120196" ) {
			this.showError($.pandalocker.lang.errors.emptyFBAppIdError);
			return false;
		}

		if( "vertical" === this.groupOptions.layout ) {
			this.options.layout = 'box_count';
		} else {
			if( !this.groupOptions.counters ) {
				this.options.layout = 'button';
			}
		}
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-facebook-share', function(e, url) {

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
		if( this.options.width ) {
			this.button.attr("data-width", this.options.width);
		}
		if( this.options.layout ) {
			this.button.attr("data-layout", this.options.layout);
			this.button.attr("data-type", this.options.layout);
		}

		var overlay = $("<div class='onp-sl-facebook-share-overlay'></div>").appendTo($holder);

		if( self.options.shareDialog ) {

			overlay.click(function() {
				FB.ui(
					{
						method: 'share',
						href: self.url,
						display: 'popup'
					},
					function(response) {
						console && console.log && console.log('AX12:');
						console && console.log && console.log(response);

						if( $.pandalocker.tools.isTabletOrMobile() && typeof response === "undefined" || response === null ) {
							$(document).trigger('onp-sl-facebook-share', [self.url]);
							return;
						}

						if( typeof response === "undefined" || response === null ) {
							return;
						}
						if( typeof response === "object" && response.error_code && response.error_code > 0 ) {
							return;
						}

						$(document).trigger('onp-sl-facebook-share', [self.url]);
					}
				);
				return false;
			});

		} else {

			overlay.click(function() {
				FB.ui(
					{
						method: 'feed',
						name: self.options.name,
						link: self.url,
						picture: self.options.image,
						caption: self.options.caption,
						description: self.options.description
					},
					function(response) {
						console && console.log && console.log('AX12:');
						console && console.log && console.log(response);

						if( $.pandalocker.tools.isTabletOrMobile() && typeof response === "undefined" || response === null ) {
							$(document).trigger('onp-sl-facebook-share', [self.url]);
							return;
						}

						if( typeof response === "undefined" || response === null ) {
							return;
						}
						if( typeof response === "object" && response.error_code && response.error_code > 0 ) {
							return;
						}

						$(document).trigger('onp-sl-facebook-share', [self.url]);
					}
				);
				return false;
			});
		}

		this.button.addClass('fb-share-button');
		window.FB.XFBML.parse($holder[0]);
	};

	button.customVerifyButton = function() {
		var self = this;
		this.customVerification = false;

		if( self.control.find(self.verification.container).length === 0 ) {
			return false;
		}

		var css = self.control.find(self.verification.container).attr('style');
		var myRegexp = /height:\s*(\d+)px/i;
		var match = myRegexp.exec(css);

		if( !match || !match[1] || parseInt(match[1]) === 0 ) {
			return false;
		}

		return true;
	};

	$.pandalocker.controls["social-buttons"]["facebook-share"] = button;

})(__$onp);
