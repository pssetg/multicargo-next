import { redirect } from 'next/navigation';

// Login is now a modal (see components/LoginModal.tsx), opened from Nav's
// "Login" button via the `multicargo:openLogin` event — there's no standalone
// login page anymore. This route is kept only so old links/bookmarks to
// /[locale]/login (and middleware's /cabinet redirect target, left as-is
// per the brief) land somewhere sensible instead of 404ing.
export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}`);
}
