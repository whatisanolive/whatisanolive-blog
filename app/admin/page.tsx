import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard/admin-dashboard";
import { getAdminDashboardData } from "@/lib/posts";

const Admin = async () => {
  const user = await getOrCreateUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // Previous dashboard queries kept for reference per request.
  // const [postsCount, commentsCount, likesCount] = await Promise.all([
  //   prisma.post.count(),
  //   prisma.comment.count(),
  //   prisma.like.count(),
  // ]);
  //
  // const posts = await prisma.post.findMany({
  //   orderBy: {createdAt: "desc"},
  //   take: 5,
  // });

  const { stats, posts } = await getAdminDashboardData();

  return <AdminDashboard
        user={user}
        stats={stats}
      posts={posts}/>; //  pass data
};

export default Admin;
