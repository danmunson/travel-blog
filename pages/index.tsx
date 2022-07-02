import { GetServerSideProps, NextPage } from 'next';
import { HomeView } from '../components/HomeView';
import { ArticleAdminFull } from '../lib/types';
import { ReadOnlyDb } from '../lib/fsutils';

const HomePage: NextPage<any, any> = ({articles}: {articles: ArticleAdminFull[]}) => {
    return (<>{HomeView(articles)}</>);
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {articles: ReadOnlyDb.getPublishedArticleSummaries()}
    };
}
