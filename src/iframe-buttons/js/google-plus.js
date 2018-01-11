// Уведомляем родителя, авторизован ли пользователь или нет
if( !getFromStorage('g_uid') || !getFromStorage('oauth_client_id') ) {
	sendMessage('not_authorized');
}

/**
 * Объект кнопки google connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'google-plus',

	_defaults: {
		// URL to plus one
		url: null,

		lang: 'ru_RU',

		// small, medium, standard, tall (https://developers.google.com/+/plugins/+1button/#button-sizes)
		size: 'medium',

		// Sets the annotation to display next to the button.
		annotation: null,

		counter: true,

		layout: 'horizontal',

		// Button container width in px, by default 450.
		width: null,

		// Sets the horizontal alignment of the button assets within its frame.
		align: "left",

		// Sets the preferred positions to display hover and confirmation bubbles, which are relative to the button.
		// comma-separated list of top, right, bottom, left
		expandTo: "",

		// To disable showing recommendations within the +1 hover bubble, set recommendations to false.
		recommendations: false
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

		this.url = this.options.url;

		if( "vertical" === this.options.layout ) {
			this.options.size = 'tall';
		} else {
			if( !this.options.counter ) {
				this.options.annotation = 'none';
			}
		}
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

		this.button = document.createElement('div');
		this.button.addClass('g-plusone');

		this.button.setAttribute("data-href", this.url);

		if( this.options.lang ) {
			var lang = 'ru';

			if( this.options.lang === 'ru_RU' ) {
				lang = 'ru';
			} else if( 'en_EN' ) {
				lang = 'en-US';
			}

			this.button.setAttribute("data-lang", lang);
		}

		if( this.options.size ) {
			this.button.setAttribute("data-size", this.options.size);
		}
		if( this.options.annotation ) {
			this.button.setAttribute("data-annotation", this.options.annotation);
		}
		if( this.options.align ) {
			this.button.setAttribute("data-align", this.options.align);
		}
		if( this.options.expandTo ) {
			this.button.setAttribute("data-expandTo", this.options.expandTo);
		}
		if( this.options.recommendations ) {
			this.button.setAttribute("data-recommendations", this.options.recommendations);
		}

		this.button.setAttribute("data-callback", "googlePlusOne_Callback");

		document.getElementById('g-btn-wrap').appendChild(this.button);

		setTimeout(function() {
			window.gapi.plusone.go('g-btn-wrap');
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

var googlePlusOne_Callback = function(data) {
	if( data.state === "on" ) {
		sendMessage('plused', {
			url: data.href,
			other_info: {
				service: button._name,
				network_user_id: getFromStorage('g_uid'),
				oauth_client_id: getFromStorage('oauth_client_id')
			}
		});
	}

	if( data.state === "off" ) {
		sendMessage('unplused', {
			url: data.href,
			other_info: {
				service: button._name,
				network_user_id: getFromStorage('g_uid'),
				oauth_client_id: getFromStorage('oauth_client_id')
			}
		})
	}
};