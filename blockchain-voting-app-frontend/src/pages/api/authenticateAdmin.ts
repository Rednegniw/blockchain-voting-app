// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { AdminLoginFormValues } from '../admin/hooks/useAdminLoginForm'

const adminCredentials = {
    email: 'admin@gmail.com',
    password: 'testingtesting'
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { email, password }: AdminLoginFormValues = req.body

    if ( email === adminCredentials.email && password === adminCredentials.password ) {
        res.status(200).send({ email })
    } else {
        res.status(403).send({ error: 'Not authenticated' })
    }
}
