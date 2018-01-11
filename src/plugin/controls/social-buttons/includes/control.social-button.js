/**
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:55
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var socialButton = $.pandalocker.tools.extend($.pandalocker.entity.control);

	/**
	 * The social buttons additionally have to get the networks option.
	 * So we overwrite the original init method.
	 */
	socialButton.init = function(group, options, networkOptions) {
		this.networkOptions = networkOptions;

		var parts = this.name.split('-');

		this.networkName = this.sdk ? this.sdk : parts.length === 2 ? parts[0] : null;
		this.buttonName = parts.length === 2 ? parts[1] : parts[0];

		$.pandalocker.entity.control.init.call(this, group, options);

		/*if( this.networkName ) {
		 this._ssIdentity = "page_" + $.pandalocker.tools.hash(this.url) + "_hash_" + this.networkName + "-" + this.buttonName;
		 } else {
		 this._ssIdentity = "page_" + $.pandalocker.tools.hash(this.url) + "_hash_" + this.buttonName;
		 }*/

		// FIX BUG: network name can be one for all buttons, so we set the full name of the button
		// so that the name can not be duplicated.
		this._ssIdentity = "page_" + $.pandalocker.tools.hash(this.url) + "_hash_" + this.name;
	};

	socialButton.urlPrepare = function(URL) {
		var uri = new $.pandalocker.tools.uri(URL);
		return uri.normalize().toString();
	};

	/**
	 * The funtions which returns an URL to like/share for the button.
	 * Uses the options and a current location to determine the URL.
	 */
	socialButton._extractUrl = function() {
		var uri = this.options.url || this.networkOptions.url || window.location.href;
		return this.urlPrepare(uri);
	};

	/**
	 * Shows the control in the specified holder.
	 */
	socialButton.render = function($holder) {
		var self = this;

		if( this.networkName ) {
			this.control.addClass('onp-sl-' + this.networkName);
		}

		this.container = $("<div class='onp-sl-social-button onp-sl-social-button-" + this.name + "'></div>");
		this.container.appendTo($holder);

		if( !this._hasError() ) {

			this._setLoadingState();

			var render = function() {

				var options = $.extend({}, self.networkOptions);
				options.globalOptions = self.lockerOptions;
				var sdkResult = self.requireSdk(self.networkName, options);

				// error fired
				sdkResult.fail(function(error) {
					self._removeLoadingState();
					self.showError(error);
				});

				// loaded successfully
				sdkResult.done(function() {

					self.setupEvents();
					self.renderButton(self.container);

					// waiting creating a button 
					self.verifyButton()
						.always(function() {
							self._removeLoadingState();
						})
						.fail(function(error) {
							self.showError(error);
						});
				});
			};

			if( this.locker.options.lazy ) {

				this.addHook('raw-impress', function() {

					if( self._rendered ) {
						return;
					}
					self._rendered = true;
					render();
				});

			} else {
				render();
			}
		}

		// adds support for the flip effect if it's needed
		this._addFlipEffect();
	};

	/**
	 * Adds the Flip Effect.
	 */
	socialButton._addFlipEffect = function() {
		var $control = this.control;
		var $innerWrap = this.innerWrap;

		var flipEffect = this.group.options.flip;
		var flipSupport = $.pandalocker.tools.has3d();

		// addes the flip effect
		(flipEffect && flipSupport && $control.addClass("onp-sl-flip")) || $control.addClass("onp-sl-no-flip");
		if( !flipEffect ) {
			return true;
		}

		var title = this.options.title || (this.networkName

				? $.pandalocker.lang[this.networkName + "_" + this.buttonName]
				: $.pandalocker.lang[this.networkName]);

		var overlay = $("<a href='#'></a>")
			.addClass("onp-sl-button-overlay")

			.append($("<div class='onp-sl-overlay-back'></div>"))
			.append(
			$("<div class='onp-sl-overlay-front'></div>")
				.append($("<div class='onp-sl-overlay-icon'></div>"))
				.append($("<div class='onp-sl-overlay-line'></div>"))
				.append($("<div class='onp-sl-overlay-text'>" + title + "</div>"))
		)

			.append($("<div class='onp-sl-overlay-header'></div>"));

		overlay.prependTo($innerWrap);

		if( !flipSupport ) {
			$control.hover(
				function() {
					var overlay = $(this).find(".onp-sl-button-overlay");
					overlay.stop().animate({opacity: 0}, 200, function() {
						overlay.hide();
					});
				},
				function() {
					var overlay = $(this).find(".onp-sl-button-overlay").show();
					overlay.stop().animate({opacity: 1}, 200);
				}
			);
		}

		// if it's a touch device
		if( $.pandalocker.isTouch() ) {

			// if it's a touch device and flip effect enabled.
			if( flipSupport ) {

				overlay.click(function() {

					if( $control.hasClass('onp-sl-flip-hover') ) {
						$control.removeClass('onp-sl-flip-hover');
					} else {
						$('.onp-sl-flip-hover').removeClass('onp-sl-flip-hover');
						$control.addClass('onp-sl-flip-hover');
					}

					return false;
				});

				// if it's a touch device and flip effect is not enabled.
			} else {

				overlay.click(function() {
					var overlay = $(this);
					overlay.stop().animate({opacity: 0}, 200, function() {
						overlay.hide();
					});

					return false;
				});
			}
		}

		// every next button has the zindex less a previos button

		if( !this.group._buttonsZIndex ) {
			this.group._buttonsZIndex = 54;
		}
		this.group._buttonsZIndex = this.group._buttonsZIndex - 4;
		var zIndex = this.group._buttonsZIndex;

		$control.css('z-index', zIndex);

		if( overlay ) {
			overlay.css('z-index', zIndex);
			overlay.find('.onp-sl-overlay-front').css('z-index', 1);
			overlay.find('.onp-sl-overlay-back').css('z-index', -1);
			overlay.find('.onp-sl-overlay-header').css('z-index', 1);
		}
	};

	/**
	 * Returns an indentity for the state storage.
	 */
	socialButton._getStorageIdentity = function() {
		return this._ssIdentity;
	};

	/**
	 * Options to verify that the button has been rendered.
	 */
	socialButton.verification = {
		container: 'iframe',
		timeout: 5000
	};

	/*socialButton._callback = function(data) {
	 if( data.event === 'loaded' ) {
	 this.button.addClass('onp-button-loaded');
	 }

	 if( data.event === 'click' || data.event === 'processing' ) {
	 this.showScreen('data-processing');
	 }

	 this._extendCallback && this._extendCallback(data);
	 };*/

	$.pandalocker.entity.socialButton = socialButton;

})(__$onp);
