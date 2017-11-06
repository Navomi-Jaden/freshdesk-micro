const assert = require('assert');
const authenticateToFreshdesk = require('../../src/hooks/authenticate-to-freshdesk');

describe('\'Authenticate to Freshdesk\' hook', () => {
	it('runs the hook', () => {
		// A mock hook object
		const mock = {};
		// Initialize our hook with no options
		const hook = authenticateToFreshdesk();

		// Run the hook function (which returns a promise)
		// and compare the resulting hook object
		return hook(mock).then(result => {
			assert.equal(result, mock, 'Returns the expected hook object');
		});
	});
});
