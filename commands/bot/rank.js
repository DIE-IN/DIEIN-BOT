const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
} = require("discord.js");

const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("랭킹")
		.setDescription("레벨 랭킹을 확인합니다.")
		.addBooleanOption((op) =>
			op.setName("전체").setDescription("전체 랭킹 여부를 설정합니다.")
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		if (interaction.guild.id == "1095311734199291944") {
			await interaction.reply({
				ephemeral: true,
				content: "랭킹이 비활성화된 서버입니다.",
			});
			if (!interaction.member.permissions.has("Administrator")) {
				return;
			}
		}
		let _chat = JSON.parse(fs.readFileSync("./data/level.json").toString());
		let chat = _chat[interaction.guild.id];
		if (interaction.options.getBoolean("전체")) {
			let all = {};
			for (const i in Object.keys(_chat)) {
				if (Object.keys(_chat)[i] == "undefined") continue;
				let guild = _chat[Object.keys(_chat)[i]];
				for (const ii in Object.keys(guild)) {
					if (all[Object.keys(guild)[ii]]) {
						all[Object.keys(guild)[ii]]["exp"] +=
							guild[Object.keys(guild)[ii]]["exp"];
					} else
						all[Object.keys(guild)[ii]] =
							guild[Object.keys(guild)[ii]];
				}
			}
			chat = all;
			interaction.guild.name = "전체";
		}
		if (chat) {
			const users = Object.keys(chat).map((u) => [chat[u], u]);
			const rank = users.sort((a, b) => b[0].exp - a[0].exp);
			let st = 0;
			let _embed = [];
			for (let u in rank) {
				if (_embed.length >= 5) break;
				u = rank[u];
				if (u[1] == "setting") continue;
				let user = "";
				if (!interaction.options.getBoolean("전체")) {
					user = interaction.guild.members.resolve(u[1]);
				} else {
					user = await interaction.client.users.fetch(u[1]);
				}
				if (!user && !interaction.options.getBoolean("전체")) {
					delete chat[u[1]];
					_chat[interaction.guild.id] = chat;
					fs.writeFileSync(
						"./data/level.json",
						JSON.stringify(_chat)
					);
					continue;
				}
				let x = u[0]["level"];
				const exp = u[0]["exp"];
				while (
					exp >=
					Math.round(7 * (x+1) * 1.26 ** ((x+1) * 0.5 - 2) + (x+1) ** 3 - (x+1) ** 2.933104) // prettier-ignore
				) {
					x += 1;
					chat[user.id]["level"] += 1;
				}
				const next = Math.round(7 * (x+1) * 1.26 ** ((x+1) * 0.5 - 2) + (x+1) ** 3 - (x+1) ** 2.933104); // prettier-ignore
				st += 1;
				_embed.push({
					name: `${st}위`,
					value: `[${user.displayName}](discord://-/users/${user.id})\n레벨 ${u[0]["level"]}\n${"<:skyblue_bar:1240162060655001610>".repeat(Math.round((exp / next) * 18))}${"<:gray_bar:1240162448032403507>".repeat(Math.round(18 - (exp / next) * 18))} ${exp}/${next} (${((exp / next) * 100).toFixed(2)}%)`,
				});
			}
			const embed = new EmbedBuilder()
				.setTitle(`${interaction.guild.name} 레벨 랭킹`)
				.addFields(_embed);
			if (interaction.guild.id == "1095311734199291944") {
				interaction.editReply({ ephemeral: true, embeds: [embed] });
			} else {
				interaction.reply({ embeds: [embed] });
			}
		} else {
			interaction.reply({ ephemeral: true, content: "랭킹이 없습니다." });
		}
	},
};
