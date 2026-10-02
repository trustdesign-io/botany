import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TaxonName } from '@/components/records/taxon-name'

const meta: Meta<typeof TaxonName> = {
  title: 'Records/TaxonName',
  component: TaxonName,
}

export default meta

type Story = StoryObj<typeof TaxonName>

export const Species: Story = {
  args: { html: '<i>Ribes speciosum</i> Pursh', className: 'text-2xl' },
}

export const Variety: Story = {
  args: { html: '<i>Aloe arborescens</i> Mill. var. <i>lutea</i>', className: 'text-2xl' },
}

export const Cultivar: Story = {
  args: { html: '<i>Symphyotrichum</i> ‘Vasterival’', className: 'text-2xl' },
}
