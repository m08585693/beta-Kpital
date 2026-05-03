/*
  # Kpital - Schema initial

  ## Tables créées

  ### goals
  Objectifs d'épargne de l'utilisateur.
  - id (uuid, clé primaire)
  - user_id (uuid, référence auth.users)
  - name (text) - Nom du projet (ex: "Voyage Japon")
  - target_amount (numeric) - Montant cible en euros
  - current_amount (numeric) - Montant déjà épargné
  - target_date (date) - Date souhaitée d'atteinte de l'objectif
  - monthly_amount (numeric) - Mensualité calculée automatiquement
  - created_at (timestamptz)

  ### payments
  Versements effectués sur un objectif.
  - id (uuid, clé primaire)
  - goal_id (uuid, référence goals)
  - user_id (uuid, référence auth.users)
  - amount (numeric) - Montant versé
  - note (text) - Note optionnelle
  - created_at (timestamptz)

  ### reminders
  Rappels mensuels générés pour chaque objectif.
  - id (uuid, clé primaire)
  - goal_id (uuid, référence goals)
  - user_id (uuid, référence auth.users)
  - scheduled_day (int) - Jour du mois (1-28) où envoyer le rappel
  - month (int) - Mois concerné
  - year (int) - Année concernée
  - amount_suggested (numeric) - Montant suggéré pour ce rappel
  - is_sent (boolean) - Si le rappel a été envoyé
  - created_at (timestamptz)

  ## Sécurité
  - RLS activé sur toutes les tables
  - Chaque utilisateur ne peut accéder qu'à ses propres données
*/

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  target_date date NOT NULL,
  monthly_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_day int NOT NULL DEFAULT 1,
  month int NOT NULL DEFAULT 1,
  year int NOT NULL DEFAULT 2024,
  amount_suggested numeric NOT NULL DEFAULT 0,
  is_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_goal_id ON payments(goal_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_goal_id ON reminders(goal_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
