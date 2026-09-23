import CreatePostPage from '@/components/posts/create-post-page'
import { getAdminUser } from '@/lib/require-admin'
import { redirect } from 'next/navigation'

const page = async () => {
  if (!(await getAdminUser())) redirect('/')

  return (
    <div>
        <CreatePostPage/>
    </div>
  )
}

export default page
