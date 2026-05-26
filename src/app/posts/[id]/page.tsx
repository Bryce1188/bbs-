import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, MessageSquarePlus, Star, ThumbsUp, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/forum/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageAlert } from "@/components/ui/page-alert";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { createReplyAction, createReportAction, deletePostAction, toggleBookmarkAction, togglePostLikeAction } from "@/app/actions";
import { getAnonymousProfile, getCurrentUserId, getPost } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

const NOTICE_TEXT: Record<string, string> = {
  reply_created: "回复已发布。",
  post_deleted: "帖子已删除。",
  like_added: "已点赞。",
  like_removed: "已取消点赞。",
  bookmark_added: "已加入收藏。",
  bookmark_removed: "已取消收藏。",
  report_submitted: "举报已提交，管理员会尽快处理。"
};

const ERROR_TEXT: Record<string, string> = {
  reply_failed: "回复提交失败，请稍后重试。",
  like_failed: "点赞操作失败，请稍后重试。",
  bookmark_failed: "收藏操作失败，请稍后重试。",
  report_failed: "举报提交失败，请稍后重试。",
  delete_failed: "删除失败，只有作者或管理员可以删除。"
};

export default async function PostDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const { error, notice } = await searchParams;
  const detail = await getPost(id);
  if (!detail?.board) notFound();

  const { post, board, replies, profiles, viewerHasLiked, viewerHasBookmarked } = detail;
  const author = detail.author ?? getAnonymousProfile();
  const currentUserId = await getCurrentUserId();
  const currentUser = profiles.find((profile) => profile.id === currentUserId);
  const canDelete = currentUserId === post.authorId || currentUser?.role === "admin" || currentUser?.role === "moderator";

  return (
    <section className="section-shell">
      {notice && NOTICE_TEXT[notice] ? <PageAlert tone="success" message={NOTICE_TEXT[notice]} /> : null}
      {error && ERROR_TEXT[error] ? <PageAlert tone="error" message={ERROR_TEXT[error]} /> : null}
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
              <UserAvatar displayName={author.displayName} avatar={author.avatar} />
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
                  <ThumbsUp className={`h-4 w-4 ${viewerHasLiked ? "fill-current" : ""}`} />
                  {formatNumber(post.likeCount)}
                </SubmitButton>
              </form>
              <form action={toggleBookmarkAction}>
                <input type="hidden" name="postId" value={post.id} />
                <SubmitButton variant="glass" size="sm" pendingText="处理中…">
                  <Star className={`h-4 w-4 ${viewerHasBookmarked ? "fill-current" : ""}`} />
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
              {canDelete ? (
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <SubmitButton variant="glass" size="sm" pendingText="删除中…">
                    <Trash2 className="h-4 w-4" />
                    删除
                  </SubmitButton>
                </form>
              ) : null}
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
                    <UserAvatar displayName={replyAuthor.displayName} avatar={replyAuthor.avatar} />
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
