import EditPostPage from '@/components/posts/edit-post-page'
import { getEditablePostById } from '@/lib/posts'
import { htmlToMarkdown } from '@/lib/markdown'
import { getAdminUser } from '@/lib/require-admin'
import { redirect } from 'next/navigation'

type EditPostParams = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: EditPostParams) => {
  if (!(await getAdminUser())) redirect('/')

  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Previous debug log kept for reference per request.
  // console.log("PARAMS:", resolvedParams)

  if(!id) return <h2>No id provided</h2>

  // Previous direct Prisma query kept for reference per request.
  // const post = await prisma.post.findUnique({
  // where: { id },
  // include: {
  //   tags: {
  //     include: {
  //       tag: true,
  //     },
  //   },
  // },
  // });

  const post = await getEditablePostById(id);


  if (!post) return <h2>Article not found for this id {id}</h2>

  const convertedFromHtml = post.contentFormat === 'HTML'

  return (
    <div>
      <EditPostPage
        post={post}
        initialContent={convertedFromHtml ? htmlToMarkdown(post.content) : post.content}
        convertedFromHtml={convertedFromHtml}
      />
    </div>
  )
}

export default Page
