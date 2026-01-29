'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: 'ログアウトしました',
    })
    router.push('/login')
  }

  if (!profile) return null

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">アカウント</h1>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">名前</div>
            <div className="font-medium">{profile.display_name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">メールアドレス</div>
            <div className="font-medium">{profile.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">会社</div>
            <div className="font-medium">
              {profile.organizations?.name || '未設定'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">権限</div>
            <div className="font-medium">
              {profile.role === 'admin' ? '経理' : '社員'}
            </div>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
