import { CURRENCY_CONVERSION_FEE } from '../constants/currency'

const VCB_USD_TRANSFER_RATE_REGEX = /CurrencyCode="USD".*?Transfer="([^"]+)"/

function _convertVCB() {
  return getCachedOrFetch('currency:usd-to-vnd-vcb', () => $fetch<string>('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10'))
}

function _convertJsDelivr() {
  return getCachedOrFetch('currency:usd-to-vnd-jsdelivr', () => $fetch<{ usd: { vnd: number } }>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'))
}

export async function convertUSDToVND(amount: number): Promise<number> {
  try {
    const xml = await _convertVCB()
    const rate = Number.parseFloat(xml.match(VCB_USD_TRANSFER_RATE_REGEX)?.[1]?.replace(/,/g, '') || '')

    if (!rate || Number.isNaN(rate))
      throw new Error('Invalid currency value')
    return Math.round(rate * amount * CURRENCY_CONVERSION_FEE)
  }
  catch {
    return _convertJsDelivr()
      .then(res => Math.round(res.usd.vnd * amount * CURRENCY_CONVERSION_FEE))
      .catch(() => {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to convert currency',
        })
      })
  }
}

export async function convertVNDToUSD(amount: number): Promise<number> {
  try {
    const xml = await _convertVCB()
    const rate = Number.parseFloat(xml.match(VCB_USD_TRANSFER_RATE_REGEX)?.[1]?.replace(/,/g, '') || '')

    if (!rate || Number.isNaN(rate))
      throw new Error('Invalid currency value')
    return Math.round(amount / rate / CURRENCY_CONVERSION_FEE)
  }
  catch {
    return _convertJsDelivr()
      .then(res => Math.round(amount / res.usd.vnd / CURRENCY_CONVERSION_FEE))
      .catch(() => {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to convert currency',
        })
      })
  }
}
