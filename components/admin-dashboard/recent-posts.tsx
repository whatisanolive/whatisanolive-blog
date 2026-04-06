import React from 'react'
import { Card , CardTitle,CardHeader,CardContent} from '../ui/card'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import Link from 'next/link'
import { Post } from "@prisma/client";
import { deletePost } from "@/actions/delete-post";
import { publishPost } from "@/actions/publish-post";

const RecentPosts = ({posts}: { posts: Post[] }) => {
  return (
    <Card >
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Recent Posts</CardTitle>
                <Button className='text-foreground/90' size="sm"
                variant={"ghost"}>
                    View All
                    <ArrowRight/>
                </Button>
            </div>
        </CardHeader>

        <CardContent>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Staus</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
  {posts.map((post) => (
    <TableRow key={post.id}>
      <TableCell>{post.title}</TableCell>

      <TableCell>
  {post.status === "PUBLISHED" ? (
    <span className="text-green-500">Published</span>
  ) : (
    <span className="text-yellow-500">Draft</span>
  )}
</TableCell>

      <TableCell>{post.category}</TableCell>

      <TableCell>
        {new Date(post.createdAt).toLocaleDateString()}
      </TableCell>

      <TableCell>
        <div className="flex gap-2">
          <Link href={`/admin/posts/${post.id}/edit`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
            {post.status === "DRAFT" && (
        <form action={publishPost}>
         <input type="hidden" name="id" value={post.id} />
        <Button size="sm">Publish</Button>
        </form>
             )}
          <DeleteButton id={post.id} />
        </div>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}

export default RecentPosts

const DeleteButton = ({ id }: { id: string }) => {
  return (
    <form action={deletePost}>
      <input type="hidden" name="id" value={id} />
      <Button variant="ghost" size="sm">
        Delete
      </Button>
    </form>
  );
};