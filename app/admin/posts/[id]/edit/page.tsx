import EditPostPage from '@/components/posts/edit-post-page'
import { prisma } from '@/lib/prisma'

type EditPostParams = {
  params: { id: string }
}

const Page = async ({ params }: EditPostParams) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  console.log("PARAMS:", resolvedParams)

  if(!id) return <h2>No id provided</h2>

  const post = await prisma.post.findUnique({
  where: { id },
  include: {
    tags: {
      include: {
        tag: true,
      },
    },
  },
});


  if (!post) return <h2>Article not found for this id {params.id}</h2>

  return (
    <div>
      <EditPostPage post={post} />
    </div>
  )
}

export default Page