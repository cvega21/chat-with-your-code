import { ServerRoutesRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ServerRoutesRes['loadToVectorDb']>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }
    return res.status(200).json({ result: 'success', data: 'hello world' })
    // const parsed = JSON.parse(req.body)
    // const { fileName, content } = parsed
    // const input = (content as string).replace(/\s+/g, ' ')
    // console.log({ input })

    // const embeddingResponse = await openai.embeddings.create({
    //     model: 'text-embedding-ada-002',
    //     input,
    // })

    // console.log(embeddingResponse.data[0]?.embedding)
    // const embedding = embeddingResponse.data[0]?.embedding
    // try {
    //     const supaRes = await supabase.from('code_embeddings').insert({
    //         file_name: fileName,
    //         file_content: content,
    //         embedding,
    //     }).select()
    //     console.log({supaRes})

    //     return res.status(200).json({ message: 'File inserted successfully' })
    // } catch (error) {
    //     console.error('Error inserting file:', error)
    //     return res.status(500).json({ message: 'Internal Server Error' })
    // }
}
