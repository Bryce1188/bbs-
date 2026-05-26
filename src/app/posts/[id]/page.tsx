import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, MessageSquarePlus, Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { createReplyAction, createReportAction, toggleBookmarkAction, togglePostLikeAction } from "@/app/actions";
import { getAnonymousProfile, getPost } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getPost(id);
  if (!detail?.board) notFound();

  const { post, author, board, replies, profiles } = detail;

  return (
    <section className="section-shell">
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{board.name}</Badge>
            {post.tags.map((tag) => (
              <Badge variant="secondary" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-normal">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{author.displayName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${author.id}`} className="text-sm font-medium hover:text-primary">
                  {author.displayName}
                </Link>
                <p className="text-xs text-muted-foreground">{author.level} · {formatDate(post.createdAt)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={togglePostLikeAction}>
                <input type="hidden" name="postId" value={post.id} />
                <SubmitButton variant="glass" size="sm" pendingText="处理中…">
                  <ThumbsUp className="h-4 w-4" />
                  {formatNumber(post.likeCount)}
                </SubmitButton>
              </form>
              <form action={toggleBookmarkAction}>
                <input type="hidden" name="postId" value={post.id} />
                <SubmitButton variant="glass" size="sm" pendingText="处理中…">
                  <Star className="h-4 w-4" />
                  收藏
                </SubmitButton>
              </form>
              <form action={createReportAction}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="reason" value="用户从主题详情页发起举报，请管理员复核内容质量。" />
                <SubmitButton variant="glass" size="sm" pendingText="提交中…">
                  <Flag className="h-4 w-4" />
                  举报
                </SubmitButton>
              </form>
            </div>
          </div>
          <Separator className="my-6" />
          <article className="max-w-3xl text-base leading-8 text-foreground/90">{post.content}</article>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">全部回复</h2>
            <Badge variant="outline">{replies.length} 条</Badge>
          </div>
          {replies.map((reply) => {
            const replyAuthor = profiles.find((profile) => profile.id === reply.authorId) ?? getAnonymousProfile();
            return (
              <Card key={reply.id} className="glass-panel">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{replyAuthor.displayName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{replyAuthor.displayName}</span>
                        <span className="text-muted-foreground">#{reply.seat}</span>
                        <span className="text-muted-foreground">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6">{reply.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="glass-panel">
            <CardContent className="p-5">
              <form action={createReplyAction} className="grid gap-3">
                <input type="hidden" name="postId" value={post.id} />
                <label htmlFor="reply-content" className="flex items-center gap-2 font-semibold">
                  <MessageSquarePlus className="h-4 w-4" />
                  发表回复
                </label>
                <Textarea id="reply-content" name="content" placeholder="写下你的回复" />
                <SubmitButton className="justify-self-start" pendingText="提交中…">
                  提交回复
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card className="glass-panel h-fit">
          <CardContent className="p-5">
            <h3 className="font-semibold">主题数据</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>浏览：{formatNumber(post.viewCount)}</p>
              <p>回复：{formatNumber(post.replyCount)}</p>
              <p>点赞：{formatNumber(post.likeCount)}</p>
              <p>收藏：{formatNumber(post.collectCount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
