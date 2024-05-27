const {
	SlashCommandBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} = require("discord.js");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("administrator")
		.setDescription("administrator permission command")
		.addSubcommand((sc) => sc.setName("eval").setDescription("test"))
		.addSubcommand((sc) =>
			sc
				.setName("find")
				.setDescription("find")
				.addStringOption((op) =>
					op
						.setName("type")
						.setDescription("type for search")
						.addChoices(
							{
								name: "서버",
								value: "guild",
								name_localizations: {
									"en-US": "guild",
									ja: "サーバー",
								},
							},
							{
								name: "채널",
								value: "channel",
								name_localizations: {
									"en-US": "channel",
									ja: "チャンネル",
								},
							},
							{
								name: "유저",
								value: "user",
								name_localizations: {
									"en-US": "user",
									ja: "ユーザー",
								},
							}
						)
						.setRequired(true)
				)
				.addStringOption((op) =>
					op
						.setName("id")
						.setDescription("id for search")
						.setRequired(true)
				)
		)
		.addSubcommand((op) => op.setName("test").setDescription("test")),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.user.id === "596928010200809493") {
			await interaction.reply({
				ephemeral: true,
				content: `관리자가 아닙니다.`,
			});
			return;
		}
		const cmd = interaction.options.getSubcommand();
		if (cmd == "test") {
			let voice = JSON.parse(
				fs.readFileSync("data/point.json").toString()
			);
			let i = 0;
			voice = voice[interaction.guild.id];
			let _voice = Object.keys(voice);
			let rank = _voice.map((u) => {
				let hour = voice[u].voice;
				if (hour >= 3600) {
					hour = `${Math.floor(hour / 3600)}시간 ${Math.floor((hour % 3600) / 60)}분`;
				} else {
					hour = `${hour / 60}분`;
				}
				let r = [u, hour, voice[u].voice];
				i += 1;
				return r;
			});
			const embed = new EmbedBuilder().setTitle("음성채팅 랭킹");
			rank = await Promise.all(
				rank.map(async (u) => {
					let member = await interaction.guild.members
						.fetch(u[0])
						.catch((e) => null);
					if (member && !member.user.bot) {
						u[0] = `[${member.displayName}](discord://-/users/${member.id})`;
						return [
							{
								name: ``,
								value: `${u[0]}\n${u[1]}`,
							},
							u[2],
						];
					} else {
						return null;
					}
				})
			);
			rank = rank.filter(a => a).sort((b, a) => a[1] - b[1]);
			while (rank.length > 5) rank.pop();
			rank = rank.map(u => {
				u[0].name = `${rank.indexOf(u) + 1}위`
				return u[0]
			})
			embed.addFields(rank);
			interaction.reply({ embeds: [embed] });
		}
		if (cmd == "find") {
			const type = interaction.options.getString("type", true);
			const id = interaction.options.getString("id", true);
			let result;
			let name;
			let additional = "";
			let embed = new EmbedBuilder().setTitle(type);
			if (type == "guild") {
				result = await interaction.client.guilds.fetch(id);
				name = result.name;
				embed.setThumbnail(result.iconURL());
			} else if (type == "channel") {
				result = await interaction.client.channels.fetch(id);
				name = result.name;
				additional = `\nGuild: ${result.guild.name} | ${result.guild.id}\nNSFW: ${result.nsfw}`;
			} else if (type == "user") {
				result = await interaction.client.users.fetch(id);
				name = result.displayName;
				embed.setThumbnail(result.avatarURL());
			}
			embed.setDescription(`Name: ${name} | ${result.id}${additional}`);
			interaction.reply({
				embeds: [embed],
			});
			return;
		}
		if (cmd == "eval") {
			const modal = new ModalBuilder()
				.setCustomId("eval")
				.setTitle("eval");
			const codeInput = new TextInputBuilder()
				.setCustomId("code")
				.setLabel("code")
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true)
				.setPlaceholder("code");
			modal.addComponents(
				new ActionRowBuilder().addComponents(codeInput)
			);
			await interaction.showModal(modal);
			return;
		}
	},
};
