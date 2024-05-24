const {
	SlashCommandBuilder,
	CommandInteraction,
	EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const { default: i18n } = require("../../util/i18n");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("커스텀역할")
		.setNameLocalizations({
			"en-US": "custom-role",
			ja: "カスタムロール",
		})
		.setDescription("커스텀 역할 관련 명령어입니다.")
		.setDescriptionLocalizations({
			"en-US": "Custom Role Commands.",
			ja: "カスタムロール コマンド.",
		})
		.addSubcommand((subcommand) =>
			subcommand
				.setName("지급")
				.setNameLocalizations({
					"en-US": "give",
					ja: "支給",
				})
				.setDescription("(관리자) 유저에게 커스텀 역할권을 지급합니다.")
				.setDescriptionLocalizations({
					"en-US": "(ADMIN) Custom Role Give to User",
				})
				.addUserOption((option) =>
					option
						.setName("유저")
						.setNameLocalizations({
							"en-US": "user",
						})
						.setDescription("커스텀 역할권을 지급할 유저입니다.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("제거")
				.setNameLocalizations({
					"en-US": "take",
					ja: "除去",
				})
				.setDescription(
					"(관리자) 유저에게서 커스텀 역할권을 제거합니다."
				)
				.setDescriptionLocalizations({
					"en-US": "(ADMIN) Custom Role Take from User",
				})
				.addUserOption((option) =>
					option
						.setName("유저")
						.setNameLocalizations({
							"en-US": "user",
							ja: "ユーザー",
						})
						.setDescription("커스텀 역할권을 제거할 유저입니다.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("설정")
				.setNameLocalizations({
					"en-US": "set",
					ja: "設定",
				})
				.setDescription("커스텀 역할을 생성하거나 수정합니다.")
				.setDescriptionLocalizations({
					"en-US": "(ADMIN) Custom Role Create or Edit",
				})
				.addStringOption((option) =>
					option
						.setName("이름")
						.setNameLocalizations({
							"en-US": "name",
						})
						.setDescription("역할의 이름입니다.")
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("색")
						.setNameLocalizations({
							"en-US": "color",
						})
						.setDescription(
							"역할 색의 헥스 코드(예: #8a2be2)입니다."
						)
				)
				.addAttachmentOption((option) =>
					option
						.setName("아이콘")
						.setDescription("역할의 아이콘입니다.")
				)
				.addBooleanOption((option) =>
					option
						.setName("제거")
						.setDescription("색과 아이콘 제거 여부입니다.")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("확인")
				.setNameLocalizations({
					"en-US": "check",
					ja: "確認",
				})
				.setDescription("자신 또는 타인의 커스텀 역할권을 확인합니다.")
				.addUserOption((option) =>
					option
						.setName("유저")
						.setNameLocalizations({
							"en-US": "user",
							ja: "ユーザー",
						})
						.setDescription("커스텀 역할권을 확인할 유저입니다.")
				)
		),
	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		console.log(interaction)
		const locale = interaction.locale;
		fs.readFile("data/custom_role.json", async (err, data) => {
			let user = interaction.user;
			user.displayName = interaction.member.displayName;
			if (interaction.options.getUser("유저"))
				user = interaction.options.getUser("유저");
			let guild = interaction.guild;
			let role = JSON.parse(data.toString());
			role = role.role;
			if (!role[guild.id]) role[guild.id] = {};
			if (!role[guild.id][user.id]) {
				role[guild.id][user.id] = [];
				role[guild.id][user.id][0] = 0;
				role[guild.id][user.id][1] = "";
				fs.writeFileSync(
					"data/custom_role.json",
					JSON.stringify({ role: role })
				);
			}
			if (interaction.options.getSubcommand() === "지급") {
				if (interaction.member.permissions.has("Administrator")) {
					if (role[guild.id][user.id][0] < 1) {
						role[guild.id][user.id][0] = 1;
						fs.writeFileSync(
							"data/custom_role.json",
							JSON.stringify({ role: role })
						);
						interaction.reply(
							`${user.displayName}님에게 커스텀 역할권을 지급했습니다.`
						);
					} else {
						interaction.reply({
							ephemeral: true,
							content: `${user.displayName}님은 이미 커스텀 역할권을 보유중입니다.`,
						});
					}
				}
			}
			if (interaction.options.getSubcommand() === "제거") {
				if (interaction.member.permissions.has("Administrator")) {
					if (role[guild.id][user.id][0] > 0) {
						role[guild.id][user.id][0] -= 1;
						if (role[guild.id][user.id][1] !== "") {
							let userRole = interaction.guild.roles.cache.get(
								role[guild.id][user.id][1]
							);
							role[guild.id][user.id][1] = "";
							if (userRole) {
								userRole
									.delete()
									.then(() => {
										interaction.reply(
											`${user.displayName}님의 커스텀 역할권과 커스텀 역할을 제거했습니다.\n제거된 역할: ${userRole.name} (${userRole.id})`
										);
									})
									.catch((e) => {
										interaction.reply(
											`${user.displayName}님의 커스텀 역할권을 제거했습니다.\n권한 부족으로 커스텀 역할(<@&${userRole.id}>)을 제거하지 못했습니다.`
										);
									});
							} else {
								interaction.reply(
									`${user.displayName}님의 커스텀 역할권을 제거했습니다.`
								);
							}
						} else {
							interaction.reply(
								`${user.displayName}님의 커스텀 역할권을 제거했습니다.`
							);
						}
						fs.writeFileSync(
							"data/custom_role.json",
							JSON.stringify({ role: role })
						);
					} else {
						interaction.reply({
							ephemeral: true,
							content: `${user.displayName}님은 커스텀 역할권 보유중이 아닙니다.`,
						});
					}
				}
			}
			if (interaction.options.getSubcommand() === "확인") {
				if (role[guild.id][user.id][0] > 0) {
					interaction.reply(
						`${user.displayName}님은 커스텀 역할권 보유중입니다.`
					);
				} else {
					interaction.reply(
						`${user.displayName}님은 커스텀 역할권 보유중이 아닙니다.`
					);
				}
			}
			if (interaction.options.getSubcommand() === "설정") {
				if (role[guild.id][user.id][0] > 0) {
					await interaction.deferReply();
					let name = interaction.options.getString("이름");
					let erase = interaction.options.getBoolean("제거");
					let color = interaction.options.getString("색");
					let icon = interaction.options.getAttachment("아이콘");
					if (icon) icon = icon.url;
					if (color) {
						if (color[0] !== "#" || color.length !== 7) {
							if (color.length === 6) {
								color = "#" + color;
							} else {
								interaction.editReply({
									ephemeral: true,
									content: await i18n("incorrectHex", locale),
								});
								return;
							}
						}
					}
					function _(__, ___) {
						let field = [
							{
								name: "역할",
								value: `<@&${___.id}>`,
							},
							{
								name: "색",
								value: `[${___.hexColor}](https://www.color-hex.com/color/${___.hexColor.replace("#", "")})`,
							},
						];
						if (___.icon)
							field.push({
								name: "아이콘",
								value: ___.iconURL(),
							});
						let embed = new EmbedBuilder()
							.setTitle(__)
							.addFields(field)
							.setThumbnail(icon)
							.setAuthor({
								name: user.displayName,
								iconURL: user.displayAvatarURL(),
							})
							.setColor(color);
						return { embeds: [embed] };
					}
					let set = {
						name: name,
						position: 25,
					};
					if (color) set.color = color;
					if (icon) set.icon = icon;
					if (erase) {
						set.color = "#000000";
						set.icon = undefined;
					}
					if (role[guild.id][user.id][1] === "") {
						interaction.guild.roles
							.create(set)
							.then((role2) => {
								role[guild.id][user.id][1] = role2.id;
								fs.writeFileSync(
									"data/custom_role.json",
									JSON.stringify({ role: role })
								);
								interaction.member.roles.add(role2);
								interaction.editReply(
									_("커스텀 역할 생성 성공!", role2)
								);
								return;
							})
							.catch(async (e) => {
								if (`${e}`.includes("ColorConvert")) {
									interaction.editReply(
										await i18n("incorrectHex", locale)
									);
									return;
								} else {
									interaction.editReply({
										content: `${e}`,
									});
									return;
								}
							});
					} else {
						interaction.guild.roles.cache
							.get(role[guild.id][user.id][1])
							.edit(set)
							.then((role2) => {
								role[guild.id][user.id][1] = role2.id;
								fs.writeFileSync(
									"data/custom_role.json",
									JSON.stringify({ role: role })
								);
								interaction.member.roles.add(role2);
								interaction.editReply(
									_("커스텀 역할 수정 성공!", role2)
								);
								return;
							})
							.catch(async (e) => {
								if (`${e}`.includes("ColorConvert")) {
									interaction.editReply(
										await i18n("incorrectHex", locale)
									);
									return;
								} else {
									interaction.editReply({
										content: `${e}`,
									});
									return;
								}
							});
					}
				} else {
					interaction.reply({
						ephemeral: true,
						content: "커스텀 역할권을 보유하고 있지 않습니다.",
					});
				}
			}
		});
	},
};
