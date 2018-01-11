/**
 * Объект кнопки google connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'google-connect',
	_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
	_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
	_CLIENT_ID: '<%= pkg.google.client_id %>',

	_defaults: {
		channelId: null,
		actions: [],
		youtubeSubscribe: {
			channelId: null
		},
		label: 'Google',
		lang: 'ru_RU',
		style: 'google',
		layout: 'first-group'
	},

	/**
	 * Инициализирует ядро
	 * @param options
	 */
	init: function(options) {
		this._prepareOptions(options);
		this._create();
	},

	/**
	 * Форматируем настройки до инициализации кнопки
	 * @return void
	 */
	_prepareOptions: function(options) {
		var self = this;

		this.options = extend({}, this._defaults, options);

		this.permissions = ['https://www.googleapis.com/auth/userinfo.profile'];
		this.permissions.push('https://www.googleapis.com/auth/userinfo.email');

		if( this.options.actions.indexOf('youtube-subscribe') !== -1 ) {
			this.permissions.push('https://www.googleapis.com/auth/youtube');

			if( !this.options.youtubeSubscribe || !this.options.youtubeSubscribe.channelId ) {
				sendMessage('error', {code: 'error_youtube_channel_missed'});
			}
		}

		// права, которые нужно запросить у пользователя
		this.restPermissions = this.permissions;

		// права, которые были отклонены пользователем
		this.declinedPermissions = [];

	},

	/**
	 * Авторизует пользователя в социальной сети
	 * @param callback - возвращает результат авторизации, с данными о пользователе
	 * @returns {*}
	 * @private
	 */
	_connect: function(callback) {
		var self = this;
		var loggedIn = false;

		// устанавливаем права, которые нужно запросить
		var requestOptions = {
			callback: function(response) {

				if( 'immediate_failed' === response.error ) {
					return;
				}
				loggedIn = true;

				if( !response || !response['status']['signed_in'] ) {
					sendMessage('error', {code: 'errors_not_signed_in'});
					return;
				}

				return self._identify(function(type, result) {
					if( 'error' === type ) {
						sendMessage('error', {
							code: 'unexpectedError',
							message: result
						});
						return;
					}
					callback(result, response);
				});
			}
		};

		requestOptions.clientid = this._CLIENT_ID;
		requestOptions.cookiepolicy = 'single_host_origin';
		requestOptions.scope = this.permissions.join(' ');

		if( this.options.share ) {
			var activityType = ( this.options.share.type || 'add' ).charAt(0).toUpperCase() + string.slice(1);
			requestOptions.requestvisibleactions = 'http://schema.org/' + activityType + 'Action';
		}

		trackWindow('google.com/o/oauth2', function() {

			setTimeout(function() {
				if( loggedIn ) {
					return;
				}

				sendMessage('error', {code: 'errors_not_signed_in'});

			}, 500);
		});

		gapi.auth.signIn(requestOptions);
	},

	/**
	 * Сохраняет данные пользователя, для использования в других виджетах
	 * @private
	 */
	_saveUserInfo: function(userInfo) {
		var self = this;

		self.sToken = hash(Math.floor((Math.random() * 999999) + 1) + 'ab');
		self.oAuthClientId = getFromStorage('oauth_client_id');

		var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest,
			xhr = new XHR(),
			getClientInfoUrl = self._GET_CLIENT_PROXY + '/save-info';

		xhr.open('POST', getClientInfoUrl, true);
		xhr.responseType = 'json';
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

		xhr.onload = function() {

			if( !this.response || (this.response && (this.response.error) || !this.response.current_conntection || !this.response.has_connections ) ) {
				if( this.response && this.response.error ) {
					console.log("%c[Error]: Ошибка при сохранении данных: " + this.response.error, "color: red;");
				}
				return;
			}

			setStorage('oauth_client_id', this.response.current_conntection.oauth_client_id, 365, true);

			// извлекаем id всех связанных соц. сетей с профилем клиента
			extract_uid_networks(this.response.has_connections);
		};

		xhr.onerror = function() {
			sendMessage('error', {code: 'request_status_code_' + this.status});
		};

		var concatData = "uid=" + encodeURIComponent(userInfo.id);

		if( !self.oAuthClientId ) {
			concatData += "&s_token=" + encodeURIComponent(self.sToken);
		} else {
			concatData += "&oauth_client_id=" + encodeURIComponent(self.oAuthClientId);
		}

		concatData += "&network=google";
		concatData += "&email=" + encodeURIComponent(userInfo.email);
		concatData += "&display_name=" + encodeURIComponent(userInfo.display_name);
		concatData += "&first_name=" + encodeURIComponent(userInfo.first_name);
		concatData += "&last_name=" + encodeURIComponent(userInfo.last_name);
		concatData += "&profile_url=" + encodeURIComponent(userInfo.profile_url);
		concatData += "&avatar_url=" + encodeURIComponent(userInfo.avatar_url);

		xhr.send(concatData);
	},

	/**
	 * Запрашивает личные данные пользователя
	 * @param callback - возвращает отформатированные данные пользователя
	 * @private
	 */
	_identify: function(callback) {
		var self = this;

		gapi.client.load('plus', 'v1').then(function() {

			gapi.client.plus.people.get({
				'userId': 'me'
			}).then(function(data) {

				var identity = {};
				if( !data || !data.result ) {
					return callback('error', identity);
				}

				identity.source = "google";
				identity.id = data.result.id;
				identity.email = data.result.emails && data.result.emails[0] && data.result.emails[0].value;
				identity.display_name = data.result.displayName;
				identity.first_name = data.result.name && data.result.name.givenName;
				identity.last_name = data.result.name && data.result.name.familyName;
				identity.profile_url = data.result.url;
				identity.social = true;

				if( data.result.image && data.result.image.url ) {
					identity.avatar_url = data.result.image.url.replace(/\?sz=\d+/gi, '');
				}

				if( self.options.actions.indexOf('youtube-subscribe') !== -1 ) {
					self._runYoutubeSubscribeAction();
				}

				self._saveUserInfo(identity);

				callback('success', identity);

			}, function(reason) {
				callback('error', reason.result.error.message);
			});
		});
	},

	_runYoutubeSubscribeAction: function() {
		var self = this;

		gapi.client.load('youtube', 'v3', function() {

			var request = gapi.client.youtube.subscriptions.insert({
				part: 'snippet',
				resource: {
					snippet: {
						resourceId: {
							kind: 'youtube#channel',
							channelId: self.options.youtubeSubscribe.channelId
						}
					}
				}
			});

			request.execute(function(response) {
				if( response && response.error ) {

					// ignores if the user is already subscribed
					if( response.error.data && response.error.data[0] && response.error.data[0].reason === "subscriptionDuplicate" ) {
						return;
					}

					console.log('[Error]: Подписка на Youtube канал провалилась из-за не известной ошибки ');
					console.log(response);
					sendMessage('error', {message: response.error.message});
				}
			});

		});
	},

	/**
	 * Запускает таймер и обновляет размеры кнопки каждые полсекунды
	 * @private
	 */
	_loopUpdateSize: function() {
		var self = this;

		var width = 0, height = 0, loaded = false;

		var timerInteration = 0, normalizeWidthTimer = setInterval(function() {

			if( !width && !height && !loaded ) {
				loaded = true;
				self.button.addClass(self._name.replace('-connect', '')).addClass('loaded');
				sendMessage('loaded');
			}

			if( width !== self.button.parentNode.offsetWidth || height !== self.button.parentNode.offsetHeight ) {
				width = self.button.parentNode.offsetWidth;
				height = self.button.parentNode.offsetHeight;

				self._updateButtonSize(width, height);
			}

			if( timerInteration > 25 ) {
				clearInterval(normalizeWidthTimer);
			}

			timerInteration++;
		}, 100);
	},

	/**
	 * Обновляет ширину кнопки и оповещает об этом родителя
	 * @private
	 */
	_updateButtonSize: function(width, height) {
		sendMessage('resize', {
			width: width,
			height: height
		});
	},

	/**
	 * Создает кнопку и устанавливает события
	 * @private
	 */
	_create: function() {
		var self = this;

		this.button = document.getElementById('btn');

		if( !window.gapi || typeof (window.gapi.auth) !== "object" ) {
			throw new Error('Не удалось загрузить sdk google.');
		}

		if( this.options.style !== 'google' ) {
			loadStyle(self._BTNS_STORAGE + 'css/connect-default.css');
		}

		loadStyle(self._BTNS_STORAGE + 'css/connect-' + this.options.style + '.css');
		this.button.parentNode.addClass(this.options.layout);

		this.button.getElementsByClassName('label')[0].innerText = i18n(this.options.label, this.options.lang);

		this._loopUpdateSize();

		this.button.onclick = function() {
			sendMessage('click');

			self._connect(function(identityData, serviceData) {
				serviceData['oauth_client_id'] = getFromStorage('oauth_client_id');

				sendMessage('connect', {
					identity_data: identityData,
					service_data: serviceData,
					other_info: {
						service: self._name,
						network_user_id: getFromStorage('g_uid'),
						oauth_client_id: getFromStorage('oauth_client_id')
					}
				});
			});
		};
	}
};

var optionsReceived = false,
// true если callback уже загружен
	googleClientLoad = false;

/**
 * Инициализируем работу кнопки
 */
onloadInit(function(options) {
	optionsReceived = options;

	// если callback google ранее вызывался
	if( googleClientLoad ) {
		googleClientCallback();
	}
});

var googleClientCallback = function() {
	googleClientLoad = true;

	// Если настройки кнопки уже пришли
	if( optionsReceived ) {
		if( buttonInit ) {
			return;
		}

		buttonInit = true;

		button.init(optionsReceived);
	}
};
