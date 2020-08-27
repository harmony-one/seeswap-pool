<template>
  <v-app id="inspire">
    <v-main>
      <v-container
          class="fill-height"
          fluid
      >
        <v-row
            align="center"
            justify="center"
        >
          <v-col
              cols="12"
              sm="8"
              md="4"
          >
            <v-card>
              <v-toolbar
                  color="primary"
                  dark
                  flat
              >
                <v-toolbar-title>SeeSwap</v-toolbar-title>
                <v-subheader>Balancer Demo on Harmony</v-subheader>
              </v-toolbar>
              <v-card-text>
                <v-row justify="center">
                  <v-col class="px-4" cols="6" justify="center">
                    <v-row align="center" justify="center">
                      <v-subheader>Action</v-subheader>
                    </v-row>
                    <v-row align="center" justify="center">
                      <v-radio-group
                          :disabled="disabled"
                          v-model="action"
                      >
                        <v-radio label="Swap Tokens" value="SWAP"></v-radio>
                        <v-radio label="Join Pool" value="JOIN"></v-radio>
                        <v-radio label="Exit Pool" value="EXIT"></v-radio>
                      </v-radio-group>
                    </v-row>
                  </v-col>
                  <v-col class="px-4" cols="6">
                    <v-row align="center" justify="center">
                      <v-subheader>Token</v-subheader>
                    </v-row>
                    <v-row align="center" justify="center">
                      <v-radio-group
                          :disabled="disabled"
                          v-model="token"
                      >
                        <v-radio label="1SEED" value="1SEED"></v-radio>
                        <v-radio label="1LINK" value="1LINK"></v-radio>
                      </v-radio-group>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row justify="center" align="center">
                  <v-col class="px-4" cols="6" justify="center" align="center">
                    <v-row justify="center" align="center">
                      <v-col cols="10" justify="center" align="center">
                        <v-text-field
                            label="Amount"
                            :suffix="token"
                            :disabled="disabled"
                            type="number"
                            outlined
                            v-model="amount"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col class="px-4" cols="6" justify="center" align="center">
                    <v-row>
                      <v-col cols="6">
                        <p><strong>{{ tokens[0].name }}</strong></p>
                        <p>Balance: {{ tokens[0].balance }}</p>
                        <p>Spot Price: {{ tokens[0].price }}</p>
                      </v-col>
                      <v-col cols="6">
                        <p><strong>{{ tokens[1].name }}</strong></p>
                        <p>Balance: {{ tokens[1].balance }}</p>
                        <p>Spot Price: {{ tokens[1].price }}</p>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <p>Pool Fee: {{ fee }}</p>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    :disabled="disabled"
                    @click="doAction">
                  {{ action }}
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
const { initHmy, resetWallet, initContract, getTokens } = require('./scripts/init.js')
const { approveToken, exitPool, joinPool, swapToken } = require('./scripts/pool.js')
const tokenContract = require('./contracts/ERC20.json')

const BigNumber = require('bignumber.js')
const bn = require('bn.js')
let BN = (val) => new bn(val)

const unitBN = BN(10).pow(BN(18))
const unitBigNumber = new BigNumber(1e18)
const gasOptions = { gasPrice: 1000000000, gasLimit: 6721900 }


export default {
  data: () => ({
    disabled: true,
    action: "SWAP",
    token: "1SEED",
    amount: 0,
    tokens: [
      {
        name: "1SEED",
        price: "",
        balance: "",
        addr: "",
        contract: null
      },
      {
        name: "1LINK",
        price: "",
        balance: "",
        addr: "",
        contract: null
      }
    ],
    fee: "",

    hmy: null,
    pool: null,
  }),

  mounted() {
    window.addEventListener('load', () => {
      this.hmy = initHmy().then((hmy) => {
        if (hmy == null) {
          alert("Please install the MathWallet extension to use SeeSwap!")
        } else {
          this.hmy = hmy
          resetWallet(hmy)
          initContract(this.hmy).then((contract) => {
            this.pool = contract
            this.updateTokens().then(() => {
              this.updatePool().then(() => {
                this.enableInput()
              })
            })
          })
        }
      })
    })
  },

  // FIXME: These are generally hard-coded to 2 tokens
  methods: {
    disableInput() {
      this.disabled = true
    },
    enableInput() {
      this.disabled = false
    },
    // TODO: Create an actual component to display errors & success instead of alert
    // TODO: Add better, more information error messages when able to get EVM errors from the sdk
    // FIXME: A lot of duplicated code, can be optimized and cleaned up
    doAction() {
      this.disableInput()

      let convertedAmount = BN(this.amount).mul(unitBN)

      if (this.action === 'SWAP') {
        if (this.token === '1SEED') {
          approveToken(this.tokens[0], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              swapToken(this.pool, this.tokens[0], this.tokens[1], convertedAmount, gasOptions).then((result) => {
                if (result == true) {
                  alert("Token swap successful!")
                  location.reload()
                } else {
                  alert("[Error] Unable to confirm transaction to swap tokens.")
                  location.reload()
                }
              })
            } else {
              alert("[Error] Unable to get token transfer approval.")
              location.reload()
            }
          })
        } else {
          approveToken(this.tokens[1], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              swapToken(this.pool, this.tokens[1], this.tokens[0], convertedAmount, gasOptions).then((result) => {
                if (result == true) {
                  alert("Token swap successful!")
                  location.reload()
                } else {
                  alert("[Error] Unable to confirm transaction to swap tokens.")
                  location.reload()
                }
              })
            } else {
              alert("[Error] Unable to get token transfer approval.")
              location.reload()
            }
          })
        }
      } else if (this.action === 'JOIN') {
        if (this.token === '1SEED') {
          approveToken(this.tokens[0], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              joinPool(this.pool, this.tokens[0], convertedAmount, gasOptions).then((result) => {
                if (result == true) {
                  alert("Pool joined!")
                  location.reload()
                } else {
                  alert("[Error] Unable to confirm transaction to join pool.")
                  location.reload()
                }
              })
            } else {
              alert("[Error] Unable to get token transfer approval.")
              location.reload()
            }
          })
        } else {
          approveToken(this.tokens[1], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              joinPool(this.pool, this.tokens[1], convertedAmount, gasOptions).then((result) => {
                if (result == true) {
                  alert("Pool joined!")
                  location.reload()
                } else {
                  alert("[Error] Unable to confirm transaction to join pool.")
                  location.reload()
                }
              })
            } else {
              alert("[Error] Unable to get token transfer approval.")
              location.reload()
            }
          })
        }
      } else if (this.action === 'EXIT') {
        if (this.token === '1SEED') {
          exitPool(this.pool, this.tokens[0], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              alert("Pool exited!")
              location.reload()
            } else {
              alert("[Error] Unable to confirm transaction to exit pool.")
              location.reload()
            }
          })
        } else {
          exitPool(this.pool, this.tokens[1], convertedAmount, gasOptions).then((result) => {
            if (result == true) {
              alert("Pool exited!")
              location.reload()
            } else {
              alert("[Error] Unable to confirm transaction to exit pool.")
              location.reload()
            }
          })
        }
      }
    },
    // TODO: Update tokens after successful transaction instead of reloading the entire application
    async updateTokens() {
      let poolTokens = getTokens()
      for (let i = 0; i < poolTokens.length; i++) {
        for (let j = 0; j < this.tokens.length; j++) {
          if (poolTokens[i].name === this.tokens[j].name) {
            this.tokens[j].addr = poolTokens[i].addr
            this.tokens[j].contract = await this.hmy.contracts.createContract(tokenContract.abi, poolTokens[i].addr)
          }
        }
      }
      return new Promise((resolve) => {
        resolve()
      })
    },
    async updatePool() {
      for (let i = 0; i < this.tokens.length; i++) {
        this.pool.methods.getBalance(this.tokens[i].addr).call(gasOptions).then((response) => {
          if (response == null) {
            console.error('[Error] Unable to fetch pool token Balance')
          } else {
            let temp = new BigNumber(response.toString())
            this.tokens[i].balance = temp.dividedBy(unitBigNumber).toFormat(2)
          }
        })
        if (i == 0) {
          this.pool.methods.getSpotPriceSansFee(this.tokens[i].addr, this.tokens[1].addr).call(gasOptions).then((response) => {
            if (response == null) {
              console.error('[Error] Unable to fetch swap price')
            } else {
              let temp = new BigNumber(response.toString())
              this.tokens[i].price = temp.dividedBy(unitBigNumber).toFormat(2)
            }
          })
        } else {
          this.pool.methods.getSpotPriceSansFee(this.tokens[i].addr, this.tokens[0].addr).call(gasOptions).then((response) => {
            if (response == null) {
              console.error('[Error] Unable to fetch swap price')
            } else {
              let temp = new BigNumber(response.toString())
              this.tokens[i].price = temp.dividedBy(unitBigNumber).toFormat(2)
            }
          })
        }
      }
      this.pool.methods.getSwapFee().call(gasOptions).then((response) => {
        if (response == null) {
          console.error('[Error] Unable to fetch pool fee')
        } else {
          let temp = new BigNumber(response.toString())
          this.fee = temp.dividedBy(unitBigNumber).multipliedBy(new BigNumber(1e2)).toString() + "%"
        }
      })
    }
  }
}
</script>