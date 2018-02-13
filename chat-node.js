let lotion = require('lotion');
let os = require('os')
let genesis = require.resolve('genesis.json');
let lotionPort = process.env.PORT || 3000;
let dev = process.env.DEV || false;
async function main() {
    console.log('starting blockchain interface on port ' + lotionPort + '...\n');
    console.log(
        ` 
        chain state : http://localhost:${lotionPort}/state
        transactions: http://localhost:${lotionPort}/txs
        `
    )
    let opts = {
        // Some people may choose to use a different port for lotion - allow them the option
        lotionPort: lotionPort,
        // If you ever change initial state, your app will have a new GCI - be careful
        initialState: {
            messages: [
                { sender: 'Devslopes', message: 'secure chat' },
                { sender: 'Devslopes', message: 'on the blockchain' },
                { sender: 'Devslopes', message: 'endless uses' }
            ]
        }
    };
    if (dev) {
        opts.devMode = true;
    } else {
        opts.keys = os.homedir() + 'priv_validator.json';
        opts.genesis = genesis;
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
    app.listen(lotionPort).then(genesis => {
        console.log('connected');
        console.log(genesis);
    }, err => {
        console.log(err);
    })
}

main()