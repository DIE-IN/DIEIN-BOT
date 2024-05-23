const { SlashCommandBuilder, CommandInteraction, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('문의')
		.setDescription('문의/건의'),
	/**
	 * 
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		let title = new TextInputBuilder()
			.setCustomId('title')
			.setLabel('제목')
			.setStyle(1)
			.setRequired(false)
		let desc = new TextInputBuilder()
			.setCustomId('desc')
			.setLabel('내용')
			.setStyle(2)
			.setRequired(true)
		title = new ActionRowBuilder().addComponents(title)
		desc = new ActionRowBuilder().addComponents(desc)
		await interaction.showModal({
			customId: 'qa',
			title: '문의',
			components: [title, desc]
		})
	}
}