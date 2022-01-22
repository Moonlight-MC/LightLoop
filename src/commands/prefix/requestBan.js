const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'requestban',
    usage: '`?requestban <@user|userId>` - Bans a user from using the request system.',
    moderator: true,
    async execute(message, args) {
        const memberId = args[0];

        let fetchedMember = undefined;
        if (memberId) fetchedMember = await message.guild.members.fetch(memberId).catch(console.error);

        const member = message.mentions.members.first() || fetchedMember;

        if (!member) return message.channel.send('Please specify a user.');

        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (!DataStorage.storage.people[member.id]) DataStorage.storage.people[member.id] = {};

        const person = DataStorage.storage.people[member.id];
        if (person.requestban) return message.channel.send('This user is already banned.');
        person.requestban = true;
        DataStorage.save();
        message.channel.send(`Request banned ${member.user.tag}.`);
    },
};
