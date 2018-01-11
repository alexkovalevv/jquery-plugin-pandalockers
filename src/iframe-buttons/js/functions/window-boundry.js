/**
 * Ишет границу окна слева
 * @returns integer
 */
function findLeftWindowBoundry() {
	// In Internet Explorer window.screenLeft is the window's left boundry
	if( window.screenLeft ) {
		return window.screenLeft;
	}
	// In Firefox window.screenX is the window's left boundry
	if( window.screenX ) {
		return window.screenX;
	}
	return 0;
};

/**
 * Ишет границу окна сверху
 * @returns integer
 */
function findTopWindowBoundry() {
	// In Internet Explorer window.screenLeft is the window's left boundry
	if( window.screenTop ) {
		return window.screenTop;
	}
	// In Firefox window.screenY is the window's left boundry
	if( window.screenY ) {
		return window.screenY;
	}
	return 0;
};
