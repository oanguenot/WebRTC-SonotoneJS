var logger = require('sonotone/others/log');

var LOG_ID = 'CAPABILITIES';

var userID = '' + new Date().getTime();
logger.log(LOG_ID, "Default Sonotone ID", userID);

var caps = {};

module.exports = {
	ID: function() {
		return userID;
	},

	setID: function(id) {
		userID = '' + id;
		logger.log(LOG_ID, "New Sonotone ID", userID);
	},

	caps: function() {
		return caps;
	},

	userName: function(userName) {
		if(userName) {
			logger.log(LOG_ID, "Set userName to <" + userName + ">");
			caps.userName = userName;
		}
		return (caps.userName || 'Anonymous');
	}
};