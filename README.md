## Free Digital Ocean Credits

Get $15 *FREE* credit for Digital Ocean hosting. Use this code on the billing page: `DODEVSLOPES15`

You will need hosting if you are to launch your own blockchain.

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
 
 7. Grab the public key data from each validator json file and put it in the `genesis.json` file in the `validators` array. It might look similar to:
 
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
 
 9. Make sure the code is bringing in the genesis file in the `chat-node.js`
 
 `let genesis = require.resolve('./genesis.json');`
 
 This tells lotion who our validators are and information about our app.
 
 10. You will need a hosting service like `AWS` or `Digital Ocean` that can run the Lotion app with all the proper ports/etc. I recommend Digital Ocean.
 
 Create a new Droplet (and don't forget to use the free credits above). I usually choose a *One Click App* and pick *Docker* - you should just make sure it has Node on it.
 
 Add your SSH keys to Digital Ocean or create a root password. If you need help with that see [here](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh).
 
 11. SSH into your new Digital Ocean Droplet. Clone this repository: [https://github.com/devslopes/blockchat.git](https://github.com/devslopes/blockchat.git)
 
 12. Copy the data from one of your `priv_validator.json` files into the the repo you just clone in a file named `priv_validator.json`. Again make sure this file is *never* added to version control.
 
 13. Run your chat-node via `node chat-node.js`. If you are creating 3 validators (or more) this will look frozen like it isn't doing anything. That is because *2/3 of all validators must be online before it starts writing blocks*. Once your other validators are online you would see output in the console here. Also note that you need a node process manager so the app can run all the time. I recommend [pm2](http://pm2.keymetrics.io/). 
 
 Once installed you can do something like `pm2 start node-chat.js --name blockchat`
 
 14. Create two more droplets on Digital Ocean OR figure out how to work with Docker, or Docker Swarm (it isn't overly easy - but can save you money) so you can have 3 containers in the same droplet. Clone repos on those machines and add the associated private keys in the `priv_validator.json` files
 
 15. Once at least 2/3 of the validators listed in `genesis.json` are online your blockchain validator nodes will start writing blocks (and logging output)
 

## Creating a Chat Client

Now you can let users use your blockchain using a Light client. A Light client on Lotion does *not* hold a copy of the blockchain data. It runs itself as a simple node on your blockchain so it can perform functions.

Take the GCI that you copied and put it in `chat-client.js` ie
`const APP_ID = "89a6244c04b9560fe2a8c75f1e75c432c00961b1ac254744866cf37fb1193e7d";`

Update your repo. Now any of your friends can join your secure blockchat by simply running `node chat-client.js`
 
