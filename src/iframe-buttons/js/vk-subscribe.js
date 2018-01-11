'use strict';

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
 * Объект кнопки subscribe.
 * Для инициализации кнопки используем метод init, метод init принимает в качестве аргумента
 * объект опций, которые получены с помощую прослушивания postMessage.
 */
var button = {

	_name: 'vk-subscribe',

	_GET_CLIENT_PROXY: 'https://sociallocker.ru/api.php',
	_APP_ID: '<%= pkg.vk.appId %>',
	_ACCESS_TOKEN: '<%= pkg.vk.accessToken %>',

	_getUserInfoRequests: 0,
	_checkWallRequests: 0,

	userId: null,
	rqApiGetgetByIdConfirm: true,
	groupType: true,
	counterBuffer: null,
	widgetUqNumber: null,
	groupInfo: null,

	_defaults: {
		groupId: null,
		layout: 'horizontal',
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

		if( !this.options.groupId ) {
			sendMessage('error', {code: 'vk_group_id_not_found'});
			return;
		}

		setMessageParam('groupId', this.options.groupId);

		if( this.options.groupId.indexOf('@') + 1 ) {
			this.groupType = false;
		}

		this.originalGroupId = this.options.groupId;

		this.cookieCounterCacheName = 'vk_sbtn_cache_' + hash(this.originalGroupId);

		this.userId = getFromStorage('vk_uid');

		if( getFromStorage(this.cookieCounterCacheName) ) {
			this.groupInfo = JSON.parse(getFromStorage(this.cookieCounterCacheName));
			this.counterBuffer = this.groupInfo.member_count;
			this.options.groupId = this.groupInfo.oid;
		}
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
	 * Создает окно подписки на группу или страницу пользователя
	 */
	showSubscribeWindow: function() {
		var self = this;

		var width = 1, height = 1;

		var guid = makeid() + hash(makeid() + (Math.floor((Math.random() * 999999)) + 1)),
			appUrl = '//vk.com/app5927451#' + guid;

		var urlTo = '//oauth.vk.com/authorize?client_id=-1&redirect_uri=' + encodeURIComponent(appUrl) + '&display=widget',
			subscribeUrl = "//vk.com/widget_community.php?act=a_subscribe_box&oid=" + ( self.groupType
					? -self.options.groupId
					: self.options.groupId ) + "&state=1";

		if( window.isUserAuth ) {
			//urlTo = '//vk.com/app5894322';
			urlTo = appUrl;
		}

		if( self.userId ) {
			urlTo = subscribeUrl;
		}

		if( !window.isUserAuth || !self.userId ) {
			width = 550;
			height = 420;
		}

		var winref = window.open(
			urlTo,
			"Sociallocker",
			"width=" + width + ",height=" + height + ",left=" + self.getWindowPositionLeft(550) + ",top=" + self.getWindowPositionTop(420) + ",toolbar=0,location=0,status=0,menubar=0,resizable=yes,scrollbars=yes,status=yes"
		);

		if( !self.userId ) {
			self.getUserInfo(guid, subscribeUrl);
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
							self.checkUserSubscribe();
							return false;
						}

						sendMessage('error', {code: 'unexpected_error'});

					}
				}, 200
			);
			return;
		}

		self.checkSubscribeForMobile();
	},

	checkSubscribeForMobile: function() {
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
				self.checkUserSubscribe(false);
				clearInterval(timer);
				return;
			}

			self.checkUserSubscribe(true, function(response) {
				if( response == 'success' ) {
					clearInterval(timer);
				}
			});

			self._checkWallRequests++;

		}, 2000);
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

			self.checkSubscribeForMobile();
		};

		xhr.onerror = function() {
			var response = this.response;
			response && response.error && console.log("%c[Error]: Ошибка выполнения ajax запроса: " + 'request_status_code_' + this.status, "color: red;");
			sendMessage('error', {code: 'unexpected_error'});
		};

		var concatData = "&action=get_user_info";
		concatData += "&guid=" + encodeURIComponent(guid);
		concatData += "&locker_id=" + encodeURIComponent(self.options.lockerId);
		concatData += "&process_url=" + encodeURIComponent(shareUrl);
		concatData += "&group_id=" + (self.groupType
			? -self.options.groupId
			: self.options.groupId);
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

	/**
	 * Проверяет подписался ли пользователь или нет
	 * @returns void
	 */
	checkUserSubscribe: function(suppressErrors, callback) {
		var self = this;

		if( !self.userId ) {
			throw Error("Не установлен user_id");
		}

		if( !self.groupType ) {
			self.vkApiCall('users.getFollowers', {
				user_id: self.options.groupId,
				offset: 0
			}, function(r) {
				if( !r || (r && !r.response) ) {

					var sendData = {code: 'unexpected_error'};

					console.log("%c[Error]: Ошибка запроса к users.getFollowers", "color: red;");

					if( r && r.error ) {
						sendData['message'] = r.error;
					}

					sendMessage('error', sendData);
					return;

				}

				if( !suppressErrors && r.response.items.indexOf(self.userId) === -1 ) {
					callback && callback('fail');

					sendMessage('notsubscribe', {
						other_info: {
							service: self._name,
							network_user_id: self.userId,
							oauth_client_id: getFromStorage('oauth_client_id')
						}
					});
					return false;
				} else if( suppressErrors && r.response.items.indexOf(self.userId) === -1 ) {
					callback && callback('fail');
					return false;
				}

				callback && callback('success');

				sendMessage('subscribe', {
					other_info: {
						service: self._name,
						network_user_id: self.userId,
						oauth_client_id: getFromStorage('oauth_client_id')
					}
				});

				removeStorage(self.cookieCounterCacheName);
			});
		} else {
			self.vkApiCall('groups.isMember', {
				group_id: self.options.groupId,
				user_id: self.userId
			}, function(r) {

				if( !r || r.error ) {
					var sendData = {code: 'unexpected_error'};

					console.log("%c[Error]: Ошибка запроса к groups.isMember", "color: red;");

					if( r && r.error ) {
						sendData['message'] = r.error;
					}

					sendMessage('error', sendData);
				}

				if( !suppressErrors && !r.response ) {
					callback && callback('fail');

					sendMessage('notsubscribe', {
						userInfo: {
							userId: self.userId
						}
					});
					return false;
				} else if( suppressErrors && !r.response ) {
					callback && callback('fail');
					return false;
				}

				callback && callback('success');

				sendMessage('subscribe', {
					userInfo: {
						userId: self.userId
					}
				});

				removeStorage(self.cookieCounterCacheName);
			});
		}
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
	 * Устанавливает счетчик для кнопки
	 * @return void
	 */
	setGroupCounter: function() {
		var self = this;
		if( this.counterBuffer ) {
			this.buttonCounter.innerText = this.minimalizeLargeNum(this.counterBuffer);
		}

		this.setStateAndShowButton();
	},

	/**
	 * Получает количество пользователей в группе или в подписчиках страницы,
	 * и обновляет значения счетчика
	 * @param callback
	 * @return void
	 */
	updateApiGroupOptions: function(callback) {
		var self = this;

		self.rqApiGetgetByIdConfirm = false;

		if( !this.groupType ) {
			self.vkApiCall('users.get', {
				user_ids: self.options.groupId.replace('@', ''),
				fields: 'followers_count, photo_100'
			}, function(r) {
				self.rqApiGetgetByIdConfirm = true;

				if( r && r.error ) {
					if( r.error.error_code == 113 ) {
						sendMessage('error', {code: 'vk_uid_not_found'});
						return;
					}
				}

				if( (r && r.error) || (!r || r && !r.response) ) {
					var sendData = {code: 'unexpected_error'};

					console.log("%c[Error]: Ошибка запроса к users.get", "color: red;");

					if( r.error && r.error.error_msg ) {
						sendData['message'] = r.error.error_msg;
					}

					sendMessage('error', sendData);
					return;
				}

				self.groupInfo = {
					title: r.response[0].first_name + ' ' + r.response[0].last_name,
					image: r.response[0].photo_100,
					oid: parseInt(r.response[0].uid),
					member_count: parseInt(r.response[0].followers_count)
				};

				self.counterBuffer = parseInt(r.response[0].followers_count);
				self.options.groupId = parseInt(r.response[0].uid);

				setStorage(self.cookieCounterCacheName, JSON.stringify(self.groupInfo), 2);

				self.setGroupCounter();
				callback && callback();
			});
		} else {
			self.vkApiCall('groups.getById', {
				group_id: self.options.groupId,
				fields: 'members_count'
			}, function(r) {
				self.rqApiGetgetByIdConfirm = true;

				if( r && r.error ) {
					if( r.error.error_code == 100 ) {
						sendMessage('error', {code: 'vk_group_id_not_found'});
						return;
					}
				}

				if( (r && r.error) || (!r || r && !r.response) ) {
					var sendData = {code: 'unexpected_error'};

					console.log("%c[Error]: Ошибка запроса к groups.getById", "color: red;");

					if( r.error && r.error.error_msg ) {
						sendData['message'] = r.error.error_msg;
					}

					sendMessage('error', sendData);
					return;
				}

				self.groupInfo = {
					title: r.response[0].name,
					image: r.response[0].photo_medium,
					oid: parseInt(r.response[0].gid),
					member_count: parseInt(r.response[0].members_count)
				};

				self.counterBuffer = parseInt(r.response[0].members_count);
				self.options.groupId = parseInt(r.response[0].gid);

				setStorage(self.cookieCounterCacheName, JSON.stringify(self.groupInfo), 2);

				self.setGroupCounter();
				callback && callback();
			});
		}

		//Автодозвон если первый раз callback не был выполнен
		var timerrqApiGetgetByIdConfirm = setInterval(function() {
			if( !self.rqApiGetgetByIdConfirm ) {
				self.updateApiGroupOptions(callback);
				return false;
			}
			clearInterval(timerrqApiGetgetByIdConfirm);
		}, 3000);
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
		this.buttonCounter = document.getElementById('btn-counter');

		this.button.parentNode.addClass(this.options.layout);

		this.button.getElementsByTagName('span')[0].innerText = i18n('subscribe', self.options.lang);

		this._updateButtonSize();

		this.button.onclick = function() {
			sendMessage('click');
			self.showSubscribeWindow();
			return false;
		};

		if( !getFromStorage(self.cookieCounterCacheName) ) {
			self.updateApiGroupOptions();
			return false;
		}

		self.setGroupCounter();
	}
};