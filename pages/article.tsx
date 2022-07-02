import { GetServerSideProps, NextPage } from "next";
import { ReadOnlyDb } from "../lib/fsutils";
import { ArticleItem, CombinedArticle } from "../lib/types";
import { ContentBase, EmptyDiv, ViewBox } from "../components/basics";
import { Stack } from "@mui/material";
import { ViewableImages, ViewableParagraph } from "../components/ViewableComponents";

function generateArticleElement(item: ArticleItem) {
    switch (item.type) {
        case 'paragraph':
            return <ViewableParagraph text={item.paragraph}/>;
        case 'slideshow':
            return <ViewableImages images={item.images}/>;
        // TODO: video
    }
};

export const ArticlePage: NextPage<any, any> = ({article}: {article: CombinedArticle}) => {
    return (
        <EmptyDiv>
            <ContentBase title={article.title}>
                <Stack spacing={2}>
                    {article.content.map((x) => {
                        return (
                            <ViewBox key={x.id} style={{margin: 'auto', marginTop: '16px'}}>
                                {generateArticleElement(x)}
                            </ViewBox>
                        );
                    })}
                </Stack>
            </ContentBase>
        </EmptyDiv>
    );
}

export default ArticlePage;

export const getServerSideProps: GetServerSideProps = async ({req, res, query}) => {
    const {title} = query;
    if (typeof title !== 'string' || !ReadOnlyDb.hasArticle(title)) {
        res.statusCode = 404;
        res.setHeader('location', '/');
        res.end();
        return {props: {}};
    } else {
        return {
            props: {article: ReadOnlyDb.getArticle(title)}
        };
    }   
}