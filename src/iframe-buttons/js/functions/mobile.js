/**
 * Возвращает true если пользователь зашел с мобильного усройства.
 * @return boolean
 */
function isMobile() {
	if( (/webOS|iPhone|iPod|BlackBerry/i).test(navigator.userAgent) ) {
		return true;
	}
	if( (/Android/i).test(navigator.userAgent) && (/Mobile/i).test(navigator.userAgent) ) {
		return true;
	}
	return false;
}

/**
 * Returns true if a current user uses a mobile device or tablet device, else false.
 */
function isTabletOrMobile() {
	if( (/webOS|iPhone|iPad|Android|iPod|BlackBerry/i).test(navigator.userAgent) ) {
		return true;
	}
	return false;
}