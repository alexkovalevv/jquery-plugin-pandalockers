if( !VK || !VK.init ) {
	throw new Error('Не удалось загрузить sdk вконтакте.');
}

/**
 * Инициализируем работу кнопки
 */
onloadInit();

/**
 * Проверяем авторизован ли пользователь или нет
 */
window.isUserAuth = false;

var vkprimg = (window.Image ? (new Image()) : document.createElement('img'));
vkprimg.onload = function() {
	window.isUserAuth = true;
};
vkprimg.src = 'https://vk.com/login?u=2&to=aW1hZ2VzL2ljb25zL2hlYWRfaWNvbnMucG5n';

/**
 * Объект кнопки share.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'vk-share',
	_GET_CLIENT_PROXY: 'https://sociallocker.ru/api.php',
	_APP_ID: '<%= pkg.vk.appId %>',
	_ACCESS_TOKEN: '<%= pkg.vk.accessToken %>',
	_getUserInfoRequests: 0,
	_checkWallRequests: 0,

	counterBuffer: 0,
	taskCheckShared: 0,
	userId: null,
	hoverWidget: false,
	widgetUqNumber: null,

	_defaults: {
		lang: 'ru_RU',
		pageUrl: null,
		pageTitle: '',
		pageDescription: '',
		pageImage: '',
		counter: 1,
		lockerId: null,
		refPageUrl: null
	},

	/**
	 * Инициализирует кнопку.
	 * @param options - object набор опций
	 * @return void
	 */
	init: function(options) {
		var self = this;

		this.prepareOptions(options);
		this.setupEvents();
		this.create();
	},

	/**
	 * Обрабатываем опции до их использования
	 * @param options - object набор опций
	 * @return void
	 */
	prepareOptions: function(options) {
		this.options = extend({}, this._defaults, options);

		this.url = this.options.pageUrl;

		setMessageParam('url', this.url);

		this.widgetUqNumber = Math.floor((Math.random() * 999999) + 1);

		this.cookieCounterCacheName = 'vk_shbtn_cache_' + hash(this.url);

		if( getFromStorage(this.cookieCounterCacheName) ) {
			this.counterBuffer = getFromStorage(this.cookieCounterCacheName);
		}

		this.userId = getFromStorage('vk_uid');
	},

	/**
	 * Устанавливаем события соц. сетей или те события, которые должны инициализироваться до создания кнопки.
	 * @return void
	 */
	setupEvents: function() {
		var self = this;

		window.VK.init({
			apiId: self._APP_ID,
			onlyWidgets: true
		});
	},

	/**
	 * Иммитация метода window.VK.Api.call, фикс для сайтов с киррилическими доменами.
	 */
	vkApiCall: function(method, params, cb) {
		var query = params || {},
			qs,
			responseCb,
			self = this;

		responseCb = function(response) {
			cb(response);
		};

		var rnd = parseInt(Math.random() * 10000000, 10);
		while( VK.Api._callbacks[rnd] ) {
			rnd = parseInt(Math.random() * 10000000, 10)
		}

		query.callback = 'VK.Api._callbacks[' + rnd + ']';

		qs = VK.Cookie.encode(query);

		VK.Api._callbacks[rnd] = responseCb;

		setTimeout(function() {
			VK.Api.attachScript(VK._domain.api + 'method/' + method + '?' + qs);
		}, 1500);
	},

	/**
	 * Создает окно репоста страницы, в этом же методе происходит прослушивание на закрытие окна
	 * @return void
	 */
	showShareWindow: function() {
		var self = this;

		var additionalOptions = ( self.options.pageTitle
				? "&title=" + encodeURIComponent(self.options.pageTitle)
				: '' ) +
			( self.options.pageDescription
				? "&description=" + encodeURIComponent(self.options.pageDescription)
				: '' ) +
			( self.options.pageImage
				? "&image=" + self.options.pageImage
				: '' ) + "&noparse=false";

		var width = 1, height = 1;

		var guid = makeid() + hash(makeid() + (Math.floor((Math.random() * 999999)) + 1)),
			appUrl = '//vk.com/app5927451#' + guid;

		var urlTo = '//oauth.vk.com/authorize?client_id=-1&redirect_uri=' + encodeURIComponent(appUrl) + '&display=widget',
			shareUrl = "//vk.com/share.php?url=" + encodeURIComponent(self.url) + additionalOptions;

		if( window.isUserAuth ) {
			//urlTo = '//vk.com/app5894322';
			urlTo = appUrl;
		}

		if( self.userId ) {
			urlTo = shareUrl;
		}

		if( !window.isUserAuth || !self.userId ) {
			width = 550;
			height = 420;
		}

		var winref = window.open(
			urlTo,
			"Sociallocker",
			"width=" + width + ",height=" + height + ",left=" + self.getWindowPositionLeft(550) + ",top=" + self.getWindowPositionTop(520) + ",toolbar=0,location=0,status=0,menubar=0,resizable=yes,scrollbars=yes,status=yes"
		);

		if( !self.userId ) {
			self.getUserInfo(guid, shareUrl);
			if( isTabletOrMobile() ) {
				return;
			}
		}

		if( !isTabletOrMobile() ) {
			// waiting until the window is closed
			var pollTimer = setInterval(
				function() {
					if( !winref || winref.closed !== false ) {
						clearInterval(pollTimer);

						if( self.userId ) {
							self.checkWall();
							return false;
						}

						sendMessage('error', {code: 'unexpected_error'});

					}
				}, 200
			);
			return;
		}

		self.checkWallForMobile();
	},

	getUserInfo: function(guid, shareUrl) {
		var self = this;
		this._getUserInfoRequests++;

		var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest,
			xhr = new XHR();

		xhr.open('POST', self._GET_CLIENT_PROXY, true);
		xhr.responseType = 'json';
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

		xhr.onload = function() {
			var response = this.response;
			if( typeof response != 'object' ) {
				response = JSON.parse(this.response);
			}

			if( !response || response.error ) {
				if( response.error && response.code && response.code == 'user_not_found' ) {
					if( window.isUserAuth && self._getUserInfoRequests > 10 ) {
						sendMessage('error', {code: 'request_limit_exceeded'});
						return;
					}

					setTimeout(function() {
						self.getUserInfo(guid, shareUrl);
					}, 1500);
					return;
				}
				response && response.error && console.log("%c[Error]: " + response.error, "color: red;");
				sendMessage('error', {code: 'unexpected_error'});
				return;
			}

			self.userId = response.uid;
			setStorage('vk_uid', self.userId, 1, true);

			self.checkWallForMobile();
		};

		xhr.onerror = function() {
			var response = this.response;
			response && response.error && console.log("%c[Error]: Ошибка выполнения ajax запроса: " + 'request_status_code_' + this.status, "color: red;");
			sendMessage('error', {code: 'unexpected_error'});
		};

		var concatData = "&action=get_user_info";
		concatData += "&guid=" + encodeURIComponent(guid);
		concatData += "&locker_id=" + encodeURIComponent(this.options.lockerId);
		concatData += "&process_url=" + encodeURIComponent(shareUrl);
		concatData += "&share_url=" + encodeURIComponent(self.url);
		concatData += "&page_url=" + encodeURIComponent(self.options.refPageUrl);

		xhr.send(concatData);
	},

	getWindowPositionLeft: function(width) {
		return screen.width
			? (screen.width / 2 - width / 2 + findLeftWindowBoundry())
			: 0;
	},

	getWindowPositionTop: function(height) {
		return screen.height
			? (screen.height / 2 - height / 2 + findTopWindowBoundry())
			: 0;
	},

	checkWallForMobile: function() {
		var self = this;

		if( !isTabletOrMobile() ) {
			return;
		}

		//processing
		if( timer ) {
			clearInterval(timer);
		}
		var timer = setInterval(function() {
			if( window.isUserAuth && self._checkWallRequests > 6 ) {
				self.checkWall(function(status, getWallLink) {
					if( status === 'success' ) {
						sendMessage('shared', {
							url: getWallLink,
							other_info: {
								service: self._name,
								network_user_id: self.userId,
								oauth_client_id: getFromStorage('oauth_client_id')
							}
						});
					}
				});
				clearInterval(timer);
				return;
			}

			self.checkWall();
			self._checkWallRequests++;

		}, 2000);
	},

	/***
	 * Проверяет поделился ли пользователь страницой или нет.
	 * Проверка происходит с помощью api метода wall.get,
	 * получая все последние записи со стены, мы сравниваем ссылки и
	 * если совпадение найдено, значит это правда.
	 * @param uid - id пользователя вконтакте
	 * @param callback - функция выполняется после завершения проверки,
	 * принимает один аргумент result(ответ может быть success или fail)
	 * @returns void
	 */
	checkWall: function(callback) {
		var self = this;

		self._checkWallRequests++;

		self.vkApiCall(
			'wall.get', {
				owner_id: self.userId,
				count: 2,
				filter: 'owner',
				access_token: self._ACCESS_TOKEN
			}, function(r) {

				if( (r && r.error) || (!r || r && !r.response) ) {
					var sendData = {code: 'unexpected_error'};

					console.log("%c[Error]: Ошибка запроса к likes.getList", "color: red;");

					if( r && r.error ) {
						sendData['message'] = r.error;
					}

					sendMessage('error', sendData);

					return;
				}
				var neededPost = r.response[1];

				if( r.response[1] && r.response[1].is_pinned && r.response[2] ) {
					neededPost = r.response[2];
				}

				if( neededPost.attachment && neededPost.attachment.link && neededPost.attachment.link.url ) {
					var getWallLink = neededPost.attachment.link.url;

					if( !getWallLink ) {
						return;
					}

					callback && callback('success', getWallLink);

					var eventName = 'shared';

					if( isTabletOrMobile() ) {
						eventName = 'waiting_shared';
					}

					sendMessage(eventName, {
						url: getWallLink,
						other_info: {
							service: self._name,
							network_user_id: self.userId,
							oauth_client_id: getFromStorage('oauth_client_id')
						}
					});

					return false;
				}

				callback && callback('fail');

				sendMessage('notshared', {
					url: getWallLink
				});

				return false;
			}
		);
	},

	/**
	 * Устанавливает счетчик для кнопки
	 * @param force - если true, принудительно обновляет счетчик и сбрасывает кеш.
	 * @param callback
	 * @return void
	 */
	updateCounter: function(force, callback) {
		var self = this;

		if( getFromStorage(self.cookieCounterCacheName) && this.counterBuffer && !force ) {
			this.buttonCounter.innerText = this.minimalizeLargeNum(this.counterBuffer);

			callback && callback();
			return;
		}

		if( !window.VK.Share ) {
			window.VK.Share = {};
		}

		window.VK.Share.count = function(idx, number) {

			self.counterBuffer = number;
			self.buttonCounter.innerText = self.minimalizeLargeNum(number);

			setStorage(self.cookieCounterCacheName, number, 1);

			callback && callback();
		};

		this.getCounterScripts();
	},

	/**
	 * Устанавливает статус загрузки кнопки
	 */
	setStateAndShowButton: function() {
		var self = this;

		if( this.options.counter ) {
			this.buttonCounter.addClass('show');
		}

		this.button.addClass('loaded');
		self._loopUpdateSize();
		sendMessage('loaded');
	},

	/**
	 * Получает скрипт счетчика вконтакте
	 * @param inx
	 * @param url
	 * @param callback
	 * @returns void
	 */
	getCounterScripts: function(callback) {
		var script = document.createElement('script');
		var prior = document.getElementsByTagName('script')[0];
		script.async = 1;
		prior.parentNode.insertBefore(script, prior);

		script.onload = script.onreadystatechange = function(_, isAbort) {
			if( isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
				script.onload = script.onreadystatechange = null;
				script = undefined;

				if( !isAbort ) {
					if( callback ) {
						callback();
					}
				}
			}
		};

		script.src = '//vk.com/share.php?act=count&index=1&url=' + encodeURIComponent(this.url);
	},

	/**
	 * Запускает таймер и обновляет размеры кнопки каждые полсекунды
	 * @private
	 */
	_loopUpdateSize: function() {
		var self = this;

		var width = 0, height = 0, loaded = false;

		var timerInteration = 0, normalizeWidthTimer = setInterval(function() {

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
	 * Преобразует длинное число счетчика в короткое
	 * @param n
	 * @returns string
	 */
	minimalizeLargeNum: function(n) {
		return abbreviateNumber(n, this.options.lang);
	},

	create: function() {
		var self = this;

		this.button = document.getElementById('btn');
		this.likeButtonContanier = this.button.getElementsByClassName('btn-clickja-verify')[0];
		this.buttonCounter = document.getElementById('btn-counter');

		this.button.parentNode.addClass(this.options.layout);

		this.button.getElementsByTagName('span')[0].innerText = i18n('share', self.options.lang);

		if( this.options.layout === 'confirm' ) {
			this.button.getElementsByTagName('span')[0].innerText = i18n('next', self.options.lang)
		}

		this.button.onclick = function() {
			//self.updateCounter(true);
			self.showShareWindow();

			sendMessage('click');

			return false;
		};

		self.updateCounter(false, function() {
			self.setStateAndShowButton();

		});
	}
};