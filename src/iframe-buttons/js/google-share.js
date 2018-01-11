/**
 * Объект кнопки google connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var googleOnShareCallack, googleOAuthCallback,
	button = {

		_name: 'google-share',
		_BTNS_STORAGE: '<%= pkg.btnsStorage %>',
		_CLIENT_ID: '<%= pkg.google.client_id %>',

		_defaults: {
			// URL to plus one
			pageUrl: null,
			lang: 'ru_RU',
			layout: 'horizontal',
			prefilltext: null
		},

		/**
		 * Инициализирует ядро
		 * @param options
		 */
		init: function(options) {
			this._prepareOptions(options);
			this._addEvents();
			this._create();
		},

		_addEvents: function() {
			var self = this;

			// Функция обратного вызова при выполнения действия пользователя
			googleOnShareCallack = function(response) {
				if( !response ) {
					return;
				}

				sendMessage('google-share-box', {
					action: response.action,
					status: response.status
				});

				if( response.status == 'started' ) {
					self.button.style.display = 'none';
				} else {
					self.button.style.display = 'inline-block';
				}

				if( !response.action ) {
					return;
				}

				if( response.action == 'shared' ) {
					sendMessage('shared');
				} else if( response.action == 'cancelled' ) {
					sendMessage('notshared');
				}
			};

			// Функция обратного вызова при авторизации пользователя
			googleOAuthCallback = function(response) {

				//console.log(response);
			};
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

				var buttonWrap = document.getElementById('g-btn-wrap');

				if( width !== buttonWrap.offsetWidth || height !== buttonWrap.offsetHeight ) {
					width = buttonWrap.offsetWidth;
					height = buttonWrap.offsetHeight;

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

			if( !window.gapi || typeof (window.gapi.auth) !== "object" ) {
				throw new Error('Не удалось загрузить sdk google.');
			}

			loadStyle(this._BTNS_STORAGE + 'css/connect-default.css');
			loadStyle(this._BTNS_STORAGE + 'css/connect-google.css');

			this.button = document.getElementById('btn');
			this.button.parentNode.addClass(this.options.layout);
			this.button.getElementsByClassName('label')[0].innerText = i18n('share', this.options.lang);

			this.button.setAttribute("data-contenturl", this.url);
			this.button.setAttribute("data-clientid", this._CLIENT_ID);
			this.button.setAttribute("data-cookiepolicy", 'single_host_origin');
			this.button.setAttribute("data-prefilltext", this.options.prefilltext);
			this.button.setAttribute("data-calltoactionlabel", 'CREATE');
			this.button.setAttribute("data-calltoactionurl", 'https://cdn.sociallocker.ru');
			this.button.setAttribute("data-callback", 'googleOAuthCallback');
			this.button.setAttribute("data-onshare", 'googleOnShareCallack');

			setTimeout(function() {
				window.gapi.interactivepost.go('g-btn-wrap');
				self._loopUpdateSize();
			}, 100);

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