export const loginPageUrl = (state: string) => import.meta.env.PROD ? `https://andv.auth.ap-northeast-1.amazoncognito.com/login?state=${state}&response_type=code&client_id=2ugimh4tmganbnn94kk1u6r4p3&redirect_uri=https://andv.tomtsutom.com/login&scope=email+openid+phone+profile` : "http://localhost:5173/login#id_token=hoge"
