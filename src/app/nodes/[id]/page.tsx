'use client'
export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Node } from '@/types'
import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 NodeForm 組件
const NodeForm = dynamic(() => import('@/components/NodeForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function EditNodePage() {
  const [node, setNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true);
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchNode = async () => {
        setLoading(true);
        const res = await fetch(`/api/nodes/${id}`)
        if (res.ok) {
          const data = (await res.json()) as Node
          setNode(data)
        }
        setLoading(false);
      }
      fetchNode()
    }
  }, [id])

  return (
    <Card
      title="编辑节点"
      extra={
        <Link href="/nodes">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      {loading ? <Spin /> : (node ? <NodeForm node={node} /> : <p>加载失败或节点不存在。</p>)}
    </Card>
  )
}