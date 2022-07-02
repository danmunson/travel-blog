import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import { getSha256 } from '../lib/crypto'
import { adminRedirect } from '../lib/endpoints'

const LoginOrLogout: NextPage = () => {

    const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const password = event.currentTarget.password.value;
        const passwordSha256 = await getSha256(password);

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passwordSha256 }),
        });

        const data = await res.json();
        if (data.isLoggedIn === true) {
            adminRedirect();
        }
    };

    const submitLogout = async () => {
        const res = await fetch('/api/logout');
        const data = await res.json();
        if (data.isLoggedIn === false) {
            alert('Logged Out.')
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Login</title>
                <meta name="description" content="Login" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Login
                </h1>

                <form onSubmit={submitLogin}>
                    <label>
                        <span>Type the admin password</span>
                        <input type="text" name="password" required />
                    </label>
                    <button type="submit">Login</button>
                </form>

                <div>
                    <button onClick={submitLogout}>Logout</button>
                </div>

            </main>
        </div>
    )
}

export default LoginOrLogout;
