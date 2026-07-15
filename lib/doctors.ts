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
  // Present only for clinics registered by a doctor/clinic user in Supabase.
  // Used to save real appointments back to the owner's dashboard.
  clinicId?: string
  ownerId?: string
}

// A clinic row as returned from Supabase `public.clinics`.
export interface ClinicRecord {
  id: string
  owner_id: string
  name: string
  provider_name: string | null
  specialty: string | null
  care_types: string[]
  accepted_carriers: string[]
  neighborhood: string | null
  borough: string | null
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
  languages: string[]
  copay_usd: number | null
  accepting_new: boolean
}

// Convert a registered Supabase clinic into the Doctor shape the search UI and
// map already understand, so real listings appear alongside the seed data.
export function clinicToDoctor(c: ClinicRecord): Doctor | null {
  // Without coordinates a clinic can't be placed on the map or distance-sorted.
  if (c.latitude == null || c.longitude == null) return null
  return {
    id: `clinic-${c.id}`,
    fullName: c.provider_name || c.name,
    credential: '',
    specialty: c.specialty || c.name,
    neighborhood: c.neighborhood || '',
    borough: (c.borough as Borough) || 'Manhattan',
    latitude: c.latitude,
    longitude: c.longitude,
    address: c.address,
    phone: c.phone || '',
    inNetwork: true,
    copayUsd: c.copay_usd ?? 20,
    deductibleStatus: 'Met',
    languages: c.languages ?? [],
    transitNote: '',
    rating: 5,
    reviewCount: 0,
    acceptingNew: c.accepting_new,
    careTypes: (c.care_types as CareId[]) ?? [],
    acceptedCarriers: c.accepted_carriers ?? [],
    clinicId: c.id,
    ownerId: c.owner_id,
  }
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

  // ---- Manhattan ----
  {
    id: 'mn01harl',
    fullName: 'Dr. Grace Adeyemi',
    credential: 'MD',
    specialty: 'Internal Medicine (Primary Care)',
    neighborhood: 'Harlem',
    borough: 'Manhattan',
    latitude: 40.8116,
    longitude: -73.9465,
    address: '215 W 125th St, New York, NY 10027',
    phone: '(212) 555-0231',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'French'],
    transitNote: 'MTA: at 125th St on the 2/3 train',
    rating: 4.7,
    reviewCount: 188,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'emblem', 'aetna'],
  },
  {
    id: 'mn02whgt',
    fullName: 'Dr. Carlos Mendez',
    credential: 'DDS',
    specialty: 'General & Family Dentistry',
    neighborhood: 'Washington Heights',
    borough: 'Manhattan',
    latitude: 40.8417,
    longitude: -73.9393,
    address: '4030 Broadway, New York, NY 10032',
    phone: '(212) 555-0248',
    inNetwork: true,
    copayUsd: 35,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: at 168th St on the A/C/1 train',
    rating: 4.6,
    reviewCount: 152,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'united'],
  },
  {
    id: 'mn03uwst',
    fullName: 'Dr. Hannah Weiss',
    credential: 'OD',
    specialty: 'Optometry (Eye Exams)',
    neighborhood: 'Upper West Side',
    borough: 'Manhattan',
    latitude: 40.787,
    longitude: -73.9754,
    address: '2130 Broadway, New York, NY 10023',
    phone: '(212) 555-0264',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English', 'Hebrew'],
    transitNote: 'MTA: at 72nd St on the 1/2/3 train',
    rating: 4.8,
    reviewCount: 243,
    acceptingNew: true,
    careTypes: ['eye'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },
  {
    id: 'mn04evil',
    fullName: 'Dr. Nadia Hassan',
    credential: 'DPT',
    specialty: 'Physical Therapy & Rehabilitation',
    neighborhood: 'East Village',
    borough: 'Manhattan',
    latitude: 40.7265,
    longitude: -73.9815,
    address: '85 Second Ave, New York, NY 10003',
    phone: '(212) 555-0279',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Arabic'],
    transitNote: 'MTA: at 2nd Ave on the F train',
    rating: 4.9,
    reviewCount: 167,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'metroplus', 'emblem'],
  },
  {
    id: 'mn05fidi',
    fullName: 'Dr. Thomas Bianchi',
    credential: 'MD',
    specialty: 'Geriatric Medicine',
    neighborhood: 'Financial District',
    borough: 'Manhattan',
    latitude: 40.7075,
    longitude: -74.0113,
    address: '80 Maiden Ln, New York, NY 10038',
    phone: '(212) 555-0293',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Italian'],
    transitNote: 'MTA: at Fulton St on the 2/3/4/5 train',
    rating: 4.7,
    reviewCount: 131,
    acceptingNew: true,
    careTypes: ['geriatric', 'pcp'],
    acceptedCarriers: ['medicare', 'aetna', 'united', 'bcbs', 'emblem'],
  },
  {
    id: 'mn06inwd',
    fullName: 'Dr. Sofia Reyes',
    credential: 'MD',
    specialty: 'Family Medicine (Primary Care)',
    neighborhood: 'Inwood',
    borough: 'Manhattan',
    latitude: 40.8677,
    longitude: -73.9212,
    address: '5030 Broadway, New York, NY 10034',
    phone: '(212) 555-0308',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: at Dyckman St on the A train',
    rating: 4.6,
    reviewCount: 119,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'aetna', 'united'],
  },

  // ---- Brooklyn ----
  {
    id: 'bk01will',
    fullName: 'Dr. Aaron Goldberg',
    credential: 'MD',
    specialty: 'Internal Medicine (Primary Care)',
    neighborhood: 'Williamsburg',
    borough: 'Brooklyn',
    latitude: 40.7081,
    longitude: -73.9571,
    address: '134 Bedford Ave, Brooklyn, NY 11249',
    phone: '(718) 555-0322',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Hebrew'],
    transitNote: 'MTA: at Bedford Ave on the L train',
    rating: 4.8,
    reviewCount: 276,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'metroplus'],
  },
  {
    id: 'bk02pksl',
    fullName: 'Dr. Emily Carter',
    credential: 'DDS',
    specialty: 'Cosmetic & General Dentistry',
    neighborhood: 'Park Slope',
    borough: 'Brooklyn',
    latitude: 40.671,
    longitude: -73.9814,
    address: '267 7th Ave, Brooklyn, NY 11215',
    phone: '(718) 555-0337',
    inNetwork: true,
    copayUsd: 40,
    deductibleStatus: 'Met',
    languages: ['English'],
    transitNote: 'MTA: at 7th Ave on the F/G train',
    rating: 4.9,
    reviewCount: 214,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },
  {
    id: 'bk03bayr',
    fullName: 'Dr. Nikolai Volkov',
    credential: 'DPT',
    specialty: 'Physical Therapy & Sports Rehab',
    neighborhood: 'Bay Ridge',
    borough: 'Brooklyn',
    latitude: 40.6264,
    longitude: -74.0299,
    address: '7420 5th Ave, Brooklyn, NY 11209',
    phone: '(718) 555-0351',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: at 77th St on the R train',
    rating: 4.7,
    reviewCount: 143,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['bcbs', 'united', 'emblem', 'aetna', 'healthfirst'],
  },
  {
    id: 'bk04flat',
    fullName: 'Dr. Jean-Baptiste Pierre',
    credential: 'MD',
    specialty: 'Geriatrics & Primary Care',
    neighborhood: 'Flatbush',
    borough: 'Brooklyn',
    latitude: 40.6409,
    longitude: -73.9626,
    address: '2101 Church Ave, Brooklyn, NY 11226',
    phone: '(718) 555-0366',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'French', 'Haitian Creole'],
    transitNote: 'MTA: at Church Ave on the B/Q train',
    rating: 4.6,
    reviewCount: 172,
    acceptingNew: true,
    careTypes: ['geriatric', 'pcp'],
    acceptedCarriers: ['medicaid', 'medicare', 'metroplus', 'healthfirst', 'emblem'],
  },
  {
    id: 'bk05bdst',
    fullName: 'Dr. Denise Washington',
    credential: 'OD',
    specialty: 'Optometry (Eye Exams)',
    neighborhood: 'Bedford-Stuyvesant',
    borough: 'Brooklyn',
    latitude: 40.6872,
    longitude: -73.9418,
    address: '1245 Fulton St, Brooklyn, NY 11216',
    phone: '(718) 555-0378',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English'],
    transitNote: 'MTA: at Nostrand Ave on the A/C train',
    rating: 4.8,
    reviewCount: 156,
    acceptingNew: true,
    careTypes: ['eye'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'aetna'],
  },
  {
    id: 'bk06bopk',
    fullName: 'Dr. Rachel Friedman',
    credential: 'MD',
    specialty: 'Family Medicine (Primary Care)',
    neighborhood: 'Borough Park',
    borough: 'Brooklyn',
    latitude: 40.6339,
    longitude: -73.991,
    address: '4802 13th Ave, Brooklyn, NY 11219',
    phone: '(718) 555-0391',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Yiddish', 'Hebrew'],
    transitNote: 'MTA: at Fort Hamilton Pkwy on the D train',
    rating: 4.7,
    reviewCount: 201,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'emblem', 'healthfirst', 'metroplus', 'united'],
  },

  // ---- Queens ----
  {
    id: 'qn01asto',
    fullName: 'Dr. Eleni Papadopoulos',
    credential: 'MD',
    specialty: 'Internal Medicine (Primary Care)',
    neighborhood: 'Astoria',
    borough: 'Queens',
    latitude: 40.7644,
    longitude: -73.9235,
    address: '3110 Steinway St, Astoria, NY 11103',
    phone: '(718) 555-0404',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Greek'],
    transitNote: 'MTA: at Steinway St on the M/R train',
    rating: 4.8,
    reviewCount: 233,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'metroplus'],
  },
  {
    id: 'qn02fhil',
    fullName: 'Dr. Samuel Klein',
    credential: 'DDS',
    specialty: 'General & Family Dentistry',
    neighborhood: 'Forest Hills',
    borough: 'Queens',
    latitude: 40.7196,
    longitude: -73.8448,
    address: '10725 Queens Blvd, Forest Hills, NY 11375',
    phone: '(718) 555-0418',
    inNetwork: true,
    copayUsd: 35,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: at 71st–Continental Aves on the E/F/M/R train',
    rating: 4.7,
    reviewCount: 178,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'medicare', 'emblem'],
  },
  {
    id: 'qn03jama',
    fullName: 'Dr. Aisha Bello',
    credential: 'MD',
    specialty: 'Geriatric Medicine',
    neighborhood: 'Jamaica',
    borough: 'Queens',
    latitude: 40.702,
    longitude: -73.789,
    address: '8900 Sutphin Blvd, Jamaica, NY 11435',
    phone: '(718) 555-0423',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Yoruba'],
    transitNote: 'MTA: at Sutphin Blvd on the E/J/Z train',
    rating: 4.6,
    reviewCount: 149,
    acceptingNew: true,
    careTypes: ['geriatric', 'pcp'],
    acceptedCarriers: ['medicaid', 'medicare', 'metroplus', 'healthfirst', 'aetna'],
  },
  {
    id: 'qn04elmh',
    fullName: 'Dr. Wei Zhang',
    credential: 'DPT',
    specialty: 'Physical Therapy & Rehabilitation',
    neighborhood: 'Elmhurst',
    borough: 'Queens',
    latitude: 40.7362,
    longitude: -73.877,
    address: '8410 Broadway, Elmhurst, NY 11373',
    phone: '(718) 555-0437',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Mandarin'],
    transitNote: 'MTA: at Elmhurst Ave on the M/R train',
    rating: 4.9,
    reviewCount: 191,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'united'],
  },
  {
    id: 'qn05bays',
    fullName: 'Dr. Susan Park',
    credential: 'OD',
    specialty: 'Optometry (Eye Exams)',
    neighborhood: 'Bayside',
    borough: 'Queens',
    latitude: 40.7686,
    longitude: -73.771,
    address: '4110 Bell Blvd, Bayside, NY 11361',
    phone: '(718) 555-0442',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English', 'Korean'],
    transitNote: 'LIRR: Bayside station, 3 blocks',
    rating: 4.8,
    reviewCount: 164,
    acceptingNew: true,
    careTypes: ['eye'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },

  // ---- Bronx ----
  {
    id: 'bx01ford',
    fullName: 'Dr. Luis Fernandez',
    credential: 'MD',
    specialty: 'Family Medicine (Primary Care)',
    neighborhood: 'Fordham',
    borough: 'Bronx',
    latitude: 40.861,
    longitude: -73.899,
    address: '2500 Grand Concourse, Bronx, NY 10458',
    phone: '(718) 555-0456',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: at Fordham Rd on the B/D train',
    rating: 4.6,
    reviewCount: 138,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'emblem', 'aetna'],
  },
  {
    id: 'bx02conc',
    fullName: 'Dr. Fatima Ahmed',
    credential: 'DDS',
    specialty: 'General & Family Dentistry',
    neighborhood: 'Concourse',
    borough: 'Bronx',
    latitude: 40.827,
    longitude: -73.922,
    address: '888 Grand Concourse, Bronx, NY 10451',
    phone: '(718) 555-0468',
    inNetwork: true,
    copayUsd: 35,
    deductibleStatus: 'Met',
    languages: ['English', 'Arabic', 'Urdu'],
    transitNote: 'MTA: at 161st St–Yankee Stadium on the 4/B/D train',
    rating: 4.7,
    reviewCount: 122,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'united'],
  },
  {
    id: 'bx03mrpk',
    fullName: 'Dr. Angela Russo',
    credential: 'DPT',
    specialty: 'Physical Therapy & Sports Rehab',
    neighborhood: 'Morris Park',
    borough: 'Bronx',
    latitude: 40.848,
    longitude: -73.85,
    address: '1875 Williamsbridge Rd, Bronx, NY 10461',
    phone: '(718) 555-0471',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Italian'],
    transitNote: 'MTA: at Morris Park on the 5 train',
    rating: 4.8,
    reviewCount: 109,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'medicare', 'emblem'],
  },
  {
    id: 'bx04rivd',
    fullName: 'Dr. Henry Cohen',
    credential: 'MD',
    specialty: 'Geriatric Medicine',
    neighborhood: 'Riverdale',
    borough: 'Bronx',
    latitude: 40.89,
    longitude: -73.912,
    address: '3555 Johnson Ave, Bronx, NY 10463',
    phone: '(718) 555-0485',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English'],
    transitNote: 'MTA: Bx7/Bx10 bus to Johnson Ave',
    rating: 4.9,
    reviewCount: 187,
    acceptingNew: true,
    careTypes: ['geriatric', 'pcp'],
    acceptedCarriers: ['medicare', 'aetna', 'united', 'bcbs', 'emblem'],
  },

  // ---- Staten Island ----
  {
    id: 'si01ndrf',
    fullName: 'Dr. Michael DeLuca',
    credential: 'MD',
    specialty: 'Internal Medicine (Primary Care)',
    neighborhood: 'New Dorp',
    borough: 'Staten Island',
    latitude: 40.573,
    longitude: -74.115,
    address: '145 New Dorp Ln, Staten Island, NY 10306',
    phone: '(718) 555-0499',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Italian'],
    transitNote: 'SIR: New Dorp station, 2 blocks',
    rating: 4.7,
    reviewCount: 141,
    acceptingNew: true,
    careTypes: ['pcp'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'emblem', 'medicare'],
  },
  {
    id: 'si02gtkl',
    fullName: 'Dr. Jennifer O\u2019Brien',
    credential: 'DDS',
    specialty: 'Cosmetic & General Dentistry',
    neighborhood: 'Great Kills',
    borough: 'Staten Island',
    latitude: 40.554,
    longitude: -74.151,
    address: '4123 Amboy Rd, Staten Island, NY 10308',
    phone: '(718) 555-0503',
    inNetwork: true,
    copayUsd: 40,
    deductibleStatus: 'Met',
    languages: ['English'],
    transitNote: 'SIR: Great Kills station, 1 block',
    rating: 4.8,
    reviewCount: 116,
    acceptingNew: true,
    careTypes: ['dental'],
    acceptedCarriers: ['bcbs', 'aetna', 'united', 'medicare', 'emblem'],
  },
  {
    id: 'si03prtr',
    fullName: 'Dr. Maria Santos',
    credential: 'DPT',
    specialty: 'Physical Therapy & Rehabilitation',
    neighborhood: 'Port Richmond',
    borough: 'Staten Island',
    latitude: 40.635,
    longitude: -74.129,
    address: '175 Port Richmond Ave, Staten Island, NY 10302',
    phone: '(718) 555-0517',
    inNetwork: true,
    copayUsd: 30,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: S44/S46 bus to Port Richmond Ave',
    rating: 4.6,
    reviewCount: 98,
    acceptingNew: true,
    careTypes: ['physical'],
    acceptedCarriers: ['medicaid', 'metroplus', 'healthfirst', 'bcbs', 'aetna'],
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

// Great-circle distance in miles between two lat/lng points (Haversine formula).
export function distanceMiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
