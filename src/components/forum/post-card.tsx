import Link from "next/link";
import { Eye, MessageCircle, Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Board, Post, Profile } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function PostCard({ post, author, board }: { post: Post; author: Profile; board: Board }) {
  return (
    <Card className="glass-panel transition hover:border-primary/45">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {post.status === "featured" ? <Badge variant="teal">精华</Badge> : null}
              {post.status === "pinned" ? <Badge variant="amber">置顶</Badge> : null}
              <Badge variant="outline">{board.name}</Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link href={`/posts/${post.id}`} className="mt-3 block text-lg font-semibold leading-7 hover:text-primary">
              {post.title}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          </div>
          <div className="flex items-center gap-3 md:min-w-44">
            <Avatar>
              <AvatarFallback>{author.displayName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{author.displayName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.updatedAt)}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {formatNumber(post.replyCount)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {formatNumber(post.viewCount)}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            {formatNumber(post.likeCount)}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            {formatNumber(post.collectCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
