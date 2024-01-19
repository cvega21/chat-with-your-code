import { TestReqBody } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'

export default async function handler(req: NextApiRequest, res: NextApiResponse<TestReqBody>) {
    // console.log({ req })
    if (req.method !== 'POST') {
        return res.status(405).json({ test: 'hello', title: 'world' })
    }
    const parsed = req.body as TestReqBody
    console.log({parsed})
    // res.send(parsed)
    return res.status(200).json(parsed)
}
