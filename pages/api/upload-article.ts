import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { sessionOptions } from '../../lib/session';
import multiparty from 'multiparty';
import { saveMediaFile, writeContentFile } from '../../lib/fsutils';
import { ArticleAdminFull, ArticleContent } from '../../lib/types';
import { uniqueImageId } from '../../lib/endpoints';

type MPFile = {originalFilename: string, path: string};

export default withIronSessionApiRoute(apiUploadArticle, sessionOptions);

// turn of default body parser so that multiparty can parse it
export const config = {
    api: {
        bodyParser: false
    }
};

async function apiUploadArticle(req: NextApiRequest, res: NextApiResponse) {
    const form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
        if (err) throw err;

        const articleSummary = JSON.parse(fields['Summary']) as ArticleAdminFull;
        const articleContent = JSON.parse(fields['ArticleContent']) as ArticleContent;
        const fileInfo = files['Files'] as MPFile[]|MPFile; // files have been pre-saved to disk

        if (Array.isArray(fileInfo)) {
            for (const info of fileInfo) saveMediaFile(info.path, info.originalFilename);
        } else if (fileInfo && fileInfo.originalFilename && fileInfo.path) {
            saveMediaFile(fileInfo.path, fileInfo.originalFilename);
        }
        

        for (const item of articleContent) {
            if (item.type === 'slideshow') {
                // path never changes
                for (const image of item.images) image.url = `/api/image/${uniqueImageId(image)}`;
            }
        }

        writeContentFile(articleSummary.filename, articleContent);
    });

    res.status(200);
    res.end();
}