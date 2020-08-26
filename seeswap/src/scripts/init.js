const { HarmonyExtension } = require('@harmony-js/core')
const { ChainType } = require('@harmony-js/utils')
const { Messenger, Provider} = require('@harmony-js/network')
const config = require('./config.json')
const contract = require('../contracts/BPool.json')

//console.log(config)
//console.log(contract)

async function initHmy() {
    let ext
    // Check for MathWallet Extension
    if (window.harmony) {
        ext = await new HarmonyExtension(window.harmony)
        ext.provider = new Provider(config.endpoint).provider

        ext.messenger = new Messenger(ext.provider, ChainType.Harmony, config.chainID)
        ext.setShardID(config.shard)
        ext.wallet.messenger = ext.messenger
        ext.blockchain.messenger = ext.messenger
        ext.transactions.messenger = ext.messenger
        ext.contracts.wallet = ext.wallet

        return ext
    }

    console.log("[Warning] Unable to load MathWallet extension. Trying OneWallet.")

    // Check for OneWallet Extension
    if (window.onewallet) {
        ext = await new HarmonyExtension(window.onewallet)
        ext.provider = new Provider(config.endpoint).provider

        ext.messenger = new Messenger(ext.provider, ChainType.Harmony, config.chainID)
        ext.setShardID(config.shard)
        ext.wallet.messenger = ext.messenger
        ext.blockchain.messenger = ext.messenger
        ext.transactions.messenger = ext.messenger
        ext.contracts.wallet = ext.wallet

        // OneWallet support is currently untested.
        // TODO: Test support & return the ext object when ready.
        return null
    }

    console.error("[Error] Unable to load OneWallet or MathWallet extensions.")

    // If neither extension can be found, return null to throw an error in the App
    // TODO: Support viewing the App without any extensions
    return null
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