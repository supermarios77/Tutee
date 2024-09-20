import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const protectedRoute = createRouteMatcher([
  '/dashboard',
  '/dashboard/upcoming',
  '/dashboard/meeting(.*)',
  '/dashboard/previous',
  '/dashboard/recordings',
  '/dashboard/personal-room',
  '/student-dashboard/',
  '/student-dashboard/upcoming',
  '/admin-dashboard'  // Add this line
]);

export default clerkMiddleware((auth, req) => {
  if (protectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
