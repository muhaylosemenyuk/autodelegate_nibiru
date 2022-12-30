const shell = require("shelljs");

// Enter your password
const PASSWORD = 'your_wallet_password'

// Enter your valoper address
const VALOPER = 'nibivaloper.........'

// Enter your wallet address
const DELEGATOR = 'nibiru_wallet_address'

const CHAIN_ID = 'nibiru-testnet-2'
const WALLETNAME = 'wallet'
const FEES = '5000'
const DENOM = 'unibi'
const PROJECT = 'nibid'
var sleepTimeout = 300
var next = false

// Your start voting power
var startStake = your_stake * 1000000

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getBalance() {
    const cmdGetBalance = `${PROJECT} q bank balances ${DELEGATOR} -o json | jq -r '.balances | .[].amount'`
    const result = shell.exec(cmdGetBalance, {shell: '/bin/bash', silent: true});
    const data = result.stdout + result.stderr;
    return data.split('\n')[0];
}

function getTimeout(rewards, sleepTimeout) {
    const reward_per_sec = rewards / sleepTimeout;
    const procent = reward_per_sec / startStake;
    const time = Math.sqrt(10000 / (reward_per_sec * procent));
    console.log('time', sleepTimeout, 'rewards', rewards);
    return time;
    
}

(async function() {
    while (true) {
        const startBalance = Number.parseInt(getBalance()) - 5000000;
        const cmdGetReward = `echo -e "${PASSWORD}\\ny\\n" | ${PROJECT} tx distribution withdraw-rewards ${VALOPER} --chain-id ${CHAIN_ID} --from ${WALLETNAME} --commission --fees ${FEES}${DENOM} -y`
        console.log('Reward');
        console.log(cmdGetReward);
        
        const reward = shell.exec(cmdGetReward, {shell: '/bin/bash', silent: true});
        console.log(reward.stdout + reward.stderr);
        console.log('Balance', getBalance());

        /*await sleep(1000 * 6);
        const cmdGetAllReward = `echo -e "${PASSWORD}\\n${PASSWORD}\\n" | ${PROJECT} tx distribution withdraw-all-rewards --from ${DELEGATOR} --chain-id ${CHAIN_ID} --fees 12500${DENOM} --gas=500000 -y`;
        console.log('All reward');
        console.log(cmdGetAllReward);
        const allReward = shell.exec(cmdGetAllReward, {shell: '/bin/bash', silent: true});
        console.log(allReward.stdout + allReward.stderr);
        console.log('Balance', getBalance());*/
        
        await sleep(1000 * 6);
        const balance = Number.parseInt(getBalance()) - 5000000;
        const cmdStakeAll = `echo -e "${PASSWORD}\\n${PASSWORD}\\n" | ${PROJECT} tx staking delegate ${VALOPER} ${balance}${DENOM} --from ${DELEGATOR} --chain-id ${CHAIN_ID} --fees ${FEES}${DENOM} -y`;
        console.log('Stake all');
        const stakeAll = shell.exec(cmdStakeAll, {shell: '/bin/bash', silent: true});
        console.log(stakeAll.stdout + stakeAll.stderr);
        
        if (next) {
          const rewards = balance - startBalance + 10000;
          sleepTimeout = getTimeout(rewards, sleepTimeout);
          startStake = startStake + rewards - 10000;   
        }
        
        console.log('sleepTimeout', sleepTimeout)
        await sleep(1000 * sleepTimeout);
        next = true
    }
})();

EOF
