const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong!'),
    async execute(interaction) {
        await interaction.reply(`Latency: ${Date.now() - interaction.createdTimestamp}ms. API Latency: ${Math.round(interaction.client.ws.ping)}ms`)
    }
}