'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Statistic, message, Spin, Table, Select, Space, Typography } from 'antd'
import { Node, Subscription, Profile, ProfileTrafficData } from '@/types'
import { ClusterOutlined, FileTextOutlined, UsergroupAddOutlined, LineChartOutlined, BarChartOutlined, TableOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DashboardPage() {
  const [nodeCount, setNodeCount] = useState<number>(0)
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0)
  const [profileCount, setProfileCount] = useState<number>(0)
  const [totalTrafficCount, setTotalTrafficCount] = useState<number>(0)
  const [profileTraffic, setProfileTraffic] = useState<Record<string, number>>({})
  const [trafficTrend, setTrafficTrend] = useState<{ date: string, count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [trafficGranularity, setTrafficGranularity] = useState<'day' | 'week' | 'month'>('day')
  const [selectedProfileForTrend, setSelectedProfileForTrend] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nodesRes, subsRes, profilesRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/subscriptions'),
          fetch('/api/profiles'),
        ]);

        if (!nodesRes.ok || !subsRes.ok || !profilesRes.ok) {
          throw new Error('Failed to fetch initial dashboard data');
        }

        const nodes: Node[] = await nodesRes.json();
        const subscriptions: Subscription[] = await subsRes.json();
        const profilesData: Profile[] = await profilesRes.json();
        
        setNodeCount(nodes.length);
        setSubscriptionCount(subscriptions.length);
        setProfileCount(profilesData.length);
        setProfiles(profilesData);

        // Traffic fetching moved inside to be chained
        const trendUrl = `/api/traffic?granularity=${trafficGranularity}${selectedProfileForTrend ? `&profileId=${selectedProfileForTrend}` : ''}`;
        const trendRes = await fetch(trendUrl);
        if(!trendRes.ok) throw new Error('Failed to fetch traffic trend data');
        const trafficTrendData: { date: string, count: number }[] = await trendRes.json();
        setTrafficTrend(trafficTrendData);

        // Calculate 24h traffic from the daily trend data if granularity is day
        let recentTrafficCount = 0;
        const trafficByProfile: Record<string, number> = {};
        
        // For simplicity, we'll just sum all traffic for now.
        // A more complex API would be needed for precise 24h data across all granularities.
        const allTrafficRes = await fetch('/api/traffic?granularity=day');
        if(!allTrafficRes.ok) throw new Error('Failed to fetch all traffic data');
        const allTrafficRecords: { date: string, count: number, profileId: string }[] = await allTrafficRes.json(); // Assuming API can return profileId

        allTrafficRecords.forEach(record => {
            recentTrafficCount += record.count;
            if (record.profileId) {
                trafficByProfile[record.profileId] = (trafficByProfile[record.profileId] || 0) + record.count;
            }
        });
        
        setTotalTrafficCount(recentTrafficCount);
        setProfileTraffic(trafficByProfile);


      } catch (error) {
        message.error('加载仪表盘数据失败');
        console.error('Failed to fetch dashboard data:', error);
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
  }).sort((a, b) => b.count - a.count);

  const profileTrafficColumns: TableProps<ProfileTrafficData>['columns'] = [
    { title: '配置文件名称', dataIndex: 'name', key: 'name' },
    { title: '总请求次数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
  ];

  const trendColumns: TableProps<{ date: string, count: number }>['columns'] = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '请求次数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
  ];

  return (
    <Spin spinning={loading} size="large" tip="加载中...">
      <div style={{ padding: '1px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>仪表盘</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="节点总数"
                value={nodeCount}
                prefix={<ClusterOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="订阅总数"
                value={subscriptionCount}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="配置文件总数"
                value={profileCount}
                prefix={<UsergroupAddOutlined />}
                valueStyle={{ color: '#0050b3' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="累计订阅请求"
                value={totalTrafficCount}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              title={<Space><BarChartOutlined /> 订阅请求趋势</Space>}
              extra={
                <Space>
                  <Select defaultValue="day" style={{ width: 120 }} onChange={(value) => setTrafficGranularity(value as 'day' | 'week' | 'month')}>
                    <Option value="day">按天</Option>
                    <Option value="week">按周</Option>
                    <Option value="month">按月</Option>
                  </Select>
                  <Select
                    allowClear
                    placeholder="按配置过滤"
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
              <Table
                size="small"
                columns={trendColumns}
                dataSource={trafficTrend}
                pagination={{ pageSize: 5 }}
                rowKey="date"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
                bordered={false}
                title={<Space><TableOutlined /> 各配置文件请求统计</Space>}
            >
              <Table
                size="small"
                columns={profileTrafficColumns}
                dataSource={profileTrafficData}
                pagination={{ pageSize: 5 }}
                rowKey="key"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}