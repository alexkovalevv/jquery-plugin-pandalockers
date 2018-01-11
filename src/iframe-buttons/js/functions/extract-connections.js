if( typeof(setStorage) === "undefined" ) {
	throw new Error('Функция extract_uid_networks зависит от функции setStorage');
}

function extract_uid_networks(connections) {

	if( !connections.length ) {
		return false;
	}

	var prefix = '';

	for( var i = 0; i < connections.length; i++ ) {
		switch( connections[i].network ) {
			case 'facebook':
				prefix = 'fb_';
				break;
			case 'google':
				prefix = 'g_';
				break;
			case 'vk':
				prefix = 'vk_';
				break;
			case 'linkedin':
				prefix = 'ln_';
				break;
			case 'twitter':
				prefix = 'tw_';
				break;
		}
		setStorage(prefix + 'uid', connections[i].network_user_id, 365, true);
	}
}