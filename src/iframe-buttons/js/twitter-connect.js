var twitterOauthReady = false;

/**
 * Инициализируем работу кнопки
 */
onloadInit();

/**
 * Объект кнопки twitter connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {
	_name: 'twitter-connect',

	_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
	_PROXY: '<%= pkg.proxy %>',
	_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',

	_defaults: {
		tweet: {
			// URL который будет включ в сообщение для публикации
			url: null,

			// текстовое сообщение для публикации
			text: '',

			// имя пользователя, от которого публикует твит
			via: null,

			// хеш теги, которые будут включены в сообщение для публикации
			hashtags: null
		},
		follow: {
			// URL который будет включ в сообщение для публикации
			url: null
		},
		actions: [],
		style: 'dark-force',
		layout: 'first-group',
		label: 'twitter',
		lang: 'ru_RU'
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

		var removeIndex = this.options.actions.indexOf('lead');

		if( removeIndex > -1 ) {
			this.options.actions.splice(removeIndex, 1);
		}

		if( this.options.actions.indexOf('follow') !== -1 ) {

			if( !this.options.follow || !this.options.follow.url ) {
				sendMessage('error', {code: 'twitter_user_missed'});
			}
		}

		if( this.options.actions.indexOf('tweet') !== -1 ) {

			if( !this.options.tweet || !this.options.tweet.text ) {
				sendMessage('error', {code: 'twitter_message_missed'});
			}
		}
	},

	/**
	 * Авторизует пользователя в социальной сети
	 * @param callback - возвращает результат авторизации, с данными о пользователе
	 * @returns {*}
	 * @private
	 */
	_connect: function(callback) {
		var self = this;

		if( twitterOauthReady ) {

			callback(this._identify(), this._getServiceData());

		} else {

			// The fix for the issue #BIZ-41:
			// removes the proxy URL from the options because it fires the errors on some website

			var optionsToPass = extend(true, {}, self.options);
			delete optionsToPass['proxy'];

			self.sToken = hash(Math.floor((Math.random() * 999999) + 1) + 'ab');
			self.oAuthClientId = getFromStorage('oauth_client_id');

			var dataToSend = {
				'request_type': 'init',
				'actions': this.options.actions.join(','),
				'twitter_options': JSON.stringify(optionsToPass)
			};

			if( this.options.follow.url && this.options.actions.indexOf('follow') + 1 ) {
				this._followUrl = this.options.follow.url;

				var parts = this._followUrl.split('/'),
					screenName = parts[parts.length - 1];

				dataToSend['follow_to'] = encodeURIComponent(screenName);
			}

			if( this.options.tweet.text && this.options.actions.indexOf('tweet') + 1 ) {
				var tweetMessage = this.options.tweet.text,
					args = [],
					viaPrefix = i18n('via', this.options.lang);

				if( this.options.tweet.url ) {
					this._tweetUrl = this.options.tweet.url;
					args.push(this.options.tweet.url);
				}

				if( this.options.tweet.hashtags ) {
					args.push(this.options.tweet.hashtags);
				}
				if( this.options.tweet.via ) {
					var viaUser = this.options.tweet.via.replace('@', '');
					args.push(viaPrefix + ' @' + viaUser);
				}

				this.options.tweet.text = encodeURIComponent(tweetMessage + ' ' + args.join(' '));

				if( !this.options.tweet.text ) {
					sendMessage('error', {code: 'undefined_tweet_message'});
				}

				dataToSend['tweet_message'] = encodeURIComponent(this.options.tweet.text);
			}

			var visitorId = getFromStorage('tw_acid');
			if( visitorId && visitorId !== 'null' ) {
				dataToSend['request_type'] = 'callback';
				dataToSend['visitor_id'] = visitorId;
			}

			var url = self._PROXY + "/twitter";

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

			trackWindow("/twitter", function() {

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

					twitterOauthReady = true;

					self._userInfo = this.response.current_conntection;
					self._hasConnections = this.response.has_connections;
					self._userInfo.email = self._userInfo.email || null;

					if( self._userInfo.visitor_id ) {
						self._saveVisitorId(self._userInfo.visitor_id);
					}

					self._saveUserInfo();
					self._connect(callback);
				};

				xhr.onerror = function() {
					sendMessage('error', {code: 'request_status_code_' + this.status});
				};

				xhr.send();
			});

			window.open(url,
				"Twitter Sign-In",
				"width=500,height=450,resizable=yes,scrollbars=yes,status=yes"
			);
		}
	},

	/**
	 * Сохраняет id пользователя в сервисе, для дальнейшего использования токенов доступа
	 * @private
	 */
	_saveVisitorId: function(visitorId) {

		this._visitorId = visitorId;
		setStorage('tw_acid', visitorId, 365, true);
	},

	/**
	 * Puts together service data required for the future requests.
	 */
	_getServiceData: function() {
		var self = this;
		return {
			visitorId: self._visitorId,
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
	 * @private
	 */
	_identify: function() {
		var self = this;

		var identity = {};

		if( !this._userInfo ) {
			return identity;
		}

		identity.source = "twitter";
		identity.email = this._userInfo.email;
		identity.first_name = this._userInfo.first_name;
		identity.last_name = this._userInfo.last_name;
		identity.display_name = this._userInfo.display_name;
		identity.profile_url = 'https://twitter.com/' + this._userInfo.screen_name;

		if( this._userInfo.avatar_url ) {
			identity.avatar_url = this._userInfo.avatar_url;
		}

		return identity;
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

		if( this.options.style != 'twitter' ) {
			loadStyle(self._BTNS_STORAGE + 'css/connect-default.css');
		}

		loadStyle(self._BTNS_STORAGE + 'css/connect-' + this.options.style + '.css');

		this.button.parentNode.addClass(this.options.layout);
		this.button.getElementsByClassName('label')[0].innerText = i18n(this.options.label, this.options.lang);

		this._loopUpdateSize();

		this.button.onclick = function() {
			sendMessage('click');

			self._connect(function(identityData, serviceData) {
				var sendData = {
					identity_data: identityData,
					service_data: serviceData,
					other_info: {
						service: self._name,
						network_user_id: self._userInfo.network_user_id,
						oauth_client_id: self._userInfo.oauth_client_id
					}
				};

				if( self._followUrl ) {
					sendData['followUrl'] = self._followUrl;
				}
				if( self._tweetUrl ) {
					sendData['tweetUrl'] = self._tweetUrl;
				}

				sendMessage('connect', sendData);
			});
		};
	}
};
