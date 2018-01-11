/**
 * Vkontakte subscribe button
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

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

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "vk-subscribe";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		groupId: null,
		counter: true
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

	button.prepareOptions = function() {
		this.groupId = this.options.groupId;

		this._identityEntity = this.options.groupId;

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.layout = this.groupOptions.layout;

		if( !this.options.groupId ) {
			this.showError($.pandalocker.lang.errors.vk_empty_group_id);
		}
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.vkSubscribe;
	};

	button.setupEvents = function() {
	};

	button._extendCallback = function(data) {
		var self = this;

		if( data.event === 'subscribe' ) {
			if( this.options.groupId !== data.groupId ) {
				self.showScreen('default');
				self.showNotice($.pandalocker.lang.errors.unexpected_error);
				return;
			}

			self.unlock("button", self.name, data.groupId);
		}

		if( data.event === 'notsubscribe' ) {
			self.showScreen('default');
			self.showNotice($.pandalocker.lang.vk_cancel_subscribe);
		}

		if( data.event === 'error' ) {

			var message = $.pandalocker.lang.errors[data.code];

			if( data.code == 'vk_uid_not_found' ) {
				if( data.groupId === undefined ) {
					message = $.pandalocker.lang.errors['vk_empty_user_id'];
				} else {
					message = message.replace(/\{vk_user_id\}/g, data.groupId.replace(/@/g, ''));
				}
			}

			if( data.code == 'vk_group_id_not_found' ) {
				if( data.groupId === undefined ) {
					message = $.pandalocker.lang.errors['vk_empty_group_id'];
				} else {
					message = message.replace(/\{vk_group_id\}/g, data.groupId);
				}
			}

			if( data.message ) {
				message = data.message;
			}

			self.showNotice(message);
			self.showError(message);
		}

	};

	/***
	 * Создает кнопку, счетчик и контейнеры
	 * @param $holder
	 */
	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<div></div>').appendTo($holder);

		this.widgetId = "onp-vk-subscribe-widget-" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		this.widget = window.ONPWGT.init(this.widgetId, 'vk-subscribe', {
			lang: this.groupOptions.lang,
			groupId: this.options.groupId,
			layout: this.layout,
			counter: this.options.counter,
			lockerId: this.locker.id,
			refPageUrl: window.location.href || $(location).attr('href')
		}, function(data) {
			self._callback(data);
		});
	};

	$.pandalocker.controls["social-buttons"]["vk-subscribe"] = button;

})(__$onp);