/**
 * Объект кнопки youtube.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'google-youtube',
	_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
	_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
	_CLIENT_ID: '<%= pkg.google.client_id %>',

	_defaults: {
		channelId: null,
		label: 'Youtube',
		lang: 'ru_RU',
		layout: 'horizontal'
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

		this.permissions = ['https://www.googleapis.com/auth/youtube'];

		if( !this.options.channelId ) {
			sendMessage('error', {code: 'error_youtube_channel_missed'});
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
	 * Запрашивает личные данные пользователя
	 * @param callback - возвращает отформатированные данные пользователя
	 * @private
	 */
	_identify: function(callback) {
		var self = this;

		gapi.client.load('youtube', 'v3', function() {
			var request = gapi.client.youtube.subscriptions.insert({
				part: 'snippet',
				resource: {
					snippet: {
						resourceId: {
							kind: 'youtube#channel',
							channelId: self.options.channelId
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

					callback('error', response.error.message);
				}

				callback('success', response);
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
				self.button.addClass(self._name).addClass('loaded');
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

		this.button.parentNode.addClass(this.options.layout);

		this.button.getElementsByClassName('label')[0].innerText = this.options.label;

		this._loopUpdateSize();

		this.button.onclick = function() {
			sendMessage('click');

			self._connect(function(identityData, serviceData) {
				sendMessage('subscribe', {channelId: self.options.channelId});
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
