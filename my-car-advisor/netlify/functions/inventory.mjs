import {loadInventory} from '../lib/inventory-lib.mjs';
export default async function(request){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405,headers:{Allow:'GET'}});
 const data=await loadInventory();return Response.json(data,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
}
export const config={path:'/api/inventory',rateLimit:{action:'rate_limit',windowLimit:20,windowSize:60,aggregateBy:['ip','domain']}};
