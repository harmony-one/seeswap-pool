const { HarmonyExtension } = require('@harmony-js/core')
const { ChainType } = require('@harmony-js/utils')
const { Messenger, Provider} = require('@harmony-js/network')
const config = require('./config.json')
const contract = require('../contracts/BPool.json')

//console.log(config)
//console.log(contract)

async function initHmy() {
    let ext
    // Only supports OneWallet
    if (window.onewallet) {
        ext = await new HarmonyExtension(window.onewallet)
        ext.provider = new Provider(config.endpoint).provider

        ext.messenger = new Messenger(ext.provider, ChainType.Harmony, config.chainID)
        ext.setShardID(config.shard)
        ext.wallet.messenger = ext.messenger
        ext.blockchain.messenger = ext.messenger
        ext.transactions.messenger = ext.messenger
        ext.contracts.wallet = ext.wallet
        console.log(ext.provider)
    } else {
        console.error("[Error] Unable to load OneWallet extension")
    }
    return ext
}

async function resetWallet(hmy) {
    return await hmy.logout()
}

async function initContract(hmy) {
    let pool = await hmy.contracts.createContract(contract.abi, config.poolAddr)
    return pool
}

// NOTE: Order of poolTokens need to match order in tokens
function getTokens() {
    return config.poolTokens
}

module.exports = {
    initHmy: initHmy,
    resetWallet: resetWallet,
    initContract: initContract,
    getTokens: getTokens,
}