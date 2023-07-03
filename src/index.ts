// @ts-ignore
import CoinMarketCap from 'coinmarketcap-api'

import { BaseMill } from '@open-oracle-origami/origami-js-sdk'
import { poll } from 'poll'

export class MissingApiKey extends Error {
  // @ts-ignore
  constructor(message) {
    super(message)

    // assign the error class name in your custom error (as a shortcut)
    this.name = this.constructor.name

    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class CoinMarketCapMill extends BaseMill {
  private readonly client: CoinMarketCap
  private readonly pollIntervalMs: number
  apiKey: string
  getQuotesParams: {}

  constructor({
    id = 'coinmarketcap',
    apiKey = '',
    getQuotesParams = {},
    pollIntervalMs = 5000,
  }) {
    super()

    if (id) this.setId(id)
    this.pollIntervalMs = pollIntervalMs
    this.getQuotesParams = getQuotesParams
    this.apiKey = apiKey
    this.client = new CoinMarketCap(apiKey)
  }

  private getQuotes = async () => {
    return this.client.getQuotes(this.getQuotesParams).then((data: any) => {
      const paper = {
        data,
        created: new Date(),
      }

      this.emitter.publish(`mill.${this.id ?? 'undefined'}`, paper)
    })
  }

  start = () => {
    super.start()

    if (!this.apiKey) {
      throw new MissingApiKey('CoinMarketCapMill requires an apiKey')
    }

    void poll(this.getQuotes, this.pollIntervalMs)
  }
}

export default CoinMarketCapMill
