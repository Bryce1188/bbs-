import { NextResponse } from "next/server";
import { getHotTopics } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(Math.trunc(limitParam), 100)) : 20;

  const topics = await getHotTopics(limit);
  return NextResponse.json({
    items: topics.map((post, index) => ({
      rank: index + 1,
      postId: post.id,
      title: post.title,
      boardId: post.boardId,
      status: post.status,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      replyCount: post.replyCount,
      hotScore: post.hotScore,
      href: `/posts/${post.id}`
    }))
  });
}
