const {
	Client,
	Collection,
	GatewayIntentBits,
	REST,
	Routes,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ActivityType,
} = require("discord.js");
const Config = require("./secret.json");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DisTube } = require("distube");
const client = new Client({
	intents: Object.keys(GatewayIntentBits).map((a) => {
		return GatewayIntentBits[a];
	}),
	shards: "auto",
});
const iconv = require("iconv-lite");
const charset = require("charset");
const request = require("request");
const path = require("path");
const fs = require("fs");

const SEKAI = require("./commands/record/_pjsekai");
fetch('')
const i18n = require("./util/i18n").default;

const ellia_api =
	"https://projectbt.teamarcstar.com:5528/game/api?service_user_id=1702814964141219840";

async function ellia_refresh() {
	const song = await (
		await fetch(ellia_api, {
			method: "POST",
			body: JSON.stringify({
				Type: "GetSongList",
				Argument: null,
				Id: null,
				timestamp: 0,
			}),
		})
	).json();
	const fumen = await (
		await fetch(ellia_api, {
			method: "POST",
			body: JSON.stringify({
				Type: "GetFumenList",
				Argument: null,
				Id: null,
				timestamp: 0,
			}),
		})
	).json();
	// "Type": "GetRankingData", "Argument": `{"LeaderboardId":"480cde734dae4033af077d9a38dd4361","RecordCount":50,"UserId":"4ea6dd39881d4e1a84c9790ac3bd74f6"}`, "Id": null, "timestamp": 0
	function sort(a, b) {
		a = a.Name.toUpperCase();
		b = b.Name.toUpperCase();
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	}
	song.sort(sort);
	fumen.sort(sort);
	fs.writeFileSync("data/ELLIA/SONG.json", JSON.stringify(song, null, 4));
	fs.writeFileSync("data/ELLIA/FUMEN.json", JSON.stringify(fumen, null, 4));
}
ellia_refresh();
setInterval(ellia_refresh, 86400000);

let distube = new DisTube(client, {
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	plugins: [new YtDlpPlugin()],
	emitNewSongOnly: true,
	leaveOnFinish: true,
	leaveOnStop: true,
	leaveOnEmpty: true,
	emptyCooldown: 0,
});

client.distube = distube;
client.commands = new Collection();

const commands = [];
// eslint-disable-next-line no-undef
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js") && !file.startsWith("_"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		commands.push(command.data.toJSON());
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			if (filePath.includes("context")) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
	}
}

(async () => {
	try {
		const rest = new REST().setToken(
			(Config.MODE === "PROD" && Config.TOKEN) ||
				(Config.MODE === "TEST" && Config.TS_TOKEN)
		);
		await rest.put(
			Routes.applicationCommands(
				(Config.MODE === "PROD" && Config.CLIENT_ID) ||
					(Config.MODE === "TEST" && Config.TS_CLIENT_ID)
			),
			{
				body: commands,
			}
		);
	} catch (error) {
		console.error(error);
	}
})();

let up = 0;

client.on("messageCreate", async (msg) => {
	const guild = msg.guild;
	const channel = msg.channel;
	let member = msg.member;
	let user = msg.author;

	if (
		channel.id === "1229064042426142770" &&
		msg.webhookId === "1230811991359361077"
	) {
		channel.send("</bump:947088344167366698>");
		return;
	}

	if (
		msg.interaction &&
		channel.id === "1231122496904761345" &&
		msg.interaction.commandName === "up" &&
		up === 0
	) {
		setTimeout(() => {
			channel.send(`</up:923517307089727568>`);
			up--;
		}, 3610000);
		up++;
		return;
	}

	if (user.bot || channel.isThread() || channel.id == "1228979122198282322")
		return;
	let point = JSON.parse(fs.readFileSync("./data/point.json").toString());
	if (!point[guild.id]) point[guild.id] = {};
	if (!point[guild.id][member.id])
		point[guild.id][member.id] = { point: 0, chat: 0, voice: 0 };
	// point[guild.id][user.id].point += 0.75;
	point[guild.id][member.id].chat += 1;
	fs.writeFileSync("./data/point.json", JSON.stringify(point, null, 4));
	let chat = JSON.parse(fs.readFileSync("./data/level.json").toString());
	if (!chat[guild.id]) chat[guild.id] = {};
	if (!chat[guild.id].setting) {
		chat[guild.id].setting = { on: "on" };
	}
	if (chat[guild.id].setting.on == "off") return;
	if (!chat[guild.id][user.id])
		chat[guild.id][user.id] = { level: 0, exp: 0 };
	chat[guild.id][user.id]["exp"] += 1;
	const exp = chat[guild.id][user.id]["exp"];
	let x = chat[guild.id][user.id]["level"];
	if (
		exp >=
		Math.round(7 * (x+1) * 1.26 ** ((x+1) * 0.5 - 2) + (x+1) ** 3 - (x+1) ** 2.933104) // prettier-ignore
	) {
		chat[guild.id][user.id]["level"] += 1;
		x += 1;
		const curret = Math.round(7 * x * 1.26 ** (x * 0.5 - 2) + x ** 3 - x ** 2.933104); // prettier-ignore
		const next = Math.round(7 * (x+1) * 1.26 ** ((x+1) * 0.5 - 2) + (x+1) ** 3 - (x+1) ** 2.933104); // prettier-ignore
		let expp = exp - curret;
		const embed = new EmbedBuilder()
			.setTitle(`${msg.member.displayName}님이 레벨업 했습니다!`)
			.addFields(
				{ name: "레벨", value: `${x - 1} -> ${x}` },
				{
					name: "경험치",
					value: `${"<:skyblue_bar:1240162060655001610>".repeat(Math.round((expp / (next - curret)) * 14))}${"<:gray_bar:1240162448032403507>".repeat(Math.round(14 - (expp / (next - curret)) * 14))} ${expp}/${next - curret} (${((expp / (next - curret)) * 100).toFixed(2)}%)`,
				},
				{
					name: "누적 경험치",
					value: `${"<:skyblue_bar:1240162060655001610>".repeat(Math.round((exp / next) * 14))}${"<:gray_bar:1240162448032403507>".repeat(Math.round(14 - (exp / next) * 14))} ${exp}/${next} (${((exp / next) * 100).toFixed(2)}%)`,
				}
				// { name: "레벨업 필요 경험치", value: `${Math.round(next) - Math.round(curret) - exp}` }
			);
		user = await user.fetch();
		let avatar = user.avatarURL({ size: 4096 });
		// let banner = user.bannerURL({ size: 512 });
		if (member.avatar) member.avatarURL({ size: 4096 });
		embed.setThumbnail(avatar);
		// embed.setImage(banner);
		channel.send({ embeds: [embed] });
	}
	fs.writeFileSync("./data/level.json", JSON.stringify(chat, null, 4));
});

client.on("guildCreate", async (guild) => {
	let log = client.channels.cache.get("1241700303083016312");
	await guild.invites
		.fetch()
		.then(async (invite) => {
			let _invite = "";
			if (invite.findKey()) {
				_invite = invite.findKey();
			} else if (invite.lastKey()) {
				_invite = invite.lastKey();
			}
			invite = ` | https://discord.gg/${_invite}`;
			let _ = new EmbedBuilder()
				.setTitle(guild.name)
				.setDescription(
					`Guild: ${guild.name} | [${guild.id}](discord://-/channels/${guild.id}) | ${invite}) | Users: ${guild.memberCount}명`
				)
				.setTimestamp(new Date().getTime());
			log.send({ embeds: [_] });
			return;
		})
		.catch(() => {
			let _ = new EmbedBuilder()
				.setTitle("추가")
				.setDescription(
					`Guild: ${guild.name} | [${guild.id}](discord://-/channels/${guild.id}) | Users: ${guild.memberCount}명`
				)
				.setTimestamp(new Date().getTime());
			log.send({ embeds: [_] });
			return;
		});
});

client.on("guildDelete", async (guild) => {
	let log = client.channels.cache.get("1241700303083016312");
	let _ = new EmbedBuilder()
		.setTitle("제거")
		.setDescription(
			`Guild: ${guild.name} | [${guild.id}](discord://-/channels/${guild.id}) | Users: ${guild.memberCount}명`
		)
		.setTimestamp(new Date().getTime());
	log.send({ embeds: [_] });
	return;
});

client.on("guildMemberAdd", (member) => {
	if (member.guild.id !== "1095311734199291944") return;
	if (!member.user.bot) {
		member.roles.add(member.guild.roles.cache.get("1172496564195962890"));
	} else {
		member.roles.add(member.guild.roles.cache.get("1172496251120517213"));
	}
});

client.on("interactionCreate", async (interaction) => {
	const guild = interaction.guild;
	const channel = interaction.channel;
	const user = interaction.user;
	const locale = interaction.locale;
	if (interaction.isChatInputCommand()) {
		const cmd = interaction.commandName;
		const command = client.commands.get(cmd);
		if (!command) {
			console.error(`No command matching ${cmd} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (e) {
			console.log(e);
			fs.writeFileSync("./data/error.js", String(e));
			interaction.reply({ ephemeral: true, files: ["./data/error.js"] });
		}
		let log = client.channels.cache.get(Config.CHANNEL.LOG);
		await guild.invites
			.fetch()
			.then(async (invite) => {
				invite = invite.firstKey();
				if (invite) {
					invite = ` | https://discord.gg/${invite}`;
				} else {
					invite = "";
				}
				let sc = " ";
				if (interaction.commandName) {
					if (interaction.options.getSubcommand()) {
						sc = sc + interaction.options.getSubcommand();
					}
					let _ = new EmbedBuilder()
						.setTitle(interaction.commandName + sc)
						.setAuthor({
							name: user.displayName,
							iconURL: user.avatarURL(),
						})
						.setDescription(
							`Guild: ${guild.name} | [${guild.id}](discord://-/channels/${guild.id})${invite}\nChannel: ${channel.name} | [${channel.id}](https://canary.discord.com/channels/${guild.id}/${channel.id})\nUser: ${user.displayName} | [${user.id}](discord://-/users/${user.id})`
						)
						.setTimestamp(new Date().getTime());
					let embeds = [_];
					let content = undefined;
					if (interaction.replied) {
						const result = await interaction.channel.messages.fetch(
							{ limit: 1, author: interaction.client.user }
						);
						if (result.embeds[0]) {
							embeds.push(result.embeds[0]);
						}
						if (result.content) {
							content = result.content;
						}
					}
					log.send({ embeds: embeds, content: content });
					return;
				}
			})
			.catch(() => {
				if (interaction.commandName) {
					let _ = new EmbedBuilder()
						.setTitle(interaction.commandName)
						.setAuthor({
							name: user.displayName,
							iconURL: user.avatarURL(),
						})
						.setDescription(
							`Guild: ${guild.name} | [${guild.id}](discord://-/channels/${guild.id})\nChannel: ${channel.name} | [${channel.id}](https://canary.discord.com/channels/${guild.id}/${channel.id})\nUser: ${user.displayName} | [${user.id}](discord://-/users/${user.id})`
						)
						.setTimestamp(new Date().getTime());
					log.send({ embeds: [_] });
					return;
				}
			});
		return;
	}
	if (interaction.isModalSubmit()) {
		if (interaction.customId === "eval") {
			if (Config.ADMIN.includes(user.id)) {
				try {
					let st = new Date().getTime();
					let code = interaction.fields.getTextInputValue("code");
					let ev = eval(code);
					if (String(ev).length <= 1999) {
						await interaction
							.reply(
								`Code\n\`\`\`js\n${code}\n\`\`\`Result\n\`\`\`js\n${String(ev)}\n\`\`\`Runtime: ${String(new Date().getTime() - st)}ms`
							)
							.catch((err) => {
								interaction.reply({
									ephemeral: true,
									content: `\`\`\`js\n${String(err)}\n\`\`\`Runtime: ${String(new Date().getTime() - st)}ms`,
								});
							});
					} else {
						let file = `./data/eval/${new Date().getTime()}.js`;
						fs.writeFile(
							file,
							`// Code\n\n${code}\n\n// Result\n\n${String(ev)}\n\n// Runtime: ${String(new Date().getTime() - st)}ms`,
							() => {
								interaction.reply({ files: [file] });
							}
						);
					}
				} catch (err) {
					let st = new Date().getTime();
					await interaction.reply({
						ephemeral: true,
						content: `\`\`\`js\n${String(err)}\n\`\`\`Runtime: ${String(new Date().getTime() - st)}ms`,
					});
				}
			} else {
				await interaction.reply({
					ephemeral: true,
					content: i18n("NotAdmin", locale),
				});
			}
		} else if (interaction.customId === "qa") {
			let title = interaction.fields.getTextInputValue("title");
			if (!title) {
				title = "문의";
			}
			let embed = new EmbedBuilder()
				.setTitle(title)
				.setAuthor({
					name: user.displayName,
					iconURL: user.avatarURL(),
				})
				.setDescription(interaction.fields.getTextInputValue("desc"))
				.setTimestamp(new Date().getTime())
				.addFields({
					name: `${user.displayName}`,
					value: `[${user.id}](discord://-/users/${user.id})`,
					inline: true,
				});
			console.log(i18n("reply", locale));
			if (user.bannerURL()) embed.setImage(user.bannerURL());
			let chan = client.channels.cache.get(Config.CHANNEL.QA);
			let row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(i18n("reply", locale))
					.setCustomId("qa_reply")
					.setStyle(1)
			);
			chan.send({
				embeds: [embed],
				components: [row],
			}).then(() => {
				let row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel(i18n("edit", locale))
						.setCustomId("qa_edit")
						.setStyle(1)
				);
				interaction.reply({
					ephemeral: true,
					embeds: [embed],
					content:
						"성공적으로 전송되었습니다.\n개발자가 확인 후 답장해드립니다.",
					components: [row],
				});
			});
		}
		return;
	}
	if (interaction.isUserContextMenuCommand()) {
		let guild = interaction.guild;
		let user = interaction.targetUser;
		user.displayName = interaction.member.displayName;
		if (interaction.commandName.startsWith("커스텀 역할권 ")) {
			fs.readFile("data/custom.json", (err, data) => {
				let cmd = interaction.commandName.replace("커스텀 역할권 ", "");
				let role = JSON.parse(data.toString());
				role = role.role;
				if (!role[guild.id]) role[guild.id] = {};
				if (!role[guild.id][user.id]) {
					role[guild.id][user.id] = [];
					role[guild.id][user.id][0] = 0;
					role[guild.id][user.id][1] = "";
					fs.writeFileSync(
						"data/custom.json",
						JSON.stringify({ role: role }, null, 4)
					);
				}
				if (cmd === "확인") {
					if (role[guild.id][user.id][0] > 0) {
						interaction.reply({
							content: `${user.displayName}${i18n("hasCustomRole", locale)}`,
							ephemeral: true,
						});
					} else {
						interaction.reply({
							content: `${user.displayName}${i18n("notCustomRole", locale)}`,
							ephemeral: true,
						});
					}
					return;
				} else if (cmd === "지급") {
					if (interaction.member.permissions.has("ADMINISTRATOR")) {
						if (role[guild.id][user.id][0] < 1) {
							role[guild.id][user.id][0] += 1;
							fs.writeFileSync(
								"data/custom.json",
								JSON.stringify({ role: role }, null, 4)
							);
							interaction.reply({
								content: `${user.displayName}님에게 커스텀 역할권을 지급했습니다.`,
								ephemeral: true,
							});
						} else {
							interaction.reply({
								ephemeral: true,
								content: `${user.displayName}님은 이미 커스텀 역할권을 보유중입니다.`,
							});
						}
					}
					return;
				} else if (cmd === "제거") {
					if (interaction.member.permissions.has("ADMINISTRATOR")) {
						if (role[guild.id][user.id][0] > 0) {
							role[guild.id][user.id][0] -= 1;
							if (role[guild.id][user.id][1] !== "") {
								let userRole =
									interaction.guild.roles.cache.get(
										role[guild.id][user.id][1]
									);
								role[guild.id][user.id][1] = "";
								if (userRole) {
									userRole
										.delete()
										.then(() => {
											interaction.reply({
												content: `${user.displayName}님의 커스텀 역할권과 커스텀 역할을 제거했습니다.\n제거된 역할: ${userRole.name} (${userRole.id})`,
												ephemeral: true,
											});
										})
										.catch(() => {
											interaction.reply({
												content: `${user.displayName}님의 커스텀 역할권을 제거했습니다.\n권한 부족으로 커스텀 역할(<@&${userRole.id}>)을 제거하지 못했습니다.`,
												ephemeral: true,
											});
										});
								} else {
									interaction.reply({
										content: `${user.displayName}님의 커스텀 역할권을 제거했습니다.`,
										ephemeral: true,
									});
								}
							} else {
								interaction.reply({
									content: `${user.displayName}님의 커스텀 역할권을 제거했습니다.`,
									ephemeral: true,
								});
							}
							fs.writeFileSync(
								"data/custom.json",
								JSON.stringify({ role: role }, null, 4)
							);
						} else {
							interaction.reply({
								ephemeral: true,
								content: `${user.displayName}${i18n("notCustomRole", locale)}`,
							});
						}
					}
					return;
				}
			});
		}
		return;
	}
	if (interaction.isAutocomplete()) {
		if (interaction.commandName === "음악") {
			let string = encodeURI(interaction.options.getString("제목", true));
			if (string.length >= 1) {
				request.get(
					{
						uri: `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&ds=yt&hl=ko&gl=kr&q=${string}}`,
						encoding: null,
					},
					(err, res, body) => {
						if (err) console.log(err);
						const enc = charset(res.headers, body); // 해당 사이트의 charset값을 획득
						const i_result = iconv.decode(body, enc); // 획득한 charset값으로 body를 디코딩
						try {
							const arr = JSON.parse(
								i_result.substring(
									i_result.indexOf("["),
									i_result.indexOf("])") + 1
								)
							);
							interaction.respond(
								arr[1].map((a) => ({ name: a[0], value: a[0] }))
							);
						} catch (e) {
							console.log(e);
						}
					}
				);
			}
			return;
		}
		if (interaction.commandName === "ellia") {
			if (interaction.options.getSubcommand(true) === "악곡") {
				let name = interaction.options.getString("이름", true);
				fs.readFile("data/ELLIA/SONG.json", async (err, data) => {
					/**
					 * @type {Array} song
					 */
					let song = JSON.parse(data.toString());
					if (name.length >= 1) {
						interaction.respond(
							song
								.filter((s) => s.Name.includes(name))
								.map((s) => ({ name: s.Name, value: s.Name }))
						);
					} else {
						while (song.length > 25) {
							song.pop();
						}
						interaction.respond(
							song.map((s) => ({ name: s.Name, value: s.Name }))
						);
					}
				});
				return;
			}
			return;
		}
		if (interaction.commandName === "프로세카") {
			let scmd = interaction.options.getSubcommand();
			class CMD {
				constructor(data) {
					this.data = data;
				}

				get Character() {
					return ["이름", this.data[0], this.data[1]];
				}

				get Music() {
					return ["악곡", this.data[0], this.data[1]];
				}
			}
			const Type = {};
			Type[SEKAI.diff.gameCharacters] = "Character";
			Type[SEKAI.diff.musics] = "Music";
			let _ = new CMD();
			function dating(cmd, data) {
				if (data == "down") {
					interaction.reply(i18n("downloading", locale));
					return;
				}
				let _data = data;
				_.data = _data;
				cmd = Type[cmd];
				let str = interaction.options.getNumber(_[cmd][0]);
				if (str.length >= 1) {
					interaction.respond(
						_data
							.filter((s) => {
								_.data = s;
								return _[cmd][1].includes(str);
							})
							.map((s) => {
								_.data = s;
								return { name: _[cmd][1], value: _[cmd][2] };
							})
					);
				} else {
					while (data.length > 25) {
						data.pop();
					}
					interaction.respond(
						data.map((s) => {
							_.data = s;
							return { name: _[cmd][1], value: _[cmd][2] };
						})
					);
				}
			}
			if (scmd === "캐릭터") {
				let characters = SEKAI.characters.ko;
				if (SEKAI.characters[locale])
					characters = SEKAI.characters[locale];
				dating(SEKAI.diff.gameCharacters, characters);
				return;
			}
			if (scmd == "악곡") {
				let musics = SEKAI.load(
					SEKAI.diff.musics,
					new SEKAI.Lang(locale).region
				);
				if (musics == "down") {
					interaction.respond([
						{
							name: i18n("downloading", locale),
							value: "Tell Your World",
						},
					]);
					return;
				}
				let str = interaction.options.getString("이름");
				if (str.length >= 1) {
					musics = musics
						.filter((s) => {
							let name = s.title;
							let composer = s.composer;
							let s_name = "";
							if (s.infos) s_name = s.infos[0].title;
							return (
								name.includes(str) ||
								s_name.includes(str) ||
								composer.includes(str)
							);
						})
						.map((s) => {
							return {
								name: `${s.infos ? `${s.infos[0].composer}${s.infos[0].composer != s.composer ? ` (${s.composer})` : ""}` : s.composer} - ${s.infos ? `${s.infos[0].title}${s.infos[0].title != s.title ? ` (${s.title})` : ""}` : s.title}`,
								value: s.title,
							};
						});
					while (musics.length > 25) {
						musics.pop();
					}
					interaction.respond(musics);
				} else {
					while (musics.length > 25) {
						musics.pop();
					}
					interaction.respond(
						musics.map((s) => {
							return {
								name: `${s.infos ? `${s.infos[0].composer}${s.infos[0].composer != s.composer ? ` (${s.composer})` : ""}` : s.composer} - ${s.infos ? `${s.infos[0].title}${s.infos[0].title != s.title ? ` (${s.title})` : ""}` : s.title}`,
								value: s.title,
							};
						})
					);
				}
			}
		}
		return;
	}

	if (interaction.isButton()) {
		if (
			interaction.customId == "prev" ||
			interaction.customId == "next" ||
			interaction.customId == "train"
		) {
			const embeds = JSON.parse(
				fs.readFileSync("data/pjsekai/charEmbed.json").toString()
			);
			const Id = interaction.message.interaction.id;
			if (embeds[Id]) {
				let page =
					interaction.customId == "prev"
						? embeds[Id].current - 1
						: interaction.customId == "next"
							? embeds[Id].current + 1
							: embeds[Id].current;
				if (page < 1) {
					page = embeds[Id].max;
				} else if (page > embeds[Id].max) {
					page = 1;
				}
				embeds[Id].current = page;
				fs.writeFileSync(
					"data/pjsekai/charEmbed.json",
					JSON.stringify(embeds, null, 4)
				);
				const Character = embeds[Id].Character;
				if (
					(Character.givenName == "사키" ||
						Character.givenName == "Saki" ||
						Character.givenName == "咲希" ||
						Character.givenName == "미즈키" ||
						Character.givenName == "Mizuki" ||
						Character.givenName == "瑞希") &&
					embeds[Id].current > 3
				) {
					page += 1;
				}
				const thumbnail = new SEKAI.Image({
					character: Character,
					card: page,
					type:
						interaction.customId == "train"
							? SEKAI.type.training
							: SEKAI.type.normal,
					ImageType: "standing",
				}).body;
				const image = new SEKAI.Image({
					character: Character,
					card: page,
					type:
						interaction.customId == "train"
							? SEKAI.type.training
							: SEKAI.type.normal,
					ImageType: "image",
				}).body;
				const cards = SEKAI.load(SEKAI.diff.cards, Character.lang);
				let prefix = "";
				if (cards) {
					const Card = cards.find(
						(c) =>
							c.assetbundleName ==
							`${image.character}_${image.card}`
					);
					if (Card) {
						prefix = `${":star:".repeat(Number(Card.cardRarityType.replace("rarity_", "")))} ${Card.prefix} `;
					}
				}
				let embed = interaction.message.embeds[0];
				embed.data.description = prefix + Character.fullName;
				embed.data.thumbnail.url = SEKAI.replace(
					SEKAI.API.assets,
					thumbnail
				);
				embed.data.image.url = SEKAI.replace(SEKAI.API.assets, image);
				embed.data.footer.text = `${embeds[Id].current}/${embeds[Id].max}`;
				if (Character.breast) {
					embed.fields[embed.fields.length - 1] = {
						inline: true,
						name: i18n("BreastSize", locale),
						value: Character.breast,
					};
				}
				let component = interaction.message.components[0];
				if (prefix.split(":star:").length > 3) {
					component.components[1].data.disabled = false;
				} else {
					component.components[1].data.disabled = true;
				}
				interaction.message.edit({
					embeds: [embed],
					components: [component],
				});
				interaction.deferUpdate();
			}
		}
		return;
	}
});

let start = new Date().getTime();

client.on("ready", async (client) => {
	let runtime = `${new Date().getTime() - start}ms`;
	console.log(
		`Discord Connected with ${client.user.displayName} in ${runtime}`
	);
	try {
		let runtimes = fs.readFileSync("./data/runtime.txt").toString();
		runtime = `${runtimes}\n${runtime}`;
	} catch (e) {
		console.log(e);
	}
	fs.writeFileSync("./data/runtime.txt", runtime);
	client.user.setActivity({
		name: "DIE IN",
		type: ActivityType.Listening,
		url: "https://www.youtube.com/watch?v=FF-tQalIIUM",
	});

	if (Config.MODE != "PROD") return;

	setInterval(() => {
		let data = JSON.parse(fs.readFileSync("./data/point.json").toString());
		let vc = [
			"1189495771209420812",
			"1234001558665040004",
			"1234001593071046667",
			"1237080206167113748",
		];
		vc.forEach(async (c) => {
			c = await client.channels.fetch(c);
			if (!data[c.guildId]) data[c.guild.id] = {};
			if (!c.members) return;
			c.members.forEach((m) => {
				let size = c.members.filter(
					(u) => !u.user.bot && !u.voice.deaf
				).size;
				if (m.voice.deaf || size < 2) return;
				if (!data[c.guildId][m.user.id])
					data[c.guildId][m.user.id] = {
						point: 0,
						chat: 0,
						voice: 0,
					};
				data[c.guildId][m.user.id].voice += 10;
				fs.writeFileSync(
					"./data/point.json",
					JSON.stringify(data, null, 4)
				);
				// data[c.guildId][m.user.id].point += 10 / 360
			});
		});
	}, 10000);

	// let interval = JSON.parse(
	// 	fs.readFileSync("./data/interval.json").toString()
	// );
	// let _interval = Array.from(interval);
	// interval.forEach(async (i) => {
	// 	if (!i) return;
	// 	let member = i.member;
	// 	let guild = i.guild;
	// 	member = await client.guilds.cache.get(guild).members.fetch(member);
	// 	i = setInterval(async () => {
	// 		data = JSON.parse(fs.readFileSync("./data/point.json").toString());
	// 		let voice = (await member.fetch(true)).voice;
	// 		if (voice.channel) {
	// 			let joins = voice.channel.members.filter(
	// 				(m) => !m.user.bot && !m.voice.deaf
	// 			);
	// 			if (!voice.deaf && joins.size >= 2) {
	// 				if (!guild) return;
	// 				data[guild][member.id].voice += 10;
	// 				data[guild][member.id].point += 10 / 360;
	// 				fs.writeFileSync(
	// 					"./data/point.json",
	// 					JSON.stringify(data, null, 4)
	// 				);
	// 			}
	// 		} else {
	// 			let __interval = _interval.filter((y) => y != null);
	// 			let index = __interval.indexOf(
	// 				__interval.find((x) => {
	// 					if (!x) return false;
	// 					return x.member == member.id;
	// 				})
	// 			);
	// 			if (index != -1) delete __interval[index];
	// 			__interval = __interval.filter((y) => y != null);
	// 			fs.writeFileSync(
	// 				"./data/interval.json",
	// 				JSON.stringify(__interval, null, 4)
	// 			);
	// 			clearInterval(i);
	// 		}
	// 	}, 10000);
	// });
});

client.login(
	(Config.MODE === "PROD" && Config.TOKEN) ||
		(Config.MODE === "TEST" && Config.TS_TOKEN)
);
