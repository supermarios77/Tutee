'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Loader from '../Loader';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

export default function MeetingTypeList() {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<any>();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt = values.dateTime.toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <Card className="bg-card text-card-foreground transition-colors duration-300">
      <CardHeader>
        <CardTitle>Meeting Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => setMeetingState('isInstantMeeting')}
          >
            <Clock className="h-6 w-6 mb-2" />
            <span>New Meeting</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => setMeetingState('isJoiningMeeting')}
          >
            <Users className="h-6 w-6 mb-2" />
            <span>Join Meeting</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => setMeetingState('isScheduleMeeting')}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>Schedule Meeting</span>
          </Button>
        </div>

        {meetingState === 'isScheduleMeeting' && !callDetail && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Add a description
                  </label>
                  <Textarea
                    className="w-full"
                    onChange={(e) => setValues({ ...values, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Date and Time
                  </label>
                  <ReactDatePicker
                    selected={values.dateTime}
                    onChange={(date) => setValues({ ...values, dateTime: date! })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button onClick={createMeeting}>Create Meeting</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {meetingState === 'isScheduleMeeting' && callDetail && (
          <Card className="mt-4">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Meeting Created</h3>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);
                  toast({ title: 'Link Copied' });
                }}
              >
                Copy Meeting Link
              </Button>
            </CardContent>
          </Card>
        )}

        {meetingState === 'isJoiningMeeting' && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Input
                  placeholder="Meeting link"
                  onChange={(e) => setValues({ ...values, link: e.target.value })}
                />
                <Button onClick={() => router.push(values.link)}>Join Meeting</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {meetingState === 'isInstantMeeting' && (
          <Card className="mt-4">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Start an Instant Meeting</h3>
              <Button onClick={createMeeting}>Start Meeting</Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}