"use client"

import Link from 'next/link'
import { Button } from '../ui/button'
import { CirclePlus, Eye, FileChartColumn, Heart, MessageCircle, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import RecentPosts from './recent-posts'
import RecentComments from './recent-comments'
import type { AdminRecentComment, AdminRecentPost } from '@/lib/posts';
import type { SessionUser } from '@/lib/getOrCreateUser';

type Stats = {
  postsCount: number;
  viewsCount: number;
  commentsCount: number;
  likesCount: number;
};

const AdminDashboard = ({
  user,
  stats,
  posts,
  comments,
}: {
  user: SessionUser;
  stats: Stats;
  posts: AdminRecentPost[]
  comments: AdminRecentComment[]
}) => {
  const cards: { title: string; value: number; note: string; icon: LucideIcon }[] = [
    { title: 'Total Posts', value: stats.postsCount, note: 'Drafts and published', icon: FileChartColumn },
    { title: 'Total Views', value: stats.viewsCount, note: 'One per reader per post per day', icon: Eye },
    { title: 'Total Comments', value: stats.commentsCount, note: 'Across all posts', icon: MessageCircle },
    { title: 'Total Likes', value: stats.likesCount, note: 'Across all posts', icon: Heart },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 ">
      <div className="flex justify-between items-center mb-8">
        <div>
      <p className="kicker text-faint">Admin</p>
      <h1 className="display mt-2 text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-subtle">Manage content and get analytics for {user.name || user.email}</p>
        </div>

      <Link href="/admin/posts/create">
      <Button>
        <CirclePlus/>
        New Post
      </Button>
      </Link>
      </div>

      {/* Quick stats */}

      <div className='grid sm:grid-cols-2 lg:grid-cols-4 mb-8 gap-4'>
        {cards.map(({ title, value, note, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='font-medium text-sm'>{title}</CardTitle>
              <Icon className='h-4 w-4' />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold mb-2">{value.toLocaleString('en-US')}</div>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <RecentPosts posts={posts}/>
        <RecentComments comments={comments}/>
      </div>
    </main>
  )
}

export default AdminDashboard
