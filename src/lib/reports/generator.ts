import type { Position } from '@/lib/types'

export interface MonthlyReport {
  reportMonth: string
  generatedAt: string
  fundOverview: {
    totalFundValue: number
    monthlyPerformance: number
    yearToDatePerformance: number
  }
  highlights: {
    marketAnalysis: string
    portfolioStrategy: string
    keyProjects: string[]
  }
  investors: InvestorReport[]
  positions: PositionReport[]
  disclaimer: string
  confidentialityNotice: string
}

export interface InvestorReport {
  name: string
  accountNumber: string
  investmentValue: number
  performanceFee: number
  netValue: number
  monthlyPerformance: number
  yearToDatePerformance: number
}

export interface PositionReport {
  projectName: string
  symbol: string
  amount: number
  costBasis: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  allocation: number
}

// Mock investor data - in production this would come from database
const MOCK_INVESTORS = [
  {
    name: 'Ralph Sigg',
    accountNumber: '003',
    sharePercent: 0.389, // 38.9% of fund based on $77,666 / $199,343
  },
  {
    name: 'John Doe',
    accountNumber: '001',
    sharePercent: 0.311,
  },
  {
    name: 'Jane Smith',
    accountNumber: '002',
    sharePercent: 0.300,
  }
]

export async function generateMonthlyReport(
  positions: Position[],
  reportMonth: string
): Promise<MonthlyReport> {
  // Calculate fund overview
  const totalFundValue = positions.reduce((sum, p) => sum + (p.current_value || 0), 0)
  const totalCostBasis = positions.reduce((sum, p) => sum + (p.cost_basis || 0), 0)
  const totalProfitLoss = totalFundValue - totalCostBasis
  const monthlyPerformance = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0

  // For YTD, we'd need historical data - for now use monthly
  const yearToDatePerformance = monthlyPerformance

  // Generate position reports
  const positionReports: PositionReport[] = positions.map(p => ({
    projectName: p.project_name,
    symbol: p.symbol.toUpperCase(),
    amount: p.amount,
    costBasis: p.cost_basis || 0,
    currentValue: p.current_value || 0,
    profitLoss: p.profit_loss || 0,
    profitLossPercent: p.profit_loss_percent || 0,
    allocation: totalFundValue > 0 ? ((p.current_value || 0) / totalFundValue) * 100 : 0
  }))

  // Sort by allocation descending
  positionReports.sort((a, b) => b.allocation - a.allocation)

  // Generate investor reports
  const investorReports: InvestorReport[] = MOCK_INVESTORS.map(investor => {
    const investmentValue = totalFundValue * investor.sharePercent
    const costBasis = totalCostBasis * investor.sharePercent
    const profitLoss = investmentValue - costBasis
    const performanceFee = profitLoss > 0 ? profitLoss * 0.30 : 0 // 30% performance fee
    const netValue = investmentValue - performanceFee
    const monthlyPerf = costBasis > 0 ? ((netValue - costBasis) / costBasis) * 100 : 0

    return {
      name: investor.name,
      accountNumber: investor.accountNumber,
      investmentValue,
      performanceFee,
      netValue,
      monthlyPerformance: monthlyPerf,
      yearToDatePerformance: monthlyPerf // Would need historical data for accurate YTD
    }
  })

  // Generate highlights based on performance
  const topPerformers = positionReports
    .filter(p => p.profitLossPercent > 0)
    .sort((a, b) => b.profitLossPercent - a.profitLossPercent)
    .slice(0, 3)

  const marketAnalysis = generateMarketAnalysis(monthlyPerformance, positionReports)
  const portfolioStrategy = generatePortfolioStrategy(positionReports)

  return {
    reportMonth,
    generatedAt: new Date().toISOString(),
    fundOverview: {
      totalFundValue,
      monthlyPerformance,
      yearToDatePerformance
    },
    highlights: {
      marketAnalysis,
      portfolioStrategy,
      keyProjects: topPerformers.map(p => `${p.projectName} (+${p.profitLossPercent.toFixed(1)}%)`)
    },
    investors: investorReports,
    positions: positionReports,
    disclaimer: 'This statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult your financial advisor before making any investment decisions.',
    confidentialityNotice: 'This document is confidential and intended solely for the use of the individual to whom it is addressed. Unauthorized use, disclosure, or copying is strictly prohibited.'
  }
}

function generateMarketAnalysis(monthlyPerformance: number, positions: PositionReport[]): string {
  if (monthlyPerformance > 20) {
    return `The portfolio experienced exceptional growth this month with a ${monthlyPerformance.toFixed(1)}% return. This strong performance was driven by favorable market conditions and strategic positioning in high-growth projects.`
  } else if (monthlyPerformance > 10) {
    return `The portfolio delivered solid returns of ${monthlyPerformance.toFixed(1)}% this month, outperforming many traditional investment vehicles. Key contributors included ${positions[0]?.projectName || 'our core holdings'}.`
  } else if (monthlyPerformance > 0) {
    return `The portfolio maintained positive momentum with a ${monthlyPerformance.toFixed(1)}% return. While modest, this performance demonstrates the resilience of our diversified approach.`
  } else {
    return `The portfolio faced challenging market conditions this month, resulting in a ${monthlyPerformance.toFixed(1)}% return. We remain confident in our long-term strategy and the fundamental strength of our holdings.`
  }
}

function generatePortfolioStrategy(positions: PositionReport[]): string {
  const largestPosition = positions[0]
  const concentration = largestPosition ? largestPosition.allocation : 0

  if (concentration > 30) {
    return `Our portfolio maintains a concentrated approach with ${largestPosition.projectName} representing ${concentration.toFixed(1)}% of holdings. This reflects our high conviction in projects with strong fundamentals and growth potential.`
  } else {
    return `We maintain a diversified portfolio across ${positions.length} positions, with our largest holding at ${concentration.toFixed(1)}%. This balanced approach helps manage risk while capturing upside potential across multiple projects.`
  }
}