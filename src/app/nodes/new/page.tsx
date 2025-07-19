'use client'

import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 NodeForm 組件
const NodeForm = dynamic(() => import('@/components/NodeForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function NewNodePage() {
  return (
    <Card
      title="添加新节点"
      extra={
        <Link href="/nodes">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      <NodeForm />
    </Card>
  )
}