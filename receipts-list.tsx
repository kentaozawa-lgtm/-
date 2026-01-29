'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, getStatusLabel, getStatusVariant } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ReceiptsListProps {
  profile: {
    id: string
    role: string
    organization_id: string
  }
}

export function ReceiptsList({ profile }: ReceiptsListProps) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [status, setStatus] = useState('all')
  const supabase = createClient()
  const { toast } = useToast()
  const isAdmin = profile.role === 'admin'

  useEffect(() => {
    loadReceipts()
  }, [month, status])

  const loadReceipts = async () => {
    setLoading(true)

    try {
      let query = supabase
        .from('receipts')
        .select(`
          *,
          account_titles(name),
          tax_categories(name),
          payment_methods(name),
          profiles!receipts_created_by_fkey(display_name)
        `)
        .gte('receipt_date', `${month}-01`)
        .lte('receipt_date', `${month}-31`)
        .order('receipt_date', { ascending: false })

      // 社員は自分のもののみ
      if (!isAdmin) {
        query = query.eq('created_by', profile.id)
      }

      // ステータスフィルタ
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data } = await query

      setReceipts(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      })

      if (!response.ok) throw new Error()

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipts-${month}.csv`
      a.click()

      toast({
        title: 'CSVを作成しました',
      })

      loadReceipts()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'CSV出力に失敗しました',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">読み取り済み領収書一覧</h1>
        {isAdmin && (
          <Button onClick={handleExportCSV} size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV出力
          </Button>
        )}
      </div>

      {/* フィルタ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date()
                    date.setMonth(date.getMonth() - i)
                    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    return (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="rejected">修正してください</SelectItem>
                  <SelectItem value="approved">確認OK</SelectItem>
                  <SelectItem value="exported">出力済み</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 一覧 */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            読み込み中...
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            領収書がありません
          </div>
        ) : (
          receipts.map((receipt) => (
            <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getStatusVariant(receipt.status)}>
                          {getStatusLabel(receipt.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(receipt.receipt_date)}
                        </span>
                      </div>
                      <div className="font-medium truncate">
                        {receipt.vendor || '取引先なし'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(receipt.amount)}
                        {receipt.account_titles && (
                          <span className="ml-2">
                            {receipt.account_titles.name}
                          </span>
                        )}
                      </div>
                      {isAdmin && receipt.profiles && (
                        <div className="text-xs text-muted-foreground mt-1">
                          作成者: {receipt.profiles.display_name}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
