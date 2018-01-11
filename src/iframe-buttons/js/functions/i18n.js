function i18n(text, lang) {
	var localization = {
		'ru_RU': [
			['like', 'Мне нравится'],
			['share', 'Поделиться'],
			['subscribe', 'Подписаться'],
			['follow', 'Читать'],
			['tweet', 'Твитнуть'],
			['load', 'Подождите'],
			['next', 'Продолжить'],
			['confirm', 'Продолжить'],
			['k', ' тыс.'],
			['m', ' млн.'],
			['b', ' млрд.']
		]
	};

	if( lang === 'en_EN' || !localization[lang] ) {
		return text;
	}

	for( var i = 0, l = localization[lang].length; i < l; i++ ) {
		if( localization[lang][i][0].toLowerCase() == text.toLowerCase() ) {
			return localization[lang][i][1];
		}
	}

	return text;
}