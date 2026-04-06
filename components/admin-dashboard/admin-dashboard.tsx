"use client"

import Link from 'next/link'
import { Button } from '../ui/button'
import { CirclePlus, FileChartColumn,Heart,MessageCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import RecentPosts from './recent-posts'
import { Post } from "@prisma/client";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

type Stats = {
  postsCount: number;
  commentsCount: number;
  likesCount: number;
};


const AdminDashboard = ({
  user,
  stats,
  posts,
}: {
  user: User;
  stats: Stats;
  posts: Post[]
}) => {
  return (
    <main className="flex-1 p-4 md:p-8 ">
      <div className="flex justify-between items-center mb-8">
        <div>
          
      <h1>Admin Dashboard</h1>
      <p>Manage content and get analytics</p>
        </div>

      <Link href="/admin/posts/create">
      <Button>
        <CirclePlus/>
        New Post
      </Button>
      </Link>
      </div>

      {/* Quick stats */}

      <div className='grid md:grid-cols-3 mb-8 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='font-medium text-sm'>Total Posts </CardTitle>
            <FileChartColumn className='h-4 w-4' />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.postsCount}</div>
            <p>+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='font-medium text-sm'>Total Comments </CardTitle>
            <MessageCircle className='h-4 w-4' />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.commentsCount}</div>
            <p>+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='font-medium text-sm'>Total Likes </CardTitle>
            <Heart className='h-4 w-4' />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.likesCount}</div>
            <p>+5 from last month</p>
          </CardContent>
        </Card>

        
      </div>

      <RecentPosts posts={posts}/>
    </main>
  )
}

export default AdminDashboard