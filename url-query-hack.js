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
