import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '../../lib/session';
import { deleteArticleMetadata, newArticle, updateArticleMetadata } from '../../lib/fsutils';
import { ArticleStatusActions } from '../../lib/types';

export default withIronSessionApiRoute(articleActions, sessionOptions);

function deleteArticle(title: string) {
    deleteArticleMetadata(title);
}

function setPublishStatus(title: string, status: 'publish'|'unpublish') {
    const published = status === 'publish';
    updateArticleMetadata(title, {published});
}

async function articleActions(req: NextApiRequest, res: NextApiResponse) {
    if (req.session.isLoggedIn) {
        const {title, action} = req.body as {title: string, action: ArticleStatusActions};
        if (action === 'new') {
            newArticle(title);
        } else if (action === 'delete') {
            deleteArticle(title);
        } else if (action === 'publish' || action === 'unpublish') {
            setPublishStatus(title, action);
        }
    } else {
        res.status(401).json({message: 'Not authorized'})
    }
}
