const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
} = require("discord.js");
const { default: i18n } = require("../../util/i18n");
const fs = require('fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("설정")
		.setDescription("봇을 설정합니다.")
		.addSubcommandGroup((scg) =>
			scg
				.setName("레벨")
				.setDescription("레벨 기능 관련 설정입니다.")
				.addSubcommand((sc) =>
					sc
						.setName("활성화")
						.setDescription("레벨 기능의 활성화/비활성화합니다.")
						.addBooleanOption((op) =>
							op
								.setName("여부")
								.setDescription(
									"레벨 기능의 활성화 여부입니다."
								)
								.setRequired(true)
						)
				)
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const locale = interaction.locale;
		const cmd = interaction.options.getSubcommandGroup();
		const scmd = interaction.options.getSubcommand();
		const guild = interaction.guild
		if (cmd == "레벨") {
			let level = JSON.parse(
				fs.readFileSync("./data/level.json").toString()
			);
			if (!level[guild.id]) level[guild.id] = {};
			if (!level[guild.id].setting) {
				level[guild.id].setting = { on: "on" };
			}
			if (scmd == "활성화") {
				if (interaction.member.permissions.has("Administrator")) {
					const bool = interaction.options.getBoolean("여부");
					if (bool) level[guild.id].setting.on = "on";
					else level[guild.id].setting.on = "off";
					interaction.reply(
						`레벨 기능의 활성화 여부를 ${bool}로 설정하였습니다.`
					);
				} else {
					interaction.reply({
						ephemeral: true,
						content: i18n('NotAdmin', locale)
					})
				}
			}
			fs.writeFileSync(
				"./data/level.json",
				JSON.stringify(level, null, 4)
			);
			return;
		}
	},
};
