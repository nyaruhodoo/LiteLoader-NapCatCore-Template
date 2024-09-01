"use strict";const _=require("node:events"),P=require("crypto"),A=require("node:https"),I=require("node:http"),U=require("node:fs"),F=require("node:process");class D{ListenerMap;WrapperSession;ListenerManger=new Map;EventTask=new Map;constructor(){}createProxyDispatch(e){const t=this;return new Proxy({},{get(r,s,i){return typeof r[s]>"u"?(...n)=>{t.DispatcherListener.apply(t,[e,s,...n]).then()}:Reflect.get(r,s,i)}})}init({ListenerMap:e,WrapperSession:t}){this.ListenerMap=e,this.WrapperSession=t}CreatEventFunction(e){const t=e.split("/");if(t.length>1){const r="get"+t[0].replace("NodeIKernel",""),s=t[1],i=this.WrapperSession[r]();let n=i[s];return n=n.bind(i),n||void 0}}CreatListenerFunction(e,t=""){const r=this.ListenerMap[e];let s=this.ListenerManger.get(e+t);if(!s&&r){s=new r(this.createProxyDispatch(e));const i=e.match(/^NodeIKernel(.*?)Listener$/)[1],n="NodeIKernel"+i+"Service/addKernel"+i+"Listener";this.CreatEventFunction(n)(s),this.ListenerManger.set(e+t,s)}return s}async DispatcherListener(e,t,...r){this.EventTask.get(e)?.get(t)?.forEach((s,i)=>{if(s.createtime+s.timeout<Date.now()){this.EventTask.get(e)?.get(t)?.delete(i);return}s.checker&&s.checker(...r)&&s.func(...r)})}async CallNoListenerEvent(e="",t=3e3,...r){return new Promise(async(s,i)=>{const n=this.CreatEventFunction(e);let o=!1;setTimeout(()=>{o||i(new Error("NTEvent EventName:"+e+" timeout"))},t);const a=await n(...r);o=!0,s(a)})}async CallNormalEvent(e="",t="",r=1,s=3e3,i,...n){return new Promise(async(o,a)=>{const l=P.randomUUID();let u=0,p,g={};const h=()=>{u==0?a(new Error("NTEvent EventName:"+e+" ListenerName:"+t+" timeout")):o([g,...p])},y=setTimeout(h,s),f=t.split("/"),d=f[0],S=f[1],M={timeout:s,createtime:Date.now(),checker:i,func:(...m)=>{u++,p=m,u>=r&&(clearTimeout(y),h())}};this.EventTask.get(d)||this.EventTask.set(d,new Map),this.EventTask.get(d)?.get(S)||this.EventTask.get(d)?.set(S,new Map),this.EventTask.get(d)?.get(S)?.set(l,M),this.CreatListenerFunction(d),g=await this.CreatEventFunction(e)(...n)})}}class Q{core;constructor(e){this.core=e}async copyFile(e,t){await this.core.util.copyFile(e,t)}async getFileSize(e){return await this.core.util.getFileSize(e)}async getVideoUrl(e,t){return(await this.core.session.getRichMediaService().getVideoPlayUrlV2({chatType:e.chatType,peerUid:e.peerUid,guildId:"0"},e.msgId,t.elementId,0,{downSourceType:1,triggerType:1})).urlResult.domainUrl[0].url}}class W{core;constructor(e){this.core=e}async setCacheSilentScan(e=!0){return""}getCacheSessionPathList(){return""}clearCache(e=["tmp","hotUpdate"]){return this.core.session.getStorageCleanService().clearCacheDataByKeys(e)}addCacheScannedPaths(e={}){return this.core.session.getStorageCleanService().addCacheScanedPaths(e)}scanCache(){return this.core.session.getStorageCleanService().scanCache()}getHotUpdateCachePath(){return""}getDesktopTmpPath(){return""}getChatCacheList(e,t=1e3,r=0){return this.core.session.getStorageCleanService().getChatCacheInfo(e,t,1,r)}getFileCacheInfo(e,t=1e3,r){}async clearChatCache(e=[],t=[]){return this.core.session.getStorageCleanService().clearChatCacheInfo(e,t)}}class B{core;constructor(e){this.core=e}async isBuddy(e){return this.core.session.getBuddyService().isBuddy(e)}async getFriends(e=!1){let[t,r]=await this.core.event.CallNormalEvent("NodeIKernelBuddyService/getBuddyList","NodeIKernelBuddyListener/onBuddyListChange",1,5e3,()=>!0,e);const s=[];for(const i of r)for(const n of i.buddyList)s.push(n);return s}async handleFriendRequest(e,t){let r=e.split("|");if(r.length<2)return;let s=r[0],i=r[1];this.core.session.getBuddyService()?.approvalFriendRequest({friendUid:s,reqTime:i,accept:t})}}var R=(c=>(c[c.DEFAULTTYPE=0]="DEFAULTTYPE",c[c.TITLETYPE=1]="TITLETYPE",c[c.NEWGROUPTYPE=2]="NEWGROUPTYPE",c))(R||{});class K{core;constructor(e){this.core=e}async getGroups(e=!1){let[t,r,s]=await this.core.event.CallNormalEvent("NodeIKernelGroupService/getGroupList","NodeIKernelGroupListener/onGroupListUpdate",1,5e3,()=>!0,e);return s}async getGroupRecommendContactArkJson(e){return this.core.session.getGroupService().getGroupRecommendContactArkJson(e)}async CreatGroupFileFolder(e,t){return this.core.session.getRichMediaService().createGroupFolder(e,t)}async DelGroupFile(e,t){return this.core.session.getRichMediaService().deleteGroupFile(e,[102],t)}async DelGroupFileFolder(e,t){return this.core.session.getRichMediaService().deleteGroupFolder(e,t)}async getSingleScreenNotifies(e){let[t,r,s,i]=await this.core.event.CallNormalEvent("NodeIKernelGroupService/getSingleScreenNotifies","NodeIKernelGroupListener/onGroupSingleScreenNotifies",1,5e3,()=>!0,!1,"",e);return i}async getGroupMembers(e,t=3e3){const r=this.core.session.getGroupService(),s=r.createMemberListScene(e,"groupMemberList_MainWindow"),i=await r.getNextMemberList(s,void 0,t);if(i.errCode!==0)throw"获取群成员列表出错,"+i.errMsg;return i.result.infos}async getGroupNotifies(){}async GetGroupFileCount(e){return this.core.session.getRichMediaService().batchGetGroupFileCount(e)}async getGroupIgnoreNotifies(){}async getArkJsonGroupShare(e){return(await this.core.event.CallNoListenerEvent("NodeIKernelGroupService/getGroupRecommendContactArkJson",5e3,e)).arkJson}async handleGroupRequest(e,t,r){return this.core.session.getGroupService().operateSysNotify(!1,{operateType:t,targetMsg:{seq:e.seq,type:e.type,groupCode:e.group.groupCode,postscript:r||""}})}async quitGroup(e){return this.core.session.getGroupService().quitGroup(e)}async kickMember(e,t,r=!1,s=""){return this.core.session.getGroupService().kickMember(e,t,r,s)}async banMember(e,t){return this.core.session.getGroupService().setMemberShutUp(e,t)}async banGroup(e,t){return this.core.session.getGroupService().setGroupShutUp(e,t)}async setMemberCard(e,t,r){return this.core.session.getGroupService().modifyMemberCardName(e,t,r)}async setMemberRole(e,t,r){return this.core.session.getGroupService().modifyMemberRole(e,t,r)}async setGroupName(e,t){return this.core.session.getGroupService().modifyGroupName(e,t,!1)}async setGroupTitle(e,t,r){}async getGroupRemainAtTimes(e){this.core.session.getGroupService().getGroupRemainAtTimes(e)}async getMemberExtInfo(e,t){return this.core.session.getGroupService().getMemberExtInfo({groupCode:e,sourceType:R.TITLETYPE,beginUin:"0",dataTime:"0",uinList:[t],uinNum:"",seq:"",groupType:"",richCardNameVer:"",memberExtFilter:{memberLevelInfoUin:1,memberLevelInfoPoint:1,memberLevelInfoActiveDay:1,memberLevelInfoLevel:1,memberLevelInfoName:1,levelName:1,dataTime:1,userShowFlag:1,sysShowFlag:1,timeToUpdate:1,nickName:1,specialTitle:1,levelNameNew:1,userShowFlagNew:1,msgNeedField:1,cmdUinFlagExt3Grocery:1,memberIcon:1,memberInfoSeq:1}})}}class O{core;constructor(e){this.core=e}async setEmojiLike(e,t,r,s=!0){return r=r.toString(),this.core.session.getMsgService().setMsgEmojiLikes(e,t,r,r.length>3?"2":"1",s)}async getMultiMsg(e,t,r){return this.core.session.getMsgService().getMultiMsg(e,t,r)}async getMsgsByMsgId(e,t){return await this.core.session.getMsgService().getMsgsByMsgId(e,t)}async getMsgsBySeqAndCount(e,t,r,s,i){return await this.core.session.getMsgService().getMsgsBySeqAndCount(e,t,r,s,i)}async activateChat(e){}async activateChatAndGetHistory(e){}async sendMsgExtend(e,t){let r=this.core.session.getMsgService().getMsgUniqueId(Date.now().toString());return this.core.session.getMsgService().sendMsg(r,e,t,new Map)}async setMsgRead(e){return this.core.session.getMsgService().setMsgRead(e)}async getMsgHistory(e,t,r){return this.core.session.getMsgService().getMsgsIncludeSelf(e,t,r,!0)}async fetchRecentContact(){}async recallMsg(e,t){await this.core.session.getMsgService().recallMsg({chatType:e.chatType,peerUid:e.peerUid},t)}async forwardMsg(e,t,r){return this.core.session.getMsgService().forwardMsg(r,e,[t],new Map)}}class v{static async HttpsGetCookies(e){const t=e.startsWith("https")?A:I;return new Promise((r,s)=>{t.get(e,n=>{let o={};const a=l=>{if(l.statusCode===301||l.statusCode===302)if(l.headers.location){const u=new URL(l.headers.location,e);v.HttpsGetCookies(u.href).then(p=>{o={...o,...p},r(o)}).catch(p=>{s(p)})}else r(o);else r(o)};n.on("data",()=>{}),n.on("end",()=>{a(n)}),n.headers["set-cookie"]&&n.headers["set-cookie"].forEach(l=>{const u=l.split(";")[0].split("="),p=u[0],g=u[1];p&&g&&p.length>0&&g.length>0&&(o[p]=g)})}).on("error",n=>{s(n)})})}static async HttpGetJson(e,t="GET",r,s={},i=!0,n=!0){const o=new URL(e),a=e.startsWith("https://")?A:I,l={hostname:o.hostname,port:o.port,path:o.href,method:t,headers:s};return new Promise((u,p)=>{const g=a.request(l,h=>{let y="";h.on("data",f=>{y+=f.toString()}),h.on("end",()=>{try{if(h.statusCode&&h.statusCode>=200&&h.statusCode<300)if(i){const f=JSON.parse(y);u(f)}else u(y);else p(new Error(`Unexpected status code: ${h.statusCode}`))}catch(f){p(f)}})});g.on("error",h=>{p(h)}),(t==="POST"||t==="PUT"||t==="PATCH")&&(n?g.write(JSON.stringify(r)):g.write(r)),g.end()})}static async HttpGetText(e,t="GET",r,s={}){return this.HttpGetJson(e,t,r,s,!1,!1)}static async createFormData(e,t){let r="image/png";t.endsWith(".jpg")&&(r="image/jpeg");const s=[`------${e}\r
`,`Content-Disposition: form-data; name="share_image"; filename="${t}"\r
`,"Content-Type: "+r+`\r
\r
`],i=U.readFileSync(t),n=`\r
------${e}--`;return Buffer.concat([Buffer.from(s.join(""),"utf8"),i,Buffer.from(n,"utf8")])}}class H{core;constructor(e){this.core=e}async setLongNick(e){return this.core.session.getProfileService().setLongNick(e)}async setSelfOnlineStatus(e,t,r){return this.core.session.getMsgService().setStatus({status:e,extStatus:t,batteryStatus:r})}async getBuddyRecommendContactArkJson(e,t=""){return this.core.session.getBuddyService().getBuddyRecommendContactArkJson(e,t)}async like(e,t=1){return this.core.session.getProfileLikeService().setBuddyProfileLike({friendUid:e,sourceId:71,doLikeCount:t,doLikeTollCount:0})}async setQQAvatar(e){const t=await this.core.session.getProfileService().setHeader(e);return{result:t?.result,errMsg:t?.errMsg}}async getSelfInfo(){}async getUserInfo(e){}async modifySelfProfile(e){return this.core.session.getProfileService().modifyDesktopMiniProfile(e)}async getPSkey(e){return await this.core.session.getTipOffService().getPskey(e,!0)}async getQzoneCookies(e,t){const r="https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin="+e+"&clientkey="+t+"&u1=https%3A%2F%2Fuser.qzone.qq.com%2F"+e+"%2Finfocenter&keyindex=19%27";return await v.HttpsGetCookies(r)}async getSkey(e,t){const r="https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin="+e+"&clientkey="+t+"&u1=https%3A%2F%2Fh5.qzone.qq.com%2Fqqnt%2Fqzoneinpcqq%2Ffriend%3Frefresh%3D0%26clientuin%3D0%26darkMode%3D0&keyindex=19%27",i=(await v.HttpsGetCookies(r)).skey;if(!i)throw new Error("getSkey Skey is Empty");return i}async getRobotUinRange(){return(await this.core.session.getRobotService().getRobotUinRange({justFetchMsgConfig:"1",type:1,version:0,aioKeywordVersion:0}))?.response?.robotUinRanges}async getUidByUin(e){return(await this.core.event.CallNoListenerEvent("NodeIKernelUixConvertService/getUid",5e3,[e])).uidInfo.get(e)}async getUinByUid(e){return e?(await this.core.event.CallNoListenerEvent("NodeIKernelUixConvertService/getUin",5e3,[e])).uinInfo.get(e):""}async getUserDetailInfo(e){let[t,r]=await this.core.event.CallNormalEvent("NodeIKernelProfileService/getUserDetailInfo","NodeIKernelProfileListener/onProfileDetailInfoChanged",2,5e3,s=>s.uid===e,e);return r}static async getCookies(e,t,r){const s="https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin="+e+"&clientkey="+t+"&u1=https%3A%2F%2F"+r+"%2F"+e+"%2Finfocenter&keyindex=19%27";return await v.HttpsGetCookies(s)}async getUserDetailInfoByUin(e){return this.core.event.CallNoListenerEvent("NodeIKernelProfileService/getUserDetailInfoByUin",5e3,e)}async forceFetchClientKey(){return await this.core.session.getTicketService().forceFetchClientKey("")}}class J{async getGroupEssenceMsg(e,t,r,s){const i="https://qun.qq.com/cgi-bin/group_digest/digest_list?bkn="+s+"&group_code="+e+"&page_start="+t+"&page_limit=20";let n;try{n=await v.HttpGetJson(i,"GET","",{Cookie:r})}catch{return}if(n.retcode===0)return n}async getGroupMembers(e,t,r){let s=new Array;try{const i=[],n=await v.HttpGetJson("https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?st=0&end=40&sort=1&gc="+e+"&bkn="+r,"POST","",{Cookie:t});if(!n?.count||n?.errcode!==0||!n?.mems)return[];for(const a in n.mems)s.push(n.mems[a]);const o=Math.ceil(n.count/40);for(let a=2;a<=o;a++){const l=v.HttpGetJson("https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?st="+(a-1)*40+"&end="+a*40+"&sort=1&gc="+e+"&bkn="+r,"POST","",{Cookie:t});i.push(l)}for(let a=1;a<=o;a++){const l=await i[a];if(!(!l?.count||l?.errcode!==0||!l?.mems))for(const u in l.mems)s.push(l.mems[u])}}catch{return s}return s}async setGroupNotice(e,t="",r,s){let i;const n="https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn="+s;try{return i=await v.HttpGetJson(n,"GET","",{Cookie:r}),i}catch{return}}async getGrouptNotice(e,t,r){let s;const i="https://web.qun.qq.com/cgi-bin/announce/get_t_list?bkn="+r+"&qid="+e+"&ft=23&ni=1&n=1&i=1&log_read=1&platform=1&s=-1&n=20";try{return s=await v.HttpGetJson(i,"GET","",{Cookie:t}),s?.ec!==0?void 0:s}catch{return}}genBkn(e){e=e||"";let t=5381;for(let r=0;r<e.length;r++){const s=e.charCodeAt(r);t=t+(t<<5)+s}return(t&2147483647).toString()}async getGroupHonorInfo(e,t,r){async function s(n,o){let a="https://qun.qq.com/interactive/honorlist?gc="+n+"&type="+o.toString(),l="",u;try{l=await v.HttpGetText(a,"GET","",{Cookie:r});const p=l.match(/window\.__INITIAL_STATE__=(.*?);/);return p&&(u=JSON.parse(p[1].trim())),o===1?u?.talkativeList:u?.actorList}catch{}}let i={group_id:e};if(t==="talkative"||t==="all")try{let n=await s(e,1);if(!n)throw new Error("获取龙王信息失败");i.current_talkative={user_id:n[0]?.uin,avatar:n[0]?.avatar,nickname:n[0]?.name,day_count:0,description:n[0]?.desc},i.talkative_list=[];for(const o of n)i.talkative_list.push({user_id:o?.uin,avatar:o?.avatar,description:o?.desc,day_count:0,nickname:o?.name})}catch{}if(t==="performer"||t==="all")try{let n=await s(e,2);if(!n)throw new Error("获取群聊之火失败");i.performer_list=[];for(const o of n)i.performer_list.push({user_id:o?.uin,nickname:o?.name,avatar:o?.avatar,description:o?.desc})}catch{}if(t==="performer"||t==="all")try{let n=await s(e,3);if(!n)throw new Error("获取群聊炽焰失败");i.legend_list=[];for(const o of n)i.legend_list.push({user_id:o?.uin,nickname:o?.name,avatar:o?.avatar,desc:o?.description})}catch{}if(t==="emotion"||t==="all")try{let n=await s(e,6);if(!n)throw new Error("获取快乐源泉失败");i.emotion_list=[];for(const o of n)i.emotion_list.push({user_id:o?.uin,nickname:o?.name,avatar:o?.avatar,desc:o?.description})}catch{}return(t==="emotion"||t==="all")&&(i.strong_newbie_list=[]),i}}class x{core;constructor(e){this.core=e}async hasOtherRunningQQProcess(){return this.core.util.hasOtherRunningQQProcess()}async ORCImage(e){return this.core.session.getNodeMiscService().wantWinScreenOCR(e)}async translateEnWordToZn(e){return this.core.session.getRichMediaService().translateEnWordToZn(e)}async getOnlineDev(){return this.core.session.getMsgService().getOnLineDev()}async getArkJsonCollection(e){return await this.core.event.CallNoListenerEvent("NodeIKernelCollectionService/collectionArkShare",5e3,"1717662698058")}async BootMiniApp(e,t){await this.core.session.getNodeMiscService().setMiniAppVersion("2.16.4");let r=await this.core.session.getNodeMiscService().getMiniAppPath();return console.log(r),this.core.session.getNodeMiscService().startNewMiniApp(e,t)}}class ${core;constructor(e){this.core=e}async createCollection(e,t,r,s,i){let n={commInfo:{bid:1,category:2,author:{type:1,numId:e,strId:r,groupId:"0",groupName:"",uid:t},customGroupId:"0",createTime:Date.now().toString(),sequence:Date.now().toString()},richMediaSummary:{originalUri:"",publisher:"",richMediaVersion:0,subTitle:"",title:"",brief:s,picList:[],contentType:1},richMediaContent:{rawData:i,bizDataList:[],picList:[],fileList:[]},need_share_url:!1};return this.core.session.getCollectionService().createNewCollectionItem(n)}async getAllCollection(e=0,t=50){let r={category:e,groupId:-1,forceSync:!0,forceFromDb:!1,timeStamp:"0",count:t,searchDown:!0};return this.core.session.getCollectionService().getCollectionItemList(r)}}class j{session;util;event;ApiCollection;ApiFile;ApiFileCache;ApiFriend;ApiGroup;ApiMsg;ApiSystem;ApiUser;ApiWeb;constructor(e,t){this.session=t,this.util=new e.NodeQQNTWrapperUtil,this.event=new D,this.event.init({ListenerMap:e,WrapperSession:this.session}),this.ApiCollection=new $(this),this.ApiFile=new Q(this),this.ApiFileCache=new W(this),this.ApiFriend=new B(this),this.ApiGroup=new K(this),this.ApiMsg=new O(this),this.ApiSystem=new x(this),this.ApiUser=new H(this),this.ApiWeb=new J}getWrapperSession(){return this.session}getWrapperUtil(){return this.util}getApiCollection(){return this.ApiCollection}getApiFile(){return this.ApiFile}getApiFileCache(){return this.ApiFileCache}getApiFriend(){return this.ApiFriend}getApiGroup(){return this.ApiGroup}getApiMsg(){return this.ApiMsg}getApiSystem(){return this.ApiSystem}getApiUser(){return this.ApiUser}getApiWeb(){return this.ApiWeb}}var w=(c=>(c.sendLog="NodeIQQNTWrapperSession/create/getNodeMiscService/sendLog",c.onQRCodeLoginSucceed="NodeIKernelLoginService/get/addKernelLoginListener/onQRCodeLoginSucceed",c.onRecvMsg="NodeIQQNTWrapperSession/create/getMsgService/addKernelMsgListener/onRecvMsg",c.requestTianshuAdv="NodeIQQNTWrapperSession/create/getMsgService/requestTianshuAdv",c.onRecvActiveMsg="nodeIKernelMsgListener/onRecvActiveMsg",c))(w||{});const L=new _.EventEmitter,G=({argArray:c,ret:e,key:t})=>{if(!(t.endsWith("Service")&&E.has(t)||!T?.log)&&(t.endsWith("Service")&&E.set(t,!0),console.log("-----------------------------------------------"),console.log(`${t} 被调用`),c.length&&console.log("参数: ",c),console.log("返回值: ",e),typeof e=="object"&&e)){const r=Object.getOwnPropertyNames(e);r.length&&console.log("返回值 keys: ",r),console.log("原型 keys: ",Object.getOwnPropertyNames(Object.getPrototypeOf(e)))}},C=({instance:c,rootKey:e})=>new Proxy(c,{get(t,r,s){const i=Reflect.get(c,r,s);if(typeof i!="function")return i;const n=`${e}/${r}`;return(...o)=>{if(T?.eventBlacklist?.includes(n))return;n.endsWith("Listener")&&(o[0]=C({instance:o[0],rootKey:n}));let a=c[r](...o);return n.endsWith("Service")&&(a=C({instance:a,rootKey:n})),G({argArray:o,ret:a,key:n}),L.emit(n,{applyRet:a,args:o}),a}}});let q,b;const E=new Map;let T;const z=c=>(T=c,new Promise(e=>{F.dlopen=new Proxy(F.dlopen,{apply(t,r,s){const[,i]=s,n=Reflect.apply(t,r,s);if(i.includes("wrapper.node")){const o=s[0].exports,a=new Proxy(o,{get(l,u,p){const g=Reflect.get(o,u,p);return typeof g!="function"?g:new Proxy(function(){},{get(h,y,f){const d=Reflect.get(g,y,f);return typeof d!="function"?d:new Proxy(d,{apply(S,M,k){const m=Reflect.apply(S,M,k),N=`${u}/${y}`;return G({argArray:k,ret:m,key:N}),N==="NodeIQQNTWrapperSession/create"&&(q=m),typeof m!="object"?m:C({instance:m,rootKey:N})}})},construct(h,y,f){const d=Reflect.construct(g,y,f);return G({key:u,ret:d,argArray:y}),C({instance:d,rootKey:u})}})}});b=s[0].exports=a}return n}}),L.once(w.onQRCodeLoginSucceed,()=>{e(new j(b,q))})}));(async()=>(await z({eventBlacklist:[w.sendLog],log:!1}),L.addListener(w.requestTianshuAdv,c=>{console.log("这尼玛能行？"),console.log(c.args)})))();
