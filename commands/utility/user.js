const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('유저수')
		.setNameLocalizations({
			'en-US': 'user-count'
		})
		.setDescription('봇을 제외한 유저수를 확인합니다.')
		.setDescriptionLocalizations({
			"en-US": 'check bot excluded user count.'
		})
		.addIntegerOption(num => num
			.addChoices({ name: '포함', value: 0 })
			.addChoices({ name: '제외', value: 1 })
			.setMinValue(0)
			.setMaxValue(1)
			.setName('관리자')
			.setDescription('관리자 포함 여부를 설정합니다.')
			.setRequired(true)
		),
	async execute(interaction) {
		let user_count = 0
		let list = await interaction.guild.members.cache
		if (interaction.options.getInteger("관리자") === 1) {
			list.forEach((member) => {
				if (!member.user.bot && !member.permissions.has('Administrator')) {
					user_count += 1;
				}
			})
			interaction.reply(`유저수(관리자 제외): ${user_count.toString()}명`)
		} else {
			list.forEach(member => {
				if (!member.user.bot) {
					user_count += 1
				}
			})
			interaction.reply(`유저수: ${user_count.toString()}명`);
		}
	}
}