import { createUploadthing } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log('Avatar uploaded:', file.url)
    }),

  noteAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 4 },
    pdf: { maxFileSize: '16MB', maxFileCount: 4 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log('Note attachment uploaded:', file.url)
    }),
}