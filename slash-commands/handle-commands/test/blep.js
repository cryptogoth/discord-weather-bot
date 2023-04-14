const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blep')
        .setDescription('Do something with animals argument')
	.addStringOption(option => option.setName('animal').setDescription('a type of animal')),
    async execute(interaction) {
	console.log("interaction keys", JSON.stringify(Object.keys(interaction)));
        const animal = interaction.options.getString('animal');
        return interaction.reply(`Do something with the argument animal: ${animal}`);
    },
};
