import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordSheet } from '@/components/records/record-sheet'
import { getRecord } from '@/lib/records'
import { EVENT_EXAMPLE, STUDIED_EXAMPLE } from '@/lib/fixtures'
import type { Entry } from '@/types/record'

const meta: Meta<typeof RecordSheet> = {
  title: 'Records/RecordSheet',
  component: RecordSheet,
  args: { keptBy: 'D.C. Chambers' },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
}

export default meta

type Story = StoryObj<typeof RecordSheet>

export const MostlyFilled: Story = {
  args: { record: getRecord('002') as Entry },
}

export const WithBlanksAndNote: Story = {
  args: { record: getRecord('015') as Entry },
}

export const Studied: Story = {
  args: { record: STUDIED_EXAMPLE },
}

export const Event: Story = {
  args: { record: EVENT_EXAMPLE },
}
