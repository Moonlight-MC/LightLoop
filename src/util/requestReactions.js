const DataStorage = require('./dataStorage');
const utility = require('./utility');
const { startDialog, canStartDialog } = require('../dialogs/startDialog');

/**
 * Avatar requests reactions init
 * @param {import('discord.js').Client} client 
 */
async function init(client) {
    // Set up all the reaction collectors for avatar requests
    const channel = await client.channels.fetch(process.env.REQUESTS_CHANNEL).catch(console.ignore);
    if (!channel) return;
    if (!DataStorage.storage.avatar_requests) DataStorage.storage.avatar_requests = [];
    DataStorage.storage.avatar_requests.forEach(async element => {
        const msg = await channel.messages.fetch(element.message).catch(console.ignore);
        // note a change here: does no longer delete the message if it's not found
        // this is because bad internet connections can cause the message to not be fetched
        // even though it exists
        // instead, entries in storage are deleted only after the time is up
        // see deleteOldRequests cronjob
        // (i didnt bother to check the error if the message doesnt exist or just internet timeout)
        if (!msg) return;
        createCollector(msg, element);
    });
}

/**
 * Creates a reaction collector on a message, second parameter is the entry in the data storage
 * @param {import('discord.js').Message} msg 
 * @param {*} element 
 */
async function createCollector(msg, element) {
    const collector = msg.createReactionCollector({ dispose: true });

    collector.on('collect', async (reaction, user) => {

        if (user.bot) return;

        const member = await msg.guild.members.fetch(user.id);
        const isModerator = utility.isModerator(member);

        if (reaction.emoji.name == '✅') {
            reaction.message.reactions.cache.get('✅').users.remove(user.id);

            if (user.id != element.user && !isModerator) return; // only the author or a moderator can archive

            let workers = await reaction.message.reactions.cache.get('⚙️')?.users.fetch();
            const lurkers = await reaction.message.reactions.cache.get('👀')?.users.fetch();

            if (reaction.message.embeds[0].footer != null) {
                // if not eligible for leveling
                workers = [];
            }

            if (canStartDialog(reaction.client, user)) {
                await user.send(utility.buildEmbed('Archiving the avatar request!', 'Please follow a few steps to finish this request. Type "cancel" at any time to cancel this action.'));
                startDialog(reaction.client, user, 'archiveAvatarRequest', { workers: workers, lurkers: lurkers, embed: reaction.message.embeds[0], requestMessage: reaction.message });
            }
            else {
                user.send(utility.buildEmbed('Please finish the current dialog first.'));
            }
        }
        else if (reaction.emoji.name == '❌') {
            reaction.message.reactions.cache.get('❌').users.remove(user.id);

            if (user.id != element.user && !isModerator) return; // only the author or a moderator can delete

            if (canStartDialog(reaction.client, user)) {
                startDialog(reaction.client, user, 'deleteAvatarRequest', { requestMessage: reaction.message });
            }
            else {
                user.send(utility.buildEmbed('Please finish the current dialog first.'));
            }
        }
        else if (reaction.emoji.name == '📝') {
            reaction.message.reactions.cache.get('📝').users.remove(user.id);

            if (user.id != element.user && !isModerator) return; // only the author can edit

            if (canStartDialog(reaction.client, user)) {
                await user.send(utility.buildEmbed('Edit Avatar Request!', 'We will now update the details of the request. You can cancel this at any point by typing "cancel". You can skip steps by sending "skip".'));
                startDialog(reaction.client, user, 'editAvatarRequest', reaction.message);
            }
            else {
                user.send(utility.buildEmbed('Please finish the current dialog first.'));
            }
        }
        else if (reaction.emoji.name == '⚙️') {
            if (user.id == element.user || DataStorage.storage.people[user.id]?.requestban) return reaction.message.reactions.cache.get('⚙️').users.remove(user.id); // the author cannot lock it themselves, and banned people neither

            // check if user has hit the ⚙️ limit
            if (DataStorage.storage.avatar_requests.filter(x => x.workers?.includes(user.id))?.length >= 5) {
                reaction.message.reactions.cache.get('⚙️').users.remove(user.id);
                user.send({ embeds: [{ description: 'Your are already working on 5 requests! Please finish another request first, before working on new ones. This limit has been implemented to avoid spam.' }] });
                return;
            }

            // add user to the workers list
            const avatar_request = DataStorage.storage.avatar_requests.find(x => x.message == reaction.message.id);
            if (!avatar_request.workers) avatar_request.workers = [];
            avatar_request.workers.push(user.id);

            element.locked = true;

            DataStorage.save('storage');

            // show the user, that the bot locked it
            reaction.message.embeds.forEach(embed => {
                embed.color = 'f28a2e'; // orange
            });
            reaction.message.edit({ embeds: reaction.message.embeds }).catch(console.ignore);
        }
        else if (reaction.emoji.name == '🔴') {
            reaction.message.reactions.cache.get('🔴').users.remove(user.id);

            if (!isModerator) return; // only a moderator can disable eligibility for leveling

            const edit = reaction.message;
            edit.embeds[0].setFooter('Not eligible for leveling.');
            reaction.message.edit({ embeds: edit.embeds }).catch(console.ignore);
        }
        else if (reaction.emoji.name == '🟢') {
            reaction.message.reactions.cache.get('🟢').users.remove(user.id);

            if (!isModerator) return; // only a moderator can enable eligibility for leveling

            const edit = reaction.message;
            edit.embeds[0].setFooter('');
            reaction.message.edit({ embeds: edit.embeds }).catch(console.ignore);
        }
    });

    collector.on('remove', (reaction, user) => {
        if (reaction.emoji.name == '⚙️' && user.id != element.user) {
            // remove user from the workers list
            const avatar_request = DataStorage.storage.avatar_requests.find(x => x.message == reaction.message.id);
            avatar_request.workers = avatar_request.workers?.filter(x => x != user.id);

            // if only the bots reaction is there, unlock
            if (reaction.count == 1) {
                element.locked = false;
                if (element.timestamp + 1000 * 60 * 60 * 24 < Date.now()) { // older than a day
                    reaction.message.embeds.forEach(embed => {
                        embed.color = '202225'; // gray
                    });
                }
                else {
                    reaction.message.embeds.forEach(embed => {
                        embed.color = '2aacf7'; // blue
                    });
                }
                reaction.message.edit({ embeds: reaction.message.embeds }).catch(console.ignore);
            }

            DataStorage.save('storage');
        }
    });

    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
}

module.exports = { init, createCollector };
