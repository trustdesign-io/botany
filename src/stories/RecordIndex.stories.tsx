import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordIndex } from '@/components/records/record-index'
import { Summary } from '@/components/records/summary'
import { EVENT_EXAMPLE, STUDIED_EXAMPLE } from '@/lib/fixtures'
import { getRecords } from '@/lib/records'

const meta: Meta<typeof RecordIndex> = {
  title: 'Records/RecordIndex',
  component: RecordIndex,
  args: { records: getRecords() },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
}

export default meta

type Story = StoryObj<typeof RecordIndex>

export const AllRecords: Story = {}

export const MixedTypes: Story = {
  args: { records: [STUDIED_EXAMPLE, EVENT_EXAMPLE, ...getRecords()] },
}

export const SummaryAccordion: Story = {
  render: (args) => <Summary records={args.records} />,
}
