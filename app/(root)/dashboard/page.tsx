import MeetingTypeList from '@/components/Meeting/MeetingTypeList';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserWithMetadata, checkUserRole } from '@/types/user';

const Home = async () => {
  try {
    const { userId, sessionClaims } = auth();

    if (!userId) {
      console.log('No user ID found. Redirecting to sign-in.');
      redirect('/sign-in');
    }

    // Cast sessionClaims to include publicMetadata
    const userMetadata = sessionClaims as unknown as { publicMetadata?: { role?: string } };

    console.log('User metadata:', JSON.stringify(userMetadata, null, 2));

    if (!checkUserRole(userMetadata as UserWithMetadata)) {
      console.log('User is not an admin. Redirecting to home.');
      return redirect('/');
    }

    const now = new Date();

    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(
      now
    );

    return (
      <section className="flex size-full flex-col gap-5 text-white">
        <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
          <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
              <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
            </div>
          </div>
        </div>

        <MeetingTypeList />
      </section>
    );
  } catch (error) {
    console.error('Error in dashboard page:', error);
    return <div>An error occurred. Please try again later.</div>;
  }
};

export default Home;