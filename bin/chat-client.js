#!/usr/bin/env node
/**
 * These libraries having nothing to do with Lotion
 * They help us read text from the shell and do some white space
 * formatting so our messages don't look ugly
 */
const fs = require('fs');
const swearjar = require('swearjar');
let leftPad = require('left-pad');
let readline = require('readline');
let rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.setPrompt('enter a username: ');

/**
 * connect will allow any computer (that can run NodeJS) to operate
 * a light node which does not create a copy of the blockchain on the machine's hard drive
 */
let { connect } = require('lotion');

/**
 * The genesis.json and the peers inside of config.js
 * helps our light client find validators and perform transactions
 */
let genesis = JSON.parse(fs.readFileSync(require.resolve('../genesis.json'), { encoding: 'utf8' }));
let config = require('../config.js')

async function main() {
    try {
        /**
         * Only show the word Connnecting if it takes more than 2 seconds
         * to connect otherwise clear it out below
         */
        let timeout = setTimeout(() => console.log('Connecting...'), 2000);
        /**
         * Append ws:// to the front of each validator IP address and the
         * tendermint port 46657 to the end. ws means connect via websockets
         * this step is required in order for connect to work
         */
        let nodes = config.peers.map((addr) => `ws://${addr}:46657`);

        /**
         * Use Javascript object literal syntax to grab the current state of the data in the blockchain
         * and to grab the send function. Note the keyword async in the function above and the keyword
         * await here below. This is an async function.
         */

        let { send, state } = await connect(null, { genesis, nodes});

        console.log('connected');
        clearTimeout(timeout);

        /**
         * Ask the user to enter a username for the chatroom
         */
        rl.prompt()
        /**
         * The logMessage function has nothing to do with Lotion - it helps make messages
         * look pretty in the shell whenever a new message is posted
         * this is a shell based chat app ya know!
         */
        let bar = '================================================================='
        let link = '                                |                                '
        function logMessage({ sender, message }, index) {
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            if (!(index % 3)) {
                console.log(bar)
            }
            console.log(
                '|  ' +
                sender +
                leftPad(': ', 12 - sender.length) +
                message +
                leftPad('|', 50 - message.length)
            )
            if (index % 3 === 2) {
                console.log(bar)
                console.log(link)
                console.log(link)
                console.log(link)
            }
            rl.prompt(true)
        }

        function usernameError(name) {
            if (name.length > 20) {
                return 'Username is too long'
            }
            if (name.length < 3) {
                return 'Username is too short'
            }
            if (name.indexOf(' ') !== -1) {
                return 'Username may not contain a space'
            }
            if (swearjar.profane(name)) {
                return 'Oh fetch! That username just won\'t do';
            }
            return false
        }

        let username;
        /**
         * This listens for when a user presses enter on the shell after
         * entering some text. If it is for the username, save it in the username variable
         * If it is a message use the Lotion.connect.send function
         */
        rl.on('line', async line => {
            readline.moveCursor(process.stdout, 0, -1)
            readline.clearScreenDown(process.stdout)
            line = line.trim()
            if (!username) {
                let e = usernameError(line)
                if (e) {
                    console.log(e)
                } else {
                    username = line
                    updateState();

                    /**
                     * Check for new messages every 3 seconds
                     */
                    setInterval(() => {
                        updateState();
                    }, 500)
                    rl.setPrompt('> ')
                }
            } else {
                /**
                 * Result is NOT the updated data - it is the success/failure result
                 * of the transaction that was just attempted
                 */
                let message = swearjar.censor(line);
                if (message && message.length >= 1 && message !== '') {
                    const result = await send({message, sender: username});
                }

                updateState()
            }

            rl.prompt(true)
        })

        /**
         * We keep track of the length of the last messages displayed
         * Then we do an async fetch to get the messages from the blockchain
         * If the length of the new messages is longer than our last recorded
         * length it means new messages have been added to the blockchain
         * Then for each new message we log it. The cool thing about our array
         * in the blockchain is that the order of messages will always be the same
         */
        let lastMessagesLength = 0;
        async function updateState() {
            let messages = await state.messages;
            if (messages && messages.length > 0) {
                for (let i = lastMessagesLength; i < messages.length; i++) {
                    if (messages[i]) {
                        logMessage(messages[i], i)
                    }
                }
                lastMessagesLength = messages.length;
            }
        }
    } catch (err) {
        console.log(err);
    }
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

main();
