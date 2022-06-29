import { withIronSessionSsr } from 'iron-session/next'
import type { InferGetServerSidePropsType, NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import { sessionOptions } from '../lib/session';
import { ArticleTable } from '../components/ArticleTable';
import { getAdminFileCopy } from '../lib/fsutils';
import { editArticleRedirect, takeArticleAction } from '../lib/endpoints'
import { NewArticleModal } from '../components/Modals'
import { Stack } from '@mui/material'

const AdminPage: NextPage<any, any> = ({ articles, isLoggedIn }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    if (!isLoggedIn) {
        return (
            <p>You need to log in.</p>
        );
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Admin</title>
                <meta name="description" content="Admin" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <Stack spacing={4}>
                    <h2 style={{textAlign: 'center'}}>Articles</h2>
                    {ArticleTable(articles)}
                    {NewArticleModal(async (title: string) => {
                        await takeArticleAction(title, 'new');
                        editArticleRedirect(title);
                    })}
                </Stack>
            </main>
        </div>
    )
}

export default AdminPage;

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    if (!isLoggedIn) {
        res.setHeader('location', '/login')
        res.statusCode = 302
        res.end()
    }

    const { articles } = getAdminFileCopy();
    return { props: { isLoggedIn, articles } };

}, sessionOptions);

