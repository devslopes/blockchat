let leftPad = require('left-pad')
let { connect } = require('lotion');
let readline = require('readline')
let genesis = require.resolve('./genesis.json');
let config = require('./config.js')
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('enter a username: ');

async function main() {
    let timeout = setTimeout(() => console.log('Connecting...'), 2000);
    let nodes = config.peers.map((addr) => `ws://${addr}:46657`);
    let client = await connect(null, { genesis, nodes});
    console.log('connected');

    clearTimeout(timeout);
    rl.prompt()

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

    let username

    function usernameError(name) {
        if (name.length > 12) {
            return 'Username is too long'
        }
        if (name.length < 3) {
            return 'Username is too short'
        }
        if (name.indexOf(' ') !== -1) {
            return 'Username may not contain a space'
        }
        return false
    }

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
                rl.setPrompt('> ')
            }
        } else {
            let message = line;
            console.log(message);
            const result = await client.send({
                message,
                sender: username
            });
            const state = await client.getState();
            updateState(state)
        }

        rl.prompt(true)
    })

    // poll blockchain state
    let lastMessagesLength = 0
    function updateState(state) {
        for (let i = lastMessagesLength; i < state.messages.length; i++) {
            logMessage(state.messages[i], i)
        }
        lastMessagesLength = state.messages.length
    }

    setInterval(async () => {
        try {
            const state = await client.getState();
            updateState(state);
        } catch (err) {
            console.log(err);
        }
    }, 500)
}

main();
