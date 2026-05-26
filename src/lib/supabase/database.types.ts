export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type UserRole = "admin" | "moderator" | "member";
type PostStatus = "featured" | "pinned" | "normal";
type ReportStatus = "pending" | "resolved" | "rejected";
type NotificationType = "reply" | "friend" | "system" | "report";

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string;
        username: string;
        display_name: string;
        avatar_path: string | null;
        role: UserRole;
        level_name: string;
        points: number;
        signature: string;
        created_at: string;
        updated_at: string;
      }>;
      roles: Table<{
        id: number;
        code: string;
        name: string;
        description: string;
      }>;
      user_roles: Table<{
        id: number;
        user_id: string;
        role_id: number;
      }>;
      boards: Table<{
        id: number;
        slug: string;
        name: string;
        group_name: string;
        description: string;
        icon: string;
        theme_color: string;
        post_count: number;
        today_count: number;
        sort_order: number;
        created_at: string;
      }>;
      posts: Table<{
        id: number;
        board_id: number;
        author_id: string | null;
        title: string;
        excerpt: string;
        content: string;
        tags: string[];
        status: PostStatus;
        reply_count: number;
        view_count: number;
        like_count: number;
        collect_count: number;
        created_at: string;
        updated_at: string;
      }>;
      post_replies: Table<{
        id: number;
        post_id: number;
        author_id: string | null;
        content: string;
        seat: number;
        is_visible: boolean;
        created_at: string;
      }>;
      post_reactions: Table<{
        id: number;
        post_id: number;
        user_id: string;
        reaction: string;
        created_at: string;
      }>;
      bookmarks: Table<{
        id: number;
        user_id: string;
        post_id: number;
        created_at: string;
      }>;
      follows: Table<{
        id: number;
        follower_id: string;
        following_id: string;
        created_at: string;
      }>;
      friendships: Table<{
        id: number;
        requester_id: string;
        addressee_id: string;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      private_messages: Table<{
        id: number;
        sender_id: string;
        receiver_id: string;
        content: string;
        image_path: string | null;
        is_read: boolean;
        sender_deleted: boolean;
        receiver_deleted: boolean;
        created_at: string;
      }>;
      notifications: Table<{
        id: number;
        user_id: string | null;
        type: NotificationType;
        title: string;
        description: string;
        is_read: boolean;
        created_at: string;
      }>;
      reports: Table<{
        id: number;
        reporter_id: string | null;
        post_id: number | null;
        reason: string;
        status: ReportStatus;
        created_at: string;
        resolved_at: string | null;
      }>;
      notices: Table<{
        id: number;
        title: string;
        content: string;
        board_id: number | null;
        is_active: boolean;
        created_at: string;
      }>;
      checkins: Table<{
        id: number;
        user_id: string;
        checkin_date: string;
        award_points: number;
      }>;
      grades: Table<{
        id: number;
        name: string;
        min_points: number;
        image_path: string | null;
      }>;
      audit_logs: Table<{
        id: number;
        actor_id: string | null;
        action: string;
        target_type: string;
        target_id: string | null;
        ip: string | null;
        created_at: string;
      }>;
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_path: string | null;
          level_name: string;
          points: number;
          signature: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: { user_id?: string };
        Returns: boolean;
      };
      create_post: {
        Args: { target_board_id: number; post_title: string; post_content: string; post_tags?: string[] };
        Returns: number;
      };
      create_reply: {
        Args: { target_post_id: number; reply_content: string };
        Returns: number;
      };
      toggle_post_reaction: {
        Args: { target_post_id: number; target_reaction?: string };
        Returns: boolean;
      };
      toggle_bookmark: {
        Args: { target_post_id: number };
        Returns: boolean;
      };
      bootstrap_admin_by_email: {
        Args: { target_email: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      post_status: PostStatus;
      report_status: ReportStatus;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
};
