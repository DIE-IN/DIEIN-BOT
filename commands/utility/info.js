const {
	SlashCommandBuilder,
	CommandInteraction,
	EmbedBuilder,
} = require("discord.js");
const si = require("systeminformation");
const { wakatimeID, wakatimeSecret } = require("../../secret.json");

function wakatime(api) {
	return `https://api.wakatime.com/api/v1/${api}`;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("정보")
		.setDescription("봇의 정보를 봅니다."),
	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		let msg = await interaction.deferReply();
		const ram = await si.mem();
		const cpu = await si.cpu();
		const graphic = (await si.graphics()).controllers[0];
		//fetch(wakatime);
		let embed = new EmbedBuilder().setTitle("다인봇 정보").addFields(
			{
				inline: true,
				name: "프로그래밍 언어",
				value: "JavaScript",
			},
			{
				inline: true,
				name: "런타임 환경",
				value: "Node.js",
			},
			{
				inline: true,
				name: "업타임",
				value: `${interaction.client.uptime / 1000 / 60}분`,
			},
			{
				inline: true,
				name: "서버 수",
				value: `${interaction.client.guilds.cache.size}개`,
			},
			{
				inline: true,
				name: "사용자 수",
				value: `${interaction.client.users.cache.size}명`,
			},
			{
				inline: true,
				name: "OS",
				value: `${process.platform} ${process.arch}`,
			},
			{
				inline: true,
				name: `GPU`,
				value: `${graphic.model} ${graphic.vram / 1024}GB`,
			},
			{
				inline: true,
				name: `CPU`,
				value: `${cpu.brand} ${cpu.model} ${cpu.speed}GHz`,
			},
			{
				inline: true,
				name: `MEMORY`,
				value: `${Math.floor(ram.used / 1024000)}MB / ${Math.floor(ram.total / 1024000)}MB (${Math.floor((ram.used / ram.total) * 100)}%)`,
			}
		);
		msg.edit({
			embeds: [embed],
		});
	},
};
