var buttonInit = false;

/**
 * Инициализирует работу кнопки при полной загрузке страницы и получении опций
 */
function onloadInit(callback) {

	window.onload = function() {

		function listener(event) {
			if( event.data.indexOf('onpwgt_to') === -1 ) {
				return;
			}

			var data = JSON.parse(event.data);
			if( data.onpwgt_to && data.onpwgt_to.button && data.onpwgt_to.button.name ) {
				if( data.onpwgt_to.button.name === button._name ) {
					if( buttonInit ) {
						return;
					}

					setMessageParam('name', button._name);

					if( callback ) {
						callback(data.onpwgt_to.button);
						return;
					}

					buttonInit = true;
					button.init(data.onpwgt_to.button);
				}
			} else {
				throw new Error('Переданые данные не соотвестуют формату.');
			}
		}

		if( window.addEventListener ) {
			window.addEventListener("message", listener);
		} else {
			// IE8
			window.attachEvent("onmessage", listener);
		}
	};
}