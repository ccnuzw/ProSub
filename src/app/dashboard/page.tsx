
'use client'

'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Statistic, message, Spin, Table, Select, Space } from 'antd'
import { Node, Subscription, Profile, ProfileTrafficData } from '@/types'
import { ClusterOutlined, FileTextOutlined, UsergroupAddOutlined, LineChartOutlined } from '@ant-design/icons'

const { Option } = Select

export default function DashboardPage() {
  const [nodeCount, setNodeCount] = useState<number>(0)
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0)
  const [profileCount, setProfileCount] = useState<number>(0)
  const [totalTrafficCount, setTotalTrafficCount] = useState<number>(0)
  const [profileTraffic, setProfileTraffic] = useState<Record<string, number>>({}) // Traffic per profile in last 24h
  const [trafficTrend, setTrafficTrend] = useState<{ date: string, count: number }[]>([]) // Traffic trend over time
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([]) // To map profile IDs to names
  const [trafficGranularity, setTrafficGranularity] = useState<'day' | 'week' | 'month'>('day')
  const [selectedProfileForTrend, setSelectedProfileForTrend] = useState<string | undefined>(undefined) // New state for filtering trend by profile

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nodesRes, subsRes, profilesRes, rawTrafficRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/subscriptions'),
          fetch('/api/profiles'),
          fetch('/api/traffic'),
        ]);

        // 检查每个请求是否成功
        if (!nodesRes.ok || !subsRes.ok || !profilesRes.ok || !rawTrafficRes.ok) {
            // 如果任一请求失败，就抛出错误
            throw new Error('Failed to fetch dashboard data');
        }

        const nodes: Node[] = await nodesRes.json();
        const subscriptions: Subscription[] = await subsRes.json();
        const profilesData: Profile[] = await profilesRes.json();
        const rawTrafficRecords: { timestamp: string, profileId: string }[] = await rawTrafficRes.json();

        setNodeCount(nodes.length);
        setSubscriptionCount(subscriptions.length);
        setProfileCount(profilesData.length);
        setProfiles(profilesData);

        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const recentTraffic = rawTrafficRecords.filter(record => {
          return new Date(record.timestamp) > twentyFourHoursAgo;
        });
        setTotalTrafficCount(recentTraffic.length);

        const trafficByProfile: Record<string, number> = {};
        recentTraffic.forEach(record => {
          trafficByProfile[record.profileId] = (trafficByProfile[record.profileId] || 0) + 1;
        });
        setProfileTraffic(trafficByProfile);

        // Fetch traffic trend based on selected granularity and profile
        const trendUrl = `/api/traffic?granularity=${trafficGranularity}${selectedProfileForTrend ? `&profileId=${selectedProfileForTrend}` : ''}`
        const trendRes = await fetch(trendUrl)
        const trafficTrendData: { date: string, count: number }[] = (await trendRes.json()) as { date: string, count: number }[]
        setTrafficTrend(trafficTrendData)

      } catch (error) {
        message.error('加载仪表盘数据失败');
        console.error('Failed to fetch dashboard data:', error);
        // 出错时设置为空数组，避免 map/filter 报错
        setProfiles([]); 
        setProfileTraffic({});
        setTotalTrafficCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trafficGranularity, selectedProfileForTrend]);

  const profileTrafficData = Object.keys(profileTraffic).map(profileId => {
    const profile = profiles.find(p => p.id === profileId)
    return {
      key: profileId,
      name: profile ? profile.name : `未知配置文件 (${profileId})`,
      count: profileTraffic[profileId],
    }
  }).sort((a, b) => b.count - a.count) // Sort by count descending

  const profileTrafficColumns = [
    { title: '配置文件名称', dataIndex: 'name', key: 'name' },
    { title: '24小时内请求次数', dataIndex: 'count', key: 'count', sorter: (a: ProfileTrafficData, b: ProfileTrafficData) => a.count - b.count },
  ]

  return (
    <Spin spinning={loading} size="large" tip="加载中...">
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>仪表盘</h1>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="节点总数"
                value={nodeCount}
                prefix={<ClusterOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="订阅总数"
                value={subscriptionCount}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="配置文件总数"
                value={profileCount}
                prefix={<UsergroupAddOutlined />}
                valueStyle={{ color: '#0050b3' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="过去24小时订阅请求"
                value={totalTrafficCount}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card
              title="订阅请求趋势"
              extra={
                <Space>
                  <Select defaultValue="day" style={{ width: 120 }} onChange={(value) => setTrafficGranularity(value as 'day' | 'week' | 'month')}>
                    <Option value="day">按天</Option>
                    <Option value="week">按周</Option>
                    <Option value="month">按月</Option>
                  </Select>
                  <Select
                    allowClear
                    placeholder="选择配置文件"
                    style={{ width: 150 }}
                    onChange={(value) => setSelectedProfileForTrend(value || undefined)}
                  >
                    {profiles.map(profile => (
                      <Option key={profile.id} value={profile.id}>
                        {profile.name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              }
            >
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc' }}>
                <p>图表区域 (Recharts 已移除)</p>
              </div>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Card title="各配置文件24小时内订阅请求次数">
              <Table
                columns={profileTrafficColumns}
                dataSource={profileTrafficData}
                pagination={false}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}
