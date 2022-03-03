function extractStrings(css) {
	let vars = [];
	css = css.replace(/''|""|'.*?[^\\]'|".*?[^\\]"/g, function(x) {
		return '___' + (vars.push(x) - 1) + '___';
	});

	return { vars, css };
}

function assignStrings(css, vars) {
	return css.replace(/___(\d+)___/g, function(x, id) {
		return vars[id];
	});
}

// ============================================================================

function breakExps(str) {
	return str.split(/,/g).map(x => x.trim());
}

const UNSUPPORTED = { '@document': 1, '@import': 1, '@charset': 1 };

function parseCss(css) {
	css = css
		.replace(/\s*\/\/.*?\n/g, '\n')
		.replace(/\/\*.*?\*\//g, ' ');

	let ctx = [],
		res = { selector: '', rules: [] };

	let re = /\s*(.*?)\s*([;{}])/g, m;
	while (m = re.exec(css)) {
		let m1 = m[1].trim();
		if (!m1) continue;

		if (m[2] == ';') {
			res.rules.push(m[1]);
		}
		else if (m[2] == '{') {
			let at = m1.substring(0, m1.indexOf(' '));
			assert(!UNSUPPORTED[at], at + ' rule is not supported here.');

			let r = at !== '@media'
					? { selector: breakExps(m[1]), rules: [] }
					: { media: breakExps(m[1].substring(6)), rules: [] };
			res.rules.push(r);
			ctx.push(res);
			res = r;
		}
		else res = ctx.pop();
	}

	return res;
}

// ============================================================================

function multExps(e1, e2, join) {
	if (!e1 || !e1.length) return e2;
	if (!e2 || !e2.length) return e1;
	if (!Array.isArray(e1)) e1 = [e1];
	if (!Array.isArray(e2)) e2 = [e2];

	let result = [];
	for (let i=0, s; s=e1[i]; ++i)
		for (let j=0, w; w=e2[j]; ++j)
			result.push(join(s, w));
	return result;
}

function paranthesize(x) {
	if (x.indexOf('not')<0 && (x.indexOf(':')<0 || (x[0]=='(' && x[x.length-1]==')')))
		return x;

	for (let i=0, c=0; x[i]; ++i) {
		if (x[i] === '(') ++c;
		if (!c) return '(' + x + ')';
		if (x[i] === ')') --c;
	}
	return x;
}

function multMediaExps(e1, e2) {
	return multExps(e1, e2, (s, w) => paranthesize(s) + ' and ' + paranthesize(w))
}

function multSelectorExps(e1, e2) {
	return multExps(e1, e2, (s, w) => w.indexOf('&') >= 0 ? w.replace(/\&/g, s) : s + ' ' + w)
}


function flattenRules(rules = [], media = [], selector = []) {
	let results = [],
		rootRules = [];

	for (let i=0, rule; rule=rules[i]; ++i) {
		if (typeof rule === 'string')
			rootRules.push(rule);

		else {
			if (rootRules.length) {
				results.push({ media, selector, rules: rootRules });
				rootRules = [];
			}

			if (rule.media)
				results.push(...flattenRules(rule.rules, multMediaExps(media, rule.media), selector));

			else
				results.push(...flattenRules(rule.rules, media, multSelectorExps(selector, rule.selector)));
		}
	}

	if (rootRules.length)
		results.push({ media, selector, rules: rootRules });
	
	// TODO: merge rules if needed

	return results;
}

// ============================================================================

function stringifyRules(rules) {
	return rules.map(css => {
		let r = css.rules.join(';\n');
		if (css.selector.length)
			r = css.selector.join(',\n') + ' {\n' + r + '\n}';

		if (css.media.length)
			r = '@media ' + css.media.join(',') + ' {\n' + r + '\n}';

		return r;
	})
	.join('\n');
}

// ============================================================================

function compile(input) {
	let { vars, css } = extractStrings(input);
	let parsed = parseCss(css).rules;
	let rules = flattenRules(parsed, [], ['ROOT']);
	// vendorize(rules)
	let result = stringifyRules(rules);
	return assignStrings(result, vars);
}



function createStylesheet(css) {
	let head = document.head || document.getElementsByTagName('head')[0],
		style = document.createElement('style');

	style.type = 'text/css';
	if (style.styleSheet)
		style.styleSheet.cssText = css; // IE
	else
		style.appendChild(document.createTextNode(css));

	head.appendChild(style);
	return style;
}

