import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { datestringFromTimestamp } from "../lib/dates";
import { ArticleAdminFull } from "../lib/types";
import { styled } from "@mui/system";
import { goToArticle } from "../lib/endpoints";
import { ContentBase } from "./basics";

const ArticleItem = styled(Box)({
    backgroundColor: '#ECE5E4',
    width: '80%',
    flexDirection: 'column',
    alignSelf: 'center',

    borderColor: 'black',
    borderRadius: '6px',
    border: '1px solid black',

    padding: '10px',

    cursor: 'pointer',
});

const fontStyles = {
    fontFamily: 'Georgia',
    fontSize: '20px'
};

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
                                <Typography sx={{textAlign: 'left', ...fontStyles}}>
                                    {article.title}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body1" sx={{textAlign: 'right', ...fontStyles}}>
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
