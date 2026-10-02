import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RecordField } from '@/components/records/record-field'

const meta: Meta<typeof RecordField> = {
  title: 'Records/RecordField',
  component: RecordField,
  decorators: [(Story) => <dl className="max-w-xl"><Story /></dl>],
}

export default meta

type Story = StoryObj<typeof RecordField>

export const Filled: Story = {
  args: { label: 'Native range', value: 'California to Mexico (Baja California Norte)' },
}

export const Blank: Story = {
  args: { label: 'Work done', value: null, lines: 4 },
}

export const WithBotanicalNames: Story = {
  args: {
    label: 'Near misses',
    value: '<i>M. axillaris</i>: mat-forming, leaves under 1 cm, glossy. <i>M. astonii</i>: shrub with heart-shaped leaves, not a scrambler.',
  },
}

export const Small: Story = {
  args: { label: 'Sources', value: 'POWO, accessed 2 Oct 2026. Fl. Amer. Sept. 2: 731 (1813).', small: true },
}
