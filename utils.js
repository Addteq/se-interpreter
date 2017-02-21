var jsonfile = require('jsonfile')

function objectIsEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function setDefaultIfNullOrUndefined(variable, defaultValue) {
	if (variable == null 
		|| variable == undefined
		|| objectIsEmpty(variable))
		return defaultValue;
	else
		return variable;
}

module.exports = {


	/**
	This function will allow migrating the existing test cases to this framework
	Add the passed steps to the end of the already defined ones
	**/
	addSteps: function(nextSteps) {
		this.test.steps = this.test.steps.concat(nextSteps)
	},

	/**
	Return the steps stored in this ETF instance. This will be the test that will run
	**/
	getSteps: function() {
		return this.test.steps
	},

	/**
	Remove the steps loaded in this ETF instance
	**/
	clean: function() {
		this.test.steps = []
	},

	/**
	Check if an object is empty
	http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object

	@param obj 		Object to check
	@return	boolean	True if empty, otherwise false
	**/
	objectIsEmpty: objectIsEmpty,

	/**
	Check if the passed variable is null, undefined, or empty.
	
	@param	variable		Variable to check
	@param	defaultValue	Default value for the passed variable
	@return	Mixed	variable argument if is not null, undefined nor empty. Otherwise, returns default value
	**/
	setDefaultIfNullOrUndefined: setDefaultIfNullOrUndefined,

	/**
	Generate a random number
	
	@return	Mixed	the generated number
	**/
	randomNumber: function() {
		return Math.floor(Math.random() * 100000001) + 1;
	},

	// Get the test ready into a separate json file
	toFile: function(testJson, fileName) {
		fileName = setDefaultIfNullOrUndefined(fileName, 'testingTest.json');
		var data = jsonfile.writeFileSync(fileName, testJson, {spaces: 2});
	},

	SeInterpreterException: function(message) {
		this.message = message;
		this.name = "Excellentable-Testing-Framework Exception";
	}
}