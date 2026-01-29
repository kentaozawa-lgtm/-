import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeReceipt } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証確認
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ユーザープロファイル取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'プロファイルが見つかりません' },
        { status: 404 }
      )
    }

    // マスタデータ取得
    const [accountTitles, taxCategories, paymentMethods] = await Promise.all([
      supabase
        .from('account_titles')
        .select('name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true),
      supabase
        .from('tax_categories')
        .select('name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true),
      supabase
        .from('payment_methods')
        .select('name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true),
    ])

    const body = await request.json()
    const { imageBase64, mimeType, imageUrl } = body

    // Gemini解析
    const analysis = await analyzeReceipt(imageBase64, mimeType, {
      accountTitles: accountTitles.data?.map((a) => a.name) || [],
      taxCategories: taxCategories.data?.map((t) => t.name) || [],
      paymentMethods: paymentMethods.data?.map((p) => p.name) || [],
    })

    // デフォルト値設定
    const receiptDate = analysis.date || new Date().toISOString().split('T')[0]
    const amount = analysis.amount || 0

    // 領収書レコード作成（下書き）
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert({
        organization_id: profile.organization_id,
        created_by: user.id,
        image_url: imageUrl,
        receipt_date: receiptDate,
        vendor: analysis.vendor,
        amount,
        invoice_number: analysis.invoice.qualified_number,
        tax_rate: analysis.tax.rate ? analysis.tax.rate * 100 : null,
        status: 'draft',
        ai_raw_data: analysis,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ receiptId: receipt.id, analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: '解析に失敗しました' },
      { status: 500 }
    )
  }
}
