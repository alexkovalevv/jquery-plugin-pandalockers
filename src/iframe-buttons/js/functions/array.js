function unionArrays( arr1, arr2 ) {
	return arr1.filter(function( element ) {
		return arr2.indexOf(element) !== -1;
	});
}

function diffArrays( a1, a2 ) {

	var a = [], diff = [];

	for( var i = 0; i < a1.length; i++ ) {
		a[a1[i]] = true;
	}

	for( var i = 0; i < a2.length; i++ ) {
		if( a[a2[i]] ) {
			delete a[a2[i]];
		} else {
			a[a2[i]] = true;
		}
	}

	for( var k in a ) {
		diff.push(k);
	}

	return diff;
}