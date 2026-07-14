// Data structures mirroring a Supabase Postgres schema for onboarding intake.
//
// table: insurance_carriers
//   id            text primary key          -- slug, e.g. "bcbs"
//   name          text not null             -- display name
//   is_public     boolean not null default false  -- government program (Medicare/Medicaid)
//
// table: insurance_plans
//   id            text primary key
//   carrier_id    text references insurance_carriers(id)
//   name          text not null             -- e.g. "PPO", "Medicare Advantage"
//
// Simulated result of:
//   select * from insurance_carriers order by name;
//   select * from insurance_plans where carrier_id = '<selected>';

export interface InsuranceCarrier {
  id: string
  name: string
  plans: string[]
}

export const INSURANCE_CARRIERS: InsuranceCarrier[] = [
  {
    id: 'bcbs',
    name: 'Blue Cross Blue Shield',
    plans: ['PPO', 'HMO', 'EPO', 'Medicare Advantage'],
  },
  {
    id: 'aetna',
    name: 'Aetna',
    plans: ['PPO', 'HMO', 'Medicare Advantage'],
  },
  {
    id: 'medicare',
    name: 'Medicare',
    plans: ['Original Medicare (Part A & B)', 'Medicare Advantage (Part C)'],
  },
  {
    id: 'medicaid',
    name: 'Medicaid',
    plans: ['Managed Care', 'Fee-for-Service'],
  },
  {
    id: 'metroplus',
    name: 'MetroPlus',
    plans: ['Medicaid Managed Care', 'Medicare Advantage', 'Marketplace'],
  },
  {
    id: 'emblem',
    name: 'EmblemHealth',
    plans: ['PPO', 'HMO', 'Medicare Advantage'],
  },
  {
    id: 'united',
    name: 'UnitedHealthcare',
    plans: ['PPO', 'HMO', 'Medicare Advantage'],
  },
  {
    id: 'healthfirst',
    name: 'Healthfirst',
    plans: ['Medicaid Managed Care', 'Medicare Advantage', 'Marketplace'],
  },
]

// Non-private, general care categories. Each maps to an icon key resolved in the UI.
export type CareId = 'pcp' | 'dental' | 'eye' | 'physical' | 'geriatric'

export interface CareOption {
  id: CareId
  icon: 'stethoscope' | 'smile' | 'eye' | 'activity' | 'heart'
}

export const CARE_OPTIONS: CareOption[] = [
  { id: 'pcp', icon: 'stethoscope' },
  { id: 'dental', icon: 'smile' },
  { id: 'eye', icon: 'eye' },
  { id: 'physical', icon: 'activity' },
  { id: 'geriatric', icon: 'heart' },
]

// Note: plain-language descriptions of each care type now live in the i18n
// dictionary (lib/i18n.ts → intake.careDescriptions) so they are translated
// along with the rest of the UI.
