import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ቅምሻ — Restaurant Operations',
    short_name: 'ቅምሻ',
    description: 'Ethiopian restaurant operations platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F5F2',
    theme_color: '#FF3B5C',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['business', 'productivity'],
    lang: 'am',
  }
}
