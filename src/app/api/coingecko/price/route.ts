import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coinId = searchParams.get('coinId')

  if (!coinId) {
    return NextResponse.json({ error: 'coinId parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    const data = await response.json()

    if (data[coinId] && data[coinId].usd) {
      return NextResponse.json({ price: data[coinId].usd })
    }

    return NextResponse.json({ price: null })
  } catch (error) {
    console.error('Error fetching coin price:', error)
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { coinIds } = body

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return NextResponse.json({ error: 'coinIds array is required' }, { status: 400 })
    }

    // Join coin IDs and fetch prices
    const idsString = coinIds.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    
    const data = await response.json()
    
    // Transform the response to match what the frontend expects
    const prices: Record<string, number> = {}
    for (const coinId of coinIds) {
      if (data[coinId] && data[coinId].usd) {
        prices[coinId] = data[coinId].usd
      } else {
        prices[coinId] = 0
      }
    }

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching coin prices:', error)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}