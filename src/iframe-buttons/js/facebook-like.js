/*if( !FB || !FB.init ) {
 throw new Error('Не удалось загрузить sdk facebook.');
 }*/

/**
 * Инициализируем работу кнопки
 */
onloadInit();

/**
 * Объект кнопки google connect.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'facebook-like',
	_APP_ID: '<%= pkg.facebook.appId %>',

	_defaults: {
		href: null,
		counter: true,
		layout: 'button_count',
		action: 'like',
		size: 'small',
		showFaces: 'false',
		share: 'false',
		lang: 'ru_RU'
	},

	/**
	 * Инициализирует ядро
	 * @param options
	 */
	init: function(options) {
		var self = this;

		this._prepareOptions(options);

		var script = document.createElement('script');
		script.src = '//connect.facebook.net/' + this.options.lang + '/sdk.js';

		script.onload = function() {
			//do stuff with the script
			self._setupEvents();
			self._create();
		};

		document.head.appendChild(script); //or something of the likes
	},

	/**
	 * Форматируем настройки до инициализации кнопки
	 * @return void
	 */
	_prepareOptions: function(options) {
		var self = this;

		this.options = extend({}, this._defaults, options);
		this.url = this.options.href || this.options.url;

		setMessageParam('url', this.url);

		if( "vertical" === this.options.layout ) {
			this.options.layout = 'box_count';
		} else {
			this.options.layout = 'button_count';

			if( !this.options.counter ) {
				this.options.layout = 'button';
			}
		}
	},

	_setupEvents: function() {
		var self = this;

		FB.init({
			appId: this._APP_ID,
			status: true,
			cookie: true,
			xfbml: true,
			version: 'v2.7'
		});

		window.FB.Event.subscribe('edge.create', function(url) {
			sendMessage('liked', {
				url: url
			});
		});

		window.FB.Event.subscribe('edge.remove', function(url) {
			sendMessage('unliked', {
				url: url
			});
		});

		FB.Event.subscribe('xfbml.render', function(response) {
			self._loopUpdateSize();
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

	/**
	 * Создает кнопку и устанавливает события
	 * @private
	 */
	_create: function() {
		var self = this;

		this.button = document.getElementsByClassName('fb-like')[0];

		this.button.setAttribute('data-href', this.options.href);
		this.button.setAttribute('data-layout', this.options.layout);
		this.button.setAttribute('data-action', this.options.action);
		this.button.setAttribute('data-size', this.options.size);
		this.button.setAttribute('data-showFaces', this.options.showFaces);
		this.button.setAttribute('data-share', this.options.share);

		FB.XFBML.parse(document.getElementById('fb-like-wrap'));
	}
};