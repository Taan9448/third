import http from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=await realpath(process.cwd());
const port=Number(process.env.PORT||5173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,`.${requested==='/'?'/index.html':requested}`);
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  path=await realpath(path);
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Moonveil is running at http://localhost:${port}`));
