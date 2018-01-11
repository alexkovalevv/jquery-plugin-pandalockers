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
		_name: 'vk-notify',
		_GET_CLIENT_PROXY: '<%= pkg.getClientProxy %>',
		_APP_ID: '<%= pkg.vk.appId %>',
		_ACCESS_TOKEN: '<%= pkg.vk.accessToken %>',

		requestApiProcessed: false,

		_defaults: {
			groupId: null
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

			if( !this.options.groupId ) {
				sendMessage('error', {code: 'vk_group_id_not_found'});
				return;
			}

			setMessageParam('groupId', this.options.groupId);

			this.originalGroupId = this.options.groupId;
			this.cookieCacheName = 'vk_sbtn_cache_' + hash(this.originalGroupId.toString());

			if( getFromStorage(this.cookieCacheName) ) {
				this.groupInfo = JSON.parse(getFromStorage(this.cookieCacheName));
				this.groupId = this.groupInfo.oid;
			}
		},

		_setupEvents: function() {
			var self = this;

			VK.init({
				apiId: this._APP_ID,
				onlyWidgets: true
			});

			VK.Observer.subscribe("widgets.allowMessagesFromCommunity.allowed", function f(userId) {
				sendMessage('subscribe', {
						groupId: self.originalGroupId,
						other_info: {
							service: self._name,
							user_id: userId
						}
					}
				);

				setStorage('vk_uid', userId, 1, true);
			});

			VK.Observer.subscribe("widgets.allowMessagesFromCommunity.denied", function f(userId) {
				sendMessage('unsubscribe', {
						groupId: self.originalGroupId,
						other_info: {
							service: self._name,
							user_id: userId
						}
					}
				);
				setStorage('vk_uid', userId, 1, true);
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
		 * Получает количество пользователей в группе или в подписчиках страницы,
		 * и обновляет значения счетчика
		 * @param callback
		 * @return void
		 */
		updateApiGroupOptions: function(callback) {
			var self = this;

			self.rqApiGetgetByIdConfirm = false;

			self.vkApiCall('groups.getById', {
				group_id: self.originalGroupId,
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

					console.log("%c[Error]: Request to groups.getById failed", "color: red;");

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
				self.groupId = parseInt(r.response[0].gid);

				setStorage(self.cookieCacheName, JSON.stringify(self.groupInfo), 2);

				callback && callback();
			});

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
		 * Создает кнопку и устанавливает события
		 * @private
		 */
		_create: function() {
			var self = this;

			this.contanier = document.getElementById('btn-cotanier');
			this.button = document.getElementById('vk-notify');
			this.buttonLayer = this.button.parentNode.getElementsByClassName('layer')[0];

			if( !getFromStorage(self.cookieCacheName) ) {
				self.updateApiGroupOptions(function() {
					VK.Widgets.AllowMessagesFromCommunity('vk-notify', {height: 22}, self.groupId);
				});
			} else {
				VK.Widgets.AllowMessagesFromCommunity('vk-notify', {height: 22}, self.groupId);
			}

			self.button.addClass('loaded');
			sendMessage('loaded');

			sendMessage('resize', {
				width: 170,
				height: 22
			});

		}
	}
	;