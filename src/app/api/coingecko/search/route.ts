import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    console.log('[API Route] Searching CoinGecko for:', query)
    
    // Search for coins
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    const searchData = await searchResponse.json()

    if (!searchData.coins || searchData.coins.length === 0) {
      return NextResponse.json({ coins: [] })
    }

    // Return the search results in the format expected by the component
    const results = {
      coins: searchData.coins.slice(0, 10) // First 10 results
    }

    console.log('[API Route] Found', results.coins.length, 'coins')
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in CoinGecko search:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}