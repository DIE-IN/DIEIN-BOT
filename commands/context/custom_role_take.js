const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('커스텀 역할권 제거')
		.setNameLocalizations({
			'en-US': "Custom Role Take",
			ja: "カスタムロール 除去",
		})
		.setType(ApplicationCommandType.User)
}