-- LIGTask Database Schema for PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'TRANSLATOR', 'ANNOTATOR');

-- Task types enum
CREATE TYPE task_type AS ENUM ('NLU', 'NLR', 'NLG');

-- Assignment status enum
CREATE TYPE assignment_status AS ENUM ('pending', 'in_progress', 'done');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) UNIQUE NOT NULL, -- User ID for login (not email)
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_id VARCHAR(50) UNIQUE NOT NULL,
    english_text TEXT NOT NULL,
    filipino_text TEXT NOT NULL,
    task_type task_type NOT NULL,
    category VARCHAR(255) NOT NULL,
    context JSONB NOT NULL,
    context_intended_to_be_safe BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    status assignment_status NOT NULL DEFAULT 'pending',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, prompt_id)
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    -- Translation mode fields
    translation_correct BOOLEAN,
    revised_translation TEXT,
    -- Annotation mode field
    safety_label VARCHAR(50),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_prompts_base_id ON prompts(base_id);
CREATE INDEX idx_prompts_task_type ON prompts(task_type);
CREATE INDEX idx_prompts_category ON prompts(category);

CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_prompt_id ON assignments(prompt_id);
CREATE INDEX idx_assignments_status ON assignments(status);

CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_prompt_id ON evaluations(prompt_id);
CREATE INDEX idx_evaluations_submitted_at ON evaluations(submitted_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Prompts policies
CREATE POLICY "Active users can view prompts" ON prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND active = true
        )
    );

-- Assignments policies
CREATE POLICY "Users can view their own assignments" ON assignments
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own assignments" ON assignments
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Evaluations policies
CREATE POLICY "Users can insert their own evaluations" ON evaluations
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view their own evaluations" ON evaluations
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with roles and authentication';
COMMENT ON TABLE prompts IS 'Dataset prompts with bilingual text and context';
COMMENT ON TABLE assignments IS 'User-prompt assignments tracking';
COMMENT ON TABLE evaluations IS 'User evaluations for translations and safety annotations';

COMMENT ON COLUMN prompts.context IS 'JSON object containing sender, recipient, and transmission_principle information';
COMMENT ON COLUMN evaluations.translation_correct IS 'For translation mode: whether the Filipino translation is correct';
COMMENT ON COLUMN evaluations.revised_translation IS 'For translation mode: user-provided corrected translation';
COMMENT ON COLUMN evaluations.safety_label IS 'For annotation mode: safety classification (Safe/Unsafe, Violates Policy/Does not Violate Policy, Answer/Refuse)';


-- Seed Data: Create 3 test users
-- Note: Passwords are hardcoded in lib/auth.ts for prototype
-- These are the user records in our users table

INSERT INTO users (user_id, name, role, active) VALUES
    ('AD-01', 'Admin User', 'ADMIN', true),
    ('TN-01', 'Translator User', 'TRANSLATOR', true),
    ('AT-01', 'Annotator User', 'ANNOTATOR', true);

-- Login Credentials:
-- Admin:      User ID: AD-01   Password: Admin@24
-- Translator: User ID: TN-01   Password: Trans@24
-- Annotator:  User ID: AT-01   Password: Annot@24
