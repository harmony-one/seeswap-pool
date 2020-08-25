const largeNumber = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
const poolAddr = "0x8902d5f97c7992631134ced8ed8c16e4f09bfef2"

async function approveToken(token, amount, gas) {
    console.log('Trying to get token approval')

    if (token.addr == "" || token.contract == null) {
        console.error('[Error] Token not instantiated yet.')
        return false
    }

    let resp = await token.contract.methods.approve(poolAddr, amount).send(gas)
    if (resp.status === 'called') {
        console.log(token.name + ' transfer approved: ' + amount)
        return true
    } else {
        console.error('[Error] Token transfer approval failed.')
        return false
    }
}

async function joinPool(pool, token, amount, gas) {
    console.log('Trying to join pool')

    if (token.addr == "" || token.contract == null) {
        console.error('[Error] Token not instantiated yet.')
        return false
    }

    let resp = await pool.methods.joinswapExternAmountIn(token.addr, amount, 0).send(gas)
    if (resp.status === "called") {
        console.log('Pool joined with ' + amount + ' '  + token.name + '.')
        return true
    } else {
        console.error('[Error] Failed to join pool.')
        return false
    }
}

async function exitPool(pool, token, amount, gas) {
    console.log('Trying to exit pool')

    if (token.addr == "" || token.contract == null) {
        console.error('[Error] Token not instantiated yet.')
        return false
    }

    let resp = await pool.methods.exitswapExternAmountOut(token.addr, amount, largeNumber).send(gas)
    if (resp.status === "called") {
        console.log('Successfully withdrew ' + amount + ' ' + token.name + ' from pool.')
        return true
    } else {
        console.error('[ERROR] Failed to withdraw from pool.')
        return false
    }
}

async function swapToken(pool, send, receive, amount, gas) {
    console.log('Trying to swap tokens')

    if (send.addr == "" || send.contract == null) {
        console.error('[Error] Token not instantiated yet.')
        return false
    }
    if (receive.addr == "" || receive.contract == null) {
        console.error('[Error] Token not instantiated yet.')
        return false
    }

    let resp = await pool.methods.swapExactAmountIn(send.addr, amount, receive.addr, 0, largeNumber).send(gas)
    if (resp.status === "called") {
        console.log('Swap successful.')
        return true
    } else {
        console.error('[Error] Swap failed.')
        return false
    }
}

module.exports = {
    joinPool: joinPool,
    exitPool: exitPool,
    swapToken: swapToken,
    approveToken: approveToken,
}