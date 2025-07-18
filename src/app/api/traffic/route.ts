import { NextResponse, NextRequest } from 'next/server'

const getKV = () => {
  return process.env.KV as KVNamespace
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const granularity = searchParams.get('granularity') || 'day' // 'day', 'week', 'month'
  const profileId = searchParams.get('profileId') // Optional: filter by profile

  try {
    const KV = getKV()
    const trafficList = await KV.list({ prefix: 'traffic:' })
    let trafficRecords: { timestamp: string, profileId: string }[] = await Promise.all(
      trafficList.keys.map(async ({ name }) => {
        const recordJson = await KV.get(name)
        return recordJson ? JSON.parse(recordJson) : null
      })
    )
    trafficRecords = trafficRecords.filter(Boolean)

    if (profileId) {
      trafficRecords = trafficRecords.filter(record => record.profileId === profileId)
    }

    const aggregatedTraffic: Record<string, number> = {}

    trafficRecords.forEach(record => {
      const date = new Date(record.timestamp)
      let key: string

      switch (granularity) {
        case 'week':
          // Get the start of the week (Sunday)
          const startOfWeek = new Date(date)
          startOfWeek.setDate(date.getDate() - date.getDay())
          key = startOfWeek.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'day':
        default:
          key = date.toISOString().split('T')[0]
          break
      }
      aggregatedTraffic[key] = (aggregatedTraffic[key] || 0) + 1
    })

    // Convert to array of { date, count } for charting
    const sortedTraffic = Object.keys(aggregatedTraffic)
      .sort()
      .map(date => ({ date, count: aggregatedTraffic[date] }))

    return NextResponse.json(sortedTraffic)
  } catch (error) {
    console.error('Failed to fetch traffic records:', error)
    return NextResponse.json({ error: 'Failed to fetch traffic records' }, { status: 500 })
  }
}