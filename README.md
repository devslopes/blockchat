## Creating Your Own Blockchain

Fork this repo onto your own Github.

First you will need to create a private/public key pair for each Validator you will have on the blockchain. 3 Validator Lotion nodes will do the trick.

1. In `chat-node.js` set `devMode: true` in the Lotion Options. This will wipe all blockchain data each time the app is run.

```
let opts = {
        devMode: true,
        initialState: {
            messages: [
                { sender: 'Devslopes', message: 'secure chat' },
                { sender: 'Devslopes', message: 'on the blockchain' },
                { sender: 'Devslopes', message: 'endless uses' }
            ]
        }
    }
```

 2. From the terminal run `node chat-node.js` you will see output similar to this (with different values):
 
 ```
 { 
   tendermintPort: 44965,
   abciPort: 42071,
   txServerPort: 3000,
   GCI: '21abc89268e03ce032f0c6ff29bb387da1e2682976934a0bb5d0d42bb55dcd6c',
   p2pPort: 43845,
   lotionPath:  '/.lotion/networks/7fff170ea744955c7055dc540d3f68431fd7d2b50b3ca9729c2b2be00a03046e173989453',
   genesisPath: '/.lotion/networks/7fff170ea744955c7055dc540d3f68431fd7d2b50b3ca9729c2b2be00a03046e173989453/genesis.json',
   lite: false 
  }
 ```
 
 3. Copy the `genesis.json` file from the path above and paste it in the home directory of this repo. ie `mv ~/.lotion/networks/7fff170ea744955c7055dc540d3f68431fd7d2b50b3ca9729c2b2be00a03046e173989453/genesis.json ./`
 
 Now you have a genesis file for your app. But it only has one validator in it.
 
 4. Next copy the validator file in the same way to this directory but rename it with a 1 ie `mv ~/.lotion/networks/7fff170ea744955c7055dc540d3f68431fd7d2b50b3ca9729c2b2be00a03046e173989453/priv_validator.json ./priv_validator1.json`
 
 We need to copy the `priv_validator` to our repo so we can add these to the genesis as well as use them for our validator servers. Eventually we will delete them from this repo.
 
 5. Run `node chat-node.js` to generate a new genesis and `priv-validator.json` - this time we don't want the new genesis file. But we DO want the `priv_validator.json` - so copy it from the new app path like we did before and this time name it `priv_validator2.json`
 
 6. Run `node chat-node.js` again and repeat the process to create `priv_validator3.json`
 
 If you did these steps correctly your project folder now looks similar to this:
 
 ![project](readme-assets/project-status-1.png?raw=true "project")
 
 7. Grab the public key data and put it in the `genesis.json` file in the `validators` array. It might look similar to:
 
 ```
 {
   "app_hash": "7fff170ea744955c7055dc540d3f68431fd7d2b50b3ca9729c2b2be00a03046e173989453",
   "chain_id": "mycoolblockchainapp",
   "genesis_time": "0001-01-01T00:00:00Z",
   "validators": [
     {
       "name": "",
       "power": 10,
       "pub_key": {
         "data": "C2BFD789B00FC0D42A4FC53EF31AB324912E262D51C4044161A3200D10FDD1F6",
         "type": "ed25519"
       }
     },
     {
       "name": "",
       "power": 10,
       "pub_key": {
         "data": "A2BFR789B00FC0D42A4FC53EF31AB324912E362D51C4044161A3200D10FDD1F6",
         "type": "ed25519"
       }
     },
     {
       "name": "",
       "power": 10,
       "pub_key": {
         "data": "L1BFD789B00FC0D42A4FC53EF31AB324812E262D51C4044161A3200D10FDD1F6",
         "type": "ed25519"
       }
     }
   ]
 }
 ```
 8. Now that we have private keys for 3 nodes/machines, and we have our genesis file, we have everything we need to start a blockchain network in a realistic scenario.
 
 9. We need to tell Lotion where to find the private keys for each machine as well as the genesis file. In `chat-node.js` change add this to the top of your file:
 
 `let genesis = require.resolve('./genesis.json');`
 
 This tells lotion who our validators are and information about our app.
 
 10. Before we upload our Lotion app to our server, let's get the private keys set up on server. You will need a hosting service like `AWS` or `Digital Ocean` that can run the Lotion app with all the proper ports/etc.
 
 Log in to your first machine. We need to get `priv_validator1.json` on that machine. Copy the data from inside of it into `~./lotion/priv_validator.json` on the remote server.
 
 Do this same thing on the 2nd server, except grabbing `priv_validator2.json` and copying it into `~./lotion/priv_validator.json` on the 2nd server.
 
 Do this same thing with the 3rd server and 3rd validator file.
 
 11. Now `delete` these 3 `priv_validator` json files from your local repo here on this machine. You basically have created a private/public key pair so Lotion can verify the validators.
 
 12. Now let's make another code change here in the Lotion app. In `chat-node.js` at the top of the file add:
 
 `let os = require('os')`
 
 We'll use this to get the path of the operating system home.
 
 Then in the options:
 ```
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
 ```
 Be sure that `devMode` is gone. We have added the path to the keys as well as the genesis json.
 
 This process may have seem long, but all we have done is created 3 validators. You need validators for your blockchain to perform consensus. But we also needed to register them in the `genesis.json` file so any client app that wants use our Lotion app knows where to find the validators.
 
13. Now push the code changes here up to your Github repo.

14. Log in to each machine, then clone this repo wherever you want.

cd into the project and run the node by running `node chat-node.js`

This will start your validator node. You might want to use a node runner like `pm2` to keep this node running all the time in the background. Keep in mind if you want a healthy blockchain you will need to know how to keep this server running at all times.

15. Copy the GCI outputs from one of your validator nodes.

## Creating a Chat Client

Now you can let users use your blockchain using a Light client. A Light client on Lotion does *not* hold a copy of the blockchain data. It runs itself as a simple node on your blockchain so it can perform functions.

Take the GCI that you copied and put it in `chat-client.js` ie
`const APP_ID = "89a6244c04b9560fe2a8c75f1e75c432c00961b1ac254744866cf37fb1193e7d";`

Update your repo. Now any of your friends can join your secure blockchat by simply running `node chat-client.js`
 
