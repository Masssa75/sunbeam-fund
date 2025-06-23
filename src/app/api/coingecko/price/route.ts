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