import{aw as e,U as s,r as a,a as t,j as r,a3 as l,al as i,aD as n,C as d,aE as c,a8 as o,aF as x,N as m,a6 as h,a5 as g,a4 as u,K as b,ai as j,a0 as p,V as y,F as v,c as N,Z as f,g as w,i as k,f as _,ah as C}from"./react-vendor-JLH1r332.js";import{a as L}from"./utils-chunk-CyH00Vps.js";import"./vendor-D5qaWewk.js";import"./http-vendor-CIEU9v4G.js";import"./auth-chunk-CmjlQMUy.js";const P=e=>Math.floor(e/1e3)+1,S=e=>new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),D=e=>{const s=/* @__PURE__ */new Date-new Date(e),a=Math.floor(s/6e4),t=Math.floor(s/36e5),r=Math.floor(s/864e5);return 1>a?"Just now":60>a?a+"m ago":24>t?t+"h ago":0===r?"Today":1===r?"Yesterday":7>r?r+" days ago":30>r?Math.floor(r/7)+" weeks ago":S(e)},T=()=>/* @__PURE__ */r.jsxs("div",{className:"animate-pulse space-y-6",children:[
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-xl shadow-lg p-6",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-6 mb-6",children:[
/* @__PURE__ */r.jsx("div",{className:"w-24 h-24 bg-gray-300 rounded-full"}),
/* @__PURE__ */r.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */r.jsx("div",{className:"h-8 bg-gray-300 rounded w-1/3 mb-2"}),
/* @__PURE__ */r.jsx("div",{className:"h-4 bg-gray-300 rounded w-1/2 mb-2"}),
/* @__PURE__ */r.jsx("div",{className:"h-4 bg-gray-300 rounded w-2/3"})]}),
/* @__PURE__ */r.jsx("div",{className:"h-10 w-24 bg-gray-300 rounded-full"})]}),
/* @__PURE__ */r.jsx("div",{className:"h-16 bg-gray-300 rounded"})]}),
/* @__PURE__ */r.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[1,2,3,4].map(e=>/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm",children:[
/* @__PURE__ */r.jsx("div",{className:"h-8 w-8 bg-gray-300 rounded mx-auto mb-2"}),
/* @__PURE__ */r.jsx("div",{className:"h-6 bg-gray-300 rounded w-16 mx-auto mb-2"}),
/* @__PURE__ */r.jsx("div",{className:"h-4 bg-gray-300 rounded w-12 mx-auto"})]},e))})]}),B=({error:e,onRetry:s,onGoBack:a})=>/* @__PURE__ */r.jsx("div",{className:"min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4",children:/* @__PURE__ */r.jsxs("div",{className:"max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center",children:[
/* @__PURE__ */r.jsx(v,{className:"h-16 w-16 text-red-500 mx-auto mb-4"}),
/* @__PURE__ */r.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:"Profile Not Found"}),
/* @__PURE__ */r.jsx("p",{className:"text-gray-600 mb-6",children:e}),
/* @__PURE__ */r.jsxs("div",{className:"space-y-3",children:[s&&/* @__PURE__ */r.jsxs("button",{onClick:s,className:"w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2",children:[
/* @__PURE__ */r.jsx(N,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{children:"Try Again"})]}),
/* @__PURE__ */r.jsx("button",{onClick:a,className:"w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors",children:"Go Back"}),
/* @__PURE__ */r.jsx(f,{to:"/dashboard",className:"block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",children:"Dashboard"})]})]})}),M=({activity:e})=>{var s;/* @__PURE__ */
return r.jsxs("div",{className:"flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors",children:[
/* @__PURE__ */r.jsx("div",{className:`w-8 h-8 ${(e=>{switch(e){case"task_completed":return"bg-blue-100";case"badge_earned":return"bg-yellow-100";case"streak_milestone":return"bg-red-100";case"level_up":return"bg-purple-100";case"thread_woven":return"bg-indigo-100";case"user_joined":return"bg-green-100";default:return"bg-gray-100"}})(e.action)} rounded-full flex items-center justify-center flex-shrink-0`,children:(e=>{switch(e){case"task_completed":/* @__PURE__ */
return r.jsx(m,{className:"h-4 w-4 text-blue-600"});case"badge_earned":/* @__PURE__ */
return r.jsx(h,{className:"h-4 w-4 text-yellow-600"});case"streak_milestone":/* @__PURE__ */
return r.jsx(g,{className:"h-4 w-4 text-red-600"});case"level_up":/* @__PURE__ */
return r.jsx(u,{className:"h-4 w-4 text-purple-600"});case"thread_woven":/* @__PURE__ */
return r.jsx(C,{className:"h-4 w-4 text-indigo-600"});case"user_joined":/* @__PURE__ */
return r.jsx(_,{className:"h-4 w-4 text-green-600"});default:/* @__PURE__ */
return r.jsx(k,{className:"h-4 w-4 text-blue-600"})}})(e.action)}),
/* @__PURE__ */r.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-900 font-medium",children:e.detail||e.action.replace(/_/g," ")}),
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-2 mt-1",children:[
/* @__PURE__ */r.jsx(w,{className:"h-3 w-3 text-gray-400"}),
/* @__PURE__ */r.jsx("p",{className:"text-xs text-gray-500",children:D(e.created_at)}),(null==(s=e.meta_data)?void 0:s.xp_gained)&&/* @__PURE__ */r.jsxs("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",children:["+",e.meta_data.xp_gained," XP"]})]})]})]})},E=({badges:e})=>e&&0!==e.length?/* @__PURE__ */r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:e.map((e,s)=>/* @__PURE__ */r.jsx("div",{className:"bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow",children:/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */r.jsx("div",{className:"w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center",children:/* @__PURE__ */r.jsx(h,{className:"h-6 w-6 text-yellow-600"})}),
/* @__PURE__ */r.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */r.jsx("h4",{className:"font-medium text-gray-900",children:e.title}),
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-600",children:e.description}),
/* @__PURE__ */r.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:["Earned ",S(e.awarded_at)]})]})]})},e.badge_id||s))}):/* @__PURE__ */r.jsxs("div",{className:"text-center py-8",children:[
/* @__PURE__ */r.jsx(p,{className:"h-16 w-16 text-gray-300 mx-auto mb-4"}),
/* @__PURE__ */r.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"No badges yet"}),
/* @__PURE__ */r.jsx("p",{className:"text-gray-600",children:"This user hasn't earned any badges yet."})]});function A(){const{username:v}=e(),N=s(),[f,w]=a.useState("badges"),[k,_]=a.useState(!1),{data:C,isLoading:D,isError:A,error:R,refetch:I}=t({queryKey:["publicProfile",v],queryFn:()=>(async e=>{var s,a;try{const{data:s}=await L.get("/api/users/"+encodeURIComponent(e));return s}catch(t){throw Error((null==(a=null==(s=t.response)?void 0:s.data)?void 0:a.detail)||"Profile not found")}})(v),enabled:!!v,staleTime:12e4,retry:2,onError:e=>{}}),{data:U=[],isLoading:F}=t({queryKey:["userActivities",v],queryFn:()=>(async e=>{try{const{data:s}=await L.get("/api/users/"+encodeURIComponent(e));if(!s.id)throw Error("User ID not found");const{data:a}=await L.get("/api/activities/",{params:{user_id:s.id,limit:10,filter_type:"all",hours_back:168}});return a}catch(s){return[]}})(v),enabled:!!v&&!!C&&"activities"===f,staleTime:6e4,retry:1}),X=a.useMemo(()=>{var e;if(!C)return null;const s=Math.floor(/* @__PURE__ */(new Date-new Date(C.created_at))/864e5),a=(e=>{const s=P(e),a=1e3*(s-1);return Math.min(Math.max((e-a)/(1e3*s-a)*100,0),100)})(C.xp);var t;return{memberDays:s,xpProgress:a,nextLevelXp:(t=C.xp,1e3*P(t)),badgeCount:(null==(e=C.badges)?void 0:e.length)||0}},[C]);return v?D?/* @__PURE__ */r.jsx("div",{className:"min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4",children:/* @__PURE__ */r.jsxs("div",{className:"max-w-4xl mx-auto",children:[
/* @__PURE__ */r.jsx("div",{className:"mb-6",children:/* @__PURE__ */r.jsxs("button",{onClick:()=>N(-1),className:"flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors",children:[
/* @__PURE__ */r.jsx(l,{className:"h-5 w-5"}),
/* @__PURE__ */r.jsx("span",{children:"Back"})]})}),
/* @__PURE__ */r.jsx(T,{})]})}):A?/* @__PURE__ */r.jsx(B,{error:(null==R?void 0:R.message)||"Profile not found",onRetry:I,onGoBack:()=>N(-1)}):C?/* @__PURE__ */r.jsx("div",{className:"min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4",children:/* @__PURE__ */r.jsxs("div",{className:"max-w-4xl mx-auto",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center justify-between mb-6",children:[
/* @__PURE__ */r.jsxs("button",{onClick:()=>N(-1),className:"flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group",children:[
/* @__PURE__ */r.jsx(l,{className:"h-5 w-5 group-hover:-translate-x-1 transition-transform"}),
/* @__PURE__ */r.jsx("span",{children:"Back"})]}),
/* @__PURE__ */r.jsxs("button",{onClick:async()=>{if(!k&&C){_(!0);try{await(async e=>{const s={title:e.username+"'s Impact ID Profile",text:`Check out ${e.username}'s profile on Impact ID - Level ${e.level} with ${e.xp.toLocaleString()} XP!`,url:window.location.href};if(!(navigator.share&&navigator.canShare&&navigator.canShare(s)))throw await navigator.clipboard.writeText(window.location.href),Error("Link copied to clipboard");await navigator.share(s)})(C),y.success("Profile shared successfully!",{icon:"🔗",duration:3e3})}catch(e){"AbortError"!==e.name&&("Link copied to clipboard"===e.message?y.success("Profile link copied to clipboard!",{icon:"📋",duration:3e3}):y.error("Failed to share profile"))}finally{_(!1)}}},disabled:k,className:"flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 shadow-sm",children:[
/* @__PURE__ */r.jsx(i,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{children:k?"Sharing...":"Share Profile"})]})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6",children:[
/* @__PURE__ */r.jsxs("div",{className:"relative",children:[
/* @__PURE__ */r.jsx("div",{className:"w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg",children:/* @__PURE__ */r.jsx("span",{className:"text-2xl font-bold text-white",children:C.username.charAt(0).toUpperCase()})}),
/* @__PURE__ */r.jsx("div",{className:"absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm",children:/* @__PURE__ */r.jsx(n,{className:"h-5 w-5 text-white"})})]}),
/* @__PURE__ */r.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */r.jsxs("div",{children:[
/* @__PURE__ */r.jsx("h1",{className:"text-3xl font-bold text-gray-900 mb-1",children:C.username}),
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-4 text-sm text-gray-600 mb-2",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */r.jsx(d,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsxs("span",{children:["Joined ",S(C.created_at)]})]}),C.location&&/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */r.jsx(c,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{children:C.location})]})]}),C.bio&&/* @__PURE__ */r.jsx("p",{className:"text-gray-700 mb-3 max-w-2xl",children:C.bio})]}),
/* @__PURE__ */r.jsx("div",{className:"flex items-center space-x-2",children:/* @__PURE__ */r.jsxs("div",{className:"bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg",children:["Level ",C.level]})})]}),(C.website||C.social_links&&Object.keys(C.social_links).length>0)&&/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-3 mt-3",children:[C.website&&/* @__PURE__ */r.jsxs("a",{href:C.website,target:"_blank",rel:"noopener noreferrer",className:"flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm",children:[
/* @__PURE__ */r.jsx(o,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{children:"Website"})]}),C.social_links&&Object.entries(C.social_links).map(([e,s])=>/* @__PURE__ */r.jsxs("a",{href:s,target:"_blank",rel:"noopener noreferrer",className:"flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm",children:[
/* @__PURE__ */r.jsx(x,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{className:"capitalize",children:e})]},e))]})]})]}),X&&/* @__PURE__ */r.jsxs("div",{className:"mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */r.jsxs("span",{className:"text-sm font-medium text-gray-700",children:["Level ",C.level," Progress"]}),
/* @__PURE__ */r.jsxs("span",{className:"text-sm text-gray-600",children:[C.xp.toLocaleString()," / ",X.nextLevelXp.toLocaleString()," XP"]})]}),
/* @__PURE__ */r.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2 overflow-hidden",children:/* @__PURE__ */r.jsx("div",{className:"bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700 ease-out relative",style:{width:X.xpProgress+"%"},children:/* @__PURE__ */r.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"})})})]})]}),
/* @__PURE__ */r.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",children:[
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow",children:[
/* @__PURE__ */r.jsx(m,{className:"h-8 w-8 text-yellow-500 mx-auto mb-2"}),
/* @__PURE__ */r.jsx("p",{className:"text-2xl font-bold text-gray-900",children:C.xp.toLocaleString()}),
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-600",children:"Total XP"})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow",children:[
/* @__PURE__ */r.jsx(h,{className:"h-8 w-8 text-blue-500 mx-auto mb-2"}),
/* @__PURE__ */r.jsx("p",{className:"text-2xl font-bold text-gray-900",children:(null==X?void 0:X.badgeCount)||0}),
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-600",children:"Badges"})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow",children:[
/* @__PURE__ */r.jsx(g,{className:"h-8 w-8 text-red-500 mx-auto mb-2"}),
/* @__PURE__ */r.jsx("p",{className:"text-2xl font-bold text-gray-900",children:C.streak||0}),
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-600",children:"Streak"})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow",children:[
/* @__PURE__ */r.jsx(u,{className:"h-8 w-8 text-purple-500 mx-auto mb-2"}),
/* @__PURE__ */r.jsx("p",{className:"text-2xl font-bold text-gray-900",children:C.essence_balance||0}),
/* @__PURE__ */r.jsx("p",{className:"text-sm text-gray-600",children:"Essence"})]})]}),
/* @__PURE__ */r.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-3 mb-3",children:[
/* @__PURE__ */r.jsx(b,{className:"h-6 w-6 text-green-600"}),
/* @__PURE__ */r.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"Activity Stats"})]}),
/* @__PURE__ */r.jsxs("div",{className:"space-y-2",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex justify-between",children:[
/* @__PURE__ */r.jsx("span",{className:"text-gray-600",children:"Tasks Completed:"}),
/* @__PURE__ */r.jsx("span",{className:"font-semibold",children:C.total_tasks_completed||0})]}),
/* @__PURE__ */r.jsxs("div",{className:"flex justify-between",children:[
/* @__PURE__ */r.jsx("span",{className:"text-gray-600",children:"Threads Woven:"}),
/* @__PURE__ */r.jsx("span",{className:"font-semibold",children:C.total_threads_woven||C.weaving_streak||0})]})]})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg p-4 shadow-sm border border-gray-200",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center space-x-3 mb-3",children:[
/* @__PURE__ */r.jsx(j,{className:"h-6 w-6 text-yellow-600"}),
/* @__PURE__ */r.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"Achievements"})]}),
/* @__PURE__ */r.jsxs("div",{className:"space-y-2",children:[
/* @__PURE__ */r.jsxs("div",{className:"flex justify-between",children:[
/* @__PURE__ */r.jsx("span",{className:"text-gray-600",children:"Member Since:"}),
/* @__PURE__ */r.jsxs("span",{className:"font-semibold",children:[(null==X?void 0:X.memberDays)||0," days"]})]}),
/* @__PURE__ */r.jsxs("div",{className:"flex justify-between",children:[
/* @__PURE__ */r.jsx("span",{className:"text-gray-600",children:"Current Level:"}),
/* @__PURE__ */r.jsxs("span",{className:"font-semibold",children:["Level ",C.level]})]})]})]})]}),
/* @__PURE__ */r.jsxs("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 mb-6",children:[
/* @__PURE__ */r.jsx("div",{className:"border-b border-gray-200",children:/* @__PURE__ */r.jsx("nav",{className:"flex space-x-8 px-6","aria-label":"Tabs",children:[{id:"badges",label:"Badges",icon:p,count:null==X?void 0:X.badgeCount},{id:"activities",label:"Recent Activity",icon:b,count:U.length}].map(e=>{const s=e.icon;/* @__PURE__ */
return r.jsxs("button",{onClick:()=>w(e.id),className:"flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors "+(f===e.id?"border-blue-500 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"),children:[
/* @__PURE__ */r.jsx(s,{className:"h-4 w-4"}),
/* @__PURE__ */r.jsx("span",{children:e.label}),null!==e.count&&void 0!==e.count&&/* @__PURE__ */r.jsx("span",{className:"px-2 py-0.5 rounded-full text-xs "+(f===e.id?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-600"),children:e.count})]},e.id)})})}),
/* @__PURE__ */r.jsxs("div",{className:"p-6",children:["badges"===f&&/* @__PURE__ */r.jsxs("div",{children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */r.jsxs("h3",{className:"text-lg font-semibold text-gray-900",children:["Badges (",(null==X?void 0:X.badgeCount)||0,")"]}),(null==X?void 0:X.badgeCount)>0&&/* @__PURE__ */r.jsx("span",{className:"text-sm text-gray-500",children:"Showing all earned badges"})]}),
/* @__PURE__ */r.jsx(E,{badges:C.badges})]}),"activities"===f&&/* @__PURE__ */r.jsxs("div",{children:[
/* @__PURE__ */r.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */r.jsxs("h3",{className:"text-lg font-semibold text-gray-900",children:["Recent Activity (",U.length,")"]}),F&&/* @__PURE__ */r.jsx("span",{className:"text-sm text-gray-500",children:"Loading..."})]}),F?/* @__PURE__ */r.jsx("div",{className:"space-y-3",children:[1,2,3].map(e=>/* @__PURE__ */r.jsxs("div",{className:"animate-pulse flex space-x-3 p-3 bg-gray-50 rounded-lg",children:[
/* @__PURE__ */r.jsx("div",{className:"rounded-full bg-gray-300 h-8 w-8"}),
/* @__PURE__ */r.jsxs("div",{className:"flex-1 space-y-2",children:[
/* @__PURE__ */r.jsx("div",{className:"h-4 bg-gray-300 rounded w-3/4"}),
/* @__PURE__ */r.jsx("div",{className:"h-3 bg-gray-300 rounded w-1/2"})]})]},e))}):U.length>0?/* @__PURE__ */r.jsx("div",{className:"space-y-3",children:U.map((e,s)=>/* @__PURE__ */r.jsx(M,{activity:e},e.id||s))}):/* @__PURE__ */r.jsxs("div",{className:"text-center py-8",children:[
/* @__PURE__ */r.jsx(b,{className:"h-16 w-16 text-gray-300 mx-auto mb-4"}),
/* @__PURE__ */r.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"No recent activity"}),
/* @__PURE__ */r.jsx("p",{className:"text-gray-600",children:"This user hasn't been active recently."})]})]})]})]})]})}):/* @__PURE__ */r.jsx(B,{error:"Profile data not available",onRetry:I,onGoBack:()=>N(-1)}):/* @__PURE__ */r.jsx(B,{error:"No username provided in URL",onGoBack:()=>N(-1)})}export{A as default};
