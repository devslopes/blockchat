let lotion = require('lotion');
let genesis = require.resolve('./genesis.json');
let lotionPort = 3000;
let config = require('./config.js')
let dev = process.env.DEV || false;

async function main() {
    /**
     * Lotion always runs on localhost - you will never access lotion
     * from outside IP addresses or domains - you would have an API at the public
     * address and then have that point to localhost to talk to the lotion app
     */
    console.log('starting blockchain interface on port ' + lotionPort + '...\n');
    console.log(
        ` 
        chain state : http://localhost:${lotionPort}/state
        transactions: http://localhost:${lotionPort}/txs
        `
    )
    let opts = {
        /**
         * Explicitly set ports so they are consistent across nodes
         * The ports you use, in this case Ports 46656 & 46657 must be
         * publicly exposed on your cloud server - no reverse proxy needed (ie Apache/nginx)
         */
        lotionPort: lotionPort,
        p2pPort: 46656,
        tendermintPort: 46657,
        /**
         * If you ever change initial state, your app will have a new GCI - be very careful about changing
         * your initialState when you have existing validators - because it could break your app
         */
        initialState: {
            messages: [
                { sender: 'Devslopes', message: 'secure chat' },
                { sender: 'Devslopes', message: 'on the blockchain' },
                { sender: 'Devslopes', message: 'endless uses' }
            ]
        }
    };
    if (dev) {
        // devMode on lotion creates a new app/GCI each run, then deletes all artifacts when killed
        // use devMode to test functionality of your code without worrying about validators
        opts.devMode = true;
    } else {
        /**
         * lotionOptions.keys is looking for a path for the private keys of the validator
         * that is running this app. You would never put this in source code. You would generate the keys
         * and then manually place that json file here in the project. It can have any name or path.
         */
        opts.keys = 'priv_validator.json';
        /**
         * Pass in an array of validator nodes IP addresses
         * Do IP addresses only, no port ie 159.65.168.34
         */
        opts.peers = config.peers.map((addr) => `${addr}:46656`);
        /**
         * Possibly the most critical piece to the puzzle - the genesis.json
         * The unique app ID (GCI) is based on initialState and genesis.json
         * If the main repo's genesis.json file EVER CHANGES - you must quickly
         * update the source code of every validator node to have the new genesis.json
         */
        opts.genesis = genesis;
    }
    /**
     * Create a new instance of Lotion
     */
    let app = lotion(opts);

    /**
     * Lotion uses middleware functions like msgHandler to intercept and process
     * incoming transactions.
     * Middleware/handlers MUST be DETERMINISTIC
     * see http://www.ocoudert.com/blog/2011/05/30/how-to-make-software-deterministic/
     *
     * Write LOTS of error handling - cover every situation which you can think of
     * Once a transaction is processed, it lives on the blockchain FOREVER
     *
     * msgHandler makes sure the incoming transaction message and sender (username) is of
     * type string and that the message is around 50 characters (so the chat doesn't get spammed)
     *
     * Appending a new message to the blockchain is as simple as pushing the
     * new message to the messages array in state
     */
    let msgHandler = (state, tx) => {
        if (
            typeof tx.sender === 'string' &&
            typeof tx.message === 'string' &&
            tx.message.length <= 50
        ) {
            if (tx.message !== '') {
                state.messages.push({
                    sender: tx.sender,
                    message: tx.message
                });
            }
        }
    }
    /**
     * Actually use the middleware handler
     */
    app.use(msgHandler);

    /**
     * Start the Lotion app
     */
    app.listen(lotionPort).then(genesis => {
        console.log('connected');
        /**
         * When a lotion app is started it will run some algorithms based on genesis.json
         * and initialState (among other things) and generate important data in the directory ~/.lotion
         */
        console.log(genesis);
    }, err => {
        console.log(err);
    })
}

process.on('unhandledRejection', function(reason, p){
    console.log('Please report the following error as a Github Issue on: ')
    console.log(
        ` 
        Please report the following error as a Github Issue on:
        https://github.com/devslopes/blockchat
        `
    )
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    console.trace();
});

main()
