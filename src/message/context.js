const DataStorage = require('../util/dataStorage');

function either(...promises) {
    return new Promise((val) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then((result) => val([i, result]));
        }
    });
}

class Context {
    /**
     * 
     * @param {import('discord.js').GuildMember} author 
     * @param {import('discord.js').Message} message 
     * @param {import('./proxytracker').ProxyMessageTracker} tracker 
     */
    constructor(author, message, tracker) {
        this.author = author;
        this.message = message;
        this.tracker = tracker;

        this.intervalId = null;

        this.tracker.track(message);

        this.ping();
        this.intervalId = setInterval(this.ping.bind(this), 10000);

        this._waited = false;
    }

    async ping() {
        await this.message.channel.sendTyping();
    }

    async processWaiting() {
        if (!this._waited) {
            const id = this.message.guild.id + '-' + this.author.id;
            const stored = DataStorage.usersettings.map;
            
            let shouldWait;
            let shouldAlert;

            if (stored.has(id)) {
                shouldWait = stored.get(id).get('wait_for_proxy');
                shouldAlert = stored.get(id).get('alert_when_waiting');
            }
            else {
                shouldWait = false;
                shouldAlert = false;
            }

            // don't wait again if it already has waited
            if (shouldWait) {
                let reaction = null;

                if (shouldAlert) {
                    try {
                        reaction = await this.message.react('❕');
                    }
                    catch (e) {
                        // the message could've been deleted already
                    }
                }

                const output = await either(this.tracker.waitForProxy(this.message), new Promise(val => setTimeout(val, 5000)));

                if (reaction !== null && output[0] === 1) {
                    try {
                        await reaction.users.remove(reaction.client.user);
                    }
                    catch (e) {
                        // some weird happened because this can only happen
                        // when the timeout ends
                        // either way the message or the reaction is probably deleted
                    }
                }
            }

            this._waited = true;
        }
    }
    /**
     * 
     * @param  {...Parameters<import('discord.js').Message['reply']>} what 
     */
    async reply(...what) {
        await this.processWaiting();

        try {
            await this.tracker.getFor(this.message).reply(...what);
        }
        catch (e) {
            // oh well
            await this.message.channel.send(...what);
        }
    }

    /**
     * 
     * @param  {...Parameters<import('discord.js').TextBasedChannel['send']>} what 
     */
    async send(...what) {
        await this.processWaiting();

        await this.message.channel.send(...what);
    }

    destroy() {
        this.tracker.remove(this.message);
        
        this.stopTyping();
    }

    get client() {
        return this.message.client;
    }

    get guild() {
        return this.message.guild;
    }

    get content() {
        return this.message.content;
    }

    get attachments() {
        return this.message.attachments;
    }

    stopTyping() {
        if (this.timeoutId !== null) {
            clearInterval(this.intervalId);
            this.timeoutId = null;
        }
    }
}

module.exports.Context = Context;
