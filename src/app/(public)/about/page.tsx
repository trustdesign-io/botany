import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DATA_URL } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'How the records are kept: what each field means and which authorities are used.',
}

const TYPES: [string, string][] = [
  ['Worked with', 'A plant I have had my hands on: planted, pruned, potted or otherwise worked. Numbered 001, 002 and so on.'],
  ['Studied', 'A species I have investigated without working on it. Numbered S001, S002 and so on.'],
  ['Event', 'A lecture, visit or course I attended. The species seen are listed in the entry. Numbered E001, E002 and so on.'],
  ['Work day', 'A day worked at a site, as a volunteer, on contract or on a project of my own. It lists the plants worked with that day, and holds work that is not about a single plant. Numbered D001, D002 and so on.'],
]

const FIELDS: [string, ReactNode][] = [
  ['Record no.', 'Records are numbered in one sequence across every site, in the order of the work. Within a single day the order carries no meaning.'],
  ['Date', 'The day I worked with the plant.'],
  ['Site, Location', 'The garden or place, then the bed or house within it.'],
  ['VC, Grid', 'The Watsonian vice-county and the grid reference. The grid reference is taken at the plant, so it stays blank until I have done that.'],
  ['Name', <>The accepted name and its authority. Botanical names are in italics; the authority is upright. Cultivar names are upright in single quotes, as in <i>Symphyotrichum</i> ‘Vasterival’.</>],
  ['Det.', <><i>Determinavit</i>: who named the plant, how, and when. “Not keyed” means nobody worked the name out with an identification key. “From label” means the name was taken from garden signage.</>],
  ['Label read', 'The label copied word for word, errors included, so the record shows what the garden calls the plant.'],
  ['Note', 'Where the label or the name given on the day differs from the accepted name, and why.'],
  ['Common names, Native range, Habit', 'From the authorities below. Garden names are attributed to whoever used them.'],
  ['Provenance', 'Where this plant came from: the supplier, the seed source, or the collector.'],
  ['Diagnostic', 'The features by which the plant is recognised.'],
  ['Near misses', 'Similar plants, and the character that separates them.'],
  ['Work done, Observed', 'What I did, and what I noticed doing it.'],
  ['Sources', 'Where the botanical details came from, with the date each was accessed.'],
  ['Open questions', 'What is unconfirmed or still to check. Most diagnostics are from secondary sources until I have checked them against the plant.'],
]

const AUTHORITIES: [string, string, string][] = [
  ['Plants of the World Online (POWO)', 'https://powo.science.kew.org/', 'Accepted names, authorities, native range and habit.'],
  ['International Plant Names Index (IPNI)', 'https://www.ipni.org/', 'Place and date of publication.'],
  ['RHS Horticultural Database', 'https://www.rhs.org.uk/plants', 'Cultivars and trade names.'],
]

export default function AboutPage() {
  return (
    <div className="grid max-w-prose gap-8">
      <div>
        <h1 className="text-3xl leading-tight text-balance sm:text-4xl">How the records are kept</h1>
        <p className="mt-3">
          These are the records of D.C. Chambers: plants worked with, species studied, events attended and days worked, at
          Lullingstone Castle World Garden and elsewhere. They began as a handwritten book and follow the same fields in the same order.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="label border-b-2 border-rule pb-1">Four kinds of record</h2>
        <dl className="grid gap-3">
          {TYPES.map(([term, text]) => (
            <div key={term} className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[9rem_1fr]">
              <dt className="label pt-1">{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <p>Each kind has its own number sequence. The list shows all four together by date, and can be filtered to one.</p>
      </section>

      <section className="grid gap-3">
        <h2 className="label border-b-2 border-rule pb-1">Blanks</h2>
        <p>
          A field with nothing recorded is shown as a rule and never left out, so the gaps are visible. Nothing is
          filled in unless it came from me, from the plant’s label, or from an authority that can be cited.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="label border-b-2 border-rule pb-1">Fields</h2>
        <dl className="grid gap-3">
          {FIELDS.map(([term, text]) => (
            <div key={term} className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[9rem_1fr]">
              <dt className="label pt-1">{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-3">
        <h2 className="label border-b-2 border-rule pb-1">Authorities</h2>
        <ul className="grid gap-2">
          {AUTHORITIES.map(([name, url, use]) => (
            <li key={url}>
              <a href={url} rel="noopener" className="underline underline-offset-2 hover:text-stamp">
                {name}
              </a>
              . {use}
            </li>
          ))}
        </ul>
        <p>Where an authority and a label disagree, the record follows the authority and keeps the label’s wording.</p>
      </section>

      <section className="grid gap-3">
        <h2 className="label border-b-2 border-rule pb-1">The data</h2>
        <p>
          Every record lives in one file,{' '}
          <a href={DATA_URL} className="underline underline-offset-2 hover:text-stamp">
            plant-records.json
          </a>
          . This site is built from that file and nothing else.
        </p>
      </section>
    </div>
  )
}
