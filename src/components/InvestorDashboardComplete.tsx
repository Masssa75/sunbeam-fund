'use client'

import { useState, useEffect } from 'react'

interface Position {
  id: string
  project_id: string
  project_name: string
  symbol: string
  amount: number
  cost_basis: number
  entry_date: string
  exit_date?: string
  notes?: string
}

interface Tweet {
  id: string
  project_name: string
  tweet_text: string
  summary?: string
  importance_score: number
  created_at: string
}

interface InvestorStanding {
  name: string
  accountNumber: string
  sharePercentage: number
  initialInvestment: number
  currentValue: number
  totalReturn: number
  totalReturnPercent: number
  monthlyReturn: number
  monthlyReturnPercent: number
  status: string
}

interface Props {
  viewAsId?: string | null
}

export default function InvestorDashboardComplete({ viewAsId }: Props) {
  const [positions, setPositions] = useState<Position[]>([])
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [investorStanding, setInvestorStanding] = useState<InvestorStanding | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [showCommentary, setShowCommentary] = useState(false)
  const [showHistoricalExamples, setShowHistoricalExamples] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [viewAsId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load positions
      const positionsUrl = viewAsId ? `/api/positions?viewAs=${viewAsId}` : '/api/positions'
      const positionsRes = await fetch(positionsUrl)
      const positionsData = await positionsRes.json()
      
      if (Array.isArray(positionsData)) {
        setPositions(positionsData)
        
        // Load prices for positions
        const projectIds = positionsData
          .filter(pos => !pos.project_id.startsWith('custom-'))
          .map(pos => pos.project_id)
        
        if (projectIds.length > 0) {
          const pricesRes = await fetch('/api/coingecko/price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectIds })
          })
          const pricesData = await pricesRes.json()
          setPrices(pricesData)
        }
      }
      
      // Load investor standing data
      try {
        const standingUrl = viewAsId ? `/api/investor/standing?viewAs=${viewAsId}` : '/api/investor/standing'
        const standingRes = await fetch(standingUrl)
        if (standingRes.ok) {
          const standingData = await standingRes.json()
          setInvestorStanding(standingData.standing)
        }
      } catch (err) {
        console.log('Could not load investor standing:', err)
      }
      
      // Load recent developments (important tweets)
      try {
        const recentDevUrl = viewAsId ? `/api/investor/recent-developments?viewAs=${viewAsId}` : '/api/investor/recent-developments'
        const recentDevRes = await fetch(recentDevUrl)
        if (recentDevRes.ok) {
          const recentDevData = await recentDevRes.json()
          setTweets(recentDevData.tweets || [])
        }
      } catch (err) {
        console.log('Could not load recent developments:', err)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate portfolio metrics
  const portfolioMetrics = () => {
    let totalCost = 0
    let totalValue = 0
    let actualTotalValue = 0 // Include ALL positions for percentage calculations
    const allocations: Record<string, number> = {}
    
    // Calculate ACTUAL total value including ALL positions (including CURE Protocol)
    positions.forEach(pos => {
      const price = prices[pos.project_id] || 0
      let currentValue = pos.project_id.startsWith('custom-') ? pos.cost_basis : pos.amount * price
      
      // If no price and not custom, use cost basis as fallback
      if (currentValue === 0 && !pos.project_id.startsWith('custom-')) {
        currentValue = pos.cost_basis
      }
      
      actualTotalValue += currentValue
    })
    
    // Filter out CURE Protocol from investor view for display/return calculations
    const investorPositions = positions.filter(pos => pos.project_name !== 'CURE Protocol')
    
    investorPositions.forEach(pos => {
      totalCost += pos.cost_basis
      
      const price = prices[pos.project_id] || 0
      let currentValue = pos.project_id.startsWith('custom-') ? pos.cost_basis : pos.amount * price
      
      // If no price and not custom, use cost basis as fallback
      if (currentValue === 0 && !pos.project_id.startsWith('custom-')) {
        currentValue = pos.cost_basis
      }
      
      totalValue += currentValue
    })
    
    // Calculate allocations using ACTUAL total value (including CURE Protocol)
    investorPositions.forEach(pos => {
      const price = prices[pos.project_id] || 0
      let currentValue = pos.project_id.startsWith('custom-') ? pos.cost_basis : pos.amount * price
      
      if (currentValue === 0 && !pos.project_id.startsWith('custom-')) {
        currentValue = pos.cost_basis
      }
      
      allocations[pos.project_name] = actualTotalValue > 0 ? (currentValue / actualTotalValue) * 100 : 0
    })
    
    const totalReturn = totalValue - totalCost
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
    
    return {
      totalValue,
      totalReturn,
      totalReturnPercent,
      allocations,
      actualTotalValue
    }
  }

  const metrics = portfolioMetrics()
  
  // Get top 4 holdings and group others
  // Only show projects with detailed explanations
  const projectsWithExplanations = ['Kaspa', 'Bittensor', 'Toncoin']
  const topHoldings = positions
    .filter(pos => projectsWithExplanations.includes(pos.project_name)) // Only show projects with deep dives
    .map(pos => {
      const currentPrice = prices[pos.project_id] || 0
      const value = pos.project_id.startsWith('custom-') 
        ? pos.cost_basis 
        : pos.amount * currentPrice
      
      // If no current price and not custom, use cost basis as fallback
      const fallbackValue = currentPrice === 0 && !pos.project_id.startsWith('custom-') 
        ? pos.cost_basis 
        : value
      
      // Calculate allocation - handle division by zero (use actual total including CURE Protocol)
      const allocation = (metrics.actualTotalValue > 0) 
        ? (fallbackValue / metrics.actualTotalValue) * 100 
        : 0
      
      return {
        ...pos,
        value: fallbackValue,
        allocation,
        currentPrice
      }
    })
    .filter(pos => pos.value > 0) // Only show positions with value
    .sort((a, b) => b.value - a.value)
  
  const top4 = topHoldings.slice(0, 4)
  
  // Calculate "others" as all positions not in the projects with explanations (including CURE Protocol)
  const allOtherPositions = positions.filter(pos => 
    !projectsWithExplanations.includes(pos.project_name)
  )
  
  // Calculate actual "others" percentage including CURE Protocol
  let othersTotal = 0
  allOtherPositions.forEach(pos => {
    const price = prices[pos.project_id] || 0
    let currentValue = pos.project_id.startsWith('custom-') ? pos.cost_basis : pos.amount * price
    
    if (currentValue === 0 && !pos.project_id.startsWith('custom-')) {
      currentValue = pos.cost_basis
    }
    
    if (metrics.actualTotalValue > 0) {
      othersTotal += (currentValue / metrics.actualTotalValue) * 100
    }
  })

  if (!mounted) {
    return <div className="min-h-screen bg-white" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading Portfolio...</div>
      </div>
    )
  }

  // Always show portfolio holdings with fallback data
  const displayHoldings = top4.length > 0 ? top4 : [
    { id: '1', project_name: 'Kaspa', allocation: 35.0, project_id: 'kaspa' },
    { id: '2', project_name: 'Bittensor', allocation: 35.0, project_id: 'bittensor' },
    { id: '3', project_name: 'Toncoin', allocation: 30.0, project_id: 'toncoin' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-10 py-5 border-b border-gray-200 flex justify-between items-center">
        <div className="font-medium">Sunbeam Capital</div>
        <div className="text-sm text-gray-500">
          {investorStanding ? `${investorStanding.name} · Account ${investorStanding.accountNumber}` : 'Investor Portal'}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-5 py-16">
        {/* Intro */}
        <div className="mb-16">
          <h1 className="text-5xl font-light leading-tight mb-5">
            You own the future of blockchain.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {positions.filter(p => p.project_name !== 'CURE Protocol').length > 0 ? positions.filter(p => p.project_name !== 'CURE Protocol').length : '12'} carefully selected technologies. Each solving fundamental problems. Built for the next decade.
          </p>
        </div>

        {/* Performance Section */}
        <div className="mb-16">
          <div className="relative bg-gray-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <span className="block text-2xl font-medium mb-1">
                  ${investorStanding ? investorStanding.currentValue.toLocaleString() : metrics.totalValue.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Current Value</span>
              </div>
              <div>
                <span className={`block text-2xl font-medium mb-1 ${(investorStanding ? investorStanding.totalReturnPercent : metrics.totalReturnPercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(investorStanding ? investorStanding.totalReturnPercent : metrics.totalReturnPercent) >= 0 ? '+' : ''}{(investorStanding ? investorStanding.totalReturnPercent : metrics.totalReturnPercent).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Total Return</span>
              </div>
              <div>
                <span className={`block text-2xl font-medium mb-1 ${(investorStanding ? investorStanding.monthlyReturnPercent : 3.8) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(investorStanding ? investorStanding.monthlyReturnPercent : 3.8) >= 0 ? '+' : ''}{(investorStanding ? investorStanding.monthlyReturnPercent : 3.8).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">This Month</span>
              </div>
              <div>
                <span className="block text-2xl font-medium mb-1">Dec 2023</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Invested Since</span>
              </div>
            </div>
            
            {/* Commentary Toggle */}
            <button
              onClick={() => setShowCommentary(!showCommentary)}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-md hover:shadow-lg"
            >
              <span>Market Context</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showCommentary ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          
          {/* Market Commentary */}
          {showCommentary && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg text-sm leading-relaxed text-gray-700 animate-in slide-in-from-top-2 duration-300">
              <div className="font-semibold mb-3 text-base">Current Market Perspective</div>
              <div className="space-y-3">
                <p>
                  Since November's peak, the crypto market has faced <span className="font-medium text-black">strong headwinds</span>. While Bitcoin has remained relatively stable, the broader altcoin market has declined 70-80%, with meme coins experiencing even steeper losses.
                </p>

                <p>
                  The irony is striking: <span className="font-medium text-black">the United States has become extraordinarily pro-crypto</span>, with everything positioned for the market to take off following Trump's inauguration. Yet the rally hasn't materialized.
                </p>
                
                <p>
                  Why? Multiple forces are creating unprecedented uncertainty. Tariff wars, Middle East conflicts, and the Trump administration's willingness to pursue radical policies—<span className="font-medium text-black">all of these keep markets constantly guessing</span>. Together, they've created a holding pattern where everyone's waiting for clarity that hasn't arrived.
                </p>

                <p>
                  We believe this uncertainty masks <span className="font-medium text-black">significant opportunity</span>. The world's largest economy has pivoted from crypto skepticism to embrace—a shift we view as fundamentally important. While current headwinds may delay market response, we think the underlying change in stance matters more than short-term volatility.
                </p>
                
                <p>
                  When markets turn, we believe our holdings will capture exponential growth—because they solve crypto's biggest problems and capitalize on its greatest opportunities. Kaspa is the first project since Bitcoin to fundamentally change how blockchains work—replacing sequential chains with parallel processing. This solves crypto's biggest limitation: scale. Bittensor creates decentralized AI that no company controls—potentially the most consequential use of blockchain technology. Toncoin tackles crypto's adoption problem, able to onboard a billion users overnight. <span className="font-medium text-black">Most projects are iterations. These are breakthroughs that could change crypto forever</span>.
                </p>

                <p>
                  Let's be clear about where we are: <span className="font-medium text-black">Bitcoin dominance has reached extreme levels</span>. In past cycles, individual investors drove Bitcoin higher, then rotated profits into altcoins. This time is different—institutions, corporations, and governments are accumulating Bitcoin as a treasury asset. MicroStrategy, Tesla, entire nations building strategic reserves.
                </p>

                {/* Altcoin Season Indicator */}
                <div className="bg-red-50 rounded-lg p-5 my-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-3xl font-bold text-red-600">14</div>
                        <div className="text-xs text-red-600 font-medium">Deep Bitcoin Season</div>
                      </div>
                      <div className="h-14 w-px bg-red-200"></div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">Altcoin Season Index</div>
                        <div className="text-xs">Only 14% of top altcoins outperforming Bitcoin</div>
                        <div className="text-xs mt-1 text-gray-500">Similar to Dec 2022 lows (score: 10)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced chart visualization */}
                  <div className="mb-3">
                    <svg viewBox="0 0 400 80" className="w-full h-16">
                      <defs>
                        <linearGradient id="seasonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor:'#ef4444', stopOpacity:0.15}} />
                          <stop offset="25%" style={{stopColor:'#f59e0b', stopOpacity:0.15}} />
                          <stop offset="50%" style={{stopColor:'#10b981', stopOpacity:0.15}} />
                          <stop offset="75%" style={{stopColor:'#3b82f6', stopOpacity:0.15}} />
                          <stop offset="100%" style={{stopColor:'#ef4444', stopOpacity:0.15}} />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="80" fill="url(#seasonGradient)" />
                      
                      {/* Grid lines */}
                      <line x1="100" y1="0" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="200" y1="0" x2="200" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="300" y1="0" x2="300" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {/* Historical line showing we're at the bottom */}
                      <polyline points="10,70 50,65 100,50 150,35 200,20 250,25 300,45 350,68 390,72" 
                                fill="none" stroke="#6b7280" strokeWidth="2.5" opacity="0.7" />
                      
                      {/* Highlight the extreme bottom */}
                      <circle cx="390" cy="72" r="5" fill="#dc2626" />
                      <circle cx="390" cy="72" r="8" fill="#dc2626" opacity="0.3" />
                      <circle cx="390" cy="72" r="11" fill="#dc2626" opacity="0.1" />
                      <line x1="390" y1="0" x2="390" y2="80" stroke="#dc2626" strokeWidth="2" opacity="0.4" />
                      
                      {/* Label current position */}
                      <text x="385" y="12" fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">NOW</text>
                    </svg>
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                    <span>Bitcoin Season</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>Altcoin Season</span>
                  </div>
                  
                  <a 
                    href="https://www.blockchaincenter.net/en/altcoin-season-index/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline block text-center"
                  >
                    View full interactive chart →
                  </a>
                </div>

                <p>
                  But the capital rotation is beginning. The U.S. government is actively exploring various altcoins—including Ethereum, Solana, and others—as part of their strategic crypto reserve. A movement similar to MicroStrategy's Bitcoin accumulation is emerging around Ethereum, with multiple corporations now exploring altcoins for their treasuries. This June, Synaptogenix announced <span className="font-medium text-black">$100 million for Bittensor</span> in their strategic reserve. As geopolitical tensions ease and inflation stabilizes, we expect institutional discovery of our altcoins to accelerate. <span className="font-medium text-black">When it happens, the moves will be explosive</span>.
                </p>

                <p>
                  But here's what experience teaches us: <span className="font-medium text-black">these drops are normal in crypto cycles</span>. Every major bull run has been preceded by periods just like this—when sentiment reaches maximum pessimism and only the strongest conviction survives. Consider Ethereum dropping to $80 in 2018 before reaching $4,800. Or Solana falling to $0.50 before hitting $260. Polygon went from $0.003 to $2.92—a 973x return. <span className="font-medium text-black">The pattern is consistent: maximum pain precedes maximum gain</span>.
                </p>
                
                {/* Historical Examples */}
                <div className="bg-gray-100 rounded-lg p-5 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-sm">Historical Perspective: Bear Market Survivors</div>
                    <button
                      onClick={() => setShowHistoricalExamples(!showHistoricalExamples)}
                      className="text-gray-600 text-xs flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      <span>{showHistoricalExamples ? 'Show less' : 'Show more'}</span>
                      <svg 
                        className={`w-3 h-3 transition-transform ${showHistoricalExamples ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400 flex justify-between mb-3 px-1">
                    <span>Project</span>
                    <span>2018-19 Bear → 2021 Bull</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Chainlink</span>
                      <div className="flex items-center gap-2">
                        <span>$0.30 → $52</span>
                        <span className="text-green-500 font-semibold">(173x)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Polygon</span>
                      <div className="flex items-center gap-2">
                        <span>$0.003 → $2.92</span>
                        <span className="text-green-500 font-semibold">(973x)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Ethereum</span>
                      <div className="flex items-center gap-2">
                        <span>$80 → $4,800</span>
                        <span className="text-green-500 font-semibold">(60x)</span>
                      </div>
                    </div>
                    
                    {showHistoricalExamples && (
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Solana</span>
                          <div className="flex items-center gap-2">
                            <span>$0.50 → $260</span>
                            <span className="text-green-500 font-semibold">(520x)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Cardano</span>
                          <div className="flex items-center gap-2">
                            <span>$0.03 → $3.10</span>
                            <span className="text-green-500 font-semibold">(103x)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Avalanche</span>
                          <div className="flex items-center gap-2">
                            <span>$2.80 → $146</span>
                            <span className="text-green-500 font-semibold">(52x)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">BNB</span>
                          <div className="flex items-center gap-2">
                            <span>$6 → $690</span>
                            <span className="text-green-500 font-semibold">(115x)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Axie Infinity</span>
                          <div className="flex items-center gap-2">
                            <span>$0.10 → $165</span>
                            <span className="text-green-500 font-semibold">(1,650x)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <p>
                  We've carefully selected holdings we believe possess extraordinary value—projects solving fundamental problems that could define crypto's next decade. History shows that <span className="font-medium text-black">the greatest returns come to those who can hold through the darkest periods</span>. When this market finally turns, and institutional capital floods into quality altcoins, we expect extraordinary returns. We believe the question isn't if, but when.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Developments */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-xl font-medium">Recent Developments</h3>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors">
                i
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                <div className="text-center mb-1 font-medium">AI-Powered Monitoring</div>
                <div>We continuously monitor Twitter, GitHub, and official channels for each portfolio project. Our AI system scores updates 1-10 for importance—only the most significant developments (9+) appear here.</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          
          {tweets.length > 0 ? (
            tweets.map((tweet, index) => (
              <div key={tweet.id} className="flex gap-6 mb-8">
                <div className="text-sm text-gray-400 min-w-24 flex-shrink-0">
                  {getRelativeTime(tweet.created_at)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">{tweet.project_name}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {tweet.summary || tweet.tweet_text.substring(0, 200)}
                    {!tweet.summary && tweet.tweet_text.length > 200 && '...'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Placeholder content when no tweets are available
            <>
              <div className="flex gap-6 mb-8">
                <div className="text-sm text-gray-400 min-w-24 flex-shrink-0">2 hours ago</div>
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">Kaspa</div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Major protocol upgrade announcement showing continued development progress
                  </div>
                </div>
              </div>
              
              <div className="flex gap-6 mb-8">
                <div className="text-sm text-gray-400 min-w-24 flex-shrink-0">Yesterday</div>
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">Bittensor</div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    New AI subnet launched for specialized machine learning models
                  </div>
                </div>
              </div>
              
              <div className="flex gap-6 mb-8">
                <div className="text-sm text-gray-400 min-w-24 flex-shrink-0">3 days ago</div>
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">Sui</div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Partnership with major gaming studio announced for blockchain integration
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Portfolio Holdings */}
        <div className="mt-20 pt-10 border-t border-gray-200 space-y-0">
          <h3 className="text-sm font-light text-gray-500 uppercase tracking-wider mb-6">Core Holdings</h3>
          {displayHoldings.map((position) => (
            <div key={position.id} className="border-t border-gray-200 py-10 cursor-pointer transition-all hover:pl-5" onClick={() => setExpandedProject(expandedProject === position.project_name ? null : position.project_name)}>
              <div className="flex justify-between items-baseline mb-3">
                <h2 className="text-2xl font-medium">{position.project_name}</h2>
                <span className="text-2xl text-gray-400">{position.allocation.toFixed(1)}%</span>
              </div>
              <p className="text-gray-500 leading-relaxed mb-3">
                {getProjectDescription(position.project_name)}
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {getProjectTag(position.project_name)}
              </span>
              
              {/* Expandable Content */}
              {expandedProject === position.project_name && (
                <div className="mt-6 bg-gray-50 rounded-lg p-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="text-base font-semibold mb-4">
                    Why {position.project_name}: {getProjectThesis(position.project_name)}
                  </div>
                  
                  {position.project_name === 'Kaspa' && <KaspaDeepDive />}
                  {position.project_name === 'Bittensor' && <BittensorDeepDive />}
                  {position.project_name === 'Toncoin' && <ToncoinDeepDive />}
                </div>
              )}
            </div>
          ))}
          
          {/* Other Holdings */}
          {othersTotal > 0 && (
            <div className="border-t border-gray-200 py-10">
              <div className="flex justify-between items-baseline mb-3">
                <h2 className="text-2xl font-medium">{allOtherPositions.length} Additional Holdings</h2>
                <span className="text-2xl text-gray-400">{othersTotal.toFixed(1)}%</span>
              </div>
              <p className="text-gray-500 leading-relaxed mb-3">
                Sui, Ethereum, Solana, and other strategic positions.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                Diversified
              </span>
            </div>
          )}
        </div>

        {/* Monthly Reports */}
        <div className="mt-20 pt-10 border-t border-gray-200">
          <h3 className="text-xl font-medium mb-8">Monthly Reports</h3>
          
          <div className="space-y-0">
            {getMonthlyReports().map((report, index) => (
              <div key={index} className="border-b border-gray-200 py-4 flex justify-between items-center hover:bg-gray-50 -mx-5 px-5 rounded cursor-pointer transition-all">
                <div className="flex items-center gap-5">
                  <div className="font-semibold text-sm">{report.month}</div>
                  <div className="text-sm text-gray-500">Portfolio value ${report.value.toLocaleString()}</div>
                </div>
                <div className={`font-semibold text-sm ${report.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {report.return >= 0 ? '+' : ''}{report.return.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-20 p-10 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-5">
            Initial investment ${investorStanding ? investorStanding.initialInvestment.toLocaleString() : '74,000'} · {investorStanding ? investorStanding.sharePercentage.toFixed(2) : '47.28'}% ownership · 3-5 year horizon
          </p>
          <div className="flex justify-center gap-8">
            <a href="#" className="text-sm text-black border-b border-gray-300 hover:border-black pb-1 transition-colors">
              Investment Philosophy
            </a>
            <a href="#" className="text-sm text-black border-b border-gray-300 hover:border-black pb-1 transition-colors">
              Contact Team
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function for relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }
  
  // Check if it's yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // If older than 2 days, show the date
  if (diffDays > 2) {
    return date.toLocaleDateString()
  }
  
  // For 2 days ago
  return '2 days ago'
}

// Helper functions for project data
function getProjectDescription(projectName: string): string {
  const descriptions: Record<string, string> = {
    'Kaspa': 'The next evolution of blockchain. The fastest and most decentralized parallel processing network.',
    'Bittensor': 'The decentralized alternative to OpenAI. AI that anyone can access and build on.',
    'Sui': '120,000 transactions per second. Built to onboard billions.',
    'Toncoin': "Telegram's native blockchain. 900 million users at your fingertips.",
    'Arbitrum': 'Ethereum scaling solution with lower fees and faster transactions.',
    'Celestia': 'Modular blockchain enabling infinite scalability.',
    'Render': 'Decentralized GPU network for 3D rendering and AI compute.',
    'Ethereum': 'The world computer. Foundation of decentralized applications.'
  }
  return descriptions[projectName] || 'Innovative blockchain technology with strong fundamentals.'
}

function getProjectTag(projectName: string): string {
  const tags: Record<string, string> = {
    'Kaspa': 'Speed Revolution',
    'Bittensor': 'AI Infrastructure',
    'Sui': 'Mass Scale',
    'Toncoin': 'Global Reach',
    'Arbitrum': 'Scaling',
    'Celestia': 'Modular',
    'Render': 'GPU Network',
    'Ethereum': 'Foundation'
  }
  return tags[projectName] || 'Technology'
}

function getProjectThesis(projectName: string): string {
  const theses: Record<string, string> = {
    'Kaspa': 'The Next Bitcoin',
    'Bittensor': 'The Decentralized Alternative to OpenAI',
    'Toncoin': 'The Only Crypto With Built-In Mass Adoption',
    'Sui': 'Built for Billion-User Scale'
  }
  return theses[projectName] || 'Strong Fundamental Value'
}

function getMonthlyReports() {
  return [
    { month: 'June 2025', value: 38621, return: 3.8 },
    { month: 'May 2025', value: 37195, return: -12.4 },
    { month: 'April 2025', value: 42472, return: -8.1 },
    { month: 'March 2025', value: 46285, return: -5.2 },
    { month: 'February 2025', value: 48794, return: 2.1 },
    { month: 'January 2025', value: 47789, return: -14.8 }
  ]
}

// Deep dive components
function KaspaDeepDive() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <p className="text-lg leading-relaxed font-medium">
          "If we sacrifice decentralization for speed,<br />
          why not just use AWS?"
        </p>
      </div>
      
      {/* Essential Features Comparison */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="font-semibold text-gray-600">Feature</div>
          <div className="font-semibold text-gray-600">Kaspa</div>
          <div className="font-semibold text-gray-600">Bitcoin</div>
          <div className="font-semibold text-gray-600">Ethereum</div>
          <div className="font-semibold text-gray-600">Solana</div>
          
          <div className="text-gray-500">Block Structure</div>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">BlockDAG</div>
          <div>Chain</div>
          <div>Chain</div>
          <div>Chain</div>
          
          <div className="text-gray-500">Block Time</div>
          <div className="text-green-600 font-semibold">1 second</div>
          <div>10 minutes</div>
          <div>12 seconds</div>
          <div>0.4 seconds*</div>
          
          <div className="text-gray-500">Decentralization</div>
          <div className="text-green-600 font-semibold">High</div>
          <div className="text-green-600 font-semibold">Very High</div>
          <div>Medium</div>
          <div>Low</div>
          
          <div className="text-gray-500">Security Model</div>
          <div className="text-green-600 font-semibold">Pure PoW</div>
          <div className="text-green-600 font-semibold">Pure PoW</div>
          <div>PoS</div>
          <div>PoS/PoH</div>
          
          <div className="text-gray-500">Validator Requirements</div>
          <div className="text-green-600 font-semibold">Home PC</div>
          <div className="text-green-600 font-semibold">Home PC</div>
          <div>32 ETH</div>
          <div>$100K+ Hardware</div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold mb-4">10 Years to Solve the "Impossible"</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Dr. Yonatan Sompolinsky didn't create Kaspa overnight. Starting in 2013, he spent a decade researching how to scale blockchains without sacrificing decentralization. His GHOST protocol papers became required reading—even Vitalik Buterin cited them as the future of blockchain scaling.
        </p>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="font-semibold text-sm mb-1">The Breakthrough: Parallel Blocks</p>
          <p className="text-sm">While every other blockchain processes blocks one after another, Kaspa processes multiple blocks simultaneously using GHOSTDAG. This is like upgrading from a single-lane road to a multi-lane highway. This breakthrough will finally make possible the solutions we could only dream about on old blockchains—instant payments, micropayments, and true global scale without sacrificing security or decentralization.</p>
        </div>
      </div>
    </div>
  )
}

function BittensorDeepDive() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <p className="text-lg leading-relaxed font-medium">
          "AI will either be controlled by a few tech giants,<br />
          or it will be owned by everyone."
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="font-semibold text-gray-600">AI Platform</div>
        <div className="font-semibold text-gray-600">Bittensor</div>
        <div className="font-semibold text-gray-600">OpenAI</div>
        
        <div className="text-gray-500">Ownership</div>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Decentralized</div>
        <div className="text-red-500">Centralized</div>
        
        <div className="text-gray-500">Deploy AI Models</div>
        <div className="text-green-600 font-semibold">Anyone</div>
        <div>OpenAI Only</div>
        
        <div className="text-gray-500">Censorship</div>
        <div className="text-green-600 font-semibold">Resistant</div>
        <div className="text-red-500">Possible</div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold mb-4">Beyond Marketplaces: Running Real AI Networks</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Bittensor isn't just another "AI marketplace." It's building the infrastructure to run decentralized AI networks that can compete with OpenAI and Google. Anyone can contribute processing power, deploy AI systems, and these systems can communicate with each other—creating a truly decentralized alternative to Big Tech AI.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-medium text-black">AI is going to completely change our future, and who owns it is extremely important</span>. Today's AI systems are already highly censored—companies decide what these systems can think and say. The possibility of having AI controlled by people rather than corporations may be one of the most critical developments for our future. Bittensor represents the path toward AI that serves humanity, not just shareholders.
        </p>
      </div>
    </div>
  )
}

function ToncoinDeepDive() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <p className="text-lg leading-relaxed font-medium">
          "While other blockchains are trying to get users,<br />
          TON already has 900 million of them."
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="font-semibold text-gray-600">Distribution</div>
        <div className="font-semibold text-gray-600">TON</div>
        <div className="font-semibold text-gray-600">Ethereum</div>
        
        <div className="text-gray-500">Built-in Users</div>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">900M Users</div>
        <div>~1M Active</div>
        
        <div className="text-gray-500">User Onboarding</div>
        <div className="text-green-600 font-semibold">Already Done</div>
        <div className="text-red-500">Complex</div>
        
        <div className="text-gray-500">Mini-Apps</div>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Built-in</div>
        <div>No</div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold mb-4">Telegram: The Operating System of the Future</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Telegram isn't just a messaging app—it's evolving into a complete digital operating system. With mini-apps, bots, channels, and seamless integrations, it's becoming the platform where people live their digital lives. And TON is the native currency of this ecosystem.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-medium text-black">Of all cryptocurrencies, TON is the one with the real potential to bring crypto to the masses</span>. While others struggle with complex onboarding and technical barriers, TON benefits from Telegram's massive, engaged user base that's already comfortable with digital interactions. This makes it uniquely positioned to achieve true mainstream crypto adoption.
        </p>
      </div>
    </div>
  )
}