import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { datestringFromTimestamp } from "../lib/dates";
import { ArticleAdminFull } from "../lib/types";
import { styled } from "@mui/system";
import { goToArticle } from "../lib/endpoints";
import { ContentBase } from "./basics";
import { articleItemBg, articleItemFontFamily } from "../lib/styling";

const ArticleItem = styled(Box)({
    backgroundColor: articleItemBg,
    width: '80%',
    flexDirection: 'column',
    alignSelf: 'center',

    borderColor: 'black',
    borderRadius: '6px',
    border: '1px solid black',

    padding: '10px',

    cursor: 'pointer',
});

export function HomeView(articles: ArticleAdminFull[]) {
    return (
        <ContentBase title={"Dan and Lisa's Travels"}>
            <Stack spacing={2}>
                {articles.map((article: ArticleAdminFull) => (
                    <ArticleItem
                        key={article.title}
                        onClick={() => goToArticle(article.title)}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Typography sx={{textAlign: 'left', fontFamily: articleItemFontFamily, fontSize: '20px'}}>
                                    {article.title}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1" sx={{textAlign: 'right', fontFamily: articleItemFontFamily, fontSize: '15px'}}>
                                    {datestringFromTimestamp(article.createdTime)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </ArticleItem>
                ))}
            </Stack>
        </ContentBase>
    );
}
