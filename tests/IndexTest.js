var Qunit = require('qunit-cli'),
	fs = require('fs'),
	API = require('../seInterpreter.js'),
	APIutils = require('../utils.js')

function arraysAreEqual(array1, array2, print) {
	var areEqual = JSON.stringify(array1) == JSON.stringify(array2)
	if (!areEqual) {
		console.log(array1)
		console.log(array2)
	}
	return areEqual
}


Qunit.module("Basic Operations", {
	// Initialize an ETF object to use
	beforeEach: function() {
		API.unitTestMode = true;
	}
});

Qunit.test("Default test config is initialized and available", function (assert) {
	var isAvailableAndInitialized = 
		(typeof API.test != "undefined") 
		&& !APIutils.objectIsEmpty(API.test);

	assert.equal(isAvailableAndInitialized, true, "Default test is undefined or empty");
})


Qunit.test("Correct handling of default and non-default argument values", function (assert) {
	// Check non-empty argument is returned correctly
	var testArg = "testing12345";
	var defaultValue = 'default67890';

	testArg = APIutils.setDefaultIfNullOrUndefined(testArg, defaultValue);
	assert.strictEqual(testArg, testArg, "Passed argument is returned correctly");


	// Now check that non-passed argument is assigned the default value
	testArg = undefined;
	testArg = APIutils.setDefaultIfNullOrUndefined(testArg, defaultValue);
	assert.strictEqual(testArg, defaultValue, "When not passing an argument, the default value is used");
})


Qunit.test("All steps defined in each function are correctly added to the list of steps to run", function (assert) {
	var allSteps = []

	// Go through all the functions in API
	for (seleniumStepFunction in Object.getPrototypeOf(API)) {

		// Run it and store its output
		var returnedSteps = API[seleniumStepFunction]()

		// Assert they return an array (which should be the array of steps)
		assert.equal(Array.isArray(returnedSteps), true, `Function ${seleniiumStepFunction} did not return an array of steps`)

		// Add the returned steps to all steps
		allSteps = allSteps.concat(returnedSteps)
	}

	// Check that all steps we collected matches the steps stored in API
	assert.equal(allSteps.length, API.test.steps.length, "Collected steps from each function don't match in length the steps stored in ETF")
	assert.ok(arraysAreEqual(allSteps, API.test.steps, "The steps collected and the stored in ETF don't match, they should be the exact same"))
})

Qunit.test("Correctly exporting defined test to a file", function (assert) {
	var fileName = '_testing.json_';
	APIutils.toFile(fileName);

	// This will throw an exception if it doesn't exist
	var threwError = false;
	try {
		fs.accessSync(fileName)
	}
	catch (e) {
		threwError = true;
	}
	// Clean up the file generated
	if (!threwError)
		fs.unlinkSync(fileName)

	assert.equal(threwError, false, "Tried to export test to JSON file but file doesn't exist");
})

// TODO: Add run of se-interpreter as a module (when you figure out how to parallelise it)