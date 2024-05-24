const {
	SlashCommandBuilder,
	// eslint-disable-next-line no-unused-vars
	ChatInputCommandInteraction,
	EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const i18n = require("../../util/i18n").default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("레벨")
		.setNameLocalizations({
			"en-US": "level",
			ja: "レベル",
		})
		.setDescription("자신 또는 타인의 레벨을 확인합니다.")
		.setDescriptionLocalizations({
			"en-US": "Check Your Level or Anyone's Level",
		})
		.addUserOption((op) =>
			op
				.setName("유저")
				.setNameLocalizations({
					"en-US": "user",
					ja: "ユーザー",
				})
				.setDescription("레벨을 볼 유저입니다.")
				.setDescriptionLocalizations({
					"en-US": "User for Check Level.",
				})
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const locale = interaction.locale;
		let chat = JSON.parse(fs.readFileSync("./data/level.json").toString());
		let guild = chat[interaction.guild.id];
		let user = interaction.user;
		let member = interaction.member;
		const _user = interaction.options.getUser("유저");
		if (_user) {
			if (_user.bot) {
				interaction.reply({
					ephemeral: true,
					content: "봇의 레벨은 확인할 수 없습니다.",
				});
				return;
			}
			user = _user;
			member = interaction.options.getMember("유저");
		}
		if (!guild) guild = { on: "on" };
		if (!guild[user.id]) {
			guild[user.id] = { level: 0, exp: 0 };
			chat[interaction.guild.id] = guild;
		}
		if (!guild.setting) {
			guild.setting = { on: "on" };
			chat[guild.id] = guild;
			fs.writeFileSync("./data/level.json", JSON.stringify(chat));
		}
		if (guild.setting.on == "off") {
			interaction.reply("레벨 기능이 비활성화된 서버입니다.");
			return;
		}
		let x = guild[user.id]["level"];
		const exp = guild[user.id]["exp"];
		const curret = Math.round(7 * x * 1.26 ** (x * 0.5 - 2) + x ** 3 - x ** 2.933104); // prettier-ignore
		const next = Math.round(7 * (x+1) * 1.26 ** ((x+1) * 0.5 - 2) + (x+1) ** 3 - (x+1) ** 2.933104); // prettier-ignore
		let expp = exp - curret;
		const embed = new EmbedBuilder()
			.setTitle(`${member.displayName}${await i18n("s level", locale)}`)
			.addFields(
				{ name: `${await i18n("level", locale)}`, value: `${x}` },
				{
					name: `${await i18n("exp", locale)}`,
					value: `${"<:skyblue_bar:1240162060655001610>".repeat(Math.round((expp / (next - curret)) * 14))}${"<:gray_bar:1240162448032403507>".repeat(Math.round(14 - (expp / (next - curret)) * 14))} ${expp}/${next - curret} (${((expp / (next - curret)) * 100).toFixed(2)}%)`,
				},
				{
					name: `${await i18n("total_exp", locale)}`,
					value: `${"<:skyblue_bar:1240162060655001610>".repeat(Math.round((exp / next) * 14))}${"<:gray_bar:1240162448032403507>".repeat(Math.round(14 - (exp / next) * 14))} ${exp}/${next} (${((exp / next) * 100).toFixed(2)}%)`,
				}
				// { name: "레벨업 필요 경험치", value: `${Math.round(next) - Math.round(curret) - exp}` }
			);
		user = await user.fetch();
		let avatar = user.avatarURL({ size: 4096 });
		// let banner = user.bannerURL({ size: 4096 });
		if (member.avatar) member.avatarURL({ size: 4096 });
		embed.setThumbnail(avatar);
		// embed.setImage(banner);
		interaction.reply({ embeds: [embed] });
	},
};

// 7x * 1.26 ^ (x * 0.5 - 2) + x ^ 3 - x ^ 2.933104
