if( !VK || !VK.init ) {
	throw new Error('Не удалось загрузить sdk вконтакте.');
}

/**
 * Инициализируем работу кнопки
 */
onloadInit();

var hoverWidget = false,
	counter = false,
	button = {
		_name: 'vk-like',
		_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
		_APP_ID: '<%= pkg.vk.appId %>',
		_ACCESS_TOKEN: '<%= pkg.vk.accessToken %>',

		requestApiProcessed: false,

		_defaults: {
			pageUrl: null,
			pageTitle: '',
			pageDescription: '',
			pageImage: '',
			counter: 1,
			pageId: '0',
			type: 'mini',
			width: '350',
			height: '22',
			verb: '0'
		},

		/**
		 * Инициализирует ядро
		 * @param options
		 */
		init: function(options) {
			this._prepareOptions(options);
			this._setupEvents();
			this._create();
		},

		/**
		 * Форматируем настройки до инициализации кнопки
		 * @return void
		 */
		_prepareOptions: function(options) {
			var self = this;

			this.options = extend({}, this._defaults, options);
			this.url = this.options.pageUrl;

			setMessageParam('url', this.url);
		},

		_setupEvents: function() {
			var self = this;

			VK.init({
				apiId: this._APP_ID,
				onlyWidgets: true
			});

			VK.Observer.subscribe("widgets.like.liked", function(like_id) {

				if( hoverWidget ) {
					self._showHint();
					self._runTimer();
				}

				sendMessage('liked', {
						url: self.url,
						other_info: {
							service: self._name,
							network_user_id: getFromStorage('vk_uid'),
							oauth_client_id: getFromStorage('oauth_client_id')
						}
					}
				);
			});

			VK.Observer.subscribe("widgets.like.unliked", function() {
				sendMessage('unliked', {
					url: self.url,
					other_info: {
						service: self._name,
						network_user_id: getFromStorage('vk_uid'),
						oauth_client_id: getFromStorage('oauth_client_id')
					}
				});
			});

			VK.Observer.subscribe("widgets.like.shared", function() {
				sendMessage('shared', {
						url: self.url,
						other_info: {
							service: self._name,
							network_user_id: getFromStorage('vk_uid'),
							oauth_client_id: getFromStorage('oauth_client_id')
						}
					}
				);
			});

			VK.Observer.subscribe("widgets.like.unshared", function() {
				sendMessage('unshared', {
					url: self.url,
					other_info: {
						service: self._name,
						network_user_id: getFromStorage('vk_uid'),
						oauth_client_id: getFromStorage('oauth_client_id')
					}
				});
			});

			document.getElementById('btn-cotanier').onmouseover = function(e) {
				hoverWidget = true;
			};

			document.getElementById('btn-cotanier').onmouseout = function(e) {
				hoverWidget = false;
			};
		},

		/**
		 * Показывает подсказку "Рассказать друзьям".
		 * @return void
		 */
		_showHint: function() {

			// если подсказка уже видимая, то ничего не делаем
			if( this.elementShown ) {
				return;
			}
			this.elementShown = true;

			// если подсказка еще не создана, создаем ее и вставляем в документ
			if( !this.element ) {
				this.element = document.createElement('div');
				this.element.addClass("onp-vk-like-alert");
				this.element.innerText = "Чтобы разблокировать, нажмите сюда";
				document.body.insertBefore(this.element, document.body.childNodes[0]);
			}

			// Обновляем позицию подсказки и показываем ее
			this._locate();
			this.element.style.display = "block";

			sendMessage('alert', {status: 'show'});
		},

		/**
		 * Скрывает подсказку
		 * @return void
		 */
		_hideHint: function() {

			// ничего не делаем, если подсказка уже скрыта или ее не существует
			if( !this.elementShown || !this.element ) {
				return;
			}
			this.elementShown = false;

			this.element.style.display = "none";

			sendMessage('alert', {status: 'hide'});
		},

		/**
		 * Обновляет позицию подсказки
		 * @return void
		 */
		_locate: function() {
			var self = this;

			var frameLikeWidget = document.getElementById('vk-like').getElementsByTagName('iframe')[0];

			if( !frameLikeWidget || !frameLikeWidget.getAttribute('id') ) {
				return;
			}

			var idxVkWidget = frameLikeWidget.getAttribute('id').replace(/vkwidget/i, '');

			if( !self.target ) {
				self.target = document.getElementById('vkwidget' + idxVkWidget + '_tt');
			}

			self.element.style.top = (parseInt(self.target.style.top) + 115) + "px";
			self.element.style.left = (parseInt(self.target.style.left) + 5) + "px";
		},

		/**
		 * Запуск таймера, который проверяет, каждые 20 сек видимость всплывающей подсказки вконтакте.
		 * Если подсказка вконтакте видима, то делаем видимой и нашу подсказку, иначе скрываем.
		 * @return void
		 */
		_runTimer: function() {
			var self = this;

			self.elementTimerTimout = 20000;
			var step = 200;

			if( self.elementTimer ) {
				return;
			}

			self.elementTimer = setInterval(function() {
				self.elementTimerTimout -= step;

				if( self.elementTimerTimout <= 0 ) {
					self._stopHintTimer();
					return;
				}

				if( self._isHidden(self.target) ) {
					self._hideHint();
				} else {
					self._showHint();
				}
			}, step);
		},

		/**
		 * Останавливаем таймер
		 * @return void
		 */
		_stopHintTimer: function() {
			if( !this.elementTimer ) {
				return;
			}

			clearInterval(this.elementTimer);
			this.elementTimer = null;
			this._hideHint();
		},

		/**
		 * Проверяем видимость элемента
		 * @param el
		 * @returns {boolean}
		 */
		_isHidden: function(el) {
			var style = window.getComputedStyle(el);
			return (style.display === 'none')
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
					self.button.addClass('loaded');
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

		_disabledButton: function() {
			this.buttonLayer.style.display = 'block';
		},

		_enabledButton: function() {
			this.buttonLayer.style.display = 'none';
		},

		/**
		 * Создает кнопку и устанавливает события
		 * @private
		 */
		_create: function() {
			var self = this;

			this.button = document.getElementById('vk-like');
			this.buttonLayer = this.button.parentNode.getElementsByClassName('layer')[0];

			this.widgetUqNumber = Math.floor((Math.random() * 999999) + 1);

			if( this.options.pageId != '0' ) {
				widget = VK.Widgets.Like('vk-like', this.options, this.options.pageId);
			} else {
				widget = VK.Widgets.Like('vk-like', this.options);
			}

			this._loopUpdateSize();
		}
	};