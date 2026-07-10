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
//   email             text not null
//   in_network        boolean not null default false
//   copay_usd         integer not null
//   deductible_status text not null            -- "Met" | "Not met"
//   languages         text[] not null
//   transit_note      text not null
//   rating            numeric(2,1) not null
//   review_count      integer not null
//   accepting_new     boolean not null default true

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
  email: string
  inNetwork: boolean
  copayUsd: number
  deductibleStatus: 'Met' | 'Not met'
  languages: string[]
  transitNote: string
  rating: number
  reviewCount: number
  acceptingNew: boolean
}

// Simulated result set from:
//   select * from doctors
//   where in_network = true and insurance_plan_id = '<Blue Cross Blue Shield Medicare Advantage>'
//   order by rating desc;
export const DOCTORS: Doctor[] = [
  {
    id: 'd1a2b3c4',
    fullName: 'Dr. Sarah Levine',
    credential: 'MD',
    specialty: 'Internal Medicine',
    neighborhood: 'Upper East Side',
    borough: 'Manhattan',
    latitude: 40.7736,
    longitude: -73.9566,
    address: '169 E 77th St, New York, NY 10075',
    phone: '(212) 555-0177',
    email: 'sarah.levine@uesinternalmed.example',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: 2 blocks from 6 train at 77th St',
    rating: 4.9,
    reviewCount: 412,
    acceptingNew: true,
  },
  {
    id: 'e5f6g7h8',
    fullName: 'Dr. Miguel Rodriguez',
    credential: 'MD',
    specialty: 'Geriatrics',
    neighborhood: 'Jackson Heights',
    borough: 'Queens',
    latitude: 40.7557,
    longitude: -73.8831,
    address: '3745 82nd St, Jackson Heights, NY 11372',
    phone: '(718) 555-0143',
    email: 'm.rodriguez@jacksonhtsgeriatrics.example',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish', 'Tagalog'],
    transitNote: 'MTA: 1 block from 7 train at 82nd St–Jackson Hts',
    rating: 4.8,
    reviewCount: 337,
    acceptingNew: true,
  },
  {
    id: 'i9j0k1l2',
    fullName: 'Dr. Mei Chen',
    credential: 'MD',
    specialty: 'Family Medicine',
    neighborhood: 'Sunset Park',
    borough: 'Brooklyn',
    latitude: 40.6459,
    longitude: -74.0104,
    address: '813 55th St, Brooklyn, NY 11220',
    phone: '(718) 555-0198',
    email: 'mei.chen@sunsetparkfammed.example',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Cantonese', 'Spanish'],
    transitNote: 'MTA: 3 blocks from N train at 8th Ave',
    rating: 4.9,
    reviewCount: 289,
    acceptingNew: true,
  },
  {
    id: 'm3n4o5p6',
    fullName: 'Dr. Anwar Rahman',
    credential: 'MD',
    specialty: 'Cardiology',
    neighborhood: 'Parkchester',
    borough: 'Bronx',
    latitude: 40.8386,
    longitude: -73.8601,
    address: '1400 Metropolitan Ave, Bronx, NY 10462',
    phone: '(718) 555-0121',
    email: 'a.rahman@parkchestercardio.example',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English', 'Bengali'],
    transitNote: 'MTA: at Parkchester station on the 6 train',
    rating: 4.7,
    reviewCount: 198,
    acceptingNew: true,
  },
  {
    id: 'q7r8s9t0',
    fullName: 'Dr. Giulia Ferraro',
    credential: 'MD',
    specialty: 'Endocrinology',
    neighborhood: 'Bensonhurst',
    borough: 'Brooklyn',
    latitude: 40.6015,
    longitude: -73.9942,
    address: '2098 86th St, Brooklyn, NY 11214',
    phone: '(718) 555-0165',
    email: 'g.ferraro@bensonhurstendo.example',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Italian'],
    transitNote: 'MTA: 1 block from D train at 20th Ave',
    rating: 4.8,
    reviewCount: 156,
    acceptingNew: true,
  },
  {
    id: 'u1v2w3x4',
    fullName: 'Dr. David Okonkwo',
    credential: 'MD',
    specialty: 'Geriatrics',
    neighborhood: 'St. George',
    borough: 'Staten Island',
    latitude: 40.6437,
    longitude: -74.0736,
    address: '1 Bay St, Staten Island, NY 10301',
    phone: '(718) 555-0189',
    email: 'd.okonkwo@stgeorgegeriatrics.example',
    inNetwork: true,
    copayUsd: 15,
    deductibleStatus: 'Met',
    languages: ['English', 'Spanish'],
    transitNote: 'MTA: 2 blocks from St. George Ferry Terminal',
    rating: 4.9,
    reviewCount: 221,
    acceptingNew: true,
  },
  {
    id: 'y5z6a7b8',
    fullName: 'Dr. Olga Petrova',
    credential: 'MD',
    specialty: 'Rheumatology',
    neighborhood: 'Brighton Beach',
    borough: 'Brooklyn',
    latitude: 40.5776,
    longitude: -73.9615,
    address: '3047 Brighton 6th St, Brooklyn, NY 11235',
    phone: '(718) 555-0154',
    email: 'o.petrova@brightonrheum.example',
    inNetwork: true,
    copayUsd: 25,
    deductibleStatus: 'Met',
    languages: ['English', 'Russian'],
    transitNote: 'MTA: at Brighton Beach station on the B/Q train',
    rating: 4.7,
    reviewCount: 143,
    acceptingNew: true,
  },
  {
    id: 'c9d0e1f2',
    fullName: 'Dr. Robert Kim',
    credential: 'MD',
    specialty: 'Ophthalmology',
    neighborhood: 'Flushing',
    borough: 'Queens',
    latitude: 40.7596,
    longitude: -73.83,
    address: '136-20 38th Ave, Flushing, NY 11354',
    phone: '(718) 555-0132',
    email: 'robert.kim@flushingeyecare.example',
    inNetwork: true,
    copayUsd: 20,
    deductibleStatus: 'Met',
    languages: ['English', 'Cantonese'],
    transitNote: 'MTA: at Flushing–Main St on the 7 train',
    rating: 4.8,
    reviewCount: 267,
    acceptingNew: true,
  },
]

export const BOROUGHS: Array<'All Boroughs' | Borough> = [
  'All Boroughs',
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
]

export const NYC_CENTER: [number, number] = [40.7128, -74.006]
