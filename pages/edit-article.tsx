import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from '../lib/session';
import { getAdminFileCopy, getArticleContent } from '../lib/fsutils';
import { InferGetServerSidePropsType, NextPage } from 'next';
import { ArticleAdminFull, ArticleContent, ArticleItem, ImageData } from '../lib/types';
import { NewParagraph, MasonryImageListUpload } from '../components/EditableComponents';

const EditPage: NextPage<any, any> = ({articleSummary, articleContent}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    // if new article, start with a blank slate
    // otherwise, pre-populate fields
    const existingMediaFiles: Set<string> = new Set();
    const articleState: Record<string, ArticleItem> = {};
    const initialOrder: string[] = [];

    for (const item of articleContent) {
        articleState[item.id] = item;
        initialOrder.push(item.id);

        if (item.type === 'slideshow') {
            item.images.forEach((image) => {
                existingMediaFiles.add(image.name + image.size.toString());
            })
        }
        // TODO: video
    }

    const uploadUpdatedArticle = (currentOrder: string[]) => {
        const newArticle = currentOrder.map((id) => articleState[id]);
        console.log(newArticle);
    };

    return (<>
        <h1>{articleSummary.title}</h1>
        {}
    </>);
};

export default EditPage;

export const getServerSideProps = withIronSessionSsr(async ({req, res, params}) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    if (!isLoggedIn) {
        res.setHeader('location', '/login');
        res.statusCode = 302;
        res.end();
    }

    const raise404 = () => {
        res.statusCode = 404;
        res.end();
        return {props: {
            articleContent: [] as ArticleContent,
            articleSummary: {} as ArticleAdminFull
        }};
    };

    if (!params) return raise404();

    const {title} = params!;

    const {articles} = getAdminFileCopy();
    const articleSummary: ArticleAdminFull|undefined = articles.find(data => data.title === title);

    if (!articleSummary) return raise404();

    const articleContent = getArticleContent(articleSummary.filename);

    return {props: {articleSummary, articleContent}};

}, sessionOptions);