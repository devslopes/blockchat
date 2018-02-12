let lotion = require('lotion');
let os = require('os')
// let genesis = require.resolve('./devslopes-genesis.json');
let port = 3000;

async function main() {
    console.log('starting blockchain interface on port ' + port + '...\n');
    console.log(
        ` 
        chain state : http://localhost:${port}/state
        transactions: http://localhost:${port}/txs
        `
    )

    let opts = {
        keys: os.homedir() + '/.lotion/priv_validator.json',
        genesis: genesis,
        initialState: {
            messages: [
                { sender: 'Devslopes', message: 'secure chat' },
                { sender: 'Devslopes', message: 'on the blockchain' },
                { sender: 'Devslopes', message: 'endless uses' }
            ]
        }
    }
    let app = lotion(opts);
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

    app.use(msgHandler);
    app.listen(3000).then(genesis => {
        console.log('connected');
        console.log(genesis);
    })
}

main()