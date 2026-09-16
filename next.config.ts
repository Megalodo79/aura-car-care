import type {NextConfig} from 'next';
const nextConfig:NextConfig={
 poweredByHeader:false,
 async headers(){return [{source:'/:path*',headers:[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'same-origin'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
 {key:'Strict-Transport-Security',value:'max-age=31536000'},
 {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src https://www.openstreetmap.org; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com; object-src 'none'; base-uri 'self'; form-action 'self'"}
 ]},{source:'/receipt/:path*',headers:[{key:'Cache-Control',value:'private, no-store'}]},{source:'/api/:path*',headers:[{key:'Cache-Control',value:'private, no-store'}]}]}
};export default nextConfig;
