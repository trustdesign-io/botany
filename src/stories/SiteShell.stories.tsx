import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

const meta: Meta<typeof Header> = {
  title: 'Layout/SiteShell',
  component: Header,
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/' } } },
}

export default meta

type Story = StoryObj<typeof Header>

export const HeaderOnly: Story = {}

export const FooterOnly: Story = {
  render: () => <Footer />,
}
