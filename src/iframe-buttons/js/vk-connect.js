if( !VK || !VK.init ) {
	throw new Error('Не удалось загрузить sdk вконтакте.');
}

var vkOauthReady = false;

/**
 * Инициализируем работу кнопки
 */
onloadInit();

/**
 * Объект кнопки vk connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {
	_name: 'vk-connect',

	_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
	_PROXY: '<%= pkg.proxy %>',
	_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
	_APP_ID: '<%= pkg.vk.appId %>',

	_defaults: {
		actions: [],
		style: 'dark-force',
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

		this.options = extend({}, this._defaults, options);
		this.scope = "email";
	},

	/**
	 * Авторизует пользователя в социальной сети
	 * @param callback - возвращает результат авторизации, с данными о пользователе
	 * @returns {*}
	 * @private
	 */
	_connect: function(callback) {
		var self = this;

		if( vkOauthReady ) {

			this._identify(
				function(identityData) {
					callback(identityData);
				}
			);

		} else {
			var width = 700;
			var height = 420;

			var x = screen.width
				? (screen.width / 2 - width / 2 + findLeftWindowBoundry())
				: 0;
			var y = screen.height
				? (screen.height / 2 - height / 2 + findTopWindowBoundry())
				: 0;

			self.sToken = hash(Math.floor((Math.random() * 999999) + 1) + 'ab');
			self.oAuthClientId = getFromStorage('oauth_client_id');

			var dataToSend = {},
				clientId,
				url = self._PROXY + '/vk';

			if( !self.oAuthClientId ) {
				dataToSend['s_token'] = self.sToken;
			} else {
				dataToSend['oauth_client_id'] = self.oAuthClientId;
			}

			for( var prop in dataToSend ) {
				if( !dataToSend.hasOwnProperty(prop) ) {
					continue;
				}
				url = updateQueryStringParameter(url, prop, dataToSend[prop]);
			}

			trackWindow('/vk', function() {
				setTimeout(
					function() {

						var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest,
							xhr = new XHR(),
							getClientInfoUrl = self._GET_CLIENT_PROXY + '/get-info';

						if( !self.oAuthClientId ) {
							getClientInfoUrl = updateQueryStringParameter(getClientInfoUrl, 's_token', self.sToken);
						} else {
							getClientInfoUrl = updateQueryStringParameter(getClientInfoUrl, 'oauth_client_id', self.oAuthClientId);
						}

						xhr.open('GET', getClientInfoUrl, true);
						xhr.responseType = 'json';

						xhr.onload = function() {

							if( !this.response || (this.response && (this.response.error) || !this.response.current_conntection || !this.response.has_connections ) ) {
								var sendData = {
									code: 'errors_not_signed_in'
								};

								if( this.response && this.response.error ) {
									console.log("%c[Error]: Ошибка при получении данных: " + this.response.error, "color: red;");
									sendData['message'] = this.response.error;
								}

								sendMessage('error', sendData);
								return;
							}

							self._userInfo = this.response.current_conntection;
							self._hasConnections = this.response.has_connections;
							self._userInfo.email = self._userInfo.email || null;

							vkOauthReady = true;
							self._saveUserInfo();
							self._connect(callback);

						};

						xhr.onerror = function() {
							sendMessage('error', {code: 'request_status_code_' + this.status});
						};

						xhr.send();

					}, 500
				);
			});

			var win = window.open("//oauth.vk.com/authorize?client_id=" + self._APP_ID +
				"&display=page&redirect_uri=" + url +
				"&scope=" + self.scope +
				"&response_type=code&v=5.50",
				"Vkontakte Sign-in",
				"width=" + width + ",height=" + height + ",left=" + x + ",top=" + y + ",resizable=yes,scrollbars=yes,status=yes"
			);
		}
	},

	/**
	 * Puts together service data required for the future requests.
	 */
	_getServiceData: function() {
		var self = this;
		return {
			access_token: self._userInfo.access_token,
			oauth_client_id: self._userInfo.oauth_client_id
		};
	},

	/**
	 * Сохраняет данные пользователя, для использования в других виджетах
	 * @private
	 */
	_saveUserInfo: function() {
		setStorage('oauth_client_id', this._userInfo.oauth_client_id, 365, true);

		// извлекаем id всех связанных соц. сетей с профилем клиента
		extract_uid_networks(this._hasConnections);
	},

	/**
	 * Запрашивает личные данные пользователя
	 * @param callback - возвращает отформатированные данные пользователя
	 * @private
	 */
	_identify: function(callback) {
		var self = this;

		var identity = {};

		identity.source = "vk";
		identity.email = self._userInfo.email;
		identity.display_name = self._userInfo.first_name + " " + self._userInfo.last_name;
		identity.first_name = self._userInfo.first_name;
		identity.last_name = self._userInfo.last_name;
		identity.profile_url = 'https://vk.com/id' + self._userInfo.network_user_id;
		identity.social = true;

		if( self._userInfo.avatar_url ) {
			identity.avatar_url = self._userInfo.avatar_url;
		}

		callback(identity);
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

		VK.init({
			apiId: this._APP_ID
		});

		if( this.options.style !== 'vk' ) {
			loadStyle(self._BTNS_STORAGE + 'css/connect-default.css');
		}

		loadStyle(self._BTNS_STORAGE + 'css/connect-' + this.options.style + '.css');
		this.button.parentNode.addClass(this.options.layout);

		this._loopUpdateSize();

		this.button.onclick = function() {
			sendMessage('click');

			self._connect(function(identityData, serviceData) {
				sendMessage('connect', {
					identity_data: identityData,
					service_data: serviceData,
					other_info: {
						service: self._name,
						network_user_id: self._userInfo.network_user_id,
						oauth_client_id: self._userInfo.oauth_client_id
					}
				});
			});
		};
	}
};