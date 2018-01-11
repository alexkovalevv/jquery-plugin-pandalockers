/**
 * Facebook Like Button
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

	button.name = "facebook-like";

	button._defaults = {

		// URL to like/share
		url: null,

		// Button layout, available: standart, button_count, box_count.
		// By default 'standard'.
		layout: 'button_count',
		// Button container width in px, by default 450.
		width: null,
		// The verb to display in the button. Only 'like' and 'recommend' are supported. By default 'like'.
		verbToDisplay: "like",
		// The color scheme of the plugin. By default 'light'.
		colorScheme: "light",
		// The font of the button. By default 'tahoma'.
		font: 'tahoma',
		// A label for tracking referrals.
		ref: null,

		// #SLJQ-29: turn on this option if you see the
		// "confim link" after click the Like button.
		theConfirmIssue: false
	};

	button.prepareOptions = function() {

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.facebookLike;
		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.options.layout = 'box_count';
		} else {
			if( !this.groupOptions.counters ) {
				this.options.layout = 'button';
			}
		}
	};

	/**
	 * Setups hooks.
	 */
	button.setupHooks = function() {
		var self = this;

		this.addHook('markup-created', function() {
			self._startTrackIFrameSizes();
		});

		this.addHook('before-show-content', function() {
			self._stopTrackIFrameSizes();
		});
	};

	/**
	 * Setups events.
	 */
	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-facebook-like', function(e, url) {

			if( self.url !== self.urlPrepare(url) ) {
				return;
			}
			self.unlock("button", self.name, self.url);
		});
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {

		this.button = $("<div></div>").appendTo($holder);

		this.button.attr("data-show-faces", false);
		this.button.attr("data-send", false);

		this.button.attr("data-href", this.url);
		if( this.options.font ) {
			this.button.attr("data-font", this.options.font);
		}
		if( this.options.colorScheme ) {
			this.button.attr("data-colorscheme", this.options.colorScheme);
		}
		if( this.options.ref ) {
			this.button.attr("data-ref", this.options.ref);
		}
		if( this.options.width ) {
			this.button.attr("data-width", this.options.width);
		}
		if( this.options.layout ) {
			this.button.attr("data-layout", this.options.layout);
		}
		if( this.options.verbToDisplay ) {
			this.button.attr("data-action", this.options.verbToDisplay);
		}

		this.button.addClass('fb-like');
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

	// --------------------------------------------------------------
	// Tracking changes the iframe size for more quickly unlocking
	// --------------------------------------------------------------

	button._startTrackIFrameSizes = function() {

		// #SLJQ-29: don't use the way based on measuring the frame size
		// to check whether the user clicked the button
		if( this.options.theConfirmIssue ) {
			return;
		}

		var self = this;
		this._trackIFrameTimer = null;

		this.locker.locker.hover(
			function() {

				var $iframe = self.control.find("iframe");
				if( !$iframe.length ) {
					return;
				}

				self._trackIFrameTimer = setInterval(function() {
					var cssHeight = parseInt($iframe[0].style.height);
					if( !cssHeight ) {
						cssHeight = $iframe.height();
					}

					if( cssHeight > 200 ) {
						self._stopTrackIFrameSizes();
						$(document).trigger('onp-sl-facebook-like', [self.url]);
					}
				}, 500);
			},
			function() {
				self._stopTrackIFrameSizes();
			}
		);
	},

		button._stopTrackIFrameSizes = function() {
			if( this._trackIFrameTimer ) {
				clearInterval(this._trackIFrameTimer);
			}
		};

	$.pandalocker.controls["social-buttons"]["facebook-like"] = button;
	
})(__$onp);
