import{U as e,W as s,r as t,a,aq as r,ar as l,q as n,K as i,a8 as o,t as d,j as c,Z as x,O as m,a4 as u,a5 as h,as as p,v as b,f as g,m as j,at as f,x as v,n as y,D as N,V as w,u as k,b as _,au as C,a6 as S,ai as q,g as T,i as z,M as P,N as A,al as L,av as E,p as R,F as $,am as Q,ao as F,e as I,c as M,A as D,a0 as B,h as K,ab as U,aw as O,a3 as Y,k as W,C as X,ax as V,ay as H,az as G,aA as J,aB as Z,aC as ee}from"./react-vendor-JLH1r332.js";import{a as se}from"./utils-chunk-CyH00Vps.js";import{u as te}from"./auth-chunk-CmjlQMUy.js";const ae=async()=>{const{data:e}=await se.get("/api/users/me");return e},re=async()=>{try{const{data:e}=await se.get("/api/notifications/unread-count");return e.count||0}catch(e){return 0}};function le({children:k,showBreadcrumbs:_=!1,breadcrumbItems:C=[]}){const{user:S,logout:q}=te(),T=e(),z=s(),[P,A]=t.useState(!1),[L,E]=t.useState(!1),{data:R}=a({queryKey:["user_profile"],queryFn:ae,staleTime:3e5,refetchOnWindowFocus:!1}),{data:$=0}=a({queryKey:["notifications_count"],queryFn:re,refetchInterval:3e4,staleTime:1e4,refetchOnWindowFocus:!1});t.useEffect(()=>{A(!1),E(!1)},[z.pathname]),t.useEffect(()=>{const e=e=>{e.target.closest(".user-menu")||e.target.closest(".mobile-menu")||E(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]);const Q=async()=>{try{await q(),w.success("Logged out successfully"),T("/login")}catch(e){w.error("Error logging out")}},F=e=>"/dashboard"===e&&"/"===z.pathname||!("/tasks"!==e||!z.pathname.startsWith("/tasks"))||!("/badges"!==e||!z.pathname.startsWith("/badges"))||!("/leaderboard"!==e||!z.pathname.startsWith("/leaderboard"))||!("/activities"!==e||!z.pathname.startsWith("/activities"))||!("/weaving"!==e||!z.pathname.startsWith("/weaving"))||z.pathname===e,I=[{name:"Dashboard",href:"/dashboard",icon:r,current:F("/dashboard"),description:"Overview and stats"},{name:"Tasks",href:"/tasks",icon:l,current:F("/tasks"),description:"Complete tasks and earn rewards"},{name:"Badges",href:"/badges",icon:n,current:F("/badges"),description:"View your achievements"},{name:"Leaderboard",href:"/leaderboard",icon:i,current:F("/leaderboard"),description:"See rankings and top performers"},{name:"Activities",href:"/activities",icon:o,current:F("/activities"),description:"Recent platform activity"},{name:"Weaving",href:"/weaving",icon:d,current:F("/weaving"),description:"Impact weaving and connections"}],M=[{name:"Profile",href:"/profile",icon:g,description:"View and edit your profile"},{name:"My Submissions",href:"/submissions",icon:j,description:"Track your submission history"},{name:"Settings",href:"/settings",icon:f,description:"Account and preferences"}],D=(()=>{var e,s;const t=R||S;return{username:(null==t?void 0:t.username)||"User",level:(null==t?void 0:t.level)||1,xp:(null==t?void 0:t.xp)||0,essence:(null==t?void 0:t.essence)||0,streak:(null==t?void 0:t.current_streak)||0,avatar:null==t?void 0:t.avatar_url,initials:(null==(s=null==(e=null==t?void 0:t.username)?void 0:e.charAt(0))?void 0:s.toUpperCase())||"U"}})();/* @__PURE__ */
return c.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900",children:[
/* @__PURE__ */c.jsx("header",{className:"bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700",children:/* @__PURE__ */c.jsxs("nav",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between h-16",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-8",children:[
/* @__PURE__ */c.jsxs(x,{to:"/dashboard",className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx("div",{className:"h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center",children:/* @__PURE__ */c.jsx("span",{className:"text-white font-bold text-sm",children:"ID"})}),
/* @__PURE__ */c.jsx("span",{className:"text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",children:"Impact ID"})]}),
/* @__PURE__ */c.jsx("div",{className:"hidden lg:flex items-center space-x-1",children:I.map(e=>{const s=e.icon;/* @__PURE__ */
return c.jsxs(x,{to:e.href,className:"group relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 "+(e.current?"bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200":"text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"),title:e.description,children:[
/* @__PURE__ */c.jsx(s,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:e.name}),
/* @__PURE__ */c.jsx("div",{className:"absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block",children:/* @__PURE__ */c.jsxs("div",{className:"bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap",children:[e.description,
/* @__PURE__ */c.jsx("div",{className:"absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"})]})})]},e.name)})})]}),
/* @__PURE__ */c.jsxs("div",{className:"hidden md:flex items-center space-x-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4 text-sm",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-yellow-600",children:[
/* @__PURE__ */c.jsx(m,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"font-semibold",children:D.xp.toLocaleString()})]}),D.essence>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-purple-600",children:[
/* @__PURE__ */c.jsx(u,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"font-semibold",children:D.essence})]}),D.streak>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-red-600",children:[
/* @__PURE__ */c.jsx(h,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"font-semibold",children:D.streak})]})]}),
/* @__PURE__ */c.jsxs(x,{to:"/notifications",className:"relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors",children:[$>0?/* @__PURE__ */c.jsx(p,{className:"h-6 w-6 text-blue-600"}):/* @__PURE__ */c.jsx(b,{className:"h-6 w-6"}),$>0&&/* @__PURE__ */c.jsx("span",{className:"absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center",children:$>9?"9+":$})]}),
/* @__PURE__ */c.jsxs("div",{className:"relative user-menu",children:[
/* @__PURE__ */c.jsx("button",{onClick:()=>E(!L),className:"flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2",children:[D.avatar?/* @__PURE__ */c.jsx("img",{src:D.avatar,alt:D.username,className:"h-8 w-8 rounded-full"}):/* @__PURE__ */c.jsx("div",{className:"h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center",children:/* @__PURE__ */c.jsx("span",{className:"text-white font-semibold text-sm",children:D.initials})}),
/* @__PURE__ */c.jsxs("div",{className:"text-left",children:[
/* @__PURE__ */c.jsx("div",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:D.username}),
/* @__PURE__ */c.jsxs("div",{className:"text-xs text-gray-500",children:["Level ",D.level]})]})]})}),L&&/* @__PURE__ */c.jsxs("div",{className:"absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50",children:[M.map(e=>{const s=e.icon;/* @__PURE__ */
return c.jsxs(x,{to:e.href,className:"flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",children:[
/* @__PURE__ */c.jsx(s,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("div",{className:"font-medium",children:e.name}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-gray-500",children:e.description})]})]},e.name)}),
/* @__PURE__ */c.jsx("hr",{className:"my-1 border-gray-200 dark:border-gray-700"}),"admin"===(null==S?void 0:S.role)&&/* @__PURE__ */c.jsxs(x,{to:"/admin",className:"flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",children:[
/* @__PURE__ */c.jsx(v,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("div",{className:"font-medium",children:"Admin Panel"}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-red-500",children:"System administration"})]})]}),
/* @__PURE__ */c.jsxs("button",{onClick:Q,className:"flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",children:[
/* @__PURE__ */c.jsx("svg",{className:"h-4 w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:/* @__PURE__ */c.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("div",{className:"font-medium",children:"Logout"}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-red-500",children:"Sign out of your account"})]})]})]})]})]}),
/* @__PURE__ */c.jsx("div",{className:"md:hidden",children:/* @__PURE__ */c.jsx("button",{onClick:()=>A(!P),className:"text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2",children:P?/* @__PURE__ */c.jsx(y,{className:"h-6 w-6"}):/* @__PURE__ */c.jsx(N,{className:"h-6 w-6"})})})]}),P&&/* @__PURE__ */c.jsx("div",{className:"md:hidden border-t border-gray-200 dark:border-gray-700 py-4 mobile-menu",children:/* @__PURE__ */c.jsxs("div",{className:"space-y-2",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3 px-3 py-3 border-b border-gray-200 dark:border-gray-700",children:[D.avatar?/* @__PURE__ */c.jsx("img",{src:D.avatar,alt:D.username,className:"h-10 w-10 rounded-full"}):/* @__PURE__ */c.jsx("div",{className:"h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center",children:/* @__PURE__ */c.jsx("span",{className:"text-white font-semibold",children:D.initials})}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("div",{className:"font-medium text-gray-900 dark:text-white",children:D.username}),
/* @__PURE__ */c.jsxs("div",{className:"text-sm text-gray-500",children:["Level ",D.level," • ",D.xp.toLocaleString()," XP"]})]})]}),I.map(e=>{const s=e.icon;/* @__PURE__ */
return c.jsxs(x,{to:e.href,className:"flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium "+(e.current?"bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200":"text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"),children:[
/* @__PURE__ */c.jsx(s,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:e.name})]},e.name)}),
/* @__PURE__ */c.jsxs("div",{className:"pt-4 border-t border-gray-200 dark:border-gray-700",children:[M.map(e=>{const s=e.icon;/* @__PURE__ */
return c.jsxs(x,{to:e.href,className:"flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",children:[
/* @__PURE__ */c.jsx(s,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:e.name})]},e.name)}),"admin"===(null==S?void 0:S.role)&&/* @__PURE__ */c.jsxs(x,{to:"/admin",className:"flex items-center space-x-3 px-3 py-3 text-base font-bold text-red-600 hover:text-red-700",children:[
/* @__PURE__ */c.jsx(v,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Admin Panel"})]}),
/* @__PURE__ */c.jsxs("button",{onClick:Q,className:"flex items-center space-x-3 w-full px-3 py-3 text-base font-medium text-red-600 hover:text-red-700",children:[
/* @__PURE__ */c.jsx("svg",{className:"h-5 w-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:/* @__PURE__ */c.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),
/* @__PURE__ */c.jsx("span",{children:"Logout"})]})]})]})})]})}),_&&C.length>0&&/* @__PURE__ */c.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",children:/* @__PURE__ */c.jsx("nav",{className:"flex","aria-label":"Breadcrumb",children:/* @__PURE__ */c.jsx("ol",{className:"flex items-center space-x-2",children:C.map((e,s)=>/* @__PURE__ */c.jsxs("li",{className:"flex items-center",children:[s>0&&/* @__PURE__ */c.jsx("svg",{className:"flex-shrink-0 h-4 w-4 text-gray-400 mr-2",fill:"currentColor",viewBox:"0 0 20 20",children:/* @__PURE__ */c.jsx("path",{fillRule:"evenodd",d:"M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",clipRule:"evenodd"})}),e.href?/* @__PURE__ */c.jsx(x,{to:e.href,className:"text-gray-500 hover:text-gray-700 text-sm font-medium",children:e.name}):/* @__PURE__ */c.jsx("span",{className:"text-gray-900 text-sm font-medium",children:e.name})]},s))})})}),
/* @__PURE__ */c.jsx("main",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:k})]})}const ne={quiz:{icon:R,iconSolid:R,color:"text-blue-600",bgColor:"bg-blue-50",borderColor:"border-blue-500",label:"Quiz"},upload:{icon:E,iconSolid:E,color:"text-green-600",bgColor:"bg-green-50",borderColor:"border-green-500",label:"Upload"},social_share:{icon:L,iconSolid:L,color:"text-purple-600",bgColor:"bg-purple-50",borderColor:"border-purple-500",label:"Social Share"},survey:{icon:j,iconSolid:j,color:"text-indigo-600",bgColor:"bg-indigo-50",borderColor:"border-indigo-500",label:"Survey"},challenge:{icon:n,iconSolid:A,color:"text-yellow-600",bgColor:"bg-yellow-50",borderColor:"border-yellow-500",label:"Challenge"},report:{icon:j,iconSolid:j,color:"text-gray-600",bgColor:"bg-gray-50",borderColor:"border-gray-500",label:"Report"}},ie={beginner:{label:"Beginner",color:"text-green-600",bgColor:"bg-green-100",icon:"🌱"},intermediate:{label:"Intermediate",color:"text-yellow-600",bgColor:"bg-yellow-100",icon:"⚡"},advanced:{label:"Advanced",color:"text-orange-600",bgColor:"bg-orange-100",icon:"🔥"},expert:{label:"Expert",color:"text-red-600",bgColor:"bg-red-100",icon:"💎"}},oe=async({taskId:e,payload:s})=>{const{data:t}=await se.post(`/api/tasks/${e}/submit`,s);return t};function de({task:e,viewMode:s="grid"}){const a=k(),[r,l]=t.useState(""),[n,o]=t.useState(null),[m,u]=t.useState(""),[h,p]=t.useState(""),[b]=t.useState(Date.now()),{mutate:j,isPending:f}=_({mutationFn:oe,onSuccess:e=>{const s=e.message||"Task submitted successfully!";w.success(s),e.auto_approved&&e.xp_earned&&w.success(`🎉 +${e.xp_earned} XP earned!`,{duration:4e3,icon:"✨"}),e.level_up&&w.success("🎊 Level up! Congratulations!",{duration:5e3,icon:"🆙"}),e.badges_unlocked&&e.badges_unlocked.length>0&&e.badges_unlocked.forEach(e=>{w.success(`🏆 Badge unlocked: ${e}!`,{duration:4e3,icon:"🎖️"})}),a.invalidateQueries({queryKey:["tasks"]}),a.invalidateQueries({queryKey:["user_profile"]}),a.invalidateQueries({queryKey:["user_badges"]}),a.invalidateQueries({queryKey:["userDashboard"]})},onError:e=>{var s,t,a,r,l,n,i;let o="Submission failed. Please try again.";(null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)?o=e.response.data.detail:(null==(r=null==(a=e.response)?void 0:a.data)?void 0:r.message)?o=e.response.data.message:400===(null==(l=e.response)?void 0:l.status)?o="Invalid submission. Please check your response and try again.":403===(null==(n=e.response)?void 0:n.status)?o="You do not have permission to submit this task.":429===(null==(i=e.response)?void 0:i.status)&&(o="Too many attempts. Please wait before trying again."),w.error(o)}}),v=()=>{if(!(()=>{if("quiz"===e.type){if(!(null==r?void 0:r.trim()))return w.error("Please select an answer."),!1}else if("upload"===e.type){if(!n&&!(null==m?void 0:m.trim()))return w.error("Please upload a file or provide a text response."),!1}else if("social_share"===e.type){if(!(null==h?void 0:h.trim()))return w.error("Please provide the social media post URL."),!1;try{new URL(h)}catch{return w.error("Please provide a valid URL."),!1}}else if(!("survey"!==e.type&&"challenge"!==e.type||(null==m?void 0:m.trim())&&m.trim().length>=10))return w.error("Please provide a response of at least 10 characters."),!1;return!0})())return;let s={response:"Completed",time_spent_minutes:Math.round((Date.now()-b)/6e4),attachments:[]};"quiz"===e.type?s.response=r.trim():"upload"===e.type?(s.response=(null==m?void 0:m.trim())||"File uploaded",n&&(s.attachments=[n.name])):"social_share"===e.type?s.response=h.trim():"survey"!==e.type&&"challenge"!==e.type||(s.response=m.trim()),j({taskId:e.id,payload:s})},y=()=>"approved"===e.user_submission_status,N=()=>"pending"===e.user_submission_status,A=()=>"declined"===e.user_submission_status||"rejected"===e.user_submission_status,L=()=>!y()&&!f&&(e.user_attempts_used||0)<(e.max_attempts||3),E=ne[e.type]||ne.challenge,R=ie[e.difficulty]||ie.beginner,Q=E.icon,F="list"===s?"bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200":"bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200";/* @__PURE__ */
return c.jsxs("div",{className:`${F} ${E.borderColor}`,children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start justify-between mb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start space-x-3 flex-1",children:[
/* @__PURE__ */c.jsx("div",{className:`p-2 rounded-lg ${E.bgColor} flex-shrink-0`,children:/* @__PURE__ */c.jsx(Q,{className:"h-5 w-5 "+E.color})}),
/* @__PURE__ */c.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */c.jsx("h3",{className:"font-bold text-gray-900 "+("list"===s?"text-base":"text-lg"),children:e.title}),
/* @__PURE__ */c.jsxs("div",{className:"flex flex-wrap items-center gap-2 mt-2",children:[
/* @__PURE__ */c.jsx("span",{className:`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${E.bgColor} ${E.color}`,children:E.label}),
/* @__PURE__ */c.jsxs("span",{className:`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${R.bgColor} ${R.color}`,children:[
/* @__PURE__ */c.jsx("span",{className:"mr-1",children:R.icon}),R.label]}),
/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium",children:[
/* @__PURE__ */c.jsx(C,{className:"h-3 w-3 mr-1"}),e.category]}),e.is_featured&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium",children:[
/* @__PURE__ */c.jsx(S,{className:"h-3 w-3 mr-1"}),"Featured"]})]})]})]}),y()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium",children:[
/* @__PURE__ */c.jsx(P,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:"Completed"})]}):N()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium",children:[
/* @__PURE__ */c.jsx(T,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:"Pending Review"})]}):A()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium",children:[
/* @__PURE__ */c.jsx($,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:"Needs Revision"})]}):null]}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-4 text-sm leading-relaxed",children:e.instructions}),e.tags&&e.tags.length>0&&/* @__PURE__ */c.jsx("div",{className:"flex flex-wrap gap-1 mb-4",children:e.tags.map((e,s)=>/* @__PURE__ */c.jsxs("span",{className:"px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs",children:["#",e]},s))}),(()=>{var s;if(y())return null;switch(e.type){case"quiz":if(!e.quiz_question)return null;const t=Array.isArray(e.quiz_question.options)?e.quiz_question.options:(null==(s=e.quiz_question.options)?void 0:s.choices)||[];/* @__PURE__ */
return c.jsxs("div",{className:"mt-4 p-4 bg-gray-50 rounded-lg",children:[
/* @__PURE__ */c.jsx("h4",{className:"font-semibold text-gray-800 mb-3",children:e.quiz_question.question||"Quiz Question"}),
/* @__PURE__ */c.jsx("div",{className:"space-y-2",children:t.map((s,t)=>/* @__PURE__ */c.jsxs("label",{className:"flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors",children:[
/* @__PURE__ */c.jsx("input",{type:"radio",name:"quiz-"+e.id,value:"string"==typeof s?s:s.text,checked:r===("string"==typeof s?s:s.text),onChange:e=>l(e.target.value),className:"h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"}),
/* @__PURE__ */c.jsx("span",{className:"ml-3 text-gray-700",children:"string"==typeof s?s:s.text})]},t))})]});case"upload":/* @__PURE__ */
return c.jsxs("div",{className:"mt-4 space-y-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"p-4 bg-gray-50 rounded-lg",children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Upload File (Optional)"}),
/* @__PURE__ */c.jsx("input",{type:"file",onChange:e=>{var s;return o((null==(s=e.target.files)?void 0:s[0])||null)},className:"block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",accept:"image/*,video/*,.pdf,.doc,.docx"}),n&&/* @__PURE__ */c.jsxs("p",{className:"mt-2 text-sm text-green-700",children:["Selected: ",n.name]})]}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Text Response"}),
/* @__PURE__ */c.jsx("textarea",{value:m,onChange:e=>u(e.target.value),rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Describe your work or provide additional details..."})]})]});case"social_share":/* @__PURE__ */
return c.jsxs("div",{className:"mt-4",children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Social Media Post URL"}),
/* @__PURE__ */c.jsx("input",{type:"url",value:h,onChange:e=>p(e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"https://twitter.com/yourpost or https://linkedin.com/posts/..."}),
/* @__PURE__ */c.jsx("p",{className:"mt-2 text-xs text-gray-600",children:"Share this task on social media and paste the link here"})]});default:/* @__PURE__ */
return c.jsxs("div",{className:"mt-4",children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Your Response"}),
/* @__PURE__ */c.jsx("textarea",{value:m,onChange:e=>u(e.target.value),rows:4,className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Share your thoughts, experience, or solution..."}),
/* @__PURE__ */c.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:["Minimum 10 characters required • ",m.length," characters"]})]})}})(),
/* @__PURE__ */c.jsxs("div",{className:"mt-6 pt-4 border-t border-gray-100",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4 text-sm text-gray-600",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(q,{className:"h-4 w-4 text-yellow-500"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:[e.xp_reward," XP"]})]}),e.essence_reward>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(d,{className:"h-4 w-4 text-purple-500"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:[e.essence_reward," Essence"]})]}),e.time_limit_minutes&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4 text-gray-500"}),
/* @__PURE__ */c.jsx("span",{children:(e=>{if(!e)return null;if(60>e)return e+"m";const s=Math.floor(e/60),t=e%60;return t>0?`${s}h ${t}m`:s+"h"})(e.time_limit_minutes)})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(z,{className:"h-4 w-4 text-gray-500"}),
/* @__PURE__ */c.jsxs("span",{children:[e.user_attempts_used||0,"/",e.max_attempts," attempts"]})]})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2",children:[y()&&/* @__PURE__ */c.jsxs("span",{className:"text-green-600 text-sm font-medium flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(P,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Completed"})]}),N()&&/* @__PURE__ */c.jsxs("span",{className:"text-yellow-600 text-sm font-medium flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Under Review"})]}),A()&&/* @__PURE__ */c.jsx("button",{onClick:v,disabled:f||!L(),className:"bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm",children:f?"Submitting...":"Retry"}),!y()&&!N()&&!A()&&/* @__PURE__ */c.jsx("button",{onClick:v,disabled:f||!L(),className:"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm",children:f?"Submitting...":"Submit Task"}),
/* @__PURE__ */c.jsx(x,{to:"/tasks/"+e.id,className:"text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors",title:"View details",children:/* @__PURE__ */c.jsx(z,{className:"h-4 w-4"})})]})]}),e.completion_count>0&&/* @__PURE__ */c.jsx("div",{className:"mt-3 pt-3 border-t border-gray-50",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between text-xs text-gray-500",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4",children:[
/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(g,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsxs("span",{children:[e.completion_count," completed"]})]}),e.success_rate>0&&/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(i,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsxs("span",{children:[Math.round(e.success_rate),"% success rate"]})]})]}),e.average_completion_time&&/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsxs("span",{children:["Avg: ",Math.round(e.average_completion_time),"min"]})]})]})})]})]})}const ce=["Environment","Education","Social Impact","Technology","Health","Community","Sustainability","Innovation","Arts & Culture","Research"],xe={beginner:{label:"Beginner",color:"text-green-600",bgColor:"bg-green-50",borderColor:"border-green-200"},intermediate:{label:"Intermediate",color:"text-yellow-600",bgColor:"bg-yellow-50",borderColor:"border-yellow-200"},advanced:{label:"Advanced",color:"text-orange-600",bgColor:"bg-orange-50",borderColor:"border-orange-200"},expert:{label:"Expert",color:"text-red-600",bgColor:"bg-red-50",borderColor:"border-red-200"}},me={all:{label:"All Tasks",icon:F},available:{label:"Available",icon:T},completed:{label:"Completed",icon:K},featured:{label:"Featured",icon:B}},ue=async()=>{const{data:e}=await se.get("/tasks/categories");return e};function he(){var e,s;const[r,l]=t.useState({category:"",difficulty:"",completed:null,limit:20,offset:0}),[i,o]=t.useState("grid"),[d,x]=t.useState(!1),[m,u]=t.useState(""),{data:h,isLoading:p,isError:b,error:g,refetch:j,isFetching:f}=a({queryKey:["tasks",r],queryFn:()=>(async e=>{const s=new URLSearchParams;e.category&&s.append("category",e.category),e.difficulty&&s.append("difficulty",e.difficulty),null!==e.completed&&s.append("completed",e.completed),e.limit&&s.append("limit",e.limit),e.offset&&s.append("offset",e.offset);const{data:t}=await se.get("/tasks/?"+s.toString());return t})(r),staleTime:3e5,cacheTime:6e5}),{data:v}=a({queryKey:["task-categories"],queryFn:ue,staleTime:18e5,cacheTime:36e5}),y=t.useCallback((e,s)=>{l(t=>({...t,[e]:s,offset:0}))},[]),N=t.useCallback(e=>{let s=null;"completed"===e&&(s=!0),"available"===e&&(s=!1),y("completed",s)},[y]),k=t.useCallback(()=>{j(),w.success("Tasks refreshed!")},[j]),_=t.useCallback(()=>{l({category:"",difficulty:"",completed:null,limit:20,offset:0}),u(""),w.success("Filters cleared!")},[]),S=(null==h?void 0:h.filter(e=>{var s;return!m||e.title.toLowerCase().includes(m.toLowerCase())||e.category.toLowerCase().includes(m.toLowerCase())||(null==(s=e.tags)?void 0:s.some(e=>e.toLowerCase().includes(m.toLowerCase())))}))||[],q=()=>/* @__PURE__ */c.jsx("div",{className:"grid gap-4 "+("grid"===i?"grid-cols-1 md:grid-cols-2 lg:grid-cols-3":"grid-cols-1"),children:[1,2,3,4,5,6].map(e=>/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-lg p-6 shadow-sm animate-pulse",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start justify-between mb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */c.jsx("div",{className:"h-5 bg-gray-300 rounded w-3/4 mb-2"}),
/* @__PURE__ */c.jsx("div",{className:"h-4 bg-gray-300 rounded w-1/2"})]}),
/* @__PURE__ */c.jsx("div",{className:"h-6 w-16 bg-gray-300 rounded-full"})]}),
/* @__PURE__ */c.jsxs("div",{className:"space-y-2 mb-4",children:[
/* @__PURE__ */c.jsx("div",{className:"h-3 bg-gray-300 rounded w-full"}),
/* @__PURE__ */c.jsx("div",{className:"h-3 bg-gray-300 rounded w-5/6"})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */c.jsx("div",{className:"h-4 bg-gray-300 rounded w-20"}),
/* @__PURE__ */c.jsx("div",{className:"h-8 w-24 bg-gray-300 rounded"})]})]},e))});return p&&!h?/* @__PURE__ */c.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */c.jsx("div",{className:"flex items-center justify-between",children:/* @__PURE__ */c.jsxs("div",{className:"animate-pulse",children:[
/* @__PURE__ */c.jsx("div",{className:"h-8 bg-gray-300 rounded w-48 mb-2"}),
/* @__PURE__ */c.jsx("div",{className:"h-4 bg-gray-300 rounded w-32"})]})}),
/* @__PURE__ */c.jsx(q,{})]}):b?/* @__PURE__ */c.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-6",children:/* @__PURE__ */c.jsx("div",{className:"flex items-center justify-center text-center",children:/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("p",{className:"text-red-800 mb-4",children:(null==g?void 0:g.message)||"Failed to load tasks."}),
/* @__PURE__ */c.jsx("button",{onClick:k,className:"bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Try Again"})]})})}):/* @__PURE__ */c.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsxs("h2",{className:"text-2xl font-bold text-gray-800 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(n,{className:"h-7 w-7 text-yellow-600"}),
/* @__PURE__ */c.jsx("span",{children:"Your Tasks"})]}),
/* @__PURE__ */c.jsxs("p",{className:"text-gray-600 mt-1",children:[S.length," task",1!==S.length?"s":""," available",r.category&&" in "+r.category,r.difficulty&&" • "+(null==(e=xe[r.difficulty])?void 0:e.label)]})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 mt-4 sm:mt-0",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center bg-gray-100 rounded-lg p-1",children:[
/* @__PURE__ */c.jsx("button",{onClick:()=>o("grid"),className:"p-2 rounded transition-colors "+("grid"===i?"bg-white text-blue-600 shadow-sm":"text-gray-500 hover:text-gray-700"),title:"Grid view",children:/* @__PURE__ */c.jsx(Q,{className:"h-4 w-4"})}),
/* @__PURE__ */c.jsx("button",{onClick:()=>o("list"),className:"p-2 rounded transition-colors "+("list"===i?"bg-white text-blue-600 shadow-sm":"text-gray-500 hover:text-gray-700"),title:"List view",children:/* @__PURE__ */c.jsx(F,{className:"h-4 w-4"})})]}),
/* @__PURE__ */c.jsxs("button",{onClick:()=>x(!d),className:"flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors "+(d||Object.values(r).some(e=>e&&20!==e&&0!==e)?"bg-blue-50 border-blue-300 text-blue-700":"bg-white border-gray-300 text-gray-700 hover:bg-gray-50"),children:[
/* @__PURE__ */c.jsx(I,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Filters"})]}),
/* @__PURE__ */c.jsx("button",{onClick:k,disabled:f,className:"p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50",title:"Refresh tasks",children:/* @__PURE__ */c.jsx(M,{className:"h-5 w-5 "+(f?"animate-spin":"")})})]})]}),
/* @__PURE__ */c.jsxs("div",{className:"relative",children:[
/* @__PURE__ */c.jsx(D,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"}),
/* @__PURE__ */c.jsx("input",{type:"text",placeholder:"Search tasks by title, category, or tags...",value:m,onChange:e=>u(e.target.value),className:"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),d&&/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-lg border border-gray-200 p-6 shadow-sm",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"Filter Tasks"}),
/* @__PURE__ */c.jsx("button",{onClick:_,className:"text-sm text-blue-600 hover:text-blue-800 transition-colors",children:"Clear All"})]}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),
/* @__PURE__ */c.jsx("div",{className:"space-y-2",children:Object.entries(me).map(([e,s])=>{const t=s.icon,a=(!0===r.completed?"completed":!1===r.completed?"available":"all")===e;/* @__PURE__ */
return c.jsxs("button",{onClick:()=>N(e),className:"w-full flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors "+(a?"bg-blue-50 border-blue-300 text-blue-700":"bg-white border-gray-300 text-gray-700 hover:bg-gray-50"),children:[
/* @__PURE__ */c.jsx(t,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:s.label})]},e)})})]}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Category"}),
/* @__PURE__ */c.jsxs("select",{value:r.category,onChange:e=>y("category",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */c.jsx("option",{value:"",children:"All Categories"}),(v||ce).map(e=>/* @__PURE__ */c.jsx("option",{value:e,children:e},e))]})]}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Difficulty"}),
/* @__PURE__ */c.jsxs("select",{value:r.difficulty,onChange:e=>y("difficulty",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */c.jsx("option",{value:"",children:"All Levels"}),Object.entries(xe).map(([e,s])=>/* @__PURE__ */c.jsx("option",{value:e,children:s.label},e))]})]})]})]}),(r.category||r.difficulty||null!==r.completed||m)&&/* @__PURE__ */c.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[
/* @__PURE__ */c.jsx("span",{className:"text-sm text-gray-600",children:"Active filters:"}),r.category&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(C,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:r.category}),
/* @__PURE__ */c.jsx("button",{onClick:()=>y("category",""),className:"ml-1 hover:text-blue-600",children:"×"})]}),r.difficulty&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(U,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:null==(s=xe[r.difficulty])?void 0:s.label}),
/* @__PURE__ */c.jsx("button",{onClick:()=>y("difficulty",""),className:"ml-1 hover:text-yellow-600",children:"×"})]}),null!==r.completed&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(K,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:r.completed?"Completed":"Available"}),
/* @__PURE__ */c.jsx("button",{onClick:()=>y("completed",null),className:"ml-1 hover:text-green-600",children:"×"})]}),m&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(D,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsxs("span",{children:['"',m,'"']}),
/* @__PURE__ */c.jsx("button",{onClick:()=>u(""),className:"ml-1 hover:text-purple-600",children:"×"})]})]}),S.length>0?/* @__PURE__ */c.jsx("div",{className:"grid gap-4 "+("grid"===i?"grid-cols-1 md:grid-cols-2 lg:grid-cols-3":"grid-cols-1"),children:S.map(e=>/* @__PURE__ */c.jsx(de,{task:e,viewMode:i},e.id))}):/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-lg p-8 shadow-sm text-center",children:[
/* @__PURE__ */c.jsx(n,{className:"h-16 w-16 text-gray-300 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:m||Object.values(r).some(e=>e&&20!==e&&0!==e)?"No tasks match your criteria":"No tasks available"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-4",children:m||Object.values(r).some(e=>e&&20!==e&&0!==e)?"Try adjusting your filters or search terms.":"Check back later for new tasks!"}),(m||Object.values(r).some(e=>e&&20!==e&&0!==e))&&/* @__PURE__ */c.jsx("button",{onClick:_,className:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Clear Filters"})]}),f&&h&&/* @__PURE__ */c.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50",children:/* @__PURE__ */c.jsx("div",{className:"bg-white rounded-lg p-6 shadow-xl",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-700",children:"Updating tasks..."})]})})})]})}const pe=/* @__PURE__ */Object.freeze(/* @__PURE__ */Object.defineProperty({__proto__:null,default:he},Symbol.toStringTag,{value:"Module"})),be={quiz:{icon:R,iconSolid:R,color:"text-blue-600",bgColor:"bg-blue-50",borderColor:"border-blue-500",label:"Quiz"},upload:{icon:E,iconSolid:E,color:"text-green-600",bgColor:"bg-green-50",borderColor:"border-green-500",label:"Upload"},social_share:{icon:L,iconSolid:L,color:"text-purple-600",bgColor:"bg-purple-50",borderColor:"border-purple-500",label:"Social Share"},survey:{icon:j,iconSolid:j,color:"text-indigo-600",bgColor:"bg-indigo-50",borderColor:"border-indigo-500",label:"Survey"},challenge:{icon:n,iconSolid:A,color:"text-yellow-600",bgColor:"bg-yellow-50",borderColor:"border-yellow-500",label:"Challenge"},report:{icon:j,iconSolid:j,color:"text-gray-600",bgColor:"bg-gray-50",borderColor:"border-gray-500",label:"Report"}},ge={beginner:{label:"Beginner",color:"text-green-600",bgColor:"bg-green-100",icon:"🌱"},intermediate:{label:"Intermediate",color:"text-yellow-600",bgColor:"bg-yellow-100",icon:"⚡"},advanced:{label:"Advanced",color:"text-orange-600",bgColor:"bg-orange-100",icon:"🔥"},expert:{label:"Expert",color:"text-red-600",bgColor:"bg-red-100",icon:"💎"}},je=async({taskId:e,payload:s})=>{const{data:t}=await se.post(`/api/tasks/${e}/submit`,s);return t},fe=/* @__PURE__ */Object.freeze(/* @__PURE__ */Object.defineProperty({__proto__:null,default:function(){var s;const{id:r}=O(),l=e(),n=k(),[o,m]=t.useState(""),[u,h]=t.useState(""),[p,b]=t.useState(null),[f,v]=t.useState(""),[y]=t.useState(Date.now()),{data:N,isLoading:A,isError:Q,error:F}=a({queryKey:["task",r],queryFn:()=>(async e=>{const{data:s}=await se.get("/api/tasks/"+e);return s})(r),staleTime:3e5,retry:(e,s)=>{var t;return 404!==(null==(t=null==s?void 0:s.response)?void 0:t.status)&&3>e},onError:e=>{var s,t;404===(null==(s=null==e?void 0:e.response)?void 0:s.status)?w.error("Task not found"):403===(null==(t=null==e?void 0:e.response)?void 0:t.status)&&w.error("You do not have permission to view this task")}}),{mutate:I,isPending:M}=_({mutationFn:je,onSuccess:e=>{const s=e.message||"Task submitted successfully!";w.success(s),e.auto_approved&&e.xp_earned&&w.success(`🎉 +${e.xp_earned} XP earned!`,{duration:4e3,icon:"✨"}),e.level_up&&w.success("🎊 Level up! Congratulations!",{duration:5e3,icon:"🆙"}),e.badges_unlocked&&e.badges_unlocked.length>0&&e.badges_unlocked.forEach(e=>{w.success(`🏆 Badge unlocked: ${e}!`,{duration:4e3,icon:"🎖️"})}),n.invalidateQueries({queryKey:["tasks"]}),n.invalidateQueries({queryKey:["task",r]}),n.invalidateQueries({queryKey:["user_profile"]}),n.invalidateQueries({queryKey:["user_badges"]}),n.invalidateQueries({queryKey:["userDashboard"]}),l("/tasks")},onError:e=>{var s,t,a,r,l,n,i;let o="Submission failed. Please try again.";(null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)?o=e.response.data.detail:(null==(r=null==(a=e.response)?void 0:a.data)?void 0:r.message)?o=e.response.data.message:400===(null==(l=e.response)?void 0:l.status)?o="Invalid submission. Please check your response and try again.":403===(null==(n=e.response)?void 0:n.status)?o="You do not have permission to submit this task.":429===(null==(i=e.response)?void 0:i.status)&&(o="Too many attempts. Please wait before trying again."),w.error(o)}}),D=()=>"approved"===(null==N?void 0:N.user_submission_status),B=()=>"pending"===(null==N?void 0:N.user_submission_status),K=()=>"declined"===(null==N?void 0:N.user_submission_status)||"rejected"===(null==N?void 0:N.user_submission_status),U=()=>!D()&&!B()&&((null==N?void 0:N.user_attempts_used)||0)<((null==N?void 0:N.max_attempts)||3);if(A)/* @__PURE__ */
return c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsx("div",{className:"animate-pulse space-y-6",children:/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl p-6 space-y-4",children:[
/* @__PURE__ */c.jsx("div",{className:"h-8 bg-gray-300 rounded w-1/3"}),
/* @__PURE__ */c.jsx("div",{className:"h-64 bg-gray-300 rounded"}),
/* @__PURE__ */c.jsx("div",{className:"h-32 bg-gray-300 rounded"})]})})})});if(Q)/* @__PURE__ */
return c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsx("div",{className:"text-center py-12",children:/* @__PURE__ */c.jsxs("div",{className:"bg-red-50 border border-red-200 rounded-lg p-8",children:[
/* @__PURE__ */c.jsx($,{className:"h-12 w-12 text-red-600 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-red-900 mb-2",children:"Error Loading Task"}),
/* @__PURE__ */c.jsx("p",{className:"text-red-800 mb-4",children:404===(null==(s=null==F?void 0:F.response)?void 0:s.status)?"Task not found. It may have been removed or you may not have access to it.":(null==F?void 0:F.message)||"Failed to load the task. Please try again."}),
/* @__PURE__ */c.jsxs("div",{className:"space-x-4",children:[
/* @__PURE__ */c.jsx("button",{onClick:()=>window.location.reload(),className:"inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors",children:"Try Again"}),
/* @__PURE__ */c.jsxs(x,{to:"/tasks",className:"inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",children:[
/* @__PURE__ */c.jsx(Y,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Back to Tasks"})]})]})]})})})});if(!N)/* @__PURE__ */
return c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */c.jsx("p",{className:"text-gray-500 mb-4",children:"Task not found."}),
/* @__PURE__ */c.jsxs(x,{to:"/tasks",className:"inline-flex items-center space-x-2 font-medium text-blue-600 hover:text-blue-500 transition-colors",children:[
/* @__PURE__ */c.jsx(Y,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Back to Tasks"})]})]})})});const W=be[null==N?void 0:N.type]||be.challenge,X=ge[null==N?void 0:N.difficulty]||ge.beginner,V=W.icon;/* @__PURE__ */
return c.jsx(le,{children:/* @__PURE__ */c.jsxs("div",{className:"max-w-4xl mx-auto",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",children:[
/* @__PURE__ */c.jsx("div",{className:"bg-gray-50 px-6 py-4 border-b border-gray-200",children:/* @__PURE__ */c.jsxs(x,{to:"/tasks",className:"inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors",children:[
/* @__PURE__ */c.jsx(Y,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Back to Tasks"})]})}),
/* @__PURE__ */c.jsxs("div",{className:"p-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start justify-between mb-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start space-x-4 flex-1",children:[
/* @__PURE__ */c.jsx("div",{className:"p-3 rounded-xl "+W.bgColor,children:/* @__PURE__ */c.jsx(V,{className:"h-8 w-8 "+W.color})}),
/* @__PURE__ */c.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */c.jsx("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:N.title}),
/* @__PURE__ */c.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[
/* @__PURE__ */c.jsx("span",{className:`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${W.bgColor} ${W.color}`,children:W.label}),
/* @__PURE__ */c.jsxs("span",{className:`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${X.bgColor} ${X.color}`,children:[
/* @__PURE__ */c.jsx("span",{className:"mr-1",children:X.icon}),X.label]}),
/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium",children:[
/* @__PURE__ */c.jsx(C,{className:"h-4 w-4 mr-1"}),N.category]}),N.is_featured&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium",children:[
/* @__PURE__ */c.jsx(S,{className:"h-4 w-4 mr-1"}),"Featured"]})]})]})]}),D()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium",children:[
/* @__PURE__ */c.jsx(P,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Completed"})]}):B()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium",children:[
/* @__PURE__ */c.jsx(T,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Pending Review"})]}):K()?/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium",children:[
/* @__PURE__ */c.jsx($,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Needs Revision"})]}):null]}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-blue-50 p-4 rounded-lg",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-blue-600 mb-1",children:[
/* @__PURE__ */c.jsx(q,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"XP Reward"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-blue-700",children:N.xp_reward})]}),N.essence_reward>0&&/* @__PURE__ */c.jsxs("div",{className:"bg-purple-50 p-4 rounded-lg",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-purple-600 mb-1",children:[
/* @__PURE__ */c.jsx(d,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Essence"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-purple-700",children:N.essence_reward})]}),N.time_limit_minutes&&/* @__PURE__ */c.jsxs("div",{className:"bg-orange-50 p-4 rounded-lg",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-orange-600 mb-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Time Limit"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-lg font-bold text-orange-700",children:(e=>{if(!e)return null;if(60>e)return e+"m";const s=Math.floor(e/60),t=e%60;return t>0?`${s}h ${t}m`:s+"h"})(N.time_limit_minutes)})]}),
/* @__PURE__ */c.jsxs("div",{className:"bg-gray-50 p-4 rounded-lg",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-gray-600 mb-1",children:[
/* @__PURE__ */c.jsx(z,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Attempts"})]}),
/* @__PURE__ */c.jsxs("p",{className:"text-lg font-bold text-gray-700",children:[N.user_attempts_used||0,"/",N.max_attempts]})]})]}),N.tags&&N.tags.length>0&&/* @__PURE__ */c.jsx("div",{className:"flex flex-wrap gap-2 mb-6",children:N.tags.map((e,s)=>/* @__PURE__ */c.jsxs("span",{className:"px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm",children:["#",e]},s))})]})]}),
/* @__PURE__ */c.jsxs("div",{className:"mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6",children:[
/* @__PURE__ */c.jsxs("h2",{className:"text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(j,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Instructions"})]}),
/* @__PURE__ */c.jsx("div",{className:"prose max-w-none",children:/* @__PURE__ */c.jsx("p",{className:"text-gray-700 leading-relaxed whitespace-pre-wrap",children:N.instructions})})]}),U()&&/* @__PURE__ */c.jsxs("div",{className:"mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6",children:[
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-4",children:"Your Submission"}),
/* @__PURE__ */c.jsxs("form",{onSubmit:e=>{if(e.preventDefault(),!(()=>{if("quiz"===N.type){if(!(null==u?void 0:u.trim()))return w.error("Please select an answer."),!1}else if("upload"===N.type){if(!p&&!(null==o?void 0:o.trim()))return w.error("Please upload a file or provide a text response."),!1}else if("social_share"===N.type){if(!(null==f?void 0:f.trim()))return w.error("Please provide the social media post URL."),!1;try{new URL(f)}catch{return w.error("Please provide a valid URL."),!1}}else if(!(null==o?void 0:o.trim())||10>o.trim().length)return w.error("Please provide a response of at least 10 characters."),!1;return!0})())return;let s={response:"Completed",time_spent_minutes:Math.round((Date.now()-y)/6e4),attachments:[]};"quiz"===N.type?s.response=u.trim():"upload"===N.type?(s.response=o.trim()||"File uploaded",p&&(s.attachments=[p.name])):"social_share"===N.type?s.response=f.trim():s.response=o.trim(),I({taskId:r,payload:s})},children:[(()=>{var e;if(!N||D())return null;switch(N.type){case"quiz":if(!N.quiz_question)return null;const s=Array.isArray(N.quiz_question.options)?N.quiz_question.options:(null==(e=N.quiz_question.options)?void 0:e.choices)||[];/* @__PURE__ */
return c.jsxs("div",{className:"mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(R,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Quiz Question"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-800 mb-4 font-medium",children:N.quiz_question.question||"Quiz Question"}),
/* @__PURE__ */c.jsx("div",{className:"space-y-3",children:s.map((e,s)=>/* @__PURE__ */c.jsxs("label",{className:"flex items-center p-4 bg-white rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors",children:[
/* @__PURE__ */c.jsx("input",{type:"radio",name:"quiz-"+N.id,value:"string"==typeof e?e:e.text,checked:u===("string"==typeof e?e:e.text),onChange:e=>h(e.target.value),className:"h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"}),
/* @__PURE__ */c.jsx("span",{className:"ml-3 text-gray-700",children:"string"==typeof e?e:e.text})]},s))})]});case"upload":/* @__PURE__ */
return c.jsxs("div",{className:"mt-6 space-y-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"p-6 bg-green-50 rounded-xl border border-green-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(E,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"File Upload"})]}),
/* @__PURE__ */c.jsx("input",{type:"file",onChange:e=>{var s;return b((null==(s=e.target.files)?void 0:s[0])||null)},className:"block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition-colors",accept:"image/*,video/*,.pdf,.doc,.docx"}),p&&/* @__PURE__ */c.jsxs("p",{className:"mt-2 text-sm text-green-700",children:["Selected: ",p.name]})]}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Additional Comments (Optional)"}),
/* @__PURE__ */c.jsx("textarea",{value:o,onChange:e=>m(e.target.value),rows:4,className:"w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",placeholder:"Describe your work or provide additional details..."})]})]});case"social_share":/* @__PURE__ */
return c.jsxs("div",{className:"mt-6 p-6 bg-purple-50 rounded-xl border border-purple-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(L,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Social Media Share"})]}),
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Post URL"}),
/* @__PURE__ */c.jsx("input",{type:"url",value:f,onChange:e=>v(e.target.value),className:"w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",placeholder:"https://twitter.com/yourpost or https://linkedin.com/posts/..."}),
/* @__PURE__ */c.jsx("p",{className:"mt-2 text-xs text-gray-600",children:"Share this task on social media and paste the link here"})]});default:/* @__PURE__ */
return c.jsxs("div",{className:"mt-6",children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Your Response"}),
/* @__PURE__ */c.jsx("textarea",{value:o,onChange:e=>m(e.target.value),rows:6,className:"w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Share your thoughts, experience, or solution..."}),
/* @__PURE__ */c.jsxs("p",{className:"text-xs text-gray-500 mt-2",children:["Minimum 10 characters required • ",o.length," characters"]})]})}})(),
/* @__PURE__ */c.jsx("div",{className:"mt-6 pt-6 border-t border-gray-200",children:/* @__PURE__ */c.jsx("button",{type:"submit",disabled:M||!U(),className:"w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95",children:M?/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */c.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-white"}),
/* @__PURE__ */c.jsx("span",{children:"Submitting..."})]}):"Submit Task"})})]})]}),D()&&/* @__PURE__ */c.jsx("div",{className:"mt-6 bg-green-50 border border-green-200 rounded-xl p-6",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx(P,{className:"h-8 w-8 text-green-600"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-green-900",children:"Task Completed!"}),
/* @__PURE__ */c.jsxs("p",{className:"text-green-700",children:["Great job! You've successfully completed this task and earned ",N.xp_reward," XP."]})]})]})}),B()&&/* @__PURE__ */c.jsx("div",{className:"mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx(T,{className:"h-8 w-8 text-yellow-600"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-yellow-900",children:"Under Review"}),
/* @__PURE__ */c.jsx("p",{className:"text-yellow-700",children:"Your submission is being reviewed. You'll be notified once it's approved."})]})]})}),K()&&/* @__PURE__ */c.jsx("div",{className:"mt-6 bg-red-50 border border-red-200 rounded-xl p-6",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx($,{className:"h-8 w-8 text-red-600"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-red-900",children:"Needs Revision"}),
/* @__PURE__ */c.jsx("p",{className:"text-red-700",children:"Your submission needs some changes. Please review the feedback and try again."})]})]})}),(N.completion_count>0||N.success_rate>0||N.average_completion_time)&&/* @__PURE__ */c.jsxs("div",{className:"mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6",children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Task Statistics"}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[N.completion_count>0&&/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(g,{className:"h-8 w-8 text-gray-400 mx-auto mb-2"}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-gray-900",children:N.completion_count}),
/* @__PURE__ */c.jsx("p",{className:"text-sm text-gray-600",children:"Completions"})]}),N.success_rate>0&&/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(i,{className:"h-8 w-8 text-gray-400 mx-auto mb-2"}),
/* @__PURE__ */c.jsxs("p",{className:"text-2xl font-bold text-gray-900",children:[Math.round(N.success_rate),"%"]}),
/* @__PURE__ */c.jsx("p",{className:"text-sm text-gray-600",children:"Success Rate"})]}),N.average_completion_time&&/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(T,{className:"h-8 w-8 text-gray-400 mx-auto mb-2"}),
/* @__PURE__ */c.jsxs("p",{className:"text-2xl font-bold text-gray-900",children:[Math.round(N.average_completion_time),"m"]}),
/* @__PURE__ */c.jsx("p",{className:"text-sm text-gray-600",children:"Avg. Time"})]})]})]})]})})}},Symbol.toStringTag,{value:"Module"})),ve=({status:e,score:s,showScore:t=!1})=>{let a="",r=T;switch(e){case"approved":a="bg-green-100 text-green-800",r=P;break;case"declined":case"rejected":a="bg-red-100 text-red-800",r=G;break;case"flagged":a="bg-orange-100 text-orange-800",r=H;break;default:a="bg-yellow-100 text-yellow-800",r=T}/* @__PURE__ */
return c.jsxs("span",{className:"inline-flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full "+a,children:[
/* @__PURE__ */c.jsx(r,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:e.toUpperCase()}),t&&s&&/* @__PURE__ */c.jsxs("span",{className:"ml-1 font-bold",children:["(",s,"/100)"]})]})},ye=/* @__PURE__ */Object.freeze(/* @__PURE__ */Object.defineProperty({__proto__:null,default:function(){const[e,s]=t.useState({status:"",limit:20,offset:0}),[r,l]=t.useState(""),[o,m]=t.useState(!1),{data:u,isLoading:h,isError:p,error:b,refetch:g,isFetching:f}=a({queryKey:["submissions",e],queryFn:()=>(async e=>{const s=new URLSearchParams;e.status&&s.append("status",e.status),e.limit&&s.append("limit",e.limit),e.offset&&s.append("offset",e.offset);const{data:t}=await se.get("/tasks/my-submissions?"+s.toString());return t})(e),staleTime:3e5}),v=t.useCallback((e,t)=>{s(s=>({...s,[e]:t,offset:0}))},[]),y=t.useCallback(()=>{g()},[g]),N=t.useCallback(()=>{s({status:"",limit:20,offset:0}),l("")},[]),w=(null==u?void 0:u.filter(e=>!r||e.task_title.toLowerCase().includes(r.toLowerCase())||e.response.toLowerCase().includes(r.toLowerCase())))||[],k=e=>{const s=/* @__PURE__ */new Date,t=new Date(e),a=Math.floor((s-t)/1e3);return 60>a?"Just now":3600>a?Math.floor(a/60)+"m ago":86400>a?Math.floor(a/3600)+"h ago":604800>a?Math.floor(a/86400)+"d ago":t.toLocaleDateString()},_=()=>/* @__PURE__ */c.jsx("div",{className:"space-y-4",children:[1,2,3,4,5].map(e=>/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl p-6 shadow-sm animate-pulse",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex justify-between items-start mb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */c.jsx("div",{className:"h-5 bg-gray-300 rounded w-3/4 mb-2"}),
/* @__PURE__ */c.jsx("div",{className:"h-4 bg-gray-300 rounded w-1/2"})]}),
/* @__PURE__ */c.jsx("div",{className:"h-6 w-20 bg-gray-300 rounded-full"})]}),
/* @__PURE__ */c.jsx("div",{className:"h-16 bg-gray-300 rounded"})]},e))}),P=u?u.reduce((e,s)=>(e.total++,e[s.status]=(e[s.status]||0)+1,e),{total:0,approved:0,pending:0,declined:0}):{total:0,approved:0,pending:0,declined:0};/* @__PURE__ */
return c.jsx(le,{children:/* @__PURE__ */c.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsxs("h1",{className:"text-3xl font-bold text-gray-900 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(j,{className:"h-8 w-8 text-blue-600"}),
/* @__PURE__ */c.jsx("span",{children:"My Submissions"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mt-1",children:"Track your task submissions and progress"})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 mt-4 sm:mt-0",children:[
/* @__PURE__ */c.jsxs("button",{onClick:()=>m(!o),className:"flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors "+(o||e.status?"bg-blue-50 border-blue-300 text-blue-700":"bg-white border-gray-300 text-gray-700 hover:bg-gray-50"),children:[
/* @__PURE__ */c.jsx(I,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Filters"})]}),
/* @__PURE__ */c.jsx("button",{onClick:y,disabled:f,className:"p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50",title:"Refresh submissions",children:/* @__PURE__ */c.jsx(M,{className:"h-5 w-5 "+(f?"animate-spin":"")})})]})]}),P.total>0&&/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg shadow-sm border border-gray-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-gray-600 mb-1",children:[
/* @__PURE__ */c.jsx(i,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Total"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-gray-900",children:P.total})]}),
/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg shadow-sm border border-gray-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-green-600 mb-1",children:[
/* @__PURE__ */c.jsx(K,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Approved"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-green-700",children:P.approved||0})]}),
/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg shadow-sm border border-gray-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-yellow-600 mb-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Pending"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-yellow-700",children:P.pending||0})]}),
/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg shadow-sm border border-gray-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-red-600 mb-1",children:[
/* @__PURE__ */c.jsx(W,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{className:"text-sm font-medium",children:"Declined"})]}),
/* @__PURE__ */c.jsx("p",{className:"text-2xl font-bold text-red-700",children:P.declined||0})]})]}),
/* @__PURE__ */c.jsxs("div",{className:"relative",children:[
/* @__PURE__ */c.jsx(D,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"}),
/* @__PURE__ */c.jsx("input",{type:"text",placeholder:"Search submissions by task title or response...",value:r,onChange:e=>l(e.target.value),className:"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),o&&/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-lg border border-gray-200 p-6 shadow-sm",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"Filter Submissions"}),
/* @__PURE__ */c.jsx("button",{onClick:N,className:"text-sm text-blue-600 hover:text-blue-800 transition-colors",children:"Clear All"})]}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),
/* @__PURE__ */c.jsxs("select",{value:e.status,onChange:e=>v("status",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */c.jsx("option",{value:"",children:"All Statuses"}),
/* @__PURE__ */c.jsx("option",{value:"pending",children:"Pending"}),
/* @__PURE__ */c.jsx("option",{value:"approved",children:"Approved"}),
/* @__PURE__ */c.jsx("option",{value:"declined",children:"Declined"}),
/* @__PURE__ */c.jsx("option",{value:"flagged",children:"Flagged"})]})]}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Show"}),
/* @__PURE__ */c.jsxs("select",{value:e.limit,onChange:e=>v("limit",parseInt(e.target.value)),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */c.jsx("option",{value:10,children:"10 submissions"}),
/* @__PURE__ */c.jsx("option",{value:20,children:"20 submissions"}),
/* @__PURE__ */c.jsx("option",{value:50,children:"50 submissions"}),
/* @__PURE__ */c.jsx("option",{value:100,children:"100 submissions"})]})]})]})]}),(e.status||r)&&/* @__PURE__ */c.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[
/* @__PURE__ */c.jsx("span",{className:"text-sm text-gray-600",children:"Active filters:"}),e.status&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(C,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsx("span",{children:e.status}),
/* @__PURE__ */c.jsx("button",{onClick:()=>v("status",""),className:"ml-1 hover:text-blue-600",children:"×"})]}),r&&/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full",children:[
/* @__PURE__ */c.jsx(D,{className:"h-3 w-3"}),
/* @__PURE__ */c.jsxs("span",{children:['"',r,'"']}),
/* @__PURE__ */c.jsx("button",{onClick:()=>l(""),className:"ml-1 hover:text-purple-600",children:"×"})]})]}),h&&!u?/* @__PURE__ */c.jsx(_,{}):p?/* @__PURE__ */c.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-6",children:/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(W,{className:"h-12 w-12 text-red-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("p",{className:"text-red-800 mb-4",children:(null==b?void 0:b.message)||"Failed to fetch submission history."}),
/* @__PURE__ */c.jsx("button",{onClick:y,className:"bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Try Again"})]})}):w&&0!==w.length?/* @__PURE__ */c.jsx("div",{className:"space-y-4",children:w.map(e=>/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"p-6 pb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex justify-between items-start mb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-bold text-gray-900",children:e.task_title}),
/* @__PURE__ */c.jsx(x,{to:"/tasks/"+e.task_id,className:"text-gray-400 hover:text-gray-600 transition-colors",title:"View task details",children:/* @__PURE__ */c.jsx(z,{className:"h-4 w-4"})})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex flex-wrap items-center gap-3 text-sm text-gray-600",children:[
/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(X,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:["Submitted ",k(e.submitted_at)]})]}),e.reviewed_at&&/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(K,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:["Reviewed ",k(e.reviewed_at)]})]}),e.attempt_number>1&&/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(M,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:["Attempt #",e.attempt_number]})]}),e.time_spent_minutes&&/* @__PURE__ */c.jsxs("span",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:[e.time_spent_minutes,"min"]})]})]})]}),
/* @__PURE__ */c.jsx(ve,{status:e.status,score:e.score,showScore:null!==e.score})]}),(e.xp_awarded>0||e.essence_awarded>0)&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4 mb-4 p-3 bg-green-50 rounded-lg border border-green-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-green-800",children:[
/* @__PURE__ */c.jsx(n,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{className:"font-medium",children:"Rewards Earned:"})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4",children:[e.xp_awarded>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-yellow-700",children:[
/* @__PURE__ */c.jsx(q,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:[e.xp_awarded," XP"]})]}),e.essence_awarded>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-purple-700",children:[
/* @__PURE__ */c.jsx(d,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:[e.essence_awarded," Essence"]})]})]})]}),e.response&&/* @__PURE__ */c.jsxs("div",{className:"mb-4",children:[
/* @__PURE__ */c.jsxs("h4",{className:"text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(V,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Your Response:"})]}),
/* @__PURE__ */c.jsx("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-4",children:/* @__PURE__ */c.jsx("p",{className:"text-gray-700 text-sm whitespace-pre-wrap leading-relaxed",children:e.response})})]}),e.attachments&&e.attachments.length>0&&/* @__PURE__ */c.jsxs("div",{className:"mb-4",children:[
/* @__PURE__ */c.jsx("h4",{className:"text-sm font-medium text-gray-700 mb-2",children:"Attachments:"}),
/* @__PURE__ */c.jsx("div",{className:"flex flex-wrap gap-2",children:e.attachments.map((e,s)=>/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs",children:[
/* @__PURE__ */c.jsx(j,{className:"h-3 w-3 mr-1"}),e]},s))})]}),e.feedback&&/* @__PURE__ */c.jsxs("div",{className:"mb-4",children:[
/* @__PURE__ */c.jsx("h4",{className:"text-sm font-medium text-gray-700 mb-2",children:"Admin Feedback:"}),
/* @__PURE__ */c.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:/* @__PURE__ */c.jsx("p",{className:"text-blue-800 text-sm leading-relaxed",children:e.feedback})})]})]}),null!==e.score&&/* @__PURE__ */c.jsx("div",{className:"px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */c.jsx("span",{className:"text-sm text-gray-600",children:"Score:"}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */c.jsx(S,{className:"h-4 w-4 text-yellow-500"}),
/* @__PURE__ */c.jsxs("span",{className:"font-bold text-gray-900",children:[e.score,"/100"]})]}),e.score>=90&&/* @__PURE__ */c.jsx("span",{className:"text-xs text-green-600 font-medium",children:"Excellent!"}),e.score>=70&&90>e.score&&/* @__PURE__ */c.jsx("span",{className:"text-xs text-blue-600 font-medium",children:"Good work"}),70>e.score&&/* @__PURE__ */c.jsx("span",{className:"text-xs text-orange-600 font-medium",children:"Needs improvement"})]})]})})]},e.id))}):/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-lg p-8 shadow-sm text-center",children:[
/* @__PURE__ */c.jsx(j,{className:"h-16 w-16 text-gray-300 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:r||e.status?"No submissions match your criteria":"No submissions yet"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-4",children:r||e.status?"Try adjusting your filters or search terms.":"Start completing tasks to see your submission history here."}),r||e.status?/* @__PURE__ */c.jsx("button",{onClick:N,className:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Clear Filters"}):/* @__PURE__ */c.jsx(x,{to:"/tasks",className:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block",children:"Browse Tasks"})]}),f&&u&&/* @__PURE__ */c.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50",children:/* @__PURE__ */c.jsx("div",{className:"bg-white rounded-lg p-6 shadow-xl",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-700",children:"Updating submissions..."})]})})})]})})}},Symbol.toStringTag,{value:"Module"}));function Ne({question:e,onAnswerSelect:s,onNext:a,disabled:r=!1,isSubmitting:l=!1,showExplanation:n=!0,timeLimit:i=null,questionNumber:o=1,totalQuestions:x=1}){const[m,u]=t.useState(null),[h,p]=t.useState(!1),[b,g]=t.useState(!1),[j,f]=t.useState(0),[v]=t.useState(Date.now());t.useEffect(()=>{if(h||r)return;const e=setInterval(()=>{f(Date.now()-v)},1e3);return()=>clearInterval(e)},[h,r,v]),t.useEffect(()=>{!i||1e3*i>j||h||y(!0)},[j,i,h]);const y=(t=!1)=>{var a;if(!m&&!t)return void w.error("Please select an answer before submitting.",{icon:"⚠️",duration:3e3});t&&!m&&w.error("Time's up! No answer selected.",{icon:"⏰",duration:4e3});const r=m===e.correct_answer||e.options&&m===(null==(a=e.options.find(e=>e.is_correct))?void 0:a.text);s(m||"",r),p(!0),r?w.success("Correct! Well done! 🎉",{duration:3e3,icon:"✅"}):w.error("Not quite right. Keep learning! 💪",{duration:3e3,icon:"❌"})},N=s=>{var t;const a="relative block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02]";if(r&&!h)return a+" opacity-50 cursor-not-allowed bg-gray-50 border-gray-200";if(h){const r=s===e.correct_answer||e.options&&(null==(t=e.options.find(e=>e.text===s))?void 0:t.is_correct);return r?a+" bg-green-50 border-green-500 text-green-900 cursor-default shadow-lg":s!==m||r?a+" opacity-60 bg-gray-50 border-gray-300 cursor-default":a+" bg-red-50 border-red-500 text-red-900 cursor-default shadow-lg"}return s===m?a+" bg-blue-50 border-blue-500 text-blue-900 shadow-md ring-2 ring-blue-200":a+" bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"},k=s=>{var t;if(!h)return null;const a=s===e.correct_answer||e.options&&(null==(t=e.options.find(e=>e.text===s))?void 0:t.is_correct),r=s===m;return a?/* @__PURE__ */c.jsx(P,{className:"h-6 w-6 text-green-600"}):r&&!a?/* @__PURE__ */c.jsx(G,{className:"h-6 w-6 text-red-600"}):null},_=e.options&&Array.isArray(e.options)?e.options.map(e=>e.text||e):e.choices||[];/* @__PURE__ */
return c.jsxs("div",{className:"max-w-4xl mx-auto",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-start justify-between mb-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx("div",{className:"p-2 bg-blue-100 rounded-lg",children:/* @__PURE__ */c.jsx(R,{className:"h-6 w-6 text-blue-600"})}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-sm font-medium text-gray-600",children:["Question ",o," of ",x]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4 mt-1",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-gray-500 text-sm",children:[
/* @__PURE__ */c.jsx(T,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:["Time: ",(e=>{const s=Math.floor(e/1e3);return`${Math.floor(s/60)}:${(""+s%60).padStart(2,"0")}`})(j)]})]}),i&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-1 text-orange-600 text-sm",children:[
/* @__PURE__ */c.jsx($,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsxs("span",{children:["Limit: ",i,"s"]})]})]})]})]}),e.hint&&!h&&/* @__PURE__ */c.jsxs("button",{onClick:()=>g(!b),className:"flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm",children:[
/* @__PURE__ */c.jsx(J,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Hint"})]})]}),
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 leading-relaxed",children:e.question||e.text}),b&&e.hint&&/* @__PURE__ */c.jsx("div",{className:"mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-start space-x-2",children:[
/* @__PURE__ */c.jsx(J,{className:"h-5 w-5 text-yellow-600 mt-0.5"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("h4",{className:"font-medium text-yellow-900",children:"Hint:"}),
/* @__PURE__ */c.jsx("p",{className:"text-yellow-800 text-sm mt-1",children:e.hint})]})]})})]}),
/* @__PURE__ */c.jsx("div",{className:"space-y-3 mb-6",children:_.length>0?_.map((s,t)=>/* @__PURE__ */c.jsx("label",{className:N(s),children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */c.jsx("input",{type:"radio",name:"question-"+(e.id||"current"),value:s,checked:s===m,onChange:()=>(e=>{h||r||u(e)})(s),className:"hidden",disabled:h||r}),
/* @__PURE__ */c.jsx("div",{className:"w-4 h-4 rounded-full border-2 transition-colors "+(s===m?"border-blue-500 bg-blue-500":"border-gray-300"),children:s===m&&/* @__PURE__ */c.jsx("div",{className:"w-full h-full rounded-full bg-white scale-50"})}),
/* @__PURE__ */c.jsx("span",{className:"text-gray-900 font-medium",children:s})]}),k(s)]})},t)):
/* @__PURE__ */c.jsxs("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-6 text-center",children:[
/* @__PURE__ */c.jsx("p",{className:"text-gray-600",children:"This question requires a text response."}),
/* @__PURE__ */c.jsx("textarea",{value:m||"",onChange:e=>u(e.target.value),className:"w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",rows:4,placeholder:"Type your answer here...",disabled:h||r})]})}),h&&n&&e.explanation&&/* @__PURE__ */c.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-start space-x-3",children:[
/* @__PURE__ */c.jsx(d,{className:"h-6 w-6 text-blue-600 mt-0.5"}),
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsx("h4",{className:"font-semibold text-blue-900 mb-2",children:"Explanation:"}),
/* @__PURE__ */c.jsx("p",{className:"text-blue-800 leading-relaxed",children:e.explanation})]})]})}),
/* @__PURE__ */c.jsx("div",{className:"flex flex-col sm:flex-row gap-3",children:h?/* @__PURE__ */c.jsx("button",{onClick:a,className:"flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]",children:"Next Question"}):/* @__PURE__ */c.jsx("button",{onClick:()=>y(),disabled:r||l,className:"flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",children:l?/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */c.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-white"}),
/* @__PURE__ */c.jsx("span",{children:"Submitting..."})]}):"Submit Answer"})})]})}const we={excellent:{threshold:90,label:"Excellent!",color:"text-green-600",bgColor:"bg-green-50",borderColor:"border-green-200",icon:A,message:"Outstanding performance! You've mastered this topic.",emoji:"🏆"},good:{threshold:70,label:"Well Done!",color:"text-blue-600",bgColor:"bg-blue-50",borderColor:"border-blue-200",icon:S,message:"Great job! You have a solid understanding.",emoji:"⭐"},fair:{threshold:50,label:"Keep Learning",color:"text-yellow-600",bgColor:"bg-yellow-50",borderColor:"border-yellow-200",icon:U,message:"Good effort! Review the material and try again.",emoji:"📚"},needsWork:{threshold:0,label:"Practice More",color:"text-orange-600",bgColor:"bg-orange-50",borderColor:"border-orange-200",icon:M,message:"Don't give up! Practice makes perfect.",emoji:"💪"}},ke=async({quizId:e,score:s,total:t,percentage:a})=>{const{data:r}=await se.post(`/tasks/quiz/${e}/complete`,{score:s,total_questions:t,percentage:a,time_spent_minutes:5});return r};function _e({score:e,total:s,onRestart:a,onContinue:l,quizId:n=null,taskTitle:o="Quiz",showActions:d=!0}){var x;const h=k(),[p,b]=t.useState(!1),[g,j]=t.useState(null),f=Math.round(e/s*100),{mutate:v,isPending:y}=_({mutationFn:ke,onSuccess:e=>{var s,t;j(e),(e.xp_earned>0||(null==(s=e.badges_unlocked)?void 0:s.length)>0)&&(b(!0),e.xp_earned>0&&w.success(`🎉 +${e.xp_earned} XP earned!`,{duration:4e3,icon:"✨"}),e.level_up&&w.success("🎊 Level up! Congratulations!",{duration:5e3,icon:"🆙"}),(null==(t=e.badges_unlocked)?void 0:t.length)>0&&e.badges_unlocked.forEach(e=>{w.success(`🏆 Badge unlocked: ${e}!`,{duration:4e3,icon:"🎖️"})})),h.invalidateQueries({queryKey:["user_profile"]}),h.invalidateQueries({queryKey:["user_badges"]}),h.invalidateQueries({queryKey:["tasks"]})},onError:e=>{w.error("Failed to save quiz results")}});t.useEffect(()=>{!n||g||y||v({quizId:n,score:e,total:s,percentage:f})},[n,e,s,f,g,y,v]);const N=(()=>{for(const[e,s]of Object.entries(we))if(f>=s.threshold)return{key:e,...s};return{key:"needsWork",...we.needsWork}})(),C=N.icon,q=((e,s)=>({xpEarned:Math.round(10*s*(90>e?70>e?1:1.2:1.5)),essenceEarned:90>e?70>e?50>e?0:1:3:5}))(f,s);/* @__PURE__ */
return c.jsxs("div",{className:"relative max-w-2xl mx-auto",children:[p&&/* @__PURE__ */c.jsxs("div",{className:"absolute inset-0 pointer-events-none",children:[
/* @__PURE__ */c.jsx("div",{className:"absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce",children:/* @__PURE__ */c.jsx("div",{className:"text-6xl",children:"🎉"})}),
/* @__PURE__ */c.jsx("div",{className:"absolute top-4 right-4 animate-pulse",children:/* @__PURE__ */c.jsx("div",{className:"text-4xl",children:"✨"})}),
/* @__PURE__ */c.jsx("div",{className:"absolute top-8 left-4 animate-bounce delay-300",children:/* @__PURE__ */c.jsx("div",{className:"text-4xl",children:"🏆"})})]}),
/* @__PURE__ */c.jsxs("div",{className:`bg-white rounded-2xl shadow-xl border-2 ${N.borderColor} overflow-hidden`,children:[
/* @__PURE__ */c.jsxs("div",{className:`${N.bgColor} px-8 py-6 text-center border-b ${N.borderColor}`,children:[
/* @__PURE__ */c.jsx("div",{className:"flex justify-center mb-4",children:/* @__PURE__ */c.jsx("div",{className:`p-4 rounded-full ${N.bgColor} ring-4 ring-white shadow-lg`,children:/* @__PURE__ */c.jsx(C,{className:"h-12 w-12 "+N.color})})}),
/* @__PURE__ */c.jsxs("h2",{className:"text-3xl font-bold text-gray-900 mb-2",children:["Quiz Complete! ",N.emoji]}),
/* @__PURE__ */c.jsx("div",{className:`inline-flex items-center px-4 py-2 rounded-full ${N.bgColor} ${N.color} font-semibold text-lg`,children:N.label})]}),
/* @__PURE__ */c.jsxs("div",{className:"px-8 py-8 text-center",children:[
/* @__PURE__ */c.jsxs("div",{className:"mb-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"text-8xl font-extrabold text-gray-900 mb-2",children:[f,
/* @__PURE__ */c.jsx("span",{className:"text-4xl text-gray-500",children:"%"})]}),
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2 text-gray-600",children:[
/* @__PURE__ */c.jsx(K,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsxs("span",{className:"text-lg",children:["You scored ",
/* @__PURE__ */c.jsx("strong",{className:"text-gray-900",children:e})," out of"," ",
/* @__PURE__ */c.jsx("strong",{className:"text-gray-900",children:s})," questions correctly"]})]})]}),
/* @__PURE__ */c.jsx("div",{className:`p-4 rounded-lg ${N.bgColor} ${N.borderColor} border`,children:/* @__PURE__ */c.jsx("p",{className:N.color+" font-medium text-lg",children:N.message})}),
/* @__PURE__ */c.jsxs("div",{className:"mt-6 grid grid-cols-3 gap-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx("div",{className:"text-2xl font-bold text-green-600",children:e}),
/* @__PURE__ */c.jsx("div",{className:"text-sm text-gray-500",children:"Correct"})]}),
/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx("div",{className:"text-2xl font-bold text-red-600",children:s-e}),
/* @__PURE__ */c.jsx("div",{className:"text-sm text-gray-500",children:"Incorrect"})]}),
/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx("div",{className:"text-2xl font-bold text-blue-600",children:s}),
/* @__PURE__ */c.jsx("div",{className:"text-sm text-gray-500",children:"Total"})]})]})]}),(g||q.xpEarned>0)&&/* @__PURE__ */c.jsxs("div",{className:"px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center space-x-2",children:[
/* @__PURE__ */c.jsx(A,{className:"h-5 w-5 text-yellow-600"}),
/* @__PURE__ */c.jsx("span",{children:"Rewards Earned"})]}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg border border-yellow-200 text-center",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2 mb-2",children:[
/* @__PURE__ */c.jsx(m,{className:"h-6 w-6 text-yellow-600"}),
/* @__PURE__ */c.jsx("span",{className:"font-semibold text-gray-900",children:"Experience Points"})]}),
/* @__PURE__ */c.jsxs("div",{className:"text-3xl font-bold text-yellow-700",children:["+",(null==g?void 0:g.xp_earned)||q.xpEarned]}),
/* @__PURE__ */c.jsx("div",{className:"text-sm text-gray-600",children:"XP"})]}),((null==g?void 0:g.essence_earned)||q.essenceEarned)>0&&/* @__PURE__ */c.jsxs("div",{className:"bg-white p-4 rounded-lg border border-purple-200 text-center",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2 mb-2",children:[
/* @__PURE__ */c.jsx(u,{className:"h-6 w-6 text-purple-600"}),
/* @__PURE__ */c.jsx("span",{className:"font-semibold text-gray-900",children:"Essence"})]}),
/* @__PURE__ */c.jsxs("div",{className:"text-3xl font-bold text-purple-700",children:["+",(null==g?void 0:g.essence_earned)||q.essenceEarned]}),
/* @__PURE__ */c.jsx("div",{className:"text-sm text-gray-600",children:"Essence"})]})]}),(null==(x=null==g?void 0:g.badges_unlocked)?void 0:x.length)>0&&/* @__PURE__ */c.jsxs("div",{className:"mt-4 p-4 bg-green-50 rounded-lg border border-green-200",children:[
/* @__PURE__ */c.jsxs("h4",{className:"font-semibold text-green-900 mb-2 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(S,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Badges Unlocked!"})]}),
/* @__PURE__ */c.jsx("div",{className:"flex flex-wrap gap-2",children:g.badges_unlocked.map((e,s)=>/* @__PURE__ */c.jsxs("span",{className:"inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium",children:["🏆 ",e]},s))})]}),(null==g?void 0:g.level_up)&&/* @__PURE__ */c.jsxs("div",{className:"mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center",children:[
/* @__PURE__ */c.jsx("div",{className:"text-2xl mb-2",children:"🎊"}),
/* @__PURE__ */c.jsx("h4",{className:"font-bold text-yellow-900 text-lg",children:"Level Up!"}),
/* @__PURE__ */c.jsx("p",{className:"text-yellow-800",children:"Congratulations on reaching a new level!"})]})]}),70>f&&/* @__PURE__ */c.jsxs("div",{className:"px-8 py-6 bg-blue-50 border-t border-blue-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(U,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Tips for Improvement"})]}),
/* @__PURE__ */c.jsxs("ul",{className:"space-y-2 text-blue-800",children:[
/* @__PURE__ */c.jsxs("li",{className:"flex items-start space-x-2",children:[
/* @__PURE__ */c.jsx("span",{children:"•"}),
/* @__PURE__ */c.jsx("span",{children:"Review the material and take your time reading each question"})]}),
/* @__PURE__ */c.jsxs("li",{className:"flex items-start space-x-2",children:[
/* @__PURE__ */c.jsx("span",{children:"•"}),
/* @__PURE__ */c.jsx("span",{children:"Practice with similar quizzes to improve your knowledge"})]}),
/* @__PURE__ */c.jsxs("li",{className:"flex items-start space-x-2",children:[
/* @__PURE__ */c.jsx("span",{children:"•"}),
/* @__PURE__ */c.jsx("span",{children:"Don't hesitate to restart and try again - practice makes perfect!"})]})]})]}),d&&/* @__PURE__ */c.jsx("div",{className:"px-8 py-6 bg-gray-50 border-t border-gray-200",children:/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[
/* @__PURE__ */c.jsxs("button",{onClick:a,className:"flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors",children:[
/* @__PURE__ */c.jsx(M,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Try Again"})]}),l&&/* @__PURE__ */c.jsxs("button",{onClick:l,className:"flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors",children:[
/* @__PURE__ */c.jsx(r,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Continue"})]}),
/* @__PURE__ */c.jsxs("button",{onClick:()=>{const e=`I just scored ${f}% on "${o}" quiz! 🎯`,s=window.location.href;navigator.share?navigator.share({title:"Quiz Results - Impact ID",text:e,url:s}):(navigator.clipboard.writeText(`${e} ${s}`),w.success("Results copied to clipboard!"))},className:"flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors",children:[
/* @__PURE__ */c.jsx(L,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Share"})]})]})})]}),
/* @__PURE__ */c.jsxs("div",{className:"mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200",children:[
/* @__PURE__ */c.jsxs("h3",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */c.jsx(i,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsx("span",{children:"Performance Breakdown"})]}),
/* @__PURE__ */c.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between text-sm",children:[
/* @__PURE__ */c.jsx("span",{children:"Accuracy"}),
/* @__PURE__ */c.jsxs("span",{className:"font-semibold",children:[f,"%"]})]}),
/* @__PURE__ */c.jsx("div",{className:"w-full bg-gray-200 rounded-full h-3",children:/* @__PURE__ */c.jsx("div",{className:"h-3 rounded-full transition-all duration-1000 "+(90>f?70>f?50>f?"bg-orange-500":"bg-yellow-500":"bg-blue-500":"bg-green-500"),style:{width:f+"%"}})}),
/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-4 gap-2 text-xs text-gray-500 mt-2",children:[
/* @__PURE__ */c.jsx("div",{className:"text-center",children:"0%"}),
/* @__PURE__ */c.jsx("div",{className:"text-center",children:"25%"}),
/* @__PURE__ */c.jsx("div",{className:"text-center",children:"50%"}),
/* @__PURE__ */c.jsx("div",{className:"text-center",children:"75%"})]})]})]})]})}const Ce=async({taskId:e,selectedAnswer:s,timeSpent:t})=>{const{data:a}=await se.post(`/api/tasks/${e}/submit`,{response:s,time_spent_minutes:Math.round(t/6e4),attachments:[]});return a},Se=/* @__PURE__ */Object.freeze(/* @__PURE__ */Object.defineProperty({__proto__:null,default:function(){var s,r;const{taskId:l}=O(),n=e(),i=k(),{data:o,isLoading:d,isError:h,error:p}=a({queryKey:["task",l],queryFn:()=>(async e=>{const{data:s}=await se.get("/api/tasks/"+e);return s})(l),staleTime:3e5,retry:(e,s)=>{var t;return 404!==(null==(t=null==s?void 0:s.response)?void 0:t.status)&&3>e},onError:e=>{var s;404===(null==(s=null==e?void 0:e.response)?void 0:s.status)&&w.error("Quiz not found")}}),[b,g]=t.useState(""),[j,f]=t.useState(!1),[v,y]=t.useState(!1),[N,C]=t.useState(null),[S,q]=t.useState(0),[z,P]=t.useState(!1),[L,E]=t.useState(null),[Q,F]=t.useState(!1),{mutate:I,isPending:M}=_({mutationFn:Ce,onSuccess:e=>{var s;const t=e.message||"Quiz submitted successfully!";w.success(t),e.auto_approved&&e.xp_earned&&w.success(`🎉 +${e.xp_earned} XP earned!`,{duration:4e3,icon:"✨"}),e.level_up&&w.success("🎊 Level up! Congratulations!",{duration:5e3,icon:"🆙"}),(null==(s=e.badges_unlocked)?void 0:s.length)>0&&e.badges_unlocked.forEach(e=>{w.success(`🏆 Badge unlocked: ${e}!`,{duration:4e3,icon:"🎖️"})}),i.invalidateQueries({queryKey:["tasks"]}),i.invalidateQueries({queryKey:["task",l]}),i.invalidateQueries({queryKey:["user_profile"]}),i.invalidateQueries({queryKey:["userDashboard"]})},onError:e=>{var s,t,a,r,l;let n="Failed to submit quiz. Please try again.";(null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)?n=e.response.data.detail:(null==(r=null==(a=e.response)?void 0:a.data)?void 0:r.message)?n=e.response.data.message:400===(null==(l=e.response)?void 0:l.status)&&(n="Invalid answer. Please check your selection and try again."),w.error(n)}});t.useEffect(()=>{if(!v||z||j)return;const e=setInterval(()=>{const e=Date.now()-N;if(q(e),null==o?void 0:o.time_limit_minutes){const s=6e4*o.time_limit_minutes-e;E(s),s>0||D()}},1e3);return()=>clearInterval(e)},[v,z,j,N,null==o?void 0:o.time_limit_minutes]);const D=()=>{w.error("Time's up! Quiz submitted automatically."),j||(f(!0),I({taskId:l,selectedAnswer:b||"",timeSpent:6e4*o.time_limit_minutes}))},B=()=>{z?(C(Date.now()-S),P(!1)):P(!0)},U=e=>{const s=Math.floor(e/1e3);return`${Math.floor(s/60)}:${(""+s%60).padStart(2,"0")}`},X="quiz"===(null==o?void 0:o.type),V=null==(s=null==o?void 0:o.quiz_question)?void 0:s.question,H=o&&(o.user_attempts_used||0)<(o.max_attempts||3),G="approved"===(null==o?void 0:o.user_submission_status);return d?/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsx("div",{className:"animate-pulse space-y-6",children:/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl p-6 space-y-4",children:[
/* @__PURE__ */c.jsx("div",{className:"h-8 bg-gray-300 rounded w-1/3"}),
/* @__PURE__ */c.jsx("div",{className:"h-64 bg-gray-300 rounded"}),
/* @__PURE__ */c.jsx("div",{className:"h-32 bg-gray-300 rounded"})]})})})}):h?/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsx("div",{className:"text-center py-12",children:/* @__PURE__ */c.jsxs("div",{className:"bg-red-50 border border-red-200 rounded-lg p-8",children:[
/* @__PURE__ */c.jsx(W,{className:"h-16 w-16 text-red-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-red-900 mb-2",children:"Error Loading Quiz"}),
/* @__PURE__ */c.jsx("p",{className:"text-red-800 mb-4",children:404===(null==(r=null==p?void 0:p.response)?void 0:r.status)?"Quiz not found. It may have been removed or you may not have access to it.":(null==p?void 0:p.message)||"Failed to load the quiz. Please try again."}),
/* @__PURE__ */c.jsxs("div",{className:"space-x-4",children:[
/* @__PURE__ */c.jsx("button",{onClick:()=>window.location.reload(),className:"inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors",children:"Try Again"}),
/* @__PURE__ */c.jsxs(x,{to:"/tasks",className:"inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",children:[
/* @__PURE__ */c.jsx(Y,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Back to Tasks"})]})]})]})})})}):X?V?G?/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */c.jsx(K,{className:"h-16 w-16 text-green-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-2",children:"Quiz Already Completed"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-6",children:"You have already successfully completed this quiz."}),
/* @__PURE__ */c.jsxs("div",{className:"space-x-4",children:[
/* @__PURE__ */c.jsx(x,{to:"/tasks",className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",children:"Browse More Tasks"}),
/* @__PURE__ */c.jsx(x,{to:"/my-submissions",className:"bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors",children:"View Submissions"})]})]})})}):H?/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsxs("div",{className:"max-w-4xl mx-auto",children:[
/* @__PURE__ */c.jsxs("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6",children:[
/* @__PURE__ */c.jsx("div",{className:"bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */c.jsxs("div",{children:[
/* @__PURE__ */c.jsxs(x,{to:"/tasks",className:"inline-flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4",children:[
/* @__PURE__ */c.jsx(Y,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Back to Tasks"})]}),
/* @__PURE__ */c.jsx("h1",{className:"text-3xl font-bold mb-2",children:o.title}),
/* @__PURE__ */c.jsx("p",{className:"text-blue-100",children:o.instructions})]}),
/* @__PURE__ */c.jsx("div",{className:"text-right",children:/* @__PURE__ */c.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4",children:[
/* @__PURE__ */c.jsx(R,{className:"h-8 w-8 mx-auto mb-2"}),
/* @__PURE__ */c.jsx("div",{className:"text-sm font-medium",children:"Quiz Challenge"})]})})]})}),
/* @__PURE__ */c.jsx("div",{className:"p-6 bg-gray-50 border-b border-gray-200",children:/* @__PURE__ */c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(m,{className:"h-6 w-6 text-yellow-600 mx-auto mb-1"}),
/* @__PURE__ */c.jsx("div",{className:"text-lg font-bold text-gray-900",children:o.xp_reward}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-gray-600",children:"XP Reward"})]}),o.essence_reward>0&&/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(u,{className:"h-6 w-6 text-purple-600 mx-auto mb-1"}),
/* @__PURE__ */c.jsx("div",{className:"text-lg font-bold text-gray-900",children:o.essence_reward}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-gray-600",children:"Essence"})]}),o.time_limit_minutes&&/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(T,{className:"h-6 w-6 text-orange-600 mx-auto mb-1"}),
/* @__PURE__ */c.jsxs("div",{className:"text-lg font-bold text-gray-900",children:[o.time_limit_minutes,"m"]}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-gray-600",children:"Time Limit"})]}),
/* @__PURE__ */c.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */c.jsx(A,{className:"h-6 w-6 text-green-600 mx-auto mb-1"}),
/* @__PURE__ */c.jsxs("div",{className:"text-lg font-bold text-gray-900",children:[(o.user_attempts_used||0)+1,"/",o.max_attempts]}),
/* @__PURE__ */c.jsx("div",{className:"text-xs text-gray-600",children:"Attempt"})]})]})})]}),
/* @__PURE__ */c.jsx("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative",children:v?j?
/* @__PURE__ */c.jsx("div",{className:"p-6",children:/* @__PURE__ */c.jsx(_e,{score:Q?1:0,total:1,onRestart:H?()=>{g(""),F(!1),f(!1),y(!1),C(null),q(0),E(null),P(!1)}:null,onContinue:()=>n("/tasks"),quizId:l,taskTitle:o.title,showActions:!M})}):
/* @__PURE__ */c.jsxs("div",{className:"p-6",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-4",children:[
/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-gray-600",children:[
/* @__PURE__ */c.jsx(T,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:["Time: ",U(S)]})]}),L&&L>0&&/* @__PURE__ */c.jsxs("div",{className:"flex items-center space-x-2 text-orange-600",children:[
/* @__PURE__ */c.jsx($,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:["Remaining: ",U(L)]})]})]}),
/* @__PURE__ */c.jsx("button",{onClick:B,className:"flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",children:z?/* @__PURE__ */c.jsxs(c.Fragment,{children:[
/* @__PURE__ */c.jsx(Z,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Resume"})]}):/* @__PURE__ */c.jsxs(c.Fragment,{children:[
/* @__PURE__ */c.jsx(ee,{className:"h-4 w-4"}),
/* @__PURE__ */c.jsx("span",{children:"Pause"})]})})]}),z&&/* @__PURE__ */c.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-xl",children:/* @__PURE__ */c.jsxs("div",{className:"bg-white p-8 rounded-lg text-center",children:[
/* @__PURE__ */c.jsx(ee,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Quiz Paused"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-4",children:"Click Resume to continue"}),
/* @__PURE__ */c.jsx("button",{onClick:B,className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",children:"Resume"})]})}),
/* @__PURE__ */c.jsx(Ne,{question:o.quiz_question,onAnswerSelect:(e,s)=>{g(e),F(s)},onNext:()=>{(null==b?void 0:b.trim())?(f(!0),I({taskId:l,selectedAnswer:b.trim(),timeSpent:S})):w.error("Please select an answer before submitting.")},disabled:z||M,isSubmitting:M,selectedAnswer:b,showSubmitButton:!0,submitButtonText:M?"Submitting...":"Submit Answer"})]}):
/* @__PURE__ */c.jsxs("div",{className:"p-8 text-center",children:[
/* @__PURE__ */c.jsxs("div",{className:"mb-6",children:[
/* @__PURE__ */c.jsx("div",{className:"w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4",children:/* @__PURE__ */c.jsx(Z,{className:"h-10 w-10 text-blue-600"})}),
/* @__PURE__ */c.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:"Ready to Start?"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600",children:"This quiz contains 1 question. Read carefully and select your answer."})]}),o.time_limit_minutes&&/* @__PURE__ */c.jsx("div",{className:"bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6",children:/* @__PURE__ */c.jsxs("div",{className:"flex items-center justify-center space-x-2 text-orange-800",children:[
/* @__PURE__ */c.jsx(T,{className:"h-5 w-5"}),
/* @__PURE__ */c.jsxs("span",{className:"font-medium",children:["Time Limit: ",o.time_limit_minutes," minutes"]})]})}),
/* @__PURE__ */c.jsx("button",{onClick:()=>{y(!0),C(Date.now()),q(0)},className:"bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105",children:"Start Quiz"})]})})]})}):/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */c.jsx($,{className:"h-16 w-16 text-orange-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-2",children:"Maximum Attempts Reached"}),
/* @__PURE__ */c.jsxs("p",{className:"text-gray-600 mb-6",children:["You have used all ",o.max_attempts," attempts for this quiz."]}),
/* @__PURE__ */c.jsx(x,{to:"/tasks",className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",children:"Browse Other Tasks"})]})})}):/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */c.jsx(R,{className:"h-16 w-16 text-gray-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-2",children:"Quiz Not Available"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-6",children:"This quiz doesn't have any questions configured."}),
/* @__PURE__ */c.jsx(x,{to:"/tasks",className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",children:"Browse Other Tasks"})]})})}):/* @__PURE__ */c.jsx(le,{children:/* @__PURE__ */c.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */c.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */c.jsx($,{className:"h-16 w-16 text-yellow-400 mx-auto mb-4"}),
/* @__PURE__ */c.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-2",children:"Not a Quiz Task"}),
/* @__PURE__ */c.jsx("p",{className:"text-gray-600 mb-6",children:"This task is not a quiz type."}),
/* @__PURE__ */c.jsx(x,{to:"/tasks/"+l,className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",children:"View Task Details"})]})})})}},Symbol.toStringTag,{value:"Module"}));export{le as L,Se as Q,ye as S,he as T,pe as a,fe as b};
