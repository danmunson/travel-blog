import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '../../lib/session';

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
    const { passwordSha256 } = await req.body;
    const isLoggedIn = passwordSha256 === process.env.ADMIN_SHA256;

    if (isLoggedIn) {
        req.session.isLoggedIn = true;
        await req.session.save();
        res.json({isLoggedIn: true});
    } else {
        res.status(401).json({message: 'Wrong password.'})
    }
}
