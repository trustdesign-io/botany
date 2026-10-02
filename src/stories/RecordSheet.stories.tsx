import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordSheet } from '@/components/records/record-sheet'
import { getRecord } from '@/lib/records'
import type { PlantRecord } from '@/types/record'

const meta: Meta<typeof RecordSheet> = {
  title: 'Records/RecordSheet',
  component: RecordSheet,
  args: { keptBy: 'D.C. Chambers' },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
}

export default meta

type Story = StoryObj<typeof RecordSheet>

export const MostlyFilled: Story = {
  args: { record: getRecord('002') as PlantRecord },
}

export const WithBlanksAndNote: Story = {
  args: { record: getRecord('015') as PlantRecord },
}
