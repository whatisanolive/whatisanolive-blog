import EditPostPage from '@/components/posts/edit-post-page'
import { getEditablePostById } from '@/lib/posts'

type EditPostParams = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: EditPostParams) => {
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

  return (
    <div>
      <EditPostPage post={post} />
    </div>
  )
}

export default Page
