import { withIronSessionSsr } from 'iron-session/next'
import type { InferGetServerSidePropsType, NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import { sessionOptions } from '../lib/session';

const CheckLogin: NextPage<any, any> = ({isLoggedIn}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const loginStatus = isLoggedIn ? 'Logged In' : 'NOT Logged In';
  return (
    <div className={styles.container}>
      <Head>
        <title>{loginStatus}</title>
        <meta name="description" content="Login Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {loginStatus}
        </h1>
      </main>
    </div>
  )
}

export default CheckLogin;

export const getServerSideProps = withIronSessionSsr(async ({req, res}) => {
    const isLoggedIn = req.session.isLoggedIn || false;
    const props = {isLoggedIn};
    return {props};
}, sessionOptions);

