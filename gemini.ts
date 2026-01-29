import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface GeminiAnalysisResult {
  date: string | null
  vendor: string | null
  amount: number | null
  tax: {
    rate: number | null
    note: string | null
  }
  invoice: {
    qualified_number: string | null
    found: boolean
  }
  suggestions: {
    account_titles: Array<{
      name: string
      confidence: number
      reason: string
    }>
    tax_categories: Array<{
      name: string
      confidence: number
    }>
    payment_methods: Array<{
      name: string
      confidence: number
    }>
  }
  raw_text_excerpt: string
}

export async function analyzeReceipt(
  imageBase64: string,
  mimeType: string,
  context?: {
    accountTitles?: string[]
    taxCategories?: string[]
    paymentMethods?: string[]
  }
): Promise<GeminiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const contextInfo = context
    ? `
利用可能な勘定科目: ${context.accountTitles?.join(', ') || 'なし'}
利用可能な税区分: ${context.taxCategories?.join(', ') || 'なし'}
利用可能な支払方法: ${context.paymentMethods?.join(', ') || 'なし'}
`
    : ''

  const prompt = `
あなたは領収書から情報を抽出するAIです。以下の領収書画像から情報を抽出し、指定されたJSON形式で返してください。

${contextInfo}

抽出する情報:
1. 日付 (YYYY-MM-DD形式)
2. 取引先/店名
3. 金額 (税込、数値のみ)
4. 税率 (0.08 または 0.10、判定できない場合はnull)
5. 適格請求書番号 (T+13桁、見つからない場合はnull)
6. 勘定科目の候補 (上位3つ、利用可能な勘定科目から選択、理由も記載)
7. 税区分の候補 (上位2つ、利用可能な税区分から選択)
8. 支払方法の候補 (上位2つ、利用可能な支払方法から選択)

レスポンス形式（必ずこの形式のJSONで返してください）:
{
  "date": "2026-01-28",
  "vendor": "セブン-イレブン 新宿xx店",
  "amount": 1280,
  "tax": {
    "rate": 0.10,
    "note": "標準税率と推定"
  },
  "invoice": {
    "qualified_number": "T1234567890123",
    "found": true
  },
  "suggestions": {
    "account_titles": [
      {"name": "消耗品費", "confidence": 0.62, "reason": "コンビニ購入"},
      {"name": "会議費", "confidence": 0.21, "reason": "飲食/軽食の可能性"}
    ],
    "tax_categories": [
      {"name": "課税10%", "confidence": 0.70},
      {"name": "軽減8%", "confidence": 0.20}
    ],
    "payment_methods": [
      {"name": "現金", "confidence": 0.55},
      {"name": "クレジットカード", "confidence": 0.25}
    ]
  },
  "raw_text_excerpt": "読み取れた主要文字列の抜粋"
}

※JSONのみを返し、マークダウンのコードブロックや説明文は含めないでください。
`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ])

  const response = await result.response
  const text = response.text()

  try {
    // マークダウンのコードブロックを除去
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonText)
    return parsed as GeminiAnalysisResult
  } catch (error) {
    console.error('Failed to parse Gemini response:', text)
    throw new Error('AIの解析結果を処理できませんでした')
  }
}

export function compressImage(file: File, maxWidth: number = 1600, quality: number = 0.8): Promise<{ blob: Blob; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('画像の圧縮に失敗しました'))
              return
            }

            canvas.toDataURL('image/jpeg', quality).split(',')[1]
            const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
            resolve({ blob, base64 })
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}
