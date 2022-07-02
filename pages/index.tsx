import { GetServerSideProps, NextPage } from 'next';
import { HomeView } from '../components/HomeView';
import { ArticleAdminFull } from '../lib/types';
import { ReadOnlyDb } from '../lib/fsutils';

const HomePage: NextPage<any, any> = ({articles}: {articles: ArticleAdminFull[]}) => {
    return (
        <div>
            <style global jsx>{`
                html,
                body,
                body > div:first-child,
                div#__next,
                div#__next > div {
                    height: 100%;
                }
            `}</style>
            {HomeView(articles)}
        </div>
    );
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {articles: ReadOnlyDb.getPublishedArticleSummaries()}
    };
}
