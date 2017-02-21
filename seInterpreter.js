function init() {
	return 	{
		type: "script",
		seleniumVersion: "2",
		formatVersion: 2,
		steps: [],
		data: {
			configs: {},
			source: "none"
		},
		inputs: [],
		timeoutSeconds: 30
	}
}

module.exports = {

	test: init(),

	/**
	Remove the steps loaded in this ETF instance
	**/
	clean: function() {
		this.test.steps = []
	},

	/**
	This function will allow migrating the existing test cases to this framework
	Add the passed steps to the end of the already defined ones
	**/
	_addSteps: function(nextSteps) {
		this.test.steps = this.test.steps.concat(nextSteps)
	},

	SeInterpreterException: function(message) {
		this.message = message;
		this.name = "SE-InterpreterAPI Exception";
	},

	/**
	Used only in constructor to initialize default values
	Not exported for public usage in test creation
	**/
	init: init,

	/**
	Open the passed url (does a get request)
	
	@param url 	URL to open, no validation at this level
	**/
	openURL: function(url) {
		var steps = [{
			type: "get",
			url: url
		}]

		this._addSteps(steps)
		return steps
	},

	/**
	Switch to an iframe inside the page
	This assumes that there exists ONLY 1 iframe
	If multiple iframes need to be used, improve this
	**/
	switchToIframe: function() {
		var steps = [{
	      type: "switchToFrameByIndex",	
	      index: "0"							
	    }]

	    this._addSteps(steps);
	    return steps;
	},

	/**
	Switch to an iframe when working in Safari
	**/
	switchToIframeSAFARI: function() {
		return this.runScript(
			`$("iframe").contents().find("body").click()`
		)
	},

	/**
	Switch to the default execution context of the page (document)
	Example, if you switched to an iframe, use this to go back to the main page
	**/
	switchToDefaultContent: function() {
		var steps = [{
			type: "switchToDefaultContent"
		}]

		this._addSteps(steps);
		return steps;
	},

	/**
	Switch to an specific tab in the selenium browser
	Initial tab is 0, immediate next is 1, and so on

	@param  tab 	Tab ID to switch to
	**/
	switchToBrowserTab: function(tab) {
		// Default, stay in the default tab 0
		tab = this._setDefaultIfNullOrUndefined(tab, "0")

		var steps = [{
			type: "switchToWindowByIndex",
			index: tab
		}]

		this._addSteps(steps)
		return steps
	},

	/**
	Wait until an element is ready

	@param selector 		Selector to identify the element
	@param selectorType 	Type of selector used. Default is "id"
	**/
	waitForElement: function (selector, selectorType) {
		var steps = [{
			type: "waitForElementPresent",		// Wait until element is present
			locator: this._getLocator(selector, selectorType, "You forgot to specify what element to wait for")
		}]

		this._addSteps(steps);
		return steps;
	},

	/**
	Click an element, but wait until it's ready first

	@param selector 		Selector to identify the element
	@param selectorType 	Type of selector used. Default is "id"
	**/
	clickElement: function (selector, selectorType) {
		return [].concat(
			this.waitForElement(selector, selectorType),  		// Wait for the element first, for safety
			this.clickElementNoWait(selector, selectorType) 	// Then click it
		)
	},

	/**
	Click an element, doesn't wait until it's ready

	@param selector 		Selector to identify the element
	@param selectorType 	Type of selector used. Default is "id"
	**/
	clickElementNoWait: function(selector, selectorType) {
		var steps = [{
			type: "clickElement",				// Then, click it
			locator: this._getLocator(selector, selectorType, "You forgot to specify what element to click")
	    }];

		this._addSteps(steps);
		return steps;		
	},

	/**
	Click a non-visible element using jquery, careful here, make sure element does exists

	@param selector 		Selector to identify the element
	**/
	clickHiddenElement: function (selector) {
		return [].concat(
			this.runScript(`$('${selector}').click()`)
		)
	},

	/**
	Set text for an element, wait until it's ready first

	@param selector 		Selector to identify the element
	@param text 			Text to set in the element
	@param selectorType 	Type of selector used. Default is "id"
	**/
	setElementText: function(selector, text, selectorType) {
		return [].concat(
			this.waitForElement(selector, selectorType),  		// Wait for the element first, for safety
			this.setElementTextNoWait(selector, text, selectorType) 	// Then set the text in it
		)
	},

	/**
	Set text for an element, doesn't wait for it

	@param selector 		Selector to identify the element
	@param text 			Text to set in the element
	@param selectorType 	(Optional) Type of selector used. Default is "id"
	**/
	setElementTextNoWait: function(selector, text, selectorType) {
		var steps = [{
			type: "setElementText",
			locator: this._getLocator(selector, selectorType, "You forgot to specify what element to set the text in"),
			text: String(text)
		}]

		this._addSteps(steps)
		return steps
	},

	/**
	Re-creates the pressing of a special key in an element, like spacebar or Enter key
	
	@param selector 		Selector to identify the elemtn
	@param specialKey 		The key to send (in text, for instance spacebar is " ", and Enter is "\n")
	@param selectorType 	(Optional) Type of selector used. Default is "id"
	**/
	pressSpecialKey: function(selector, specialKey, selectorType) {
		var steps = [{
			type: "sendKeysToElement",
			locator: this._getLocator(selector, selectorType, "You forgot to specify what element to set the text in"),
			text: String(specialKey)
		}]

		this._addSteps(steps)
		return steps
	},
	
	/**
	Set a timer

	@param  time 	 Time to wait
	**/
	wait: function(time) {
		time = time || 3;
		time *= 1000
		var steps = [{
			type: "pause",
			waitTime: String(time)
		}]
		this._addSteps(steps)
		return steps
	},

	/**
	Run a script

	@param	script 			The script to run
	**/
	runScript: function(script, variable) {
		variable = variable || "";
		var steps = [{
			type: "storeEval",
			script: script,
			variable: variable
		}]

		this._addSteps(steps);
		return steps;
	},

	/**
	Wait until the passed script returns the expected value

	@param	script 			The script to run
	@param 	expectedValue	Value the script waits for
	**/
	waitForScript: function(script, expectedValue) {
		var steps = [{
			type: "waitForEval",
			script: script,
			value: expectedValue
		}];

		this._addSteps(steps);
		return steps;
	},

	/**
	Assert that a script returns the expected value

	@param	script 			The script to run
	@param 	expectedValue	Value the script waits for
	**/
	assert: function(script, expectedValue) {
		var steps = [{
			type: "assertEval",
			script: `return String(${script})`,
			value: String(expectedValue)
		}];

		this._addSteps(steps);
		return steps;
	},


	/**
	Get a locator object used by SE-Interpreter

	@param selector 		Selector to identify the element
	@param selectorType 	Type of selector used. Default is "id"
	@param errorMsg			Error message to use in case selector is undefined. Default is empty
	**/
	_getLocator: function(selector, selectorType, errorMsg) {
		// If no selector passed, throw error
		if (selector == undefined && !this.unitTestMode) throw new this.SeInterpreterException(errorMsg);

		// Only set a default for selectorType, default: id
		selectorType = this._setDefaultIfNullOrUndefined(selectorType, "id");

		// For test mode
		if (selector == undefined) selector = "test"

		return {
			type: selectorType,
			value: selector
		}
	}
}