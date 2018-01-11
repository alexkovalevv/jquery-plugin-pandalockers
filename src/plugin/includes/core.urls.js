/**
 URI.js v1.18.10 http://medialize.github.io/URI.js/

 * @!obfuscator:false
 * @!preprocess:true
 * @!priority:90
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

/* build contains: punycode.js, SecondLevelDomains.js, URI.js */
/*
 https://mths.be/punycode v1.4.0 by @mathias  URI.js - Mutating URLs
 Second Level Domain (SLD) Support

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

 URI.js - Mutating URLs

 Version: 1.18.10

 Author: Rodney Rehm
 Web: http://medialize.github.io/URI.js/

 Licensed under
   MIT License http://www.opensource.org/licenses/mit-license

*/
(function(r) {
	function t(d) {
		throw new RangeError(J[d]);
	}

	function w(d, e) {
		for( var h = d.length, z = []; h--; ) {
			z[h] = e(d[h]);
		}
		return z
	}

	function m(d, e) {
		var h = d.split("@"), z = "";
		1 < h.length && (z = h[0] + "@", d = h[1]);
		d = d.replace(I, ".");
		h = d.split(".");
		h = w(h, e).join(".");
		return z + h
	}

	function d(d) {
		for( var e = [], h = 0, l = d.length, k, a; h < l; ) {
			k = d.charCodeAt(h++), 55296 <= k && 56319 >= k && h < l
				? (a = d.charCodeAt(h++), 56320 == (a & 64512)
					? e.push(((k & 1023) << 10) + (a & 1023) + 65536)
					: (e.push(k), h--))
				: e.push(k);
		}
		return e
	}

	function v(d) {
		return w(d, function(d) {
			var e =
				"";
			65535 < d && (d -= 65536, e += n(d >>> 10 & 1023 | 55296), d = 56320 | d & 1023);
			return e += n(d)
		}).join("")
	}

	function x(d, e) {
		return d + 22 + 75 * (26 > d) - ((0 != e) << 5)
	}

	function k(d, k, m) {
		var h = 0;
		d = m ? e(d / 700) : d >> 1;
		for( d += e(d / k); 455 < d; h += 36 ) {
			d = e(d / 35);
		}
		return e(h + 36 * d / (d + 38))
	}

	function G(d) {
		var h = [], m = d.length, l = 0, n = 128, a = 72, b, c;
		var g = d.lastIndexOf("-");
		0 > g && (g = 0);
		for( b = 0; b < g; ++b ) {
			128 <= d.charCodeAt(b) && t("not-basic"), h.push(d.charCodeAt(b));
		}
		for( g = 0 < g ? g + 1 : 0; g < m; ) {
			b = l;
			var f = 1;
			for( c = 36; ; c += 36 ) {
				g >= m && t("invalid-input");
				var q = d.charCodeAt(g++);
				q = 10 > q - 48 ? q - 22 : 26 > q - 65 ? q - 65 : 26 > q - 97 ? q - 97 : 36;
				(36 <= q || q > e((2147483647 - l) / f)) && t("overflow");
				l += q * f;
				var D = c <= a ? 1 : c >= a + 26 ? 26 : c - a;
				if( q < D ) {
					break;
				}
				q = 36 - D;
				f > e(2147483647 / q) && t("overflow");
				f *= q
			}
			f = h.length + 1;
			a = k(l - b, f, 0 == b);
			e(l / f) > 2147483647 - n && t("overflow");
			n += e(l / f);
			l %= f;
			h.splice(l++, 0, n)
		}
		return v(h)
	}

	function A(h) {
		var m, r, l, p = [];
		h = d(h);
		var a = h.length;
		var b = 128;
		var c = 0;
		var g = 72;
		for( l = 0; l < a; ++l ) {
			var f = h[l];
			128 > f && p.push(n(f))
		}
		for( (m = r = p.length) && p.push("-"); m < a; ) {
			var q = 2147483647;
			for( l = 0; l < a; ++l ) {
				f = h[l], f >= b &&
				f < q && (q = f);
			}
			var D = m + 1;
			q - b > e((2147483647 - c) / D) && t("overflow");
			c += (q - b) * D;
			b = q;
			for( l = 0; l < a; ++l ) {
				if( f = h[l], f < b && 2147483647 < ++c && t("overflow"), f == b ) {
					var B = c;
					for( q = 36; ; q += 36 ) {
						f = q <= g ? 1 : q >= g + 26 ? 26 : q - g;
						if( B < f ) {
							break;
						}
						var K = B - f;
						B = 36 - f;
						p.push(n(x(f + K % B, 0)));
						B = e(K / B)
					}
					p.push(n(x(B, 0)));
					g = k(c, D, m == r);
					c = 0;
					++m
				}
			}
			++c;
			++b
		}
		return p.join("")
	}

	var E = "object" == typeof exports && exports && !exports.nodeType && exports,
		F = "object" == typeof module && module && !module.nodeType && module, y = "object" == typeof global && global;
	if( y.global === y || y.window ===
		y || y.self === y ) {
		r = y;
	}
	var H = /^xn--/, C = /[^\x20-\x7E]/, I = /[\x2E\u3002\uFF0E\uFF61]/g, J = {
		overflow: "Overflow: input needs wider integers to process",
		"not-basic": "Illegal input >= 0x80 (not a basic code point)",
		"invalid-input": "Invalid input"
	}, e = Math.floor, n = String.fromCharCode, p;
	var u = {
		version: "1.3.2",
		ucs2: {
			decode: d,
			encode: v
		},
		decode: G,
		encode: A,
		toASCII: function(d) {
			return m(d, function(d) {
				return C.test(d) ? "xn--" + A(d) : d
			})
		},
		toUnicode: function(d) {
			return m(d, function(d) {
				return H.test(d) ? G(d.slice(4).toLowerCase()) : d
			})
		}
	};
	if( "function" == typeof define && "object" == typeof define.amd && define.amd ) {
		define("punycode", function() {
			return u
		});
	} else if( E && F ) {
		if( module.exports == E ) {
			F.exports = u;
		} else {
			for( p in
				u ) {
				u.hasOwnProperty(p) && (E[p] = u[p]);
			}
		}
	} else {
		r.punycode = u
	}
})(this);
(function(r, t) {
	"object" === typeof module && module.exports
		? module.exports = t(require("./punycode"), require("./IPv6"), require("./SecondLevelDomains"))
		: "function" === typeof define && define.amd
		? define(["./punycode", "./IPv6", "./SecondLevelDomains"], t)
		: r.URI = t(r.punycode, r.IPv6, r.SecondLevelDomains, r)
})(this, function(r, t, w, m) {
	function d(a, b) {
		var c = 1 <= arguments.length, g = 2 <= arguments.length;
		if( !(this instanceof d) ) {
			return c ? g ? new d(a, b) : new d(a) : new d;
		}
		if( void 0 === a ) {
			if( c ) {
				throw new TypeError("undefined is not a valid argument for URI");
			}
			a = "undefined" !== typeof location ? location.href + "" : ""
		}
		if( null === a && c ) {
			throw new TypeError("null is not a valid argument for URI");
		}
		this.href(a);
		return void 0 !== b ? this.absoluteTo(b) : this
	}

	function v(a) {
		return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")
	}

	function x(a) {
		return void 0 === a ? "Undefined" : String(Object.prototype.toString.call(a)).slice(8, -1)
	}

	function k(a) {
		return "Array" === x(a)
	}

	function G(a, b) {
		var c = {}, d;
		if( "RegExp" === x(b) ) {
			c = null;
		} else if( k(b) ) {
			var f = 0;
			for( d = b.length; f < d; f++ ) {
				c[b[f]] = !0
			}
		} else {
			c[b] =
				!0;
		}
		f = 0;
		for( d = a.length; f < d; f++ ) {
			if( c && void 0 !== c[a[f]] || !c && b.test(a[f]) ) {
				a.splice(f, 1), d--, f--;
			}
		}
		return a
	}

	function A(a, b) {
		var c;
		if( k(b) ) {
			var d = 0;
			for( c = b.length; d < c; d++ ) {
				if( !A(a, b[d]) ) {
					return !1;
				}
			}
			return !0
		}
		var f = x(b);
		d = 0;
		for( c = a.length; d < c; d++ ) {
			if( "RegExp" === f ) {
				if( "string" === typeof a[d] && a[d].match(b) ) {
					return !0
				}
			} else if( a[d] === b ) {
				return !0;
			}
		}
		return !1
	}

	function E(a, b) {
		if( !k(a) || !k(b) || a.length !== b.length ) {
			return !1;
		}
		a.sort();
		b.sort();
		for( var c = 0, d = a.length; c < d; c++ ) {
			if( a[c] !== b[c] ) {
				return !1;
			}
		}
		return !0
	}

	function F(a) {
		return a.replace(/^\/+|\/+$/g,
			"")
	}

	function y(a) {
		return escape(a)
	}

	function H(a) {
		return encodeURIComponent(a).replace(/[!'()*]/g, y).replace(/\*/g, "%2A")
	}

	function C(a) {
		return function(b, c) {
			if( void 0 === b ) {
				return this._parts[a] || "";
			}
			this._parts[a] = b || null;
			this.build(!c);
			return this
		}
	}

	function I(a, b) {
		return function(c, d) {
			if( void 0 === c ) {
				return this._parts[a] || "";
			}
			null !== c && (c += "", c.charAt(0) === b && (c = c.substring(1)));
			this._parts[a] = c;
			this.build(!d);
			return this
		}
	}

	var J = m && m.URI;
	d.version = "1.18.10";
	var e = d.prototype, n = Object.prototype.hasOwnProperty;
	d._parts = function() {
		return {
			protocol: null,
			username: null,
			password: null,
			hostname: null,
			urn: null,
			port: null,
			path: null,
			query: null,
			fragment: null,
			duplicateQueryParameters: d.duplicateQueryParameters,
			escapeQuerySpace: d.escapeQuerySpace
		}
	};
	d.duplicateQueryParameters = !1;
	d.escapeQuerySpace = !0;
	d.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
	d.idn_expression = /[^a-z0-9\.-]/i;
	d.punycode_expression = /(xn--)/i;
	d.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
	d.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
	d.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/ig;
	d.findUri = {
		start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
		end: /[\s\r\n]|$/,
		trim: /[`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019]+$/,
		parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g
	};
	d.defaultPorts = {
		http: "80",
		https: "443",
		ftp: "21",
		gopher: "70",
		ws: "80",
		wss: "443"
	};
	d.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
	d.domAttributes = {
		a: "href",
		blockquote: "cite",
		link: "href",
		base: "href",
		script: "src",
		form: "action",
		img: "src",
		area: "href",
		iframe: "src",
		embed: "src",
		source: "src",
		track: "src",
		input: "src",
		audio: "src",
		video: "src"
	};
	d.getDomAttribute = function(a) {
		if( a && a.nodeName ) {
			var b = a.nodeName.toLowerCase();
			if( "input" !== b || "image" === a.type ) {
				return d.domAttributes[b]
			}
		}
	};
	d.encode = H;
	d.decode = decodeURIComponent;
	d.iso8859 = function() {
		d.encode = escape;
		d.decode =
			unescape
	};
	d.unicode = function() {
		d.encode = H;
		d.decode = decodeURIComponent
	};
	d.characters = {
		pathname: {
			encode: {
				expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
				map: {
					"%24": "$",
					"%26": "&",
					"%2B": "+",
					"%2C": ",",
					"%3B": ";",
					"%3D": "=",
					"%3A": ":",
					"%40": "@"
				}
			},
			decode: {
				expression: /[\/\?#]/g,
				map: {
					"/": "%2F",
					"?": "%3F",
					"#": "%23"
				}
			}
		},
		reserved: {
			encode: {
				expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
				map: {
					"%3A": ":",
					"%2F": "/",
					"%3F": "?",
					"%23": "#",
					"%5B": "[",
					"%5D": "]",
					"%40": "@",
					"%21": "!",
					"%24": "$",
					"%26": "&",
					"%27": "'",
					"%28": "(",
					"%29": ")",
					"%2A": "*",
					"%2B": "+",
					"%2C": ",",
					"%3B": ";",
					"%3D": "="
				}
			}
		},
		urnpath: {
			encode: {
				expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
				map: {
					"%21": "!",
					"%24": "$",
					"%27": "'",
					"%28": "(",
					"%29": ")",
					"%2A": "*",
					"%2B": "+",
					"%2C": ",",
					"%3B": ";",
					"%3D": "=",
					"%40": "@"
				}
			},
			decode: {
				expression: /[\/\?#:]/g,
				map: {
					"/": "%2F",
					"?": "%3F",
					"#": "%23",
					":": "%3A"
				}
			}
		}
	};
	d.encodeQuery = function(a, b) {
		var c = d.encode(a + "");
		void 0 === b && (b = d.escapeQuerySpace);
		return b ? c.replace(/%20/g, "+") : c
	};
	d.decodeQuery = function(a, b) {
		a += "";
		void 0 === b &&
		(b = d.escapeQuerySpace);
		try {
			return d.decode(b ? a.replace(/\+/g, "%20") : a)
		}
		catch( c ) {
			return a
		}
	};
	var p = {
		encode: "encode",
		decode: "decode"
	}, u, h = function(a, b) {
		return function(c) {
			try {
				return d[b](c + "").replace(d.characters[a][b].expression, function(c) {
					return d.characters[a][b].map[c]
				})
			}
			catch( g ) {
				return c
			}
		}
	};
	for( u in p ) {
		d[u + "PathSegment"] = h("pathname", p[u]), d[u + "UrnPathSegment"] = h("urnpath", p[u]);
	}
	p = function(a, b, c) {
		return function(g) {
			var f = c ? function(a) {
				return d[b](d[c](a))
			} : d[b];
			g = (g + "").split(a);
			for(
				var e = 0, h =
					g.length; e < h; e++
			) {
				g[e] = f(g[e]);
			}
			return g.join(a)
		}
	};
	d.decodePath = p("/", "decodePathSegment");
	d.decodeUrnPath = p(":", "decodeUrnPathSegment");
	d.recodePath = p("/", "encodePathSegment", "decode");
	d.recodeUrnPath = p(":", "encodeUrnPathSegment", "decode");
	d.encodeReserved = h("reserved", "encode");
	d.parse = function(a, b) {
		b || (b = {});
		var c = a.indexOf("#");
		-1 < c && (b.fragment = a.substring(c + 1) || null, a = a.substring(0, c));
		c = a.indexOf("?");
		-1 < c && (b.query = a.substring(c + 1) || null, a = a.substring(0, c));
		"//" === a.substring(0, 2)
			? (b.protocol =
				null, a = a.substring(2), a = d.parseAuthority(a, b))
			: (c = a.indexOf(":"), -1 < c && (b.protocol = a.substring(0, c) || null, b.protocol && !b.protocol.match(d.protocol_expression)
			? b.protocol = void 0
			: "//" === a.substring(c + 1, c + 3)
				                                                                          ? (a = a.substring(c + 3), a = d.parseAuthority(a, b))
				                                                                          : (a = a.substring(c + 1), b.urn = !0)));
		b.path = a;
		return b
	};
	d.parseHost = function(a, b) {
		a = a.replace(/\\/g, "/");
		var c = a.indexOf("/");
		-1 === c && (c = a.length);
		if( "[" === a.charAt(0) ) {
			var d = a.indexOf("]");
			b.hostname = a.substring(1, d) || null;
			b.port = a.substring(d + 2, c) || null;
			"/" === b.port && (b.port = null)
		} else {
			var f = a.indexOf(":");
			d = a.indexOf("/");
			f = a.indexOf(":", f + 1);
			-1 !== f && (-1 === d || f < d)
				? (b.hostname = a.substring(0, c) || null, b.port = null)
				: (d = a.substring(0, c).split(":"), b.hostname = d[0] || null, b.port = d[1] || null)
		}
		b.hostname && "/" !== a.substring(c).charAt(0) && (c++, a = "/" + a);
		return a.substring(c) || "/"
	};
	d.parseAuthority = function(a, b) {
		a = d.parseUserinfo(a, b);
		return d.parseHost(a, b)
	};
	d.parseUserinfo = function(a, b) {
		var c = a.indexOf("/"), g = a.lastIndexOf("@", -1 < c ? c : a.length - 1);
		-1 < g && (-1 ===
			c || g < c)
			? (c = a.substring(0, g).split(":"), b.username = c[0]
			? d.decode(c[0])
			: null, c.shift(), b.password = c[0] ? d.decode(c.join(":")) : null, a = a.substring(g + 1))
			: (b.username = null, b.password = null);
		return a
	};
	d.parseQuery = function(a, b) {
		if( !a ) {
			return {};
		}
		a = a.replace(/&+/g, "&").replace(/^\?*&*|&+$/g, "");
		if( !a ) {
			return {};
		}
		for(
			var c = {}, g = a.split("&"), f = g.length, e, h, k = 0; k < f; k++
		) {
			if( e = g[k].split("="), h = d.decodeQuery(e.shift(), b), e = e.length
					? d.decodeQuery(e.join("="), b)
					: null, n.call(c, h) ) {
				if( "string" === typeof c[h] || null === c[h] ) {
					c[h] =
						[c[h]];
				}
				c[h].push(e)
			} else {
				c[h] = e;
			}
		}
		return c
	};
	d.build = function(a) {
		var b = "";
		a.protocol && (b += a.protocol + ":");
		a.urn || !b && !a.hostname || (b += "//");
		b += d.buildAuthority(a) || "";
		"string" === typeof a.path && ("/" !== a.path.charAt(0) && "string" === typeof a.hostname && (b += "/"), b += a.path);
		"string" === typeof a.query && a.query && (b += "?" + a.query);
		"string" === typeof a.fragment && a.fragment && (b += "#" + a.fragment);
		return b
	};
	d.buildHost = function(a) {
		var b = "";
		if( a.hostname ) {
			b = d.ip6_expression.test(a.hostname) ? b + ("[" + a.hostname + "]") : b + a.hostname;
		} else {
			return "";
		}
		a.port && (b += ":" + a.port);
		return b
	};
	d.buildAuthority = function(a) {
		return d.buildUserinfo(a) + d.buildHost(a)
	};
	d.buildUserinfo = function(a) {
		var b = "";
		a.username && (b += d.encode(a.username));
		a.password && (b += ":" + d.encode(a.password));
		b && (b += "@");
		return b
	};
	d.buildQuery = function(a, b, c) {
		var g = "", f, e;
		for( f in a ) {
			if( n.call(a, f) && f ) {
				if( k(a[f]) ) {
					var h = {};
					var m = 0;
					for(
						e = a[f].length; m < e; m++
					) {
						void 0 !== a[f][m] && void 0 === h[a[f][m] + ""] && (g += "&" + d.buildQueryParameter(f, a[f][m], c), !0 !== b && (h[a[f][m] + ""] = !0))
					}
				} else {
					void 0 !==
					a[f] && (g += "&" + d.buildQueryParameter(f, a[f], c));
				}
			}
		}
		return g.substring(1)
	};
	d.buildQueryParameter = function(a, b, c) {
		return d.encodeQuery(a, c) + (null !== b ? "=" + d.encodeQuery(b, c) : "")
	};
	d.addQuery = function(a, b, c) {
		if( "object" === typeof b ) {
			for( var g in
				b ) {
				n.call(b, g) && d.addQuery(a, g, b[g]);
			}
		} else if( "string" === typeof b ) {
			void 0 === a[b]
				? a[b] = c
				: ("string" === typeof a[b] && (a[b] = [a[b]]), k(c) || (c = [c]), a[b] = (a[b] || []).concat(c));
		} else {
			throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
		}
	};
	d.removeQuery =
		function(a, b, c) {
			var g;
			if( k(b) ) {
				for( c = 0, g = b.length; c < g; c++ ) {
					a[b[c]] = void 0;
				}
			} else if( "RegExp" === x(b) ) {
				for( g in
					a ) {
					b.test(g) && (a[g] = void 0);
				}
			} else if( "object" === typeof b ) {
				for( g in
					b ) {
					n.call(b, g) && d.removeQuery(a, g, b[g]);
				}
			} else if( "string" === typeof b ) {
				void 0 !== c
					? "RegExp" === x(c)
					? !k(a[b]) && c.test(a[b])
						  ? a[b] = void 0
						  : a[b] = G(a[b], c)
					: a[b] !== String(c) || k(c) && 1 !== c.length
						  ? k(a[b]) && (a[b] = G(a[b], c))
						  : a[b] = void 0
					: a[b] = void 0;
			} else {
				throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");
			}
		};
	d.hasQuery = function(a, b, c, g) {
		switch( x(b) ) {
			case "String":
				break;
			case "RegExp":
				for( var f in a ) {
					if( n.call(a, f) && b.test(f) && (void 0 === c || d.hasQuery(a, f, c)) ) {
						return !0;
					}
				}
				return !1;
			case "Object":
				for( var e in b ) {
					if( n.call(b, e) && !d.hasQuery(a, e, b[e]) ) {
						return !1;
					}
				}
				return !0;
			default:
				throw new TypeError("URI.hasQuery() accepts a string, regular expression or object as the name parameter");
		}
		switch( x(c) ) {
			case "Undefined":
				return b in a;
			case "Boolean":
				return a = !(k(a[b]) ? !a[b].length : !a[b]), c === a;
			case "Function":
				return !!c(a[b],
					b, a);
			case "Array":
				return k(a[b]) ? (g ? A : E)(a[b], c) : !1;
			case "RegExp":
				return k(a[b]) ? g ? A(a[b], c) : !1 : !(!a[b] || !a[b].match(c));
			case "Number":
				c = String(c);
			case "String":
				return k(a[b]) ? g ? A(a[b], c) : !1 : a[b] === c;
			default:
				throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");
		}
	};
	d.joinPaths = function() {
		for( var a = [], b = [], c = 0, g = 0; g < arguments.length; g++ ) {
			var f = new d(arguments[g]);
			a.push(f);
			for( var f = f.segment(), e = 0; e < f.length; e++ ) {
				"string" === typeof f[e] &&
				b.push(f[e]), f[e] && c++
			}
		}
		if( !b.length || !c ) {
			return new d("");
		}
		b = (new d("")).segment(b);
		"" !== a[0].path() && "/" !== a[0].path().slice(0, 1) || b.path("/" + b.path());
		return b.normalize()
	};
	d.commonPath = function(a, b) {
		var c = Math.min(a.length, b.length), d;
		for( d = 0; d < c; d++ ) {
			if( a.charAt(d) !== b.charAt(d) ) {
				d--;
				break
			}
		}
		if( 1 > d ) {
			return a.charAt(0) === b.charAt(0) && "/" === a.charAt(0) ? "/" : "";
		}
		if( "/" !== a.charAt(d) || "/" !== b.charAt(d) ) {
			d = a.substring(0, d).lastIndexOf("/");
		}
		return a.substring(0, d + 1)
	};
	d.withinString = function(a, b, c) {
		c || (c = {});
		var g = c.start || d.findUri.start, f = c.end || d.findUri.end, e = c.trim || d.findUri.trim,
			h = c.parens || d.findUri.parens, m = /[a-z0-9-]=["']?$/i;
		for( g.lastIndex = 0; ; ) {
			var k = g.exec(a);
			if( !k ) {
				break;
			}
			var l = k.index;
			if( c.ignoreHtml ) {
				var n = a.slice(Math.max(l - 3, 0), l);
				if( n && m.test(n) ) {
					continue
				}
			}
			for( var p = l + a.slice(l).search(f), n = a.slice(l, p), p = -1; ; ) {
				var r = h.exec(n);
				if( !r ) {
					break;
				}
				p = Math.max(p, r.index + r[0].length)
			}
			n = -1 < p ? n.slice(0, p) + n.slice(p).replace(e, "") : n.replace(e, "");
			n.length <= k[0].length || c.ignore && c.ignore.test(n) || (p =
				l + n.length, k = b(n, l, p, a), void 0 === k
				? g.lastIndex = p
				: (k = String(k), a = a.slice(0, l) + k + a.slice(p), g.lastIndex = l + k.length))
		}
		g.lastIndex = 0;
		return a
	};
	d.ensureValidHostname = function(a) {
		if( a.match(d.invalid_hostname_characters) ) {
			if( !r ) {
				throw new TypeError('Hostname "' + a + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
			}
			if( r.toASCII(a).match(d.invalid_hostname_characters) ) {
				throw new TypeError('Hostname "' + a + '" contains characters other than [A-Z0-9.-]');
			}
		}
	};
	d.noConflict = function(a) {
		if( a ) {
			return a =
				{URI: this.noConflict()}, m.URITemplate && "function" === typeof m.URITemplate.noConflict && (a.URITemplate = m.URITemplate.noConflict()), m.IPv6 && "function" === typeof m.IPv6.noConflict && (a.IPv6 = m.IPv6.noConflict()), m.SecondLevelDomains && "function" === typeof m.SecondLevelDomains.noConflict && (a.SecondLevelDomains = m.SecondLevelDomains.noConflict()), a;
		}
		m.URI === this && (m.URI = J);
		return this
	};
	e.build = function(a) {
		if( !0 === a ) {
			this._deferred_build = !0;
		} else if( void 0 === a || this._deferred_build ) {
			this._string = d.build(this._parts),
				this._deferred_build = !1;
		}
		return this
	};
	e.clone = function() {
		return new d(this)
	};
	e.valueOf = e.toString = function() {
		return this.build(!1)._string
	};
	e.protocol = C("protocol");
	e.username = C("username");
	e.password = C("password");
	e.hostname = C("hostname");
	e.port = C("port");
	e.query = I("query", "?");
	e.fragment = I("fragment", "#");
	e.search = function(a, b) {
		var c = this.query(a, b);
		return "string" === typeof c && c.length ? "?" + c : c
	};
	e.hash = function(a, b) {
		var c = this.fragment(a, b);
		return "string" === typeof c && c.length ? "#" + c : c
	};
	e.pathname = function(a,
	                      b) {
		if( void 0 === a || !0 === a ) {
			var c = this._parts.path || (this._parts.hostname ? "/" : "");
			return a ? (this._parts.urn ? d.decodeUrnPath : d.decodePath)(c) : c
		}
		this._parts.path = this._parts.urn ? a ? d.recodeUrnPath(a) : "" : a ? d.recodePath(a) : "/";
		this.build(!b);
		return this
	};
	e.path = e.pathname;
	e.href = function(a, b) {
		var c;
		if( void 0 === a ) {
			return this.toString();
		}
		this._string = "";
		this._parts = d._parts();
		var g = a instanceof d, f = "object" === typeof a && (a.hostname || a.path || a.pathname);
		a.nodeName && (f = d.getDomAttribute(a), a = a[f] || "", f = !1);
		!g &&
		f && void 0 !== a.pathname && (a = a.toString());
		if( "string" === typeof a || a instanceof String ) {
			this._parts = d.parse(String(a), this._parts);
		} else if( g || f ) {
			for( c in
				g = g
					? a._parts
					: a, g ) {
				n.call(this._parts, c) && (this._parts[c] = g[c]);
			}
		} else {
			throw new TypeError("invalid input");
		}
		this.build(!b);
		return this
	};
	e.is = function(a) {
		var b = !1, c = !1, g = !1, f = !1, e = !1, h = !1, k = !1, l = !this._parts.urn;
		this._parts.hostname && (l = !1, c = d.ip4_expression.test(this._parts.hostname), g = d.ip6_expression.test(this._parts.hostname), b = c || g, e = (f = !b) && w && w.has(this._parts.hostname),
			h = f && d.idn_expression.test(this._parts.hostname), k = f && d.punycode_expression.test(this._parts.hostname));
		switch( a.toLowerCase() ) {
			case "relative":
				return l;
			case "absolute":
				return !l;
			case "domain":
			case "name":
				return f;
			case "sld":
				return e;
			case "ip":
				return b;
			case "ip4":
			case "ipv4":
			case "inet4":
				return c;
			case "ip6":
			case "ipv6":
			case "inet6":
				return g;
			case "idn":
				return h;
			case "url":
				return !this._parts.urn;
			case "urn":
				return !!this._parts.urn;
			case "punycode":
				return k
		}
		return null
	};
	var z = e.protocol, L = e.port, l = e.hostname;
	e.protocol = function(a, b) {
		if( void 0 !== a && a && (a = a.replace(/:(\/\/)?$/, ""), !a.match(d.protocol_expression)) ) {
			throw new TypeError('Protocol "' + a + "\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");
		}
		return z.call(this, a, b)
	};
	e.scheme = e.protocol;
	e.port = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 !== a && (0 === a && (a = null), a && (a += "", ":" === a.charAt(0) && (a = a.substring(1)), a.match(/[^0-9]/))) ) {
			throw new TypeError('Port "' + a + '" contains characters other than [0-9]');
		}
		return L.call(this, a, b)
	};
	e.hostname = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 !== a ) {
			var c = {};
			if( "/" !== d.parseHost(a, c) ) {
				throw new TypeError('Hostname "' + a + '" contains characters other than [A-Z0-9.-]');
			}
			a = c.hostname
		}
		return l.call(this, a, b)
	};
	e.origin = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a ) {
			var c = this.protocol();
			return this.authority() ? (c ? c + "://" : "") + this.authority() : ""
		}
		c = d(a);
		this.protocol(c.protocol()).authority(c.authority()).build(!b);
		return this
	};
	e.host = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a ) {
			return this._parts.hostname ? d.buildHost(this._parts) : "";
		}
		if( "/" !== d.parseHost(a, this._parts) ) {
			throw new TypeError('Hostname "' + a + '" contains characters other than [A-Z0-9.-]');
		}
		this.build(!b);
		return this
	};
	e.authority = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a ) {
			return this._parts.hostname ? d.buildAuthority(this._parts) : "";
		}
		if( "/" !== d.parseAuthority(a, this._parts) ) {
			throw new TypeError('Hostname "' +
				a + '" contains characters other than [A-Z0-9.-]');
		}
		this.build(!b);
		return this
	};
	e.userinfo = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a ) {
			var c = d.buildUserinfo(this._parts);
			return c ? c.substring(0, c.length - 1) : c
		}
		"@" !== a[a.length - 1] && (a += "@");
		d.parseUserinfo(a, this._parts);
		this.build(!b);
		return this
	};
	e.resource = function(a, b) {
		if( void 0 === a ) {
			return this.path() + this.search() + this.hash();
		}
		var c = d.parse(a);
		this._parts.path = c.path;
		this._parts.query = c.query;
		this._parts.fragment = c.fragment;
		this.build(!b);
		return this
	};
	e.subdomain = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a ) {
			if( !this._parts.hostname || this.is("IP") ) {
				return "";
			}
			var c = this._parts.hostname.length - this.domain().length - 1;
			return this._parts.hostname.substring(0, c) || ""
		}
		c = this._parts.hostname.length - this.domain().length;
		c = this._parts.hostname.substring(0, c);
		c = new RegExp("^" + v(c));
		a && "." !== a.charAt(a.length - 1) && (a += ".");
		a && d.ensureValidHostname(a);
		this._parts.hostname = this._parts.hostname.replace(c, a);
		this.build(!b);
		return this
	};
	e.domain = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		"boolean" === typeof a && (b = a, a = void 0);
		if( void 0 === a ) {
			if( !this._parts.hostname || this.is("IP") ) {
				return "";
			}
			var c = this._parts.hostname.match(/\./g);
			if( c && 2 > c.length ) {
				return this._parts.hostname;
			}
			c = this._parts.hostname.length - this.tld(b).length - 1;
			c = this._parts.hostname.lastIndexOf(".", c - 1) + 1;
			return this._parts.hostname.substring(c) || ""
		}
		if( !a ) {
			throw new TypeError("cannot set domain empty");
		}
		d.ensureValidHostname(a);
		!this._parts.hostname || this.is("IP")
			? this._parts.hostname = a
			: (c = new RegExp(v(this.domain()) + "$"), this._parts.hostname = this._parts.hostname.replace(c, a));
		this.build(!b);
		return this
	};
	e.tld = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		"boolean" === typeof a && (b = a, a = void 0);
		if( void 0 === a ) {
			if( !this._parts.hostname || this.is("IP") ) {
				return "";
			}
			var c = this._parts.hostname.lastIndexOf("."), c = this._parts.hostname.substring(c + 1);
			return !0 !== b && w && w.list[c.toLowerCase()] ? w.get(this._parts.hostname) || c : c
		}
		if( a ) {
			if( a.match(/[^a-zA-Z0-9-]/) ) {
				if( w &&
					w.is(a) ) {
					c = new RegExp(v(this.tld()) + "$"), this._parts.hostname = this._parts.hostname.replace(c, a);
				} else {
					throw new TypeError('TLD "' + a + '" contains characters other than [A-Z0-9]');
				}
			} else {
				if( !this._parts.hostname || this.is("IP") ) {
					throw new ReferenceError("cannot set TLD on non-domain host");
				}
				c = new RegExp(v(this.tld()) + "$");
				this._parts.hostname = this._parts.hostname.replace(c, a)
			}
		} else {
			throw new TypeError("cannot set TLD empty");
		}
		this.build(!b);
		return this
	};
	e.directory = function(a, b) {
		if( this._parts.urn ) {
			return void 0 ===
			       a ? "" : this;
		}
		if( void 0 === a || !0 === a ) {
			if( !this._parts.path && !this._parts.hostname ) {
				return "";
			}
			if( "/" === this._parts.path ) {
				return "/";
			}
			var c = this._parts.path.length - this.filename().length - 1,
				c = this._parts.path.substring(0, c) || (this._parts.hostname ? "/" : "");
			return a ? d.decodePath(c) : c
		}
		c = this._parts.path.length - this.filename().length;
		c = this._parts.path.substring(0, c);
		c = new RegExp("^" + v(c));
		this.is("relative") || (a || (a = "/"), "/" !== a.charAt(0) && (a = "/" + a));
		a && "/" !== a.charAt(a.length - 1) && (a += "/");
		a = d.recodePath(a);
		this._parts.path =
			this._parts.path.replace(c, a);
		this.build(!b);
		return this
	};
	e.filename = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( "string" !== typeof a ) {
			if( !this._parts.path || "/" === this._parts.path ) {
				return "";
			}
			var c = this._parts.path.lastIndexOf("/"), c = this._parts.path.substring(c + 1);
			return a ? d.decodePathSegment(c) : c
		}
		c = !1;
		"/" === a.charAt(0) && (a = a.substring(1));
		a.match(/\.?\//) && (c = !0);
		var g = new RegExp(v(this.filename()) + "$");
		a = d.recodePath(a);
		this._parts.path = this._parts.path.replace(g, a);
		c ? this.normalizePath(b) : this.build(!b);
		return this
	};
	e.suffix = function(a, b) {
		if( this._parts.urn ) {
			return void 0 === a ? "" : this;
		}
		if( void 0 === a || !0 === a ) {
			if( !this._parts.path || "/" === this._parts.path ) {
				return "";
			}
			var c = this.filename(), g = c.lastIndexOf(".");
			if( -1 === g ) {
				return "";
			}
			c = c.substring(g + 1);
			c = /^[a-z0-9%]+$/i.test(c) ? c : "";
			return a ? d.decodePathSegment(c) : c
		}
		"." === a.charAt(0) && (a = a.substring(1));
		if( c = this.suffix() ) {
			g = a ? new RegExp(v(c) + "$") : new RegExp(v("." + c) + "$");
		} else {
			if( !a ) {
				return this;
			}
			this._parts.path += "." + d.recodePath(a)
		}
		g && (a = d.recodePath(a),
			this._parts.path = this._parts.path.replace(g, a));
		this.build(!b);
		return this
	};
	e.segment = function(a, b, c) {
		var d = this._parts.urn ? ":" : "/", f = this.path(), e = "/" === f.substring(0, 1), f = f.split(d);
		void 0 !== a && "number" !== typeof a && (c = b, b = a, a = void 0);
		if( void 0 !== a && "number" !== typeof a ) {
			throw Error('Bad segment "' + a + '", must be 0-based integer');
		}
		e && f.shift();
		0 > a && (a = Math.max(f.length + a, 0));
		if( void 0 === b ) {
			return void 0 === a ? f : f[a];
		}
		if( null === a || void 0 === f[a] ) {
			if( k(b) ) {
				f = [];
				a = 0;
				for( var h = b.length; a < h; a++ ) {
					if( b[a].length ||
						f.length && f[f.length - 1].length ) {
						f.length && !f[f.length - 1].length && f.pop(), f.push(F(b[a]))
					}
				}
			} else {
				if( b || "string" === typeof b ) {
					b = F(b), "" === f[f.length - 1] ? f[f.length - 1] = b : f.push(b)
				}
			}
		} else {
			b ? f[a] = F(b) : f.splice(a, 1);
		}
		e && f.unshift("");
		return this.path(f.join(d), c)
	};
	e.segmentCoded = function(a, b, c) {
		var e;
		"number" !== typeof a && (c = b, b = a, a = void 0);
		if( void 0 === b ) {
			a = this.segment(a, b, c);
			if( k(a) ) {
				var f = 0;
				for( e = a.length; f < e; f++ ) {
					a[f] = d.decode(a[f])
				}
			} else {
				a = void 0 !== a ? d.decode(a) : void 0;
			}
			return a
		}
		if( k(b) ) {
			for( f = 0, e = b.length; f < e; f++ ) {
				b[f] =
					d.encode(b[f]);
			}
		} else {
			b = "string" === typeof b || b instanceof String ? d.encode(b) : b;
		}
		return this.segment(a, b, c)
	};
	var M = e.query;
	e.query = function(a, b) {
		if( !0 === a ) {
			return d.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
		}
		if( "function" === typeof a ) {
			var c = d.parseQuery(this._parts.query, this._parts.escapeQuerySpace), e = a.call(this, c);
			this._parts.query = d.buildQuery(e || c, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
			this.build(!b);
			return this
		}
		return void 0 !== a && "string" !== typeof a
			? (this._parts.query =
				d.buildQuery(a, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), this.build(!b), this)
			: M.call(this, a, b)
	};
	e.setQuery = function(a, b, c) {
		var e = d.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
		if( "string" === typeof a || a instanceof String ) {
			e[a] = void 0 !== b
				? b
				: null;
		} else if( "object" === typeof a ) {
			for( var f in
				a ) {
				n.call(a, f) && (e[f] = a[f]);
			}
		} else {
			throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
		}
		this._parts.query = d.buildQuery(e, this._parts.duplicateQueryParameters,
			this._parts.escapeQuerySpace);
		"string" !== typeof a && (c = b);
		this.build(!c);
		return this
	};
	e.addQuery = function(a, b, c) {
		var e = d.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
		d.addQuery(e, a, void 0 === b ? null : b);
		this._parts.query = d.buildQuery(e, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
		"string" !== typeof a && (c = b);
		this.build(!c);
		return this
	};
	e.removeQuery = function(a, b, c) {
		var e = d.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
		d.removeQuery(e, a, b);
		this._parts.query =
			d.buildQuery(e, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
		"string" !== typeof a && (c = b);
		this.build(!c);
		return this
	};
	e.hasQuery = function(a, b, c) {
		var e = d.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
		return d.hasQuery(e, a, b, c)
	};
	e.setSearch = e.setQuery;
	e.addSearch = e.addQuery;
	e.removeSearch = e.removeQuery;
	e.hasSearch = e.hasQuery;
	e.normalize = function() {
		return this._parts.urn
			? this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build()
			: this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build()
	};
	e.normalizeProtocol = function(a) {
		"string" === typeof this._parts.protocol && (this._parts.protocol = this._parts.protocol.toLowerCase(), this.build(!a));
		return this
	};
	e.normalizeHostname = function(a) {
		this._parts.hostname && (this.is("IDN") && r
			? this._parts.hostname = r.toASCII(this._parts.hostname)
			: this.is("IPv6") && t && (this._parts.hostname = t.best(this._parts.hostname)), this._parts.hostname = this._parts.hostname.toLowerCase(), this.build(!a));
		return this
	};
	e.normalizePort = function(a) {
		"string" === typeof this._parts.protocol &&
		this._parts.port === d.defaultPorts[this._parts.protocol] && (this._parts.port = null, this.build(!a));
		return this
	};
	e.normalizePath = function(a) {
		var b = this._parts.path;
		if( !b ) {
			return this;
		}
		if( this._parts.urn ) {
			return this._parts.path = d.recodeUrnPath(this._parts.path), this.build(!a), this;
		}
		if( "/" === this._parts.path ) {
			return this;
		}
		var b = d.recodePath(b), c = "";
		if( "/" !== b.charAt(0) ) {
			var e = !0;
			b = "/" + b
		}
		if( "/.." === b.slice(-3) || "/." === b.slice(-2) ) {
			b += "/";
		}
		b = b.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");
		e && (c = b.substring(1).match(/^(\.\.\/)+/) ||
			"") && (c = c[0]);
		for( ; ; ) {
			var f = b.search(/\/\.\.(\/|$)/);
			if( -1 === f ) {
				break;
			} else if( 0 === f ) {
				b = b.substring(3);
				continue
			}
			var h = b.substring(0, f).lastIndexOf("/");
			-1 === h && (h = f);
			b = b.substring(0, h) + b.substring(f + 3)
		}
		e && this.is("relative") && (b = c + b.substring(1));
		this._parts.path = b;
		this.build(!a);
		return this
	};
	e.normalizePathname = e.normalizePath;
	e.normalizeQuery = function(a) {
		"string" === typeof this._parts.query && (this._parts.query.length
			? this.query(d.parseQuery(this._parts.query, this._parts.escapeQuerySpace))
			: this._parts.query =
			                                          null, this.build(!a));
		return this
	};
	e.normalizeFragment = function(a) {
		this._parts.fragment || (this._parts.fragment = null, this.build(!a));
		return this
	};
	e.normalizeSearch = e.normalizeQuery;
	e.normalizeHash = e.normalizeFragment;
	e.iso8859 = function() {
		var a = d.encode, b = d.decode;
		d.encode = escape;
		d.decode = decodeURIComponent;
		try {
			this.normalize()
		}
		finally {
			d.encode = a, d.decode = b
		}
		return this
	};
	e.unicode = function() {
		var a = d.encode, b = d.decode;
		d.encode = H;
		d.decode = unescape;
		try {
			this.normalize()
		}
		finally {
			d.encode = a, d.decode = b
		}
		return this
	};
	e.readable = function() {
		var a = this.clone();
		a.username("").password("").normalize();
		var b = "";
		a._parts.protocol && (b += a._parts.protocol + "://");
		a._parts.hostname && (a.is("punycode") && r
			? (b += r.toUnicode(a._parts.hostname), a._parts.port && (b += ":" + a._parts.port))
			: b += a.host());
		a._parts.hostname && a._parts.path && "/" !== a._parts.path.charAt(0) && (b += "/");
		b += a.path(!0);
		if( a._parts.query ) {
			for( var c = "", e = 0, f = a._parts.query.split("&"), h = f.length; e < h; e++ ) {
				var k = (f[e] || "").split("="),
					c = c + ("&" + d.decodeQuery(k[0], this._parts.escapeQuerySpace).replace(/&/g,
						"%26"));
				void 0 !== k[1] && (c += "=" + d.decodeQuery(k[1], this._parts.escapeQuerySpace).replace(/&/g, "%26"))
			}
			b += "?" + c.substring(1)
		}
		return b += d.decodeQuery(a.hash(), !0)
	};
	e.absoluteTo = function(a) {
		var b = this.clone(), c = ["protocol", "username", "password", "hostname", "port"], e, f;
		if( this._parts.urn ) {
			throw Error("URNs do not have any generally defined hierarchical components");
		}
		a instanceof d || (a = new d(a));
		if( b._parts.protocol ) {
			return b;
		}
		b._parts.protocol = a._parts.protocol;
		if( this._parts.hostname ) {
			return b;
		}
		for( e = 0; f = c[e]; e++ ) {
			b._parts[f] =
				a._parts[f];
		}
		b._parts.path
			? (".." === b._parts.path.substring(-2) && (b._parts.path += "/"), "/" !== b.path().charAt(0) && (c = (c = a.directory())
			? c
			: 0 === a.path().indexOf("/")
				                                                                                                      ? "/"
				                                                                                                      : "", b._parts.path = (c
			? c + "/"
			: "") + b._parts.path, b.normalizePath()))
			: (b._parts.path = a._parts.path, b._parts.query || (b._parts.query = a._parts.query));
		b.build();
		return b
	};
	e.relativeTo = function(a) {
		var b = this.clone().normalize();
		if( b._parts.urn ) {
			throw Error("URNs do not have any generally defined hierarchical components");
		}
		a = (new d(a)).normalize();
		var c =
			b._parts;
		var e = a._parts;
		var f = b.path();
		a = a.path();
		if( "/" !== f.charAt(0) ) {
			throw Error("URI is already relative");
		}
		if( "/" !== a.charAt(0) ) {
			throw Error("Cannot calculate a URI relative to another relative URI");
		}
		c.protocol === e.protocol && (c.protocol = null);
		if( c.username === e.username && c.password === e.password && null === c.protocol && null === c.username && null === c.password && c.hostname === e.hostname && c.port === e.port ) {
			c.hostname = null, c.port = null;
		} else {
			return b.build();
		}
		if( f === a ) {
			return c.path = "", b.build();
		}
		f = d.commonPath(f, a);
		if( !f ) {
			return b.build();
		}
		e = e.path.substring(f.length).replace(/[^\/]*$/, "").replace(/.*?\//g, "../");
		c.path = e + c.path.substring(f.length) || "./";
		return b.build()
	};
	e.equals = function(a) {
		var b = this.clone(), c = new d(a);
		a = {};
		var e;
		b.normalize();
		c.normalize();
		if( b.toString() === c.toString() ) {
			return !0;
		}
		var f = b.query();
		var h = c.query();
		b.query("");
		c.query("");
		if( b.toString() !== c.toString() || f.length !== h.length ) {
			return !1;
		}
		b = d.parseQuery(f, this._parts.escapeQuerySpace);
		h = d.parseQuery(h, this._parts.escapeQuerySpace);
		for( e in b ) {
			if( n.call(b,
					e) ) {
				if( !k(b[e]) ) {
					if( b[e] !== h[e] ) {
						return !1
					}
				} else if( !E(b[e], h[e]) ) {
					return !1;
				}
				a[e] = !0
			}
		}
		for( e in h ) {
			if( n.call(h, e) && !a[e] ) {
				return !1;
			}
		}
		return !0
	};
	e.duplicateQueryParameters = function(a) {
		this._parts.duplicateQueryParameters = !!a;
		return this
	};
	e.escapeQuerySpace = function(a) {
		this._parts.escapeQuerySpace = !!a;
		return this
	};
	return d
});

(function($) {
	'use strict';
	// restores window.URI to its previous state and returns URI
	$.pandalocker.tools.uri = URI.noConflict();
})(__$onp);