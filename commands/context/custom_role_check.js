const {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
} = require("discord.js");

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName("커스텀 역할권 확인")
		.setNameLocalizations({
			"en-US": "Custom Role Check",
			ja: "カスタムロール 確認",
		})
		.setType(ApplicationCommandType.User),
};
