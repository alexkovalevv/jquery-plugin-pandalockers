if( !FB || !FB.init ) {
	throw new Error('Не удалось загрузить sdk facebook.');
}

/**
 * Инициализируем работу кнопки
 */
onloadInit();

/**
 * Объект кнопки facebook connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'facebook-connect',

	_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
	_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
	_APP_ID: '<%= pkg.facebook.appId %>',
	//_APP_ID: '1681260055442448',

	_serviceData: null,

	_defaults: {
		label: 'Facebook',
		lang: 'ru_RU',
		actions: [],
		permissions: ['public_profile', 'email'],
		fields: ['email', 'first_name', 'last_name', 'gender', 'link'],
		style: 'great-attractor',
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

		// название кнопки
		setMessageParam('name', 'facebook-connect');

		this.options = extend({}, this._defaults, options);

		// права, которые нужно запросить у пользователя
		this.restPermissions = this.options.permissions;

		// права, которые были отклонены пользователем
		this.declinedPermissions = [];

	},

	/**
	 * Проверяем авторизацию пользователя
	 * @param onComplete callback - который сработает после проверки запрошенных прав у пользователя
	 * @private
	 */
	_getLoginStatus: function(onComplete) {
		var self = this;

		FB.getLoginStatus(function(response) {
			self._checkPermissions(response, onComplete);
		});
	},

	/**
	 *
	 * Проверяет требуемые права у пользователя
	 * @param response object - результат getLoginStatus
	 * @param onComplete callback - который сработает после проверки запрошенных прав у пользователя
	 * @private
	 */
	_checkPermissions: function(response, onComplete) {
		var self = this;

		this._status = response.status;
		this._serviceData = response;

		if( !response || 'connected' !== this._status ) {
			if( onComplete ) {
				onComplete();
			}
			return;
		}

		FB.api('/me/permissions', function(response) {

			console.log(response);

			if( !response || !response.data ) {
				return;
			}

			// новый формат
			if( response.data[0] && !response.data[0].permission && !response.data[0].status ) {

				var granted = [];
				var declined = [];

				for( var perm in response.data[0] ) {

					if( response.data[0][perm] ) {
						granted.push(perm);
					} else {
						declined.push(perm);
					}
				}

			} else {

				// старый формат

				declined = response.data.filter(function(a) {
					return a.status !== 'granted';
				});

				granted = response.data.filter(function(a) {
					return a.status == 'granted';
				});

				var refineDeclined = [];
				if( declined.length ) {
					for( var i = 0, l = declined.length; i < l; i++ ) {
						refineDeclined.push(declined[i].permission);
					}
				}

				var refineGranted = [];
				if( granted.length ) {
					for( var e = 0, k = granted.length; e < k; e++ ) {
						refineGranted.push(granted[e].permission);
					}
				}
			}

			self.restPermissions = [];

			for( p in self.options.permissions ) {
				if( !self.options.permissions.hasOwnProperty(p) ) {
					continue;
				}

				if( refineGranted.indexOf(self.options.permissions[p]) === -1 ) {
					self.restPermissions.push(self.options.permissions[p]);
				}
			}

			console.log(self.restPermissions);
			//self.restPermissions = diffArrays(self.options.permissions, refineGranted);
			self.declinedPermissions = unionArrays(self.restPermissions, refineDeclined);

			if( onComplete ) {
				onComplete();
			}
		});
	},

	/**
	 * Авторизует пользователя в социальной сети
	 * @param callback - возвращает результат авторизации, с данными о пользователе
	 * @returns {*}
	 * @private
	 */
	_connect: function(callback) {
		var self = this;

		// пользователь уже авторизован и предоставил все необходимые разрешения
		if( 'connected' === self._status && !this.restPermissions.length ) {
			return this._identify(function(identityData) {
				callback(identityData, self._serviceData);
			});
		}

		// устанавливаем права, которые нужно запросить
		var requestOptions = {
			scope: self.restPermissions.join(',')
		};

		// если некоторые из прав были отклонены, попросим их снова
		if( self.declinedPermissions.length > 0 ) {
			requestOptions.auth_type = 'rerequest';
		}

		var loggedIn = false;

		trackWindow('facebook.com/dialog/oauth', function() {
			setTimeout(function() {
				if( loggedIn ) {
					return;
				}

				sendMessage('error', {code: 'errors_not_signed_in'});
			}, 500);
		});

		// пробуем авторизоваться, если пользователь не авторизован
		FB.login(function(response) {
			loggedIn = true;
			self._checkPermissions(response, function() {

				// показываем сообщение, что пользователь не авторизован в приложении
				if( 'connected' !== self._status ) {

					sendMessage('error', {code: 'errors_not_signed_in'});
					return;
				}

				// показываем сообщение о том, что пользователь не предоставил все требуемые права
				if( self.restPermissions.length ) {
					sendMessage('error', {
						code: 'res_errors_not_granted',
						permissions: self.restPermissions.join(', ')
					});
					return;
				}

				return self._identify(function(identityData) {
					callback(identityData);
				});
			});
		}, requestOptions);
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

		concatData += "&network=facebook";
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

		FB.api('/me?fields=' + this.options.fields.join(','), function(data) {

			var identity = {};
			if( !data ) {
				return callback(identity);
			}

			identity.id = data.id;
			identity.source = "facebook";
			identity.email = data.email ? data.email : null;
			identity.display_name = data.first_name + " " + data.last_name;
			identity.first_name = data.first_name;
			identity.last_name = data.last_name;
			identity.profile_url = data.link;
			identity.avatar_url = 'https://graph.facebook.com/' + data.id + '/picture?type=large';
			identity.social = true;

			self._saveUserInfo(identity);

			callback(identity);
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

		FB.init({
			appId: this._APP_ID,
			status: true,
			cookie: true,
			version: 'v2.7'
		});

		if( this.options.style !== 'facebook' ) {
			loadStyle(this._BTNS_STORAGE + 'css/connect-default.css');
		}

		loadStyle(this._BTNS_STORAGE + 'css/connect-' + this.options.style + '.css');
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
						network_user_id: getFromStorage('fb_uid'),
						oauth_client_id: getFromStorage('oauth_client_id')
					}
				});
			});
		};
	}
};


