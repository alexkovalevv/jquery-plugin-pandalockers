/**
 * Draugiem button
 * Copyright 2016, OnePress, http://byonepress.com
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:[]
 */
(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	/** --------------------------------------------------------
	 * Sdk button
	 */

	$.pandalocker.sdk.draugiem = $.pandalocker.sdk.draugiem || {
		name: "draugiem",
		url: "//www.draugiem.lv/api/api.js",
		scriptId: "draugiem-jssdk",

		hasParams: true,

		isRender: true,

		// a timeout to load
		timeout: 10000,

		isLoaded: function() {
			return "object" == typeof window.DApi
		},

		createEvents: function() {
			var self = this;
			var isLoaded = this.isLoaded();

			var load = function() {
				$(document).trigger(self.name + '-init');
			};

			if( isLoaded ) {
				load();
				return;
			}

			$(document).bind('draugiem-script-loaded', function() {
				load();
			});
		}
	};

	/** --------------------------------------------------------
	 * Social button
	 */

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "draugiem-share";

	button._lastHoverButton = null;

	button.verification.container = 'iframe';
	button.verification.timeout = 5000;

	button._defaults = {
		url: null,
		textMessage: null,
		titleMessage: null,
		titlePrefixMessage: null,
		imageUrl: null,
		layout: null,
		popup: true,
		mobile: true
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();

		this.options.layout = "default";

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.draugiemShare;

		if( "vertical" === this.groupOptions.layout ) {
			this.options.layout = "bubble";
		}

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-draugiem-share', function(e, url) {
			var uri = new $.pandalocker.tools.uri(data.url);
			if( this.url !== uri.normalize().toString() ) {
				return;
			}
			self.unlock("button", self.name, self.url);
		});

		this.options.onAdd = function(e) {
			if( self._lastHoverButton && self._lastHoverButton.data('url') ) {
				$(document).trigger('onp-sl-draugiem-share', [
					self._lastHoverButton.data('url')
				]);
			}
		}
	};

	button.renderButton = function($holder) {
		var self = this;

		var uniqId = "draugiem-share-" + Math.floor(999999 * Math.random() + 1);
		this.button = $("<div></div>");
		this.button.attr("id", uniqId);
		this.button.data('url', this.options.url);

		this.wrap = $('<div class="onp-sl-draugiem-share"></div>')
			.appendTo($holder)
			.append(this.button);

		if( !this.options.counter ) {
			this.wrap.addClass("counter-off");
		}

		this.button.hover(function() {
			self._lastHoverButton = $(this);
		});

		var options = {
			link: this.options.url,
			text: this.options.textMessage,
			title: this.options.titleMessage,
			titlePrefix: this.options.titlePrefixMessage,
			layout: this.options.layout,
			popup: this.options.popup,
			mobile: this.options.mobile,
			picUrl: this.options.imageUrl,
			onAdd: this.options.onAdd
		};

		window.DApi && new DApi.Like(options).append(uniqId)
	};

	$.pandalocker.controls["social-buttons"]["draugiem-share"] = button;

})(__$onp);