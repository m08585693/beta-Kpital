import { supabase } from './supabase';

// Envoyer une invitation
export async function sendInvitation(goalId: string, email: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  // Vérifier que l'utilisateur est bien membre du goal
  const { data: membership } = await supabase
    .from('goal_members')
    .select('role')
    .eq('goal_id', goalId)
    .eq('user_id', user.id)
    .single();

  if (!membership) throw new Error('Tu n\'es pas membre de cet objectif');

  // Vérifier qu'une invitation pending n'existe pas déjà
  const { data: existing } = await supabase
    .from('goal_invitations')
    .select('id')
    .eq('goal_id', goalId)
    .eq('invited_email', email)
    .eq('status', 'pending')
    .single();

  if (existing) throw new Error('Une invitation est déjà en attente pour cet email');

  const { data, error } = await supabase
    .from('goal_invitations')
    .insert({
      goal_id: goalId,
      invited_email: email,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Récupérer les invitations reçues par l'utilisateur connecté
export async function getMyInvitations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const { data, error } = await supabase
    .from('goal_invitations')
    .select(`
      id,
      status,
      created_at,
      expires_at,
      goal_id,
      goals (title, target_amount, monthly_amount),
      invited_by
    `)
    .eq('invited_email', user.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Accepter une invitation
export async function acceptInvitation(invitationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  // Récupérer l'invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('goal_invitations')
    .select('goal_id, invited_email')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invitation) throw new Error('Invitation introuvable');
  if (invitation.invited_email !== user.email) throw new Error('Cette invitation ne t\'est pas destinée');

  // Mettre à jour le statut
  await supabase
    .from('goal_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  // Ajouter l'utilisateur comme membre
  const { error } = await supabase
    .from('goal_members')
    .insert({
      goal_id: invitation.goal_id,
      user_id: user.id,
      role: 'member',
    });

  if (error) throw error;
}

// Refuser une invitation
export async function rejectInvitation(invitationId: string) {
  const { error } = await supabase
    .from('goal_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitationId);

  if (error) throw error;
}

// Récupérer les membres d'un objectif
export async function getGoalMembers(goalId: string) {
  const { data, error } = await supabase
    .from('goal_members')
    .select(`
      id,
      role,
      joined_at,
      user_id
    `)
    .eq('goal_id', goalId);

  if (error) throw error;
  return data ?? [];
}

// Ajouter l'owner quand un objectif est créé
export async function addOwnerToGoal(goalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const { error } = await supabase
    .from('goal_members')
    .insert({
      goal_id: goalId,
      user_id: user.id,
      role: 'owner',
    });

  if (error) throw error;
}