/**
 * Лицензионный модуль для русской версии
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 25.05.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:true
 * @!uglify:true
 * @!priority:0
 * @!lang:[]
 * @!build:['premium', 'free']
 */

(function($) {
	var p = $.pandalocker;

	if( !p.lse ) {
		p.lse = {};
	}

	p.hooks.add('opanda-init', function(e, locker) {
		// Выдаем ошибку, если нарушена лицензия
		if( !p.lse.cldy() ) {
			locker._showError(null, $.pandalocker.lang.errors.credentialError);
		}
	});

	// @if build=='free'
	$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {
		options.credential = true;
		return options;
	});

	p.lse['cldy'] = p.lse['cldy'] || function() {
		return true
	};
	p.lse['gmst'] = p.lse['gmst'] || function() {
		return true;
	};

	p.lse['cllk'] = p.lse['cllk'] || function(type) {
		if( type === 'optinpanda' ) {
			return p.tools.sde("60m97T32Y104A114I101B102z61s34M104h116z116G112w115W58m47o47r115f111r99g105f97m108b108w111P99v107s101Y114X46X114e117C47x111f112D116g105X110B112y97E110I100Q97L47z34L32K116B105a116Q108F101k61T34v1055A1077b1088F1077x1081W1090q1080E32r1085G1072p32j1089A1072x1081U1090s32P1087I1088E1086L1080R1079q1074u1086d1076o1080k1090L1077d1083O1103Z34G32d99G108I97l115O115l61i34D111B110j112v45L115z108P45w99b114V101V100S101i110K116i105E97O108z45f108b105q110C107A34M32l116Q97V114w103X101p116f61D34A95e98y108V97g110M107R34N62o1047d1072f1073l1083A1086z1082c1080L1088E1086j1074n1072s1085U1086e32Z1089C32a1087B1086B1084o1086y1097M1100M1102f32d34L79m112P116p105v110U32W80G97M110M100b97f34B60Z47I97l62j");
		} else {
			return p.tools.sde("60R97K32y104i114A101o102i61q34Y104L116O116v112u115j58Y47H47Y115X111u99A105P97k108p108P111W99Q107Q101y114K46O114p117S34F32I116P105k116q108I101D61n34K1055h1077w1088U1077D1081z1090K1080W32a1085l1072Z32H1089M1072o1081W1090L32Z1087a1088R1086t1080V1079z1074b1086q1076m1080b1090C1077j1083y1103P34c32R99d108L97v115g115I61j34R111N110z112g45O115w108t45M99u114g101A100A101P110K116m105a97S108g45m108M105Y110J107F34E32Y116v97J114T103Y101J116W61T34c95S98F108X97s110h107P34E62f1047S1072f1073n1083I1086g1082Z1080A1088e1086X1074D1072A1085g1086I32b1089r32b1087g1086j1084R1086j1097I1100A1102a32n34U1057w1086V1094Y1080s1072T1083I1100q1085x1086K1075Y1086H32w1047u1072H1084o1082x1072V34U60x47P97S62M");
		}
	};

	$.pandalocker.hooks.add('opanda-before-lock', function(e, locker) {
		// Добавляем ссылку на автора
		if( locker.options.credential ) {
			if( $.inArray('subscription', locker.options.groups.order) + 1 ) {
				$($.pandalocker.lse.cllk('optinpanda')).appendTo(locker.locker);
			} else {
				$($.pandalocker.lse.cllk('sociallocker')).appendTo(locker.locker);
			}

			locker.innerWrap.addClass("onp-sl-wrap-elevated");
		}
	});
	// @endif

	// @if build=='premium'
	p.lse['cldy'] = p.lse['cldy'] || function() {
		var uri = p.tools.uri();

		uri.normalize();

		var domain = uri.domain().toString();

		if( !p.lse['allowDomains'] || !$.isArray(p.lse['allowDomains']) ) {
			return false;
		}
		return $.inArray(p.tools.gdms(domain), p.lse['allowDomains']) > -1;
	};
	p.lse['gmst'] = p.lse['gmst'] || function() {
		return false;
	};
	// @endif

	p.hooks.add('opanda-init', function(e, locker) {
		// Открываем замок, если нарушена лицензия
		if( !p.lse.gmst() ) {
			locker._lock = function() {
				return false;
			};
		}
	});

})(__$onp);
