import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader as Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClinic, type CreateClinicPayload } from '../api/clinicOnboardingApi';
import { useClinicStore } from '@/store/clinic-store';
import { useUserClinics } from '@/hooks/useUserClinics';

export function CreateClinicPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setClinicId } = useClinicStore();
  const { refetch: refetchClinics } = useUserClinics();

  const form = useForm<CreateClinicPayload>({
    defaultValues: {
      clinic_name: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: CreateClinicPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const clinic = await createClinic(data);

      await refetchClinics();

      setClinicId(clinic.id);

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to create clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto mb-4 size-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="size-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Create Your Clinic</CardTitle>
          <CardDescription className="text-base">
            Set up your clinic to start managing patients and appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="clinic_name"
                rules={{ required: 'Clinic name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your clinic name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter clinic address"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                      message: 'Please enter a valid phone number',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="clinic@example.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Creating Clinic...
                  </>
                ) : (
                  <>
                    <Building2 className="size-5 mr-2" />
                    Create Clinic
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
