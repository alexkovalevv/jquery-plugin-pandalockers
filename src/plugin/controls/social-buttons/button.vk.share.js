/*!
 * Vkontakte share Button for jQuery
 * Copyright 2013, OnePress, http://byonepress.com
*/

(function($) {
	'use strict';

	if( !$.pandalocker.sociallocker.vk ) {
		$.pandalocker.sociallocker.vk = {};
	}
	$.pandalocker.sociallocker.vk.share = {

		/**
		 * Returns verification data to check whether the button is created.
		 */
		getVerificationData: function(options) {

			return {
				container: '.onp-button-loaded',
				timeout: 15000
			};
		},

		/**
		 * Returns the url for the the prodiver.
		 */
		getStateId: function(buttonOptions) {
			return $.pandalocker.tools.URL.normalize(buttonOptions.pageUrl);
		},

		idx: 100,

		/**
		 * Creats the Like button.
		 */
		create: function($where, options, api) {

			var $button = {

				_defaults: {
					url: null,
					vkAuth: false,
					pageDescription: null,
					counter: 1
				},

				getUrlToLike: function() {
					return this.url;
				},

				_create: function() {
					var self = this;

					$.pandalocker.sociallocker.vk.share.idx++;

					this._idx = $.pandalocker.sociallocker.vk.share.idx;

					this._prepareOptions();

					if( !this.options.appId ) {
						api.setButtonError(this.element, $.pandalocker.sociallocker.lang.errors.emptyVKAppIdError);
						return false;
					}

					this._setupEvents();

					this.element.data('onepress-vkButton', this);
					this._createButton();

					$.pandalocker.connector.connect("vk", this.options, function(sdk) {

						self.pseudoButton.addClass('onp-button-loaded');
						self.pseudoButton.show();

						if( self.options.counter ) {

							self._vkShareRewrite();

							self._getScriptShareCount(self._idx, self.url, function() {
								clearInterval(checkConflict);
							});

							var checkConflict = setInterval(function() {
								self._vkShareRewrite();
							}, 50);
						}

						if( !self.options.vkAuth ) {
							self.pseudoButton.on('click', function() {

								var url = $(this).parent().data('url-to-verify');
								var gidx = $(this).parent().data('idx');
								var counter = $(this).parent().data('counter');

								var winref = window.open("http://vk.com/share.php?url=" + url,
									"Sociallocker",
									"width=500,height=450,resizable=yes,scrollbars=yes,status=yes"
								);

								// waiting until the window is closed
								var pollTimer = setInterval(function() {
									if( !winref || winref.closed !== false ) {
										clearInterval(pollTimer);

										self._getScriptShareCount(gidx, url);
										if( !window.VK.Share ) {
											window.VK.Share = {};
										}
										window.VK.Share.count = function(idx, number, callback) {
											if( callback ) {
												return 'mark';
											}

											if( counter < number ) {
												$(document).trigger('vk-counter-ready-' + idx, [idx, number]);
												$(document).trigger('vk-share', [url]);
											}
										};

									}
								}, 200);

								return false;
							});
						} else {
							window.VK.Auth.getLoginStatus(function authInfo(response) {

								if( !response.session ) {
									self.stopAuthButton = $('<div class="onp-vk-share-auth-block">Авторизоваться</div>');
									self.pseudoButton.after(self.stopAuthButton);

									self.pseudoButton.parent().hover(
										function() {
											self.stopAuthButton.fadeIn(200);
										},
										function() {
											self.stopAuthButton.fadeOut(100);
										}
									);

									self.stopAuthButton.on('click', function() {
										window.VK.Auth.login(function(response) {
											if( response.session ) {
												self.pseudoButton.parent().unbind('hover');
											}
										}, 9000);
										return false;
									});
								}
							});

							self.pseudoButton.on('click', function() {
								var s = $(this);
								var url = s.parent().data('url-to-verify');

								window.VK.Api.call('wall.post', {
									message: self.options.pageDescription,
									attachments: url
								}, function(r) {
									if( r.response && r.response.post_id ) {
										$(document).trigger('vk-share', [url]);
									}
								});
								return false;
							});

						}

					});

					return true;
				},

				_vkShareRewrite: function() {
					var self = this;

					if( !window.VK.Share ) {
						window.VK.Share = {};
					}
					if( window.VK.Share.count === self._vkShareCountCallback ) {
						return;
					}

					if( window.VK.Share.count ) {
						$.pandalocker.sociallocker.vk.share._oldShareCallback = window.VK.Share.count;
					}

					window.VK.Share.count = this._vkShareCountCallback;
				},

				_vkShareCountCallback: function(idx, number) {
					if( idx > 100 ) {
						$(document).trigger('vk-counter-ready-' + idx, [idx, number]);
					} else {
						if( $.pandalocker.sociallocker.vk.share._oldShareCallback ) {
							$.pandalocker.sociallocker.vk.share._oldShareCallback(idx, number);
						}
					}
				},

				_getScriptShareCount: function(inx, url, callback) {
					$.getScript('http://vk.com/share.php?act=count&index=' + inx + '&url=' + url, callback
						? callback
						: function() {
						});
				},

				_prepareOptions: function() {
					var values = $.extend({}, this._defaults);
					this.options = $.extend(values, this.options);

					this.url = $.pandalocker.tools.URL.normalize((!this.options.url)
						? window.location.href
						: this.options.url);
				},

				_setupEvents: function() {
					var self = this;

					$(document).bind('vk-share', function(e, url) {
						if( self.options.unlock && self.url === $.pandalocker.tools.URL.normalize(url) ) {
							self.options.unlock("button");
						}
					});

					$(document).bind('vk-counter-ready-' + self._idx, function(e, idx, count) {
						$('#onp-vk-share-widget-' + idx).closest('.onp-vk-share-button').find('.onp-pseudo-share-counter')
							.text(self._minimalizeLargeNum(count))
						self.button.data('counter', count);
					});

				},

				_minimalizeLargeNum: function(n) {
					if( n < 1000 ) {
						return n;
					}

					n = n / 1000;
					n = Math.round(n * 10) / 10

					return n + "k";
				},

				/**
				 * Generates an html code for the button using specified options.
				 */
				_createButton: function() {
					var self = this;

					self.button = $('<div></div>');
					self.wrap = $("<div class='onp-social-button onp-vk-button onp-vk-share-button'></div>")
						.appendTo(this.element)
						.append(this.button);

					self.button.attr('id', 'onp-vk-share-widget-' + self._idx);

					self.pseudoButton =
						$('<div class="onp-pseudo-share-button">' +
							'<div class="onp-vk-like-left">' +
							'<i class="onp-vk-like-logo"></i>' +
							'</div>' +
							'<span>' + $.pandalocker.sociallocker.lang.vk_share + '</span>' +
							'</div>'
						);

					self.button.wrap('<div class="onp-vk-share-button-wrap"></div>');
					self.button.append(self.pseudoButton);
					self.pseudoButton.hide();

					self.pseudoButtonCounter = $('<div class="onp-pseudo-share-counter">-</div>');
					self.wrap.append(self.pseudoButtonCounter);

					if( self.options.counter ) {
						self.pseudoButtonCounter.addClass('show');
					} else {
						self.wrap.wrapInner('<div class="onp-vk-button-inner"></div>');
					}

					self.button.data('url-to-verify', self.url);
					self.button.data('idx', self._idx);
				}
			};

			$button.element = $where;
			$button.options = options;

			var result = $button._create();
			if( !result ) {
				return false;
			}

			return $button;
		}
	};

})(jQuery);