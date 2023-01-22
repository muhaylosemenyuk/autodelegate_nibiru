const shell = require("shelljs");

// Enter your password
const PASSWORD = 'your_wallet_password'

// Enter your valoper address
const VALOPER = 'nibivaloper.........'

// Enter your wallet address
const DELEGATOR = 'nibiru_wallet_address'

// Enter your wallet2 address
const DELEGATOR2 = 'nibiru_wallet2_address'

const CHAIN_ID = 'nibiru-testnet-2'
const WALLETNAME = 'wallet'
const FEES = '8500'
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

function getBalance(address) {
    const cmdGetBalance = `${PROJECT} q bank balances ${address} -o json | jq -r '.balances | .[].amount'`
    const result = shell.exec(cmdGetBalance, {shell: '/bin/bash', silent: true});
    const data = result.stdout + result.stderr;
    return data.split('\n')[0];
}

function getTimeout(rewards, sleepTimeout) {
    const reward_per_sec = rewards / sleepTimeout;
    const procent = reward_per_sec / startStake;
    const time = Math.sqrt((+FEES * 3 + 12500) / (reward_per_sec * procent));
    console.log('time', sleepTimeout, 'rewards', rewards);
    return time;
}

(async function() {
    while (true) {
        // Зібрати реварди
        const startBalance = Number.parseInt(getBalance(DELEGATOR)) - 5000000;
        const cmdGetReward = `echo -e "${PASSWORD}\\ny\\n" | ${PROJECT} tx distribution withdraw-rewards ${VALOPER} --chain-id ${CHAIN_ID} --from ${WALLETNAME} --commission --fees ${FEES}${DENOM} -y`
        console.log('Reward');
        console.log(cmdGetReward);
        
        const reward = shell.exec(cmdGetReward, {shell: '/bin/bash', silent: true});
        console.log(reward.stdout + reward.stderr);
        console.log('Balance', getBalance(DELEGATOR));

        // Зібрати з додаткового гаманця
        await sleep(1000 * 6);
        const startBalance2 = Number.parseInt(getBalance(DELEGATOR2)) - 5000000;
        const cmdGetAllReward = `echo -e "${PASSWORD}\\n${PASSWORD}\\n" | ${PROJECT} tx distribution withdraw-all-rewards --from ${DELEGATOR2} --chain-id ${CHAIN_ID} --fees 12500${DENOM} --gas=500000 -y`;
        await sleep(1000 * 6);
        console.log('All reward');
        console.log(cmdGetAllReward);
        const allReward = shell.exec(cmdGetAllReward, {shell: '/bin/bash', silent: true});
        console.log(allReward.stdout + allReward.stderr);
        console.log('Balance2', getBalance(DELEGATOR2));
        
        // Заделегувати з основного
        await sleep(1000 * 6);
        const balance = Number.parseInt(getBalance(DELEGATOR)) - 5000000;
        const cmdStakeAll = `echo -e "${PASSWORD}\\n${PASSWORD}\\n" | ${PROJECT} tx staking delegate ${VALOPER} ${balance}${DENOM} --from ${DELEGATOR} --chain-id ${CHAIN_ID} --fees ${FEES}${DENOM} -y`;
        console.log('Stake all');
        const stakeAll = shell.exec(cmdStakeAll, {shell: '/bin/bash', silent: true});
        console.log(stakeAll.stdout + stakeAll.stderr);
        
        //Заделегувати з додаткового
        await sleep(1000 * 6);
        const balance2 = Number.parseInt(getBalance(DELEGATOR2)) - 5000000;
        const cmdStakeAll2 = `echo -e "${PASSWORD}\\n${PASSWORD}\\n" | ${PROJECT} tx staking delegate ${VALOPER} ${balance2}${DENOM} --from ${DELEGATOR2} --chain-id ${CHAIN_ID} --fees ${FEES}${DENOM} -y`;
        console.log('Stake all2');
        const stakeAll2 = shell.exec(cmdStakeAll2, {shell: '/bin/bash', silent: true});
        console.log(stakeAll2.stdout + stakeAll2.stderr);
        console.log(cmdStakeAll2);
        
        
        if (next) {
          const rewards = balance - startBalance + (+FEES * 2) + balance2 - startBalance2 + +FEES + 12500;
          sleepTimeout = getTimeout(rewards, sleepTimeout);
          startStake = startStake + rewards - 10000;   
        }
        
        console.log('sleepTimeout', sleepTimeout)
        await sleep(1000 * sleepTimeout);
        next = false
        
        if (sleepTimeout >= 60) {
          next = true
        }
        
    }
})();
