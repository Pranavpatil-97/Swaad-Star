import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StarRating from './StarRating'

function Wrapper() {
  const [v, setV] = useState(0)
  return <StarRating value={v} onChange={setV} />
}

test('guest can pick every rating from 1 to 5', async () => {
  const user = userEvent.setup()
  render(<Wrapper />)
  for (const n of [1, 2, 3, 4, 5]) {
    const radio = screen.getByLabelText(`${n} star${n > 1 ? 's' : ''}`)
    await user.click(radio)
    expect(radio).toBeChecked()
  }
})  