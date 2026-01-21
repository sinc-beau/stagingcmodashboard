import { supabase } from './supabase';

export async function setupAdminUser() {
  const adminEmail = 'beau.horton@sincusa.com';
  const adminPassword = 'admin123';

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('sponsor_users')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle();

    if (existingUser) {
      console.log('Admin user already exists in sponsor_users');

      const { data: authUser } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (authUser) {
        console.log('Admin user can log in successfully');
        return { success: true, message: 'Admin user already configured' };
      }
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating auth user:', signUpError);
      return { success: false, error: signUpError.message };
    }

    if (signUpData.user) {
      const { error: updateError } = await supabase
        .from('sponsor_users')
        .update({
          id: signUpData.user.id,
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('email', adminEmail);

      if (updateError) {
        console.error('Error updating sponsor_users:', updateError);
      } else {
        console.log('Admin user created and approved successfully');
        return { success: true, message: 'Admin user created successfully' };
      }
    }

    return { success: true, message: 'Setup initiated' };
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
    return { success: false, error: String(error) };
  }
}
