
// URL Query Hack
document.addEventListener("DOMContentLoaded", function() {
	let [inpUrl, inpUsername, inpToken] = document.querySelectorAll("form label+input")
	let {url: qUrl, username: qUsername, token: qToken} = getJsonFromUrl()

	hackReactInputValue(inpUrl, qUrl || "")
	hackReactInputValue(inpUsername, qUsername || "")
	hackReactInputValue(inpToken, qToken || "")

	if (qUrl) {
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
			if (href == "#!") {
				// Quickly copy text on click via the syntax: `[TEXT TO COPY](#!)`
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

// Prevent Rapid Submits -- since it can cause the "git push" to fail, which in
// turn, will cause the page to reload.
document.addEventListener("DOMContentLoaded", function() {
	let confirmBeforeReload = false

	;(new MutationObserver(function() {
		let form = document.querySelectorAll('form')[1]
		if (form && !form.custom_handledRapidSubmits) {
			form.custom_handledRapidSubmits = true

			let inpText = form.querySelector("input[type=text]")
			let inpSubmit = form.querySelector("input[type=submit]")
			if (!inpSubmit) return;

			form.addEventListener('submit', function() {
				if (inpText) inpText.readOnly = true
				inpSubmit.disabled = true

				let oldValue = inpSubmit.value
				inpSubmit.value = "Loading…"

				setTimeout(function() {
					if (inpText) inpText.readOnly = false
					inpSubmit.disabled = false
					inpSubmit.value = oldValue
				}, 2000)

				confirmBeforeReload = true
				setTimeout(function() {
					confirmBeforeReload = false
				}, 5000)
			})
		}
	})).observe(document.body, {subtree: true, childList: true})

	// Confirm before reload
	// -- https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
	window.addEventListener('beforeunload', function (e) {
		if (confirmBeforeReload) {
			// Cancel the event
			e.preventDefault()
			// Chrome requires returnValue to be set
			e.returnValue = ''
		}
	})
})
