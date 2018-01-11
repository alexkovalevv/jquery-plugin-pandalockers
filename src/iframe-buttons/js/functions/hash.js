/**
 * Кодирует строку по алгоритму md5.
 * @return string
 */
function hash(str) {
	var hash = 0;
	if( !str || str.length === 0 ) {
		return hash;
	}
	for( var i = 0; i < str.length; i++ ) {
		var charCode = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + charCode;
		hash = hash & hash;
	}
	hash = hash.toString(16);
	hash = hash.replace("-", "");
	return hash;
}

function makeid()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i = 0; i < 10; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}