const axios = require('axios');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
	return function authenticateToFreshdesk (hook) {
		let app = hook.app;
		
		return new Promise(function(resolve, reject) {
			let strategy = hook.data.strategy || '';
			
			let url = hook.data.url || '';
			let username = hook.data.username || hook.data.email || '';
			let password = hook.data.password || '';
			
			if (strategy !== '' && url !== '') {
				if (strategy === 'local') {
					if (hook.path === 'authentication') {
						if (username !== '' && password !== '') {
							return axios.get(`${url}/api/v2/tickets`, {
								auth: { username, password }
							}).then(res => {
								// If the authentication failed
								if (res.status === 400)
									return reject(res.data);
								
								// If auth passed, return the jwt token back.
								hook.result = app.passport.createJWT({
									url,
									iss: app.passport.options('jwt').jwt.issuer,
									username,
									password
								}, { secret: app.passport.options('jwt').secret });
								
								return resolve(hook);
							});
						}
						
						return reject('Username and password are required.');
					}
					
					return reject('Local is only available on the /authentication path');
				} else if (strategy === 'jwt') {
					let token = (hook.params.headers.authorization || hook.data.access_token || '').replace(/Bearer\s/, '');
					
					// Check if the jwt token is valid.
					return app.passport.verifyJWT(token, { secret: app.passport.options('jwt').secret }).then(res => {
						// If on the authentication path, return the jwt payload back to the user; else, continue to through to the service call.
						if (hook.path === 'authentication')
							hook.result = res;
						else
							hook.params.payload = res;
						
						return resolve(hook);
					}).catch(err => {
						return reject(err);
					});
				}
				
				return reject('Strategy must either be `local` or `jwt`.');
			}
			
			return reject('`url` and `strategy` must be defined.');
		});
	};
};
