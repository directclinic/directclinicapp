// Data structures mirroring a Supabase Postgres schema.
//
// table: doctors
//   id                uuid primary key default gen_random_uuid()
//   full_name         text not null
//   credential        text not null            -- e.g. "MD", "DO"
//   specialty         text not null
//   neighborhood      text not null
//   borough           text not null            -- Manhattan | Brooklyn | Queens | Bronx | Staten Island
//   latitude          double precision not null
//   longitude         double precision not null
//   address           text not null
//   phone             text not null
//   in_network        boolean not null default false
//   copay_usd         integer not null
//   deductible_status text not null            -- "Met" | "Not met"
//   languages         text[] not null
//   transit_note      text not null
//   rating            numeric(2,1) not null
//   review_count      integer not null
//   accepting_new     boolean not null default true
//   care_types        text[] not null          -- care categories this doctor serves
//   accepted_carriers text[] not null          -- insurance carrier ids in-network here

import { INSURANCE_CARRIERS, type CareId } from '@/lib/intake'

export type Borough =
  | 'Manhattan'
  | 'Brooklyn'
  | 'Queens'
  | 'Bronx'
  | 'Staten Island'

export interface Doctor {
  id: string
  fullName: string
  credential: string
  specialty: string
  neighborhood: string
  borough: Borough
  latitude: number
  longitude: number
  address: string
  phone: string
  inNetwork: boolean
  copayUsd: number
  deductibleStatus: 'Met' | 'Not met'
  languages: string[]
  transitNote: string
  rating: number
  reviewCount: number
  acceptingNew: boolean
  careTypes: CareId[]
  acceptedCarriers: string[]
}

// Simulated result set from:
//   select * from doctors order by rating desc;
// The application filters this set by the intake selections (care type + carrier).
export const DOCTORS: Doctor[] = [
  {
    id: 'd1a2b3c4',
    fullName: 'Dr. Sarah Levine',
    credential: 'MD',
    specialty: 'Internal Medicine (Primary Care)',
    neighborhood: 'Upper East Side',
    borough: 'Manhattan',
    latitude: 40.7736,
    longitude: -73.9566,
    address: '169 E 77th St, New York, NY 10075',
    phone: '(212) 555-0177',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: 2 blocks from 6 train at 77th St',
    rating: 4.9,
    reviewCount: 412,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },
  {
    id: 'e5f6g7h8',
    fullName: 'Dr. Miguel Rodriguez',
    credential: 'MD',
    specialty: 'Geriatrics & Primary Care',
    neighborhood: 'Jackson Heights',
    borough: 'Queens',
    latitude: 40.7557,
    longitude: -73.8831,
    address: '3745 82nd St, Jackson Heights, NY 11372',
    phone: '(718) 555-0192',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish', 'Tagalog'],
    transitNote: 'MTA: 1 block from 7 train at 82nd St–Jackson Hts',
    rating: 4.8,
    reviewCount: 337,
    acceptingNew: true,
    careTypes: ['geriatric', 'pcp'],
    acceptedCarriers: ['medicare', 'medicaid', 'metroplus', 'healthfirst', 'aetna'],
  },
  {
    id: 'i9j0k1l2',
    fullName: 'Dr. Mei Chen',
    credential: 'MD',
    specialty: 'Family Medicine (Primary Care)',
    neighborhood: 'Sunset Park',
    borough: 'Brooklyn',
    latitude: 40.6459,
    longitude: -74.0104,
    address: '813 55th St, Brooklyn, NY 11220',
    phone: '(718) 555-0143',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Cantonese', 'Spanish'],
    transitNote: 'MTA: 3 blocks from N train at 8th Ave',
    rating: 4.9,
    reviewCount: 289,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'metroplus', 'healthfirst', 'emblem', 'united'],
  },
  {
    id: 'm3n4o5p6',
    fullName: 'Dr. Anwar Rahman',
    credential: 'DDS',
    specialty: 'General & Family Dentistry',
    neighborhood: 'Parkchester',
    borough: 'Bronx',
    latitude: 40.8386,
    longitude: -73.8601,
    address: '1400 Metropolitan Ave, Bronx, NY 10462',
    phone: '(718) 555-0168',
    inNetwork: true,
    copayUsd: 35,
    deductibleStatus: 'Met',
    languages: ['English', 'Bengali'],
    transitNote: 'MTA: at Parkchester station on the 6 train',
    rating: 4.7,
    reviewCount: 198,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['aetna', 'medicaid', 'metroplus', 'healthfirst', 'bcbs'],
  },
  {
    id: 'q7r8s9t0',
    fullName: 'Dr. Giulia Ferraro',
    credential: 'DPT',
    specialty: 'Physical Therapy & Rehabilitation',
    neighborhood: 'Bensonhurst',
    borough: 'Brooklyn',
    latitude: 40.6015,
    longitude: -73.9942,
    address: '2098 86th St, Brooklyn, NY 11214',
    phone: '(718) 555-0121',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Italian'],
    transitNote: 'MTA: 1 block from D train at 20th Ave',
    rating: 4.8,
    reviewCount: 156,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },
  {
    id: 'u1v2w3x4',
    fullName: 'Dr. David Okonkwo',
    credential: 'MD',
    specialty: 'Geriatric Medicine',
    neighborhood: 'St. George',
    borough: 'Staten Island',
    latitude: 40.6437,
    longitude: -74.0736,
    address: '1 Bay St, Staten Island, NY 10301',
    phone: '(718) 555-0184',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: 2 blocks from St. George Ferry Terminal',
    rating: 4.9,
    reviewCount: 221,
    acceptingNew: true,
    careTypes: ['geriatric'],
    acceptedCarriers: ['medicare', 'united', 'aetna', 'emblem', 'healthfirst', 'bcbs'],
  },
  {
    id: 'y5z6a7b8',
    fullName: 'Dr. Olga Petrova',
    credential: 'DDS',
    specialty: 'Cosmetic & General Dentistry',
    neighborhood: 'Brighton Beach',
    borough: 'Brooklyn',
    latitude: 40.5776,
    longitude: -73.9615,
    address: '3047 Brighton 6th St, Brooklyn, NY 11235',
    phone: '(718) 555-0139',
    inNetwork: true,
    copayUsd: 40,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: at Brighton Beach station on the B/Q train',
    rating: 4.7,
    reviewCount: 143,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['bcbs', 'united', 'emblem', 'medicare', 'aetna'],
  },
  {
    id: 'c9d0e1f2',
    fullName: 'Dr. Robert Kim',
    credential: 'MD',
    specialty: 'Ophthalmology (Eye Care)',
    neighborhood: 'Flushing',
    borough: 'Queens',
    latitude: 40.7596,
    longitude: -73.83,
    address: '136-20 38th Ave, Flushing, NY 11354',
    phone: '(718) 555-0156',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Cantonese'],
    transitNote: 'MTA: at Flushing–Main St on the 7 train',
    rating: 4.8,
    reviewCount: 267,
    acceptingNew: true,
    careTypes: ['eye'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'metroplus', 'medicare'],
  },
  {
    id: 'g3h4i5j6',
    fullName: 'Dr. James Sullivan',
    credential: 'OD',
    specialty: 'Optometry (Eye Exams)',
    neighborhood: 'Chelsea',
    borough: 'Manhattan',
    latitude: 40.7465,
    longitude: -74.0014,
    address: '245 W 23rd St, New York, NY 10011',
    phone: '(212) 555-0110',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: at 23rd St on the C/E train',
    rating: 4.6,
    reviewCount: 176,
    acceptingNew: true,
    careTypes: ['eye'],
    acceptedCarriers: ['emblem', 'healthfirst', 'medicaid', 'metroplus', 'aetna'],
  },
  {
    id: 'k7l8m9n0',
    fullName: 'Dr. Priya Nair',
    credential: 'DPT',
    specialty: 'Physical Therapy & Sports Rehab',
    neighborhood: 'Long Island City',
    borough: 'Queens',
    latitude: 40.7447,
    longitude: -73.9485,
    address: '10-27 46th Rd, Long Island City, NY 11101',
    phone: '(718) 555-0107',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Bengali'],
    transitNote: 'MTA: at Court Sq on the 7/E/M/G train',
    rating: 4.9,
    reviewCount: 204,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'united'],
  },
]

// Reverse lookup: resolve a carrier id (as stored on a doctor's acceptedCarriers)
// back to its human-readable display name.
export const CARRIER_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  INSURANCE_CARRIERS.map((c) => [c.id, c.name]),
)

// Slug lookup used to resolve a carrier's display name back to its id.
export const CARRIER_ID_BY_NAME: Record<string, string> = {
  'Blue Cross Blue Shield': 'bcbs',
  Aetna: 'aetna',
  Medicare: 'medicare',
  Medicaid: 'medicaid',
  MetroPlus: 'metroplus',
  EmblemHealth: 'emblem',
  UnitedHealthcare: 'united',
  Healthfirst: 'healthfirst',
}

// Estimate the patient's co-pay from the selected plan and care type. Co-pays are
// determined by the insurance plan (PPO/HMO/etc.), with a small specialist
// surcharge for non-primary care. Public managed-care programs are $0.
export function estimateCopay(
  plan: string | null,
  care: CareId | null,
  fallback: number,
): number {
  if (!plan) return fallback

  const p = plan.toLowerCase()
  let base: number
  if (p.includes('medicaid') || p.includes('managed care') || p.includes('fee-for-service')) {
    return 0
  } else if (p.includes('medicare advantage') || p.includes('part c')) {
    base = 10
  } else if (p.includes('original medicare') || p.includes('part a')) {
    base = 25
  } else if (p.includes('ppo')) {
    base = 20
  } else if (p.includes('epo')) {
    base = 30
  } else if (p.includes('hmo')) {
    base = 35
  } else if (p.includes('marketplace')) {
    base = 40
  } else {
    base = 25
  }

  const surcharge: Record<CareId, number> = {
    pcp: 0,
    geriatric: 0,
    eye: 10,
    dental: 15,
    physical: 10,
  }
  return base + (care ? surcharge[care] : 0)
}

export const BOROUGHS: Array<'All Boroughs' | Borough> = [
  'All Boroughs',
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
]

export const NYC_CENTER: [number, number] = [40.7128, -74.006]
