function trackWindow( urlPart, onCloseCallback ) {

	var funcOpen = window.open;
	window.open = function( url, name, params ) {

		var winref = funcOpen(url, name, params);

		if( !url ) return winref;
		if( url.indexOf(urlPart) === -1 ) return winref;

		var pollTimer = setInterval(function() {
			if( !winref || winref.closed !== false ) {
				clearInterval(pollTimer);
				onCloseCallback && onCloseCallback();
			}
		}, 300);

		return winref;
	};
}
