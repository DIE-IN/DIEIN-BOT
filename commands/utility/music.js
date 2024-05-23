const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
} = require("discord.js");
const { default: DisTube } = require("distube");
const ytdl = require("ytdl-core");
const fac = require("fast-average-color-node").getAverageColor;
module.exports = {
	data: new SlashCommandBuilder()
		.setName("음악")
		.setNameLocalizations({
			"en-US": "music",
		})
		.setDescription("음악 관련 명령어입니다.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("재생")
				.setDescription("유튜브에서 음악을 검색하고 재생합니다")
				.addStringOption((option) => {
					return option
						.setName("제목")
						.setDescription("검색할 음악의 제목입니다.")
						.setAutocomplete(true)
						.setRequired(true);
				})
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("스킵").setDescription("음악을 스킵합니다.")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("종료").setDescription("장비를 정지합니다.")
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		if (interaction.options.getSubcommand() === "재생") {
			const m = await interaction.deferReply();
			async function play(queue, song) {
				await ytdl
					.getInfo(song.url)
					.then(async (videos) => {
						let video = videos.videoDetails;
						let uploader = video.author;
						function truncateString(
							str = String(),
							numLines = Number()
						) {
							const lines = str.split("\n");
							if (lines.length <= numLines) {
								return str;
							}
							const truncatedLines = lines.slice(0, numLines);
							return truncatedLines.join("\n");
						}
						let color = (
							await fac(song.thumbnail, {
								algorithm: "dominant",
							})
						).hex;
						let embed = new EmbedBuilder()
							.setAuthor({
								name: uploader.name,
								url: uploader.channel_url,
								iconURL: uploader.thumbnails[0].url,
							})
							.setTitle(video.title)
							.setTimestamp(Date.parse(video.uploadDate))
							.setImage(song.thumbnail)
							.setURL(song.url)
							.setFooter({
								text: song.formattedDuration,
							})
							.addFields({
								name: "신청자",
								value: `[${song.member.displayName}](discord://-/users/${song.user.id})`,
							});
						if (video.description)
							embed.setDescription(
								truncateString(
									video.description.replaceAll("\n\n", "\n"),
									5
								) + `\n[...더보기](${song.url})`
							);
						if (color) embed.setColor(color);
						m.edit({ embeds: [embed] });
					})
					.catch((e) => {
						console.log(e);
					});
			}
			function add(queue, song) {
				let embed = new EmbedBuilder().setTitle("Mari Playlist");
				queue.songs.map((song) => {
					embed.addFields({
						name: `[${song.name}](${song.url})`,
						value: `[${song.member.displayName}](discord://-/users/${song.user.id})`,
					});
				});
				m.edit({ embeds: [embed] });
			}
			interaction.client.distube.removeAllListeners("playSong");
			interaction.client.distube.removeAllListeners("addSong");
			interaction.client.distube.addListener("playSong", play);
			interaction.client.distube.addListener("addSong", add);
			interaction.client.distube
				.play(
					interaction.member.voice.channel,
					interaction.options.getString("제목", true),
					{
						member: interaction.member,
						textChannel: interaction.channel,
					}
				)
				.catch((e) => {
					m.edit(String(e));
				});
			return;
		}
		if (interaction.options.getSubcommand() === "스킵") {
			const queue = interaction.client.distube.getQueue(interaction);
			if (!queue)
				return interaction.reply({ ephemeral: true, content: "X" });
			try {
				const song = await queue.skip();
				interaction.reply(
					`<@${interaction.member.id}>님이 스킵하였습니다. ${song.name} 재생합니다.`
				);
				return;
			} catch (e) {
				interaction.reply({ ephemeral: true, content: String(e) });
				return;
			}
		}
		if (interaction.options.getSubcommand() === "종료") {
			const queue = interaction.client.distube.getQueue(interaction);
			if (!queue)
				return interaction.reply({ ephemeral: true, content: "X" });
			queue.stop();
			interaction.reply(
				`<@${interaction.member.id}>님이 장비를 정지하였습니다.`
			);
			return;
		}
	},
};
