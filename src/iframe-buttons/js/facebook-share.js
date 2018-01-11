if( !FB || !FB.init ) {
	throw new Error('Не удалось загрузить sdk facebook.');
}

/**
 * Инициализируем работу кнопки
 */
onloadInit();

var button = {

	_name: 'facebook-share',

	_APP_ID: '<%= pkg.facebook.appId %>',

	_counterBuffer: 0,

	_defaults: {
		counter: true,
		layout: 'horizontal',
		href: null,
		lang: 'ru_RU',
		title: null,
		picture: null,
		caption: null,
		description: null
	},

	init: function(options) {
		this._prepareOptions(options);
		this._create();
		this._updateCounter();
	},

	_prepareOptions: function(options) {
		this.options = extend({}, this._defaults, options);
		this.url = this.options.url;

		setMessageParam('url', this.url);

		this.cookieCounterCacheName = 'fb_sbtn_cache_' + hash(this.url);

		if( getFromStorage(this.cookieCounterCacheName) ) {
			this._counterBuffer = getFromStorage(this.cookieCounterCacheName);
		}
	},

	_updateCounter: function() {
		var self = this;

		if( this._counterBuffer ) {
			this.button.getElementsByClassName('counter')[0].innerText = this._minimalizeLargeNum(this._counterBuffer);

			if( this.options.counter ) {
				this.button.getElementsByClassName('counter')[0].addClass('show');
			}

			this._loopUpdateSize();
			sendMessage('loaded');
			return;
		}

		this._getCounter(function() {
			if( self.options.counter ) {
				self.button.getElementsByClassName('counter')[0].addClass('show');
			}
			self._loopUpdateSize();
			sendMessage('loaded');
		});
	},

	_getCounter: function(callback) {
		var self = this;

		var XHR = ("onload" in new XMLHttpRequest())
			? XMLHttpRequest
			: XDomainRequest;
		var xhr = new XHR();

		xhr.open('GET', "//graph.facebook.com/?id=" + encodeURIComponent(this.url), true);
		xhr.responseType = 'json';

		xhr.onload = function() {

			if( !this.response || (this.response && this.response.error) ) {

				console.log("%c[Error]: Ошибка запроса на получение счетчика", "color: red;");

				var sendData = {};

				if( this.response && this.response.error ) {
					console.log(this.response.error);
					sendData['message'] = this.response.error;
				}

				sendData['code'] = 'unexpected_error';

				sendMessage('error', sendData);
				return;
			}

			if( this.response.share ) {
				self._counterBuffer = this.response.share.share_count;
				setStorage(self.cookieCounterCacheName, self._counterBuffer, 2);
			}

			self.button.getElementsByClassName('counter')[0].innerText = self._minimalizeLargeNum(self._counterBuffer);

			callback && callback();
		};

		xhr.onerror = function() {
			sendMessage('error', {code: 'request_status_code_' + this.status});
		};

		xhr.send();
	},

	/**
	 * Преобразует длинное число счетчика в короткое
	 * @param n
	 * @returns string
	 */
	_minimalizeLargeNum: function(n) {
		return abbreviateNumber(n, this.options.lang);
	},

	/**
	 * Запускает таймер и обновляет размеры кнопки каждые полсекунды
	 * @private
	 */
	_loopUpdateSize: function() {
		var self = this;

		var width = 0, height = 0, loaded = false;

		var timerInteration = 0, normalizeWidthTimer = setInterval(function() {

			/*if( !width && !height && !loaded ) {
			 loaded = true;
			 }*/

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

	_create: function() {
		var self = this;

		this.button = document.getElementById('btn');

		var svgSupport = (window.SVGSVGElement) ? true : false;

		this.button.parentNode.addClass(this.options.layout);

		if( !svgSupport ) {
			this.button.addClass('no-svg');
		}

		this.button.getElementsByClassName('label')[0].innerText = i18n('share', this.options.lang);

		FB.init({
			appId: this._APP_ID,
			status: true,
			cookie: true,
			xfbml: true,
			version: 'v2.7'
		});

		this.button.onclick = function() {
			sendMessage('click');

			FB.ui(
				{
					method: 'share',
					href: self.url,
					display: 'popup'
				},
				function(response) {
					console && console.log && console.log('AX12:');
					console && console.log && console.log(response);

					var sendData = {
						url: self.url
					};

					if( isTabletOrMobile() && typeof response === "undefined" || response === null ) {
						sendMessage('shared', sendData);
						return;
					}

					if( (typeof response === "undefined" || response === null ) || ( typeof response === "object" && response.error_code && response.error_code > 0 ) ) {
						sendMessage('notshared', sendData);
						return;
					}

					sendMessage('shared', sendData);
				}
			);
			return false;
		};
	}
};