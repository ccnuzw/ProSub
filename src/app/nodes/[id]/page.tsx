
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import NodeForm from '@/components/NodeForm'
import { Node } from '@/types'

export default function EditNodePage() {
  const [node, setNode] = useState<Node | null>(null)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchNode = async () => {
        const res = await fetch(`/api/nodes/${id}`)
        if (res.ok) {
          const data = await res.json()
          setNode(data)
        }
      }
      fetchNode()
    }
  }, [id])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Node</h1>
      {node ? <NodeForm node={node} /> : <p>Loading...</p>}
    </div>
  )
}
