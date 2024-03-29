function abbreviateNumber(value, lang) {

	if( typeof(i18n) === "undefined" ) {
		throw Error('Функция abbreviateNumber зависит от функции i18n');
	}

	var newValue = value;
	if( value >= 1000 ) {

		var suffixes = ["", "k", "m", "b", "t"];
		var suffixNum = Math.floor(("" + value).length / 3);
		var shortValue = '';
		for( var precision = 2; precision >= 1; precision-- ) {
			shortValue = parseFloat((suffixNum != 0
				? (value / Math.pow(1000, suffixNum) )
				: value).toPrecision(precision));
			var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
			if( dotLessShortValue.length <= 2 ) {
				break;
			}
		}
		if( shortValue % 1 != 0 ) {
			shortNum = shortValue.toFixed(1);
		}

		newValue = shortValue + i18n(suffixes[suffixNum], lang);
	}
	return newValue;
}