const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('커스텀 역할권 지급')
		.setNameLocalizations({
			'en-US': "Custom Role Give",
			ja: "カスタムロール 支給",
		})
		.setType(ApplicationCommandType.User)
}