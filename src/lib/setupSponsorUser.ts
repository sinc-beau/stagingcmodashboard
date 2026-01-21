import { supabase } from './supabase';

export async function setupSponsorUser(email: string, sponsorName: string) {
  try {
    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('id, name')
      .ilike('name', `%${sponsorName}%`)
      .maybeSingle();

    if (!sponsor) {
      return { success: false, error: `Sponsor "${sponsorName}" not found` };
    }

    const { data: existingUser } = await supabase
      .from('sponsor_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return { success: true, message: 'User already exists', user: existingUser };
    }

    const password = 'tempPassword123!';

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: 'sponsor',
          sponsor_id: sponsor.id
        }
      }
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    const { data: createdUser, error: insertError } = await supabase
      .from('sponsor_users')
      .insert({
        id: authData.user?.id,
        email: email,
        sponsor_id: sponsor.id,
        status: 'approved',
        role: 'sponsor',
        approved_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, message: 'Sponsor user created successfully', user: createdUser };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
