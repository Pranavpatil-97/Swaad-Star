import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicChips from './TopicChips'

function Wrapper() {
  const [v, setV] = useState([])
  return <TopicChips value={v} onChange={setV} />
}

test('chips toggle on and off', async () => {
  const user = userEvent.setup()
  render(<Wrapper />)
  const food = screen.getByRole('button', { name: 'Food' })
  expect(food).toHaveAttribute('aria-pressed', 'false')
  await user.click(food)
  expect(food).toHaveAttribute('aria-pressed', 'true')
  await user.click(food)
  expect(food).toHaveAttribute('aria-pressed', 'false')
})