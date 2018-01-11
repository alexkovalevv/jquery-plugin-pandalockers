/**
 * Vkontakte notify
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	if( !$.pandalocker.vk_notify ) {
		$.pandalocker.vk_notify = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "vk-notify";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		groupId: null
	};

	button.urlPrepare = function(URL) {
		var uri = new $.pandalocker.tools.uri(URL);
		return uri.normalize().toString();
	};

	button.prepareOptions = function() {
		this.groupId = this.options.groupId;

		if( "vertical" === this.groupOptions.layout ) {
			this.showError($.pandalocker.lang.errors.unsupportedLayout.replace('{button}', 'vk-notify'));
		}

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.vkSubscribe;

		if( !this.groupId ) {
			this.showError($.pandalocker.lang.errors.vk_empty_group_id);
		}
	};

	button.setupEvents = function() {
		var self = this;
	};

	button._extendCallback = function(data) {

		if( data.event === 'subscribe' ) {
			if( this.groupId !== data.groupId ) {
				this.showScreen('default');
				this.showNotice($.pandalocker.lang.errors.unexpected_error);
				return;
			}

			this.unlock("button", this.name, this.groupId);
		}

		if( data.event === 'unsubscribe' ) {
			this.showScreen('default');
			this.showNotice($.pandalocker.lang.vk_cancel_subscribe);
		}
	};

	/**
	 * Returns an indentity for the state storage.
	 */
	button._getStorageIdentity = function() {
		var groupId = this.groupId;

		if( this.groupId && typeof this.groupId === "number" ) {
			groupId = groupId.toString();
		}
		return "page_" + $.pandalocker.tools.hash(groupId) + "_hash_" + this.name;
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<div></div>').appendTo($holder);

		this.widgetId = "onp-vk-notify-widget-" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		window.ONPWGT.init(this.widgetId, 'vk-notify', {
			groupId: this.groupId
		}, function(data) {
			self._callback(data);
		});

	};

	$.pandalocker.controls["social-buttons"]["vk-notify"] = button;
})(__$onp);