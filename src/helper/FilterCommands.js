export default {
	/**
	 *
	 * @param commands
	 * @param { Message } message
	 * @returns {Promise<*>}
	 */
	byPermission: async (commands, message) => {
		// Filter all commands based on the permissions specified and the user's permissions
		return commands.filter((command) => {
			let viable = false;
			if (command["permissions"].length > 0) {
				command["permissions"].forEach((permission) => {
					if (message.member.hasPermission(permission)) {
						viable = true;
					}
				});
			} else {
				viable = true;
			}
			return viable;
		});
	}
};
