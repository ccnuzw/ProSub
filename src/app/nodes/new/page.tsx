'use client'

import NodeForm from '@/components/NodeForm'
import { Card, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'

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