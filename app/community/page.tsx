import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { addCommunityDiscussionAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { listCommunityDiscussions } from "@/lib/persistence";

type CommunityPageProps = {
  searchParams: Promise<{ posted?: string }>;
};

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const discussions = await listCommunityDiscussions();
  const user = await getCurrentUser();
  const params = await searchParams;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Community forum</h1>
          <p className="mt-2 text-stone-500">
            Ask questions, swap wellness ideas, share progress, and connect with teachers and members across Thryve.
          </p>
          {params.posted ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Discussion posted.
            </div>
          ) : null}
          {user ? (
            <form action={addCommunityDiscussionAction} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Discussion title</span>
                <input name="title" placeholder="What would you like to talk about?" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Your message</span>
                <textarea className="min-h-32" name="body" placeholder="Share a question, insight, or idea..." required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Tags</span>
                <input name="tags" placeholder="restorative, beginners, routines" />
              </label>
              <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
                Start discussion
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-600">
              <p>Sign in to start a discussion so we know who is posting.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-full border border-stone-300 bg-white px-4 py-2 font-medium text-stone-900" href="/sign-in">
                  Sign in
                </Link>
                <Link
                  className="rounded-full bg-stone-900 px-4 py-2 font-medium text-white"
                  href="/sign-up"
                  style={{ color: "#ffffff" }}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Recent discussions</h2>
        <div className="mt-6 space-y-4">
          {discussions.map((discussion) => (
            <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5" key={discussion.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{discussion.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {discussion.authorName} • {discussion.authorRole} •{" "}
                    {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-stone-600">{discussion.replyCount} replies</span>
              </div>
              <p className="mt-4 text-stone-700">{discussion.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {discussion.tags.map((tag) => (
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-emerald-700" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
