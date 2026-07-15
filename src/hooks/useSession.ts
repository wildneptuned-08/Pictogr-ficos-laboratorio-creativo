import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/config/supabaseClient'

export function useSession() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { user }
}
