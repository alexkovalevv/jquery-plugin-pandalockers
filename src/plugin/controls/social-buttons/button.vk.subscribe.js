/*!
 * Vkontakte Subcribe Button for jQuery
 * Copyright 2013, OnePress, http://byonepress.com
*/

(function($) {
	'use strict';

	if( !$.pandalocker.sociallocker.vk ) {
		$.pandalocker.sociallocker.vk = {};
	}
	$.pandalocker.sociallocker.vk.subscribe = {

		/**
		 * Returns verification data to check whether the button is created.
		 */
		getVerificationData: function(options) {

			return {
				container: 'iframe',
				timeout: 15000
			};
		},

		/**
		 * Returns the groud id for the the prodiver.
		 */
		getStateId: function(buttonOptions) {
			return buttonOptions.group_id;
		},

		/**
		 * Creats the VK Subscribe button.
		 */
		create: function($where, options, api) {

			var $button = {

				_defaults: {
					mode: 2,
					width: "400",
					height: "200",
					group_id: null,
					counter: 1,
					title: $.pandalocker.sociallocker.lang.vk_subscribe
				},

				getUrlToLike: function() {
					return this.url;
				},

				_create: function() {
					var self = this;

					this._prepareOptions();

					if( !this.options.appId ) {
						api.setButtonError(this.element, $.pandalocker.sociallocker.lang.errors.emptyVKAppIdError);
						return false;
					}

					if( !this.options.group_id ) {
						api.setButtonError(this.element, $.pandalocker.sociallocker.lang.errors.emptyVKGroupIdError);
						return false;
					}

					this._isStringGroupId = typeof self.options.group_id === 'string';
					this._originalGroupId = self.options.group_id;

					self._setupEvents();
					self._createButton();

					var whenReady = function() {

						$.pandalocker.connector.connect("vk", self.options, function(sdk) {

							if( self.options.group_id ) {
								if( !self.button.attr('id') ) {
									var uniqueID = Math.floor((Math.random() * 999999) + 1);
									window.VK.Widgets.Group("vk_subscribe_" + uniqueID, self.options, self.options.group_id);
									self.button.attr('id', "vk_subscribe_" + uniqueID);

									var checkFrameTimer = setInterval(function() {
										if( $("#vk_subscribe_" + uniqueID).find('iframe').attr('id') !== undefined ) {

											if( self.options.counter ) {
												self.pseudoButtonCounter.addClass('show');
											}

											self.pseudoButton.show();
											clearInterval(checkFrameTimer);
											return false;
										}
									}, 1000);
								}
							}
						});
					};

					if( this._isStringGroupId || this.options.counter ) {
						this._apiConnectToGroup(function() {
							whenReady();
						});
					} else {
						whenReady();
					}

					return true;
				},

				_prepareOptions: function() {

					var values = $.extend({}, this._defaults);
					this.options = $.extend(values, this.options);

					if( this.options.group_id && !isNaN(this.options.group_id) ) {
						this.options.group_id = parseInt(this.options.group_id);
					}
				},

				_setupEvents: function() {
					var self = this;

					$(document).bind('vk-subscribe', function(e, verify_id) {
						if( !self.options.unlock ) {
							return;
						}

						if( self._isStringGroupId && self._originalGroupId === verify_id ) {
							self.options.unlock("button");
							return;
						}

						if( self.options.group_id === parseInt(verify_id) ) {
							self.options.unlock("button");
							return;
						}
					});

					$(document).bind('vk-unsubscribe', function(e, pseudoButton) {
						pseudoButton.addClass('onp-repeat-to-subscribe').html('<span>Повторите</span>');
					});

					$(document).bind('vk-get-group-count-' + self.options.group_id, function(e, response) {

						if( !response.response || !response.response[0] ) {
							api.setButtonError(self.element, $.pandalocker.sociallocker.lang.errors.invalidVKGroupIdError);
							return;
						}
						;

						var gid = response.response[0].gid;
						var screenName = response.response[0].screen_name;

						if( !gid || ( self._isStringGroupId && screenName !== self.options.group_id ) || ( !self._isStringGroupId && gid !== self.options.group_id ) ) {
							api.setButtonError(self.element, $.pandalocker.sociallocker.lang.errors.invalidVKGroupIdError);
							return;
						}

						if( self.options.counter ) {
							self.pseudoButtonCounter.text(self._minimalizeLargeNum(response.response[0].members_count));
						}

						if( self._isStringGroupId ) {
							self.options.group_id = parseInt(gid);
						}

						self._apiConnectToGroupCallback && self._apiConnectToGroupCallback();
					});

				},

				_apiConnectToGroup: function(callback) {
					var script = document.createElement('SCRIPT');

					script.src = 'http://api.vk.com/method/groups.getById?gid=' + this.options.group_id + '&fields=members_count&callback=_vkGetGroupCountCallback';
					document.getElementsByTagName("head")[0].appendChild(script);

					this._apiConnectToGroupCallback = callback;
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

					this.button = $('<div></div>');
					this.wrap = $("<div class='onp-social-button onp-vk-button onp-vk-subscribe-button'></div>")
						.appendTo(this.element)
						.append(this.button);

					this.pseudoButton =
						$('<div class="onp-pseudo-subscribe-button">' +
							'<div class="onp-vk-like-left">' +
							'<i class="onp-vk-like-logo"></i>' +
							'</div>' +
							'<span>' + this.options.title + '</span>' +
							'</div>'
						);
					this.pseudoButtonCounter = $('<div class="onp-pseudo-subscribe-counter"></div>');
					this.wrap.append(this.pseudoButtonCounter);

					this.button.wrap('<div class="onp-vk-subscribe-button-wrap"></div>');
					this.button.parent().append(this.pseudoButton);

					this.pseudoButton.hide();

					this.button.data('owner-to-verify', this.options.group_id);
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

	window._vkGetGroupCountCallback = function(response) {
		$(document).trigger('vk-get-group-count-' + response.response[0].gid, [response]);
		$(document).trigger('vk-get-group-count-' + response.response[0].screen_name, [response]);
	};

})(jQuery);

