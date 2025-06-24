import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || !url.includes('docs.google.com')) {
      return NextResponse.json({ error: 'Invalid Google Doc URL' }, { status: 400 })
    }
    
    // Fetch the document content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SunbeamBot/1.0)'
      },
      redirect: 'follow'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`)
    }
    
    const content = await response.text()
    
    // Return as plain text
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    console.error('Error fetching Google Doc:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Doc' },
      { status: 500 }
    )
  }
}