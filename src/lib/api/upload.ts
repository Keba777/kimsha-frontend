import { api } from './client'

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('image', file)
    const res = await api.post<{ data: { url: string } }>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data!.url
  },
}
