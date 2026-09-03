import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user role for strict portal separation
  let userRole = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    userRole = profile?.role
  }

  const pathname = request.nextUrl.pathname

  // 1. Protect Student Profile (/profile and subpaths)
  if (pathname.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/userlogin', request.url))
    }
    
    // Strict: Redirect admins away from the student portal
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // 2. Protect Admin Portal (/admin and subpaths)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Strict: Redirect non-admins away from the admin portal
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  // 3. Handle Admin Login Page (/login)
  if (pathname === '/login') {
    if (user && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return supabaseResponse
  }

  // 4. Handle Student Login Page (/userlogin)
  if (pathname === '/userlogin' && user) {
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/profile', '/profile/:path*', '/admin', '/admin/:path*', '/login', '/userlogin'],
}

