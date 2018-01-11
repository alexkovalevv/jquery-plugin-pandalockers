/*!
 * VK Like
 * Copyright 2014, OnePress, http://byonepress.com
*/
(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "vk-like";

	if( !$.pandalocker.data.vk ) {
		$.pandalocker.data.vk = {};
	}

	$.pandalocker.data.vk.lastHoverWidget = null;
	$.pandalocker.data.vk.idx = 0;

	button._defaults = {

		type: 'mini',
		pageTitle: null,
		pageDescription: null,
		pageUrl: null,
		pageImage: null,
		text: null,
		height: 20,
		counter: 1,
		requireSharing: 1,
		verb: 0
	};

	button.prepareOptions = function() {
		this.url = $.pandalocker.tools.URL.normalize((!this.options.pageUrl)
			? window.location.href
			: this.options.pageUrl);

		if( !this.options.appId ) {
			this.setError($.pandalocker.lang.errors.emptyVKAppIdError);
			return false;
		}
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('vk-like', function(e, url) {
			if( !self.options.unlock ) {
				return;
			}
			if( !url || self.url === $.pandalocker.tools.URL.normalize(url) ) {
				self.unlock("button");
			}
		});

		if( this.options.requireSharing ) {

			$(window).resize(function() {
				self._locateVkShareHint();
			});

			$(document).bind('vk-like-alert-' + this._idx, function(e) {

				self._showVkShareHint();
				self._runVkShareHintTimer();
			});
		}
	};

	button.renderButton = function($holder) {

		$.pandalocker.data.vk.idx++;
		this._idx = $.pandalocker.data.vk.idx;

		var uniqueID = Math.floor((Math.random() * 999999) + 1);
		this._widgetId = "vk_like_" + uniqueID;

		this.button = $("<div></div>").appendTo($holder);
	};

	/**
	 * Shows the VK Share Hint.
	 */
	button._showVkShareHint = function() {

		// if the hint is already visible, nothing to do
		if( this._vkShareHintShown ) {
			return;
		}
		this._vkShareHintShown = true;

		// if the hint has not been created yet, creates it only once
		if( !this._vkShareHint ) {

			this._vkShareHint =
				$('<div class="onp-vk-like-alert">' + $.pandalocker.sociallocker.lang.vkLikeAlertText + '</div>')
					.hide().prependTo($('body'));
		}

		// updates the position of the hint and shows it
		this._locateVkShareHint();
		this._vkShareHint.show();
	};

	/**
	 * Hides the VK Share hint.
	 */
	button._hideVkShareHint = function() {

		// nothing to do, if the hint is already hidden or if it has not been created yet
		if( !this._vkShareHintShown || !this._vkShareHint ) {
			return;
		}
		this._vkShareHintShown = false;

		this._vkShareHint.hide();
	};

	/**
	 * Update the VK Share hint position.
	 */
	button._locateVkShareHint = function() {
		var self = this;

		// finds the targte element to attach the VK Share hint
		if( !this._vkShareHintTarget || !this._vkShareHintTarget.length ) {
			this._vkShareHintTarget = $('#vkwidget' + this._idx + '_tt');
		}

		// updates the poistion of the VK Share hint
		this._vkShareHint.css({
			top: parseInt(self._vkShareHintTarget.css('top')) + 115,
			left: parseInt(self._vkShareHintTarget.css('left')) - 120
		});
	};

	/**
	 * Runs a timer which will work 20 seconds to show the VK Share
	 * hint again after leaving the mouse pointer from the Like button.
	 */
	button._runVkShareHintTimer = function() {
		var self = this;

		this._vkShareHintTimerTimout = 20000;
		var step = 200;

		if( this._vkShareHintTimer ) {
			return;
		}

		this._vkShareHintTimer = setInterval(function() {

			self._vkShareHintTimerTimout = self._vkShareHintTimerTimout - step;
			if( self._vkShareHintTimerTimout <= 0 ) {
				self._stopVkShareHintTimer();
				return;
			}

			if( !self._vkShareHintTarget.is(":visible") ) {
				self._hideVkShareHint();
			} else {
				self._showVkShareHint();
			}

		}, step);
	};

	/**
	 * Stops the VK Share Timer.
	 */
	button._stopVkShareHintTimer = function() {
		if( !this._vkShareHintTimer ) {
			return;
		}

		clearInterval(this._vkShareHintTimer);
		this._vkShareHintTimer = null;
		this._hideVkShareHint();
	};

	$.pandalocker.controls["social-buttons"]["vk-like"] = button;

})(jQuery);