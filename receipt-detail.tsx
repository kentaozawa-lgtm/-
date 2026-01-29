'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getStatusLabel, getStatusVariant } from '@/lib/utils'
import { Edit, AlertCircle } from 'lucide-react'

interface ReceiptDetailProps {
  receipt: any
  profile: {
    role: string
  }
}

export function ReceiptDetail({ receipt, profile }: ReceiptDetailProps) {
  const isAdmin = profile.role === 'admin'
  const isRejected = receipt.status === 'rejected'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">領収書詳細</h1>
        {isAdmin && (
          <Link href={`/receipts/${receipt.id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              編集する
            </Button>
          </Link>
        )}
      </div>

      {/* 差し戻し通知 */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-900 mb-1">
                  修正してください
                </div>
                <div className="text-sm text-red-800">
                  {receipt.rejection_comment}
                </div>
                {receipt.rejection_fields && receipt.rejection_fields.length > 0 && (
                  <div className="text-sm text-red-800 mt-2">
                    修正箇所: {receipt.rejection_fields.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 画像 */}
      <Card>
        <CardContent className="p-6">
          <img
            src={receipt.image_url}
            alt="領収書"
            className="w-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(receipt.image_url, '_blank')}
          />
        </CardContent>
      </Card>

      {/* 詳細情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>詳細情報</CardTitle>
            <Badge variant={getStatusVariant(receipt.status)}>
              {getStatusLabel(receipt.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">日付</div>
              <div className="font-medium">{formatDate(receipt.receipt_date)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">金額</div>
              <div className="font-medium text-lg">
                {formatCurrency(receipt.amount)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">取引先</div>
            <div className="font-medium">{receipt.vendor || '－'}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">勘定科目</div>
              <div className="font-medium">
                {receipt.account_titles?.name || '－'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">税区分</div>
              <div className="font-medium">
                {receipt.tax_categories?.name || '－'}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">支払方法</div>
            <div className="font-medium">
              {receipt.payment_methods?.name || '－'}
            </div>
          </div>

          {receipt.invoice_number && (
            <div>
              <div className="text-sm text-muted-foreground">
                適格請求書番号
              </div>
              <div className="font-medium font-mono">
                {receipt.invoice_number}
              </div>
            </div>
          )}

          {receipt.tax_rate && (
            <div>
              <div className="text-sm text-muted-foreground">税率</div>
              <div className="font-medium">{receipt.tax_rate}%</div>
            </div>
          )}

          {receipt.memo && (
            <div>
              <div className="text-sm text-muted-foreground">メモ</div>
              <div className="font-medium">{receipt.memo}</div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">作成者</div>
            <div className="font-medium">
              {receipt.profiles?.display_name || '－'}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">作成日時</div>
            <div className="font-medium">
              {new Date(receipt.created_at).toLocaleString('ja-JP')}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">更新日時</div>
            <div className="font-medium">
              {new Date(receipt.updated_at).toLocaleString('ja-JP')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
