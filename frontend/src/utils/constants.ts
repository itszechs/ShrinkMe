export const api = {
    base: "https://shrinkme.vercel.app",
    links: "/api/v1/links",
    signup: "/api/v1/auth/signup",
    login: "/api/v1/auth/login",

    buildUrl(url : string) {
        return `${this.base}${url}`;
    }
}
