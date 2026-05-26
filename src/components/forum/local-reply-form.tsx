"use client";

import { FormEvent, useRef, useState } from "react";
import { MessageSquarePlus, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type LocalReplyFormProps = {
  postId: number;
};

export function LocalReplyForm({ postId }: LocalReplyFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function submitCurrentForm() {
    const form = formRef.current;
    if (!form) return;
    const body = new FormData(form);
    setPending(true);

    const response = await fetch(`/posts/${postId}/reply`, {
      method: "POST",
      body,
      redirect: "follow"
    });

    window.location.assign(response.url);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCurrentForm();
  }

  return (
    <form ref={formRef} action={`/posts/${postId}/reply`} method="post" onSubmit={handleSubmit} className="grid gap-3">
      <label htmlFor="reply-content" className="flex items-center gap-2 font-semibold">
        <MessageSquarePlus className="h-4 w-4" />
        写下你的回复
      </label>
      <Textarea id="reply-content" name="content" placeholder="写下你的回复" disabled={pending} />
      <Button type="button" className="justify-self-start" disabled={pending} onClick={submitCurrentForm}>
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {pending ? "提交中…" : "提交回复"}
      </Button>
    </form>
  );
}
