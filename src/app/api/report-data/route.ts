import { NextRequest, NextResponse } from 'next/server'

// Hardcoded portfolio data for public reports
// In production, this could be updated via a separate admin process
const PORTFOLIO_DATA = [
  {
    id: '1',
    project_id: 'kaspa',
    project_name: 'Kaspa',
    symbol: 'kas',
    amount: 300000,
    cost_basis: 12000,
    entry_date: '2024-01-15',
    notes: 'Core position - fastest Layer 1'
  },
  {
    id: '2',
    project_id: 'bittensor',
    project_name: 'Bittensor',
    symbol: 'tao',
    amount: 85,
    cost_basis: 25500,
    entry_date: '2024-02-01',
    notes: 'AI thesis - decentralized intelligence'
  },
  {
    id: '3',
    project_id: 'sui',
    project_name: 'Sui',
    symbol: 'sui',
    amount: 15000,
    cost_basis: 18000,
    entry_date: '2024-01-20',
    notes: 'Next-gen Layer 1'
  },
  {
    id: '4',
    project_id: 'the-open-network',
    project_name: 'Toncoin',
    symbol: 'ton',
    amount: 3000,
    cost_basis: 15000,
    entry_date: '2024-03-01',
    notes: 'Telegram ecosystem play'
  },
  {
    id: '5',
    project_id: 'celestia',
    project_name: 'Celestia',
    symbol: 'tia',
    amount: 1200,
    cost_basis: 9600,
    entry_date: '2024-02-15',
    notes: 'Modular blockchain thesis'
  },
  {
    id: '6',
    project_id: 'render-token',
    project_name: 'Render',
    symbol: 'rndr',
    amount: 1000,
    cost_basis: 5000,
    entry_date: '2024-01-25',
    notes: 'Decentralized GPU network'
  },
  {
    id: '7',
    project_id: 'arbitrum',
    project_name: 'Arbitrum',
    symbol: 'arb',
    amount: 5000,
    cost_basis: 5000,
    entry_date: '2024-03-10',
    notes: 'Leading Ethereum L2'
  },
  {
    id: '8',
    project_id: 'near-protocol',
    project_name: 'NEAR Protocol',
    symbol: 'near',
    amount: 1000,
    cost_basis: 4000,
    entry_date: '2024-02-20',
    notes: 'Chain abstraction leader'
  },
  {
    id: '9',
    project_id: 'sei-network',
    project_name: 'Sei',
    symbol: 'sei',
    amount: 10000,
    cost_basis: 3000,
    entry_date: '2024-03-05',
    notes: 'Trading-optimized L1'
  }
]

export async function GET(request: NextRequest) {
  console.log('[API Route] GET /api/report-data called - PUBLIC ENDPOINT')
  
  try {
    // Check if a specific month is requested
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    
    if (month) {
      // In the future, fetch historical report from database
      console.log('[API Route] Historical reports not yet implemented for', month)
      // For now, return current hardcoded data
    }
    
    // Return hardcoded data as fallback
    console.log('[API Route] Returning', PORTFOLIO_DATA.length, 'positions for report')
    
    return NextResponse.json(PORTFOLIO_DATA)
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}