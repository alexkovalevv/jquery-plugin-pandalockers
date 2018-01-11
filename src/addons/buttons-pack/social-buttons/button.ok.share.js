/**
 * Odnoklassniki share button
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "ok-share";
	button.sdk = 'ok';

	button._defaults = {
		url: null,
		style: {
			width: 120,
			height: 30,
			st: 'rounded',
			sz: 20,
			ck: 1
		},
		counter: true,
		title: $.pandalocker.lang.socialButtons.okShare
	};

	button._extractUrl = function() {
		var uri = new $.pandalocker.tools.uri(this.options.url || this.networkOptions.url || window.location.href);
		return uri.normalize().toString();
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.options.style.vt = 1;
			this.options.style.width = 70;
			this.options.style.height = 50;
		}

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.okShare;
	};

	button.verification = {
		container: 'iframe',
		timeout: 10000
	};

	button.setupEvents = function() {
	};

	button.onShare = function(e) {
		if( !e.originalEvent.origin || e.originalEvent.origin.indexOf('ok') === -1 ) {
			return;
		}
		var args = e.originalEvent.data.split("$");

		if( args[0] === "ok_shared" ) {
			this.unlock("button", this.name, this.url);
		}
	};

	button.renderButton = function($holder) {
		var self = this;
		var uniqueID = "onp-sl-ok-share-" + Math.floor((Math.random() * 999999) + 1);

		self.button = $('<div></div>').appendTo($holder);
		self.button.attr('id', uniqueID);

		if( !this.options.counter ) {
			self.options.style.width = 70;
			self.options.style.nc = 1;
		}

		var checkFrameTimer = setInterval(function() {
			if( $("#" + uniqueID).length ) {
				window.OK.CONNECT.insertShareWidget(uniqueID, self.url, JSON.stringify(self.options.style));
				clearInterval(checkFrameTimer);
				return false;
			}
		}, 1000);

		$(window).on('message onmessage', function(e) {
			self.onShare(e);
		});
	};

	$.pandalocker.controls["social-buttons"]["ok-share"] = button;

})(__$onp);