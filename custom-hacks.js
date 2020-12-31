
// URL Query Hack
document.addEventListener("DOMContentLoaded", function() {
	let [inpUrl, inpUsername, inpToken] = document.querySelectorAll("form label+input")
	let {url: qUrl, username: qUsername, token: qToken} = getJsonFromUrl()

	if (qUrl) hackReactInputValue(inpUrl, qUrl)
	if (qUsername) hackReactInputValue(inpUsername, qUsername)
	if (qToken) hackReactInputValue(inpToken, qToken)

	if (qUrl && qUsername && qToken) {
		setTimeout(function() {
			document.querySelector("form input[type=submit]").click()
		}, 300)
	}

	// From, https://stackoverflow.com/a/8486188
	function getJsonFromUrl(url) {
		if(!url) url = location.search
		var query = url.substr(1)
		var result = {}
		query.split("&").forEach(function(part) {
		var item = part.split("=")
			result[item[0]] = decodeURIComponent(item[1])
		})
		return result
	}

	// From, https://stackoverflow.com/a/59599339
	function hackReactInputValue(input, newValue) {
		let lastValue = input.value
		input.value = newValue
		let event = new Event('input', { bubbles: true })
		// hack React15
		event.simulated = true
		// hack React16
		let tracker = input._valueTracker
		if (tracker) {
			tracker.setValue(lastValue)
		}
		input.dispatchEvent(event)
	}
})

// Markdown Link Parser + Write Text to Clipboard
document.addEventListener("DOMContentLoaded", function() {
	(new MutationObserver(function() {
		let h2 = document.querySelector("h2")
		if (h2 && !h2.matches("[data-observed=true]")) {
			parseMDStyleLinks(h2)
			new MutationObserver(() => parseMDStyleLinks(h2))
				.observe(h2, {subtree: true, childList: true, characterData: true})
			h2.dataset.observed = true
		}
	})).observe(document.body, {subtree: true, childList: true})

	function parseMDStyleLinks(el) {
		if (el.custom_oldInnerHTML == el.innerHTML)
			return; // Nothing changed here

		// Parse Markdown-style links
		el.innerHTML = el.innerHTML.replaceAll(/\[((?:\\\]|[^\]])+)\]\(((?:\\\)|[^\s\)])+)\)/g, function(str, txt, href) {
			let unesc = /\\(?![A-Za-z0-9 ])/g
			let targetAttr = " target=_blank"
			if (href == "#") {
				// Quickly copy text on click via the syntax: `[TEXT TO COPY](#)`
				href = "javascript:navigator.clipboard.writeText(\""
					+ JSON.stringify(txt).slice(1,-1) + "\")"
				targetAttr = ""
			}
			txt = txt.replaceAll(unesc, "")
			href = encodeURI(href.replaceAll(unesc, ""))
			return "<a href=\"" + href + "\"" + targetAttr + ">" + txt + "</a>"
		})

		el.custom_oldInnerHTML = el.innerHTML
	}
})
