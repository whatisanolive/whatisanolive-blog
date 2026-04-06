import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard/admin-dashboard";

const Admin = async () => {
  const user = await getOrCreateUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const [postsCount, commentsCount, likesCount] = await Promise.all([
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
  ]);

  const posts = await prisma.post.findMany({
    orderBy: {createdAt: "desc"},
    take: 5,
  });


  return <AdminDashboard
        user={user}
        stats={{
        postsCount,
        commentsCount,
        likesCount,
      }}
      posts={posts}/>; //  pass data
};

export default Admin;