export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: 'iron-session-cookie',
    cookieOptions: {
        secure: process.env.SESSION_RESTRICTION === 'secure',
    },
};


declare module 'iron-session' {
    interface IronSessionData {
        isLoggedIn?: boolean
    }
}
