import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/jest';
import { Button } from './Button';

export default {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

type Story = StoryObj<any>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
  play: async () => {
    await expect(false).toBe(true);
  },
};

// export const Secondary: Story = {
//   args: {
//     label: 'Button',
//   },
// };

// export const Large: Story = {
//   args: {
//     size: 'large',
//     label: 'Button',
//   },
// };

// export const Small: Story = {
//   args: {
//     size: 'small',
//     label: 'Button',
//   },
// };
