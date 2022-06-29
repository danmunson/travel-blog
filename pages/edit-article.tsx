import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from '../lib/session';
import { getAdminFileCopy, getArticleContent } from '../lib/fsutils';
import { InferGetServerSidePropsType, NextPage } from 'next';
import { ArticleAdminFull, ArticleContent, ArticleItem, EditState, ImageData } from '../lib/types';
import { ContentCreationGroup } from '../components/EditableComponents';
import React from 'react';
import { adminRedirect, uniqueImageId, uploadArticle } from '../lib/endpoints';
import { UploadProgressDisplay } from '../components/Modals';
import deepcopy from 'deepcopy';
import { Stack } from '@mui/material';
import { BasicStyledBox } from '../components/basics';

const EditPage: NextPage<any, any> = ({articleSummary, articleContent}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    // if new article, start with a blank slate
    // otherwise, pre-populate fields
    const existingMediaFiles: Set<string> = new Set();
    const articleState: Record<string, ArticleItem> = {};
    const initialOrder: string[] = [];

    for (const item of articleContent) {
        articleState[item.id] = deepcopy(item);
        initialOrder.push(item.id);

        if (item.type === 'slideshow') {
            for (const image of item.images) existingMediaFiles.add(uniqueImageId(image));
        }
        // TODO: video
    }

    const shouldSkipUpload = (image: ImageData) => existingMediaFiles.has(uniqueImageId(image));

    const [uploadStatus, setUploadStatus] = React.useState(0);

    const uploadUpdatedArticle = async (editState: EditState) => {
        const {articleState, articleOrder} = editState;
        const newArticle = articleOrder.map((id) => articleState[id]);

        try {
            await uploadArticle(
                articleSummary,
                newArticle,
                shouldSkipUpload,
                (pct: number) => setUploadStatus(pct)
            );
            adminRedirect();
        } catch (error) {
            console.error(error);
            setUploadStatus(0);
        }
    };

    const initialEditState: EditState = {
        articleState,
        articleOrder: initialOrder
    };
    const [currentEditState, updateEditState] = React.useState(initialEditState);

    return (
        <BasicStyledBox>
            <Stack spacing={4}>
                <h1>{articleSummary.title}</h1>
                {ContentCreationGroup(currentEditState, updateEditState, uploadUpdatedArticle)}
                {UploadProgressDisplay(uploadStatus)}
            </Stack>
        </BasicStyledBox>
    );
};

export default EditPage;

export const getServerSideProps = withIronSessionSsr(async ({req, res, query}) => {

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

    if (!query) return raise404();

    const {title} = query!;

    const {articles} = getAdminFileCopy();
    const articleSummary: ArticleAdminFull|undefined = articles.find(data => data.title === title);

    if (!articleSummary) return raise404();

    const articleContent = getArticleContent(articleSummary.filename);

    return {props: {articleSummary, articleContent}};

}, sessionOptions);