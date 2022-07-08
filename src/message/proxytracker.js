/** @extends Map<K, V> */
class DefaultMap extends Map {
    /**
     * 
     * @param {(arg: K) => V)} factory 
     * @param {(what: V) => boolean} rectify
     */
    constructor(factory, rectify) {
        super();
        this.factory = factory;
        this.rectifier = rectify;
    }
    /** @param {K} key
     * @returns {void}
     */
    get(key) {
        if (!this.has(key)) {
            this.set(key, this.factory());
        }

        return super.get(key);
    }

    rectify(key) {
        if (!this.has(key)) {
            return;
        }

        if (!this.rectifier(this.get(key))) {
            this.delete(key);
        }
    }
}


function Future() {
    // hacky
    let _resolve;
    let _reject;

    const promise = new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
    });

    promise.resolve = _resolve;
    promise.reject = _reject;

    return promise;
}

class ProxyMessageTracker {
    constructor() {
        /**
         * The tracked messages
         * 
         * @type {DefaultMap<string, Map<string, import('discord.js').Message | null>>}
         */
        this.tracked = new DefaultMap(() => new Map(), (what) => what.size > 0);

        /**
         * The tracked messages
         * 
         * @type {Map<string, Future>>}
         */
        this.proxyFuture = new Map();

        /**
         * The messages that ended it's tracking lifecycle and are now waiting to be noticed
         * 
         * @type {DefaultMap<string, Map<string, import('discord.js').Message>>}
         */
        this.finalised = new DefaultMap(() => new Map(), (what) => what.size > 0);

        /**
         * Track all webhook messages that could serve as a proxy message
         * 
         * @type {DefaultMap<string, import('discord.js').Message[]>}
         */
        this.suspicious = new DefaultMap(() => [], (what) => what.length > 0);
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    track(message) {
        const messageIds = this.tracked.get(message.channelId);

        messageIds.set(message.id, message);
        this.proxyFuture.set(message.id, Future());
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    remove(message) {
        const finalised = this.finalised.get(message.channelId);
        if (finalised.has(message.id)) {
            finalised.delete(message.id);
        }

        const tracked = this.tracked.get(message.channelId);
        if (tracked.has(message.id)) {
            tracked.delete(message.id);
        }

        if (this.proxyFuture.has(message.id)) {
            this.proxyFuture.get(message.id).resolve();
            this.proxyFuture.delete(message.id);
        }

        this.finalised.rectify(message.channelId);
        this.tracked.rectify(message.channelId);

        if (!this.tracked.has(message.channelId) && this.suspicious.has(message.channelId)) {
            // there's no suspicious messages if there's no messages to track either
            this.suspicious.delete(message.channelId);
        }
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    getFor(message) {
        const finalised = this.finalised.get(message.channelId);
        this.finalised.rectify(message.channelId);

        if (finalised.has(message.id)) {
            return finalised.get(message.id);
        }

        const tracked = this.tracked.get(message.channelId);
        this.tracked.rectify(message.channelId);

        if (tracked.has(message.id)) {
            return tracked.get(message.id);
        }

        return null;
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    waitForProxy(message) {
        if (this.proxyFuture.has(message.id)) {
            return this.proxyFuture.get(message.id);
        }

        const future = new Promise(val => val());
        return future;
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    handleMessageCreate(message) {

        // there's no need to track webhook messages
        // on a channel that has no tracked messages in the first place
        // so we check for that

        if (message.webhookId !== null && this.tracked.has(message.channelId)) {
            const suspicious = this.suspicious.get(message.channelId);
            suspicious.push(message);

            if (suspicious.length > 10) {
                suspicious.shift();
            }
        }
    }

    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    handleMessageDelete(message) {
        // if the message isn't being tracked, just ignore it
        if (this.tracked.has(message.channelId) && this.tracked.get(message.channelId).has(message.id)) {
            // delete the tracked message and find for a match
            this.tracked.get(message.channelId).delete(message.id);

            if (this.suspicious.has(message.channelId)) {
                const matchingContent = message.content;
                const candidates = this.suspicious.get(message.channelId);
                
                for (let i = 0; i < candidates.length; i++) {
                    const candidate = candidates[i];

                    // a full-match fails for tupperbox
                    if (candidate.content.endsWith(matchingContent)) {
                        candidates.splice(i, 1);
                        this.finalised.get(message.channelId).set(message.id, candidate);

                        if (this.proxyFuture.has(message.id)) {
                            this.proxyFuture.get(message.id).resolve();
                        }

                        break;
                    }
                }
            }


            this.tracked.rectify(message.channelId);
        }
    }
}

module.exports.ProxyMessageTracker = ProxyMessageTracker;
