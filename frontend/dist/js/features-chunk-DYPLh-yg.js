import{r as e,j as a,a4 as s,P as t,O as r,a5 as l,N as i,g as n,a7 as d,a8 as o,q as c,c as x,a9 as m,aa as g,ab as h,ac as u,t as b,s as p,K as y,a0 as v,ad as j,ae as w,af as N,ag as f,V as k,u as _,a as S,b as C,L as T,ah as E,ai as W,m as L,R as q}from"./react-vendor-JLH1r332.js";import{a as R}from"./utils-chunk-CyH00Vps.js";import{L as F}from"./tasks-chunk-BIljiLKS.js";import"./vendor-D5qaWewk.js";import"./http-vendor-CIEU9v4G.js";import"./auth-chunk-CmjlQMUy.js";const P=[{id:"Environment",name:"Environment",icon:o,color:"green"},{id:"Social Good",name:"Social Good",icon:m,color:"pink"},{id:"Technology",name:"Technology",icon:g,color:"blue"},{id:"Education",name:"Education",icon:h,color:"purple"},{id:"Health",name:"Health",icon:u,color:"red"},{id:null,name:"All Categories",icon:b,color:"gray"}],D=e=>{0>e&&(e=0);const a=Math.floor(e/3600),s=Math.floor(e%3600/60),t=Math.floor(e%60);return a>0?`${a}h ${s}m ${t}s`:s>0?`${s}m ${t}s`:t+"s"};function A({status:m,onClaim:g,claiming:h=!1,availableThreads:u=[],threadsLoading:b=!1,userStats:v=null,leaderboard:j=[],onCategoryFilter:w=()=>{},selectedCategory:N=null,onRefreshThreads:f=()=>{}}){const[k,_]=e.useState((null==m?void 0:m.time_remaining_seconds)||0),[S,C]=e.useState(null),[T,E]=e.useState(!1),[W,L]=e.useState(!1);e.useEffect(()=>{if(m&&(_(m.time_remaining_seconds||0),!m.is_ready&&m.time_remaining_seconds>0)){const e=setInterval(()=>{_(a=>a>1?a-1:(clearInterval(e),0))},1e3);return()=>clearInterval(e)}},[m]);const q=(null==m?void 0:m.is_ready)&&0>=k,R=(null==m?void 0:m.daily_weaves_completed)>=(null==m?void 0:m.daily_weaves_limit),F=q&&!R,A=e=>{const a=P.find(a=>a.id===e),s={green:"bg-green-100 text-green-700 border-green-300",pink:"bg-pink-100 text-pink-700 border-pink-300",blue:"bg-blue-100 text-blue-700 border-blue-300",purple:"bg-purple-100 text-purple-700 border-purple-300",red:"bg-red-100 text-red-700 border-red-300",gray:"bg-gray-100 text-gray-700 border-gray-300"};return s[null==a?void 0:a.color]||s.gray};return m?/* @__PURE__ */a.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl border border-purple-200 overflow-hidden",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx("div",{className:"p-2 bg-white bg-opacity-20 rounded-lg",children:/* @__PURE__ */a.jsx(s,{className:"h-6 w-6"})}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("h3",{className:"text-2xl font-bold",children:"The Impact Loom"}),
/* @__PURE__ */a.jsx("p",{className:"text-purple-100",children:"Transform impact threads into meaningful categorizations"})]})]}),
/* @__PURE__ */a.jsx("div",{className:"text-center",children:/* @__PURE__ */a.jsx("div",{className:"inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium "+(F?"bg-green-500 bg-opacity-20 text-green-100":"bg-yellow-500 bg-opacity-20 text-yellow-100"),children:F?/* @__PURE__ */a.jsxs(a.Fragment,{children:[
/* @__PURE__ */a.jsx("div",{className:"w-2 h-2 bg-green-400 rounded-full animate-pulse"}),
/* @__PURE__ */a.jsx("span",{children:"Ready to Weave"})]}):/* @__PURE__ */a.jsxs(a.Fragment,{children:[
/* @__PURE__ */a.jsx(t,{className:"w-4 h-4"}),
/* @__PURE__ */a.jsx("span",{children:R?"Daily Limit":"Cooling Down"})]})})})]}),v&&/* @__PURE__ */a.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4 text-center",children:[
/* @__PURE__ */a.jsx(s,{className:"h-5 w-5 mx-auto mb-1 text-yellow-300"}),
/* @__PURE__ */a.jsx("div",{className:"text-lg font-bold",children:v.essence_balance}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Essence"})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4 text-center",children:[
/* @__PURE__ */a.jsx(r,{className:"h-5 w-5 mx-auto mb-1 text-blue-300"}),
/* @__PURE__ */a.jsxs("div",{className:"text-lg font-bold",children:[v.daily_weaves_completed,"/",v.daily_weaves_limit]}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Daily Weaves"})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4 text-center",children:[
/* @__PURE__ */a.jsx(l,{className:"h-5 w-5 mx-auto mb-1 text-red-300"}),
/* @__PURE__ */a.jsx("div",{className:"text-lg font-bold",children:v.streak}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Streak"})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4 text-center",children:[
/* @__PURE__ */a.jsx(i,{className:"h-5 w-5 mx-auto mb-1 text-yellow-300"}),
/* @__PURE__ */a.jsx("div",{className:"text-lg font-bold",children:v.total_weaves||0}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Total"})]})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"p-6 space-y-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-white rounded-lg p-4 border border-gray-200",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */a.jsx("span",{className:"text-sm font-medium text-gray-700",children:"Daily Progress"}),
/* @__PURE__ */a.jsxs("span",{className:"text-sm text-gray-500",children:[m.daily_weaves_completed," / ",m.daily_weaves_limit]})]}),
/* @__PURE__ */a.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2",children:/* @__PURE__ */a.jsx("div",{className:"bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500",style:{width:((null==m?void 0:m.daily_weaves_limit)?m.daily_weaves_completed/m.daily_weaves_limit*100:0)+"%"}})})]}),!F&&!R&&/* @__PURE__ */a.jsx("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx(n,{className:"h-8 w-8 text-yellow-600"}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("h4",{className:"font-semibold text-yellow-800",children:"Weaving Cooldown Active"}),
/* @__PURE__ */a.jsxs("p",{className:"text-yellow-700",children:["Next weaving available in ",
/* @__PURE__ */a.jsx("span",{className:"font-bold",children:D(k)})]})]})]})}),R&&/* @__PURE__ */a.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx(d,{className:"h-8 w-8 text-blue-600"}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("h4",{className:"font-semibold text-blue-800",children:"Daily Weaving Limit Reached"}),
/* @__PURE__ */a.jsxs("p",{className:"text-blue-700",children:["You've completed ",m.daily_weaves_limit," weaves today. Come back tomorrow for more!"]})]})]})}),F&&/* @__PURE__ */a.jsxs("div",{className:"flex space-x-4",children:[
/* @__PURE__ */a.jsxs("button",{onClick:()=>E(!T),className:"flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors",children:[
/* @__PURE__ */a.jsx(o,{className:"h-4 w-4"}),
/* @__PURE__ */a.jsxs("span",{children:[T?"Hide":"Browse"," Available Threads"]})]}),
/* @__PURE__ */a.jsxs("button",{onClick:()=>L(!W),className:"flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors",children:[
/* @__PURE__ */a.jsx(c,{className:"h-4 w-4"}),
/* @__PURE__ */a.jsxs("span",{children:[W?"Hide":"View"," Leaderboard"]})]})]}),T&&F&&/* @__PURE__ */a.jsxs("div",{className:"bg-gray-50 rounded-lg p-4 border border-gray-200",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */a.jsxs("h4",{className:"font-semibold text-gray-900",children:["Available Threads (",m.available_threads||0,")"]}),
/* @__PURE__ */a.jsx("div",{className:"flex items-center space-x-2",children:/* @__PURE__ */a.jsx("button",{onClick:f,disabled:b,className:"p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50",title:"Refresh threads",children:/* @__PURE__ */a.jsx(x,{className:"h-4 w-4 "+(b?"animate-spin":"")})})})]}),
/* @__PURE__ */a.jsx("div",{className:"mb-4",children:/* @__PURE__ */a.jsx("div",{className:"flex flex-wrap gap-2",children:P.map(e=>{const s=e.icon,t=N===e.id;/* @__PURE__ */
return a.jsxs("button",{onClick:()=>w(e.id),className:"flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border transition-colors "+(t?A(e.id):"bg-white text-gray-600 border-gray-300 hover:bg-gray-50"),children:[
/* @__PURE__ */a.jsx(s,{className:"h-3 w-3"}),
/* @__PURE__ */a.jsx("span",{children:e.name})]},e.id||"all")})})}),b?/* @__PURE__ */a.jsx("div",{className:"space-y-3",children:[...[,,,]].map((e,s)=>/* @__PURE__ */a.jsxs("div",{className:"bg-white p-4 rounded-lg border animate-pulse",children:[
/* @__PURE__ */a.jsx("div",{className:"h-4 bg-gray-300 rounded w-3/4 mb-2"}),
/* @__PURE__ */a.jsx("div",{className:"h-3 bg-gray-300 rounded w-1/2"})]},s))}):u.length>0?/* @__PURE__ */a.jsx("div",{className:"space-y-3 max-h-64 overflow-y-auto",children:u.map(e=>{var s;/* @__PURE__ */
return a.jsxs("div",{className:"bg-white p-4 rounded-lg border cursor-pointer transition-all "+(S===e.id?"border-purple-500 bg-purple-50":"border-gray-200 hover:border-gray-300"),onClick:()=>C(S===e.id?null:e.id),children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-start justify-between",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsx("h5",{className:"font-medium text-gray-900 mb-1 line-clamp-2",children:e.title||(null==(s=e.meta_data)?void 0:s.title)||"Impact Thread"}),e.summary&&/* @__PURE__ */a.jsx("p",{className:"text-sm text-gray-600 line-clamp-2",children:e.summary})]}),S===e.id&&/* @__PURE__ */a.jsx("div",{className:"ml-3 flex-shrink-0",children:/* @__PURE__ */a.jsx("div",{className:"w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center",children:/* @__PURE__ */a.jsx("span",{className:"text-white text-xs",children:"✓"})})})]}),
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mt-2 text-xs text-gray-500",children:[
/* @__PURE__ */a.jsxs("span",{children:["Source: ",e.source||"Web"]}),e.category&&/* @__PURE__ */a.jsx("span",{className:"px-2 py-1 rounded-full "+A(e.category),children:e.category})]})]},e.id)})}):/* @__PURE__ */a.jsxs("div",{className:"text-center py-8 text-gray-500",children:[
/* @__PURE__ */a.jsx(o,{className:"h-12 w-12 mx-auto mb-2 text-gray-400"}),
/* @__PURE__ */a.jsx("p",{children:"No threads available in this category."}),
/* @__PURE__ */a.jsx("p",{className:"text-sm",children:"Try selecting a different category or refresh."})]})]}),W&&/* @__PURE__ */a.jsxs("div",{className:"bg-gray-50 rounded-lg p-4 border border-gray-200",children:[
/* @__PURE__ */a.jsxs("h4",{className:"font-semibold text-gray-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */a.jsx(c,{className:"h-5 w-5 text-yellow-600"}),
/* @__PURE__ */a.jsx("span",{children:"Weekly Weaving Leaders"})]}),j.length>0?/* @__PURE__ */a.jsx("div",{className:"space-y-2",children:j.slice(0,5).map((e,s)=>/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3 p-2 bg-white rounded-lg",children:[
/* @__PURE__ */a.jsx("div",{className:"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white "+(0===s?"bg-yellow-500":1===s?"bg-gray-400":2===s?"bg-amber-600":"bg-gray-300 text-gray-700"),children:s+1}),
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsx("div",{className:"font-medium text-gray-900",children:e.username}),
/* @__PURE__ */a.jsxs("div",{className:"text-xs text-gray-500",children:[e.weave_count," weaves • ",e.total_essence," essence"]})]})]},e.username))}):/* @__PURE__ */a.jsx("p",{className:"text-gray-500 text-center py-4",children:"Leaderboard loading..."})]}),
/* @__PURE__ */a.jsx("button",{onClick:()=>{S?g(S):g()},disabled:!F||h,className:`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform ${F&&!h?"bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105":"bg-gray-300 text-gray-500 cursor-not-allowed"} disabled:transform-none`,children:h?/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-white"}),
/* @__PURE__ */a.jsx("span",{children:"Finding Thread..."})]}):/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx(s,{className:"h-5 w-5"}),
/* @__PURE__ */a.jsx("span",{children:h?"Finding Thread...":R?`Daily Limit Reached (${m.daily_weaves_limit})`:q?S?"Weave Selected Thread":"Weave Random Thread":"Ready in "+D(k)})]})}),F&&/* @__PURE__ */a.jsxs("div",{className:"text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3",children:[
/* @__PURE__ */a.jsx(p,{className:"h-4 w-4 inline mr-1"}),S?"You'll weave the selected thread above.":"A random thread will be selected for you to weave."]})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 p-6",children:[
/* @__PURE__ */a.jsxs("h4",{className:"font-semibold text-gray-900 mb-4 flex items-center space-x-2",children:[
/* @__PURE__ */a.jsx(y,{className:"h-5 w-5 text-blue-600"}),
/* @__PURE__ */a.jsx("span",{children:"Platform Activity"})]}),
/* @__PURE__ */a.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */a.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-purple-600",children:m.available_threads||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-gray-600",children:"Available Threads"})]}),
/* @__PURE__ */a.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-blue-600",children:(null==v?void 0:v.essence_balance)||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-gray-600",children:"Your Essence"})]}),
/* @__PURE__ */a.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-green-600",children:(null==v?void 0:v.streak)||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-gray-600",children:"Current Streak"})]}),
/* @__PURE__ */a.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-red-600",children:(null==v?void 0:v.total_weaves)||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-gray-600",children:"Total Weaves"})]})]})]})]}):/* @__PURE__ */a.jsxs("div",{className:"bg-white rounded-2xl shadow-lg p-6 text-center",children:[
/* @__PURE__ */a.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"}),
/* @__PURE__ */a.jsx("p",{className:"text-gray-600",children:"Loading loom status..."})]})}const I=[{id:"Environment",name:"Environment",icon:o,solidIcon:o,color:"green",description:"Climate, sustainability, conservation",examples:["renewable energy","waste reduction","biodiversity"]},{id:"Social Good",name:"Social Good",icon:m,solidIcon:w,color:"pink",description:"Community impact, social justice",examples:["poverty reduction","equality","community building"]},{id:"Technology",name:"Technology",icon:g,solidIcon:N,color:"blue",description:"Innovation, digital solutions",examples:["AI for good","digital inclusion","tech accessibility"]},{id:"Education",name:"Education",icon:h,solidIcon:f,color:"purple",description:"Learning, skill development",examples:["educational access","skills training","literacy"]},{id:"Health",name:"Health",icon:u,solidIcon:u,color:"red",description:"Healthcare, wellness, medical",examples:["healthcare access","mental health","medical research"]},{id:"Other",name:"Other",icon:b,solidIcon:s,color:"gray",description:"Uncategorized impact areas",examples:["mixed impact","unique initiatives","cross-sector"]}];function M({thread:t,onSubmit:l,submitting:i=!1,userStats:d=null,showAdvanced:o=!1,estimatedReward:c={min:3,max:8}}){var x;const[m,g]=e.useState(null),[h,u]=e.useState(""),[b,y]=e.useState(""),[w,N]=e.useState(3),[_,S]=e.useState(!1),[C,T]=e.useState(0),[E,W]=e.useState(0),[L]=e.useState(Date.now());e.useEffect(()=>{const e=setInterval(()=>{W(Date.now()-L)},1e3);return()=>clearInterval(e)},[L]),e.useEffect(()=>{const e=h.length;let a=0;20>e||(a+=1),50>e||(a+=1),100>e||(a+=1),200>e||(a+=1),(h.includes("because")||h.includes("due to"))&&(a+=1),T(Math.min(a,5))},[h]);const q=async(e,a=!1)=>{if(!e)return void k.error("Please select a category");if(!a&&(!h.trim()||20>h.trim().length))return void k.error("Please provide at least 20 characters of reasoning");const s={thread_id:t.id,category:e,reasoning:a?"Quick categorization as "+e:h.trim(),action_plan:b.trim()||null,difficulty_rating:w};try{await l(s),k.success(`Weaving submitted! Estimated reward: ${c.min}-${c.max} essence`,{icon:"✨",duration:4e3})}catch(r){k.error("Failed to submit weaving. Please try again.")}},R=e=>{const a={green:"bg-green-100 text-green-700 border-green-300 hover:bg-green-200",pink:"bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200",blue:"bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",purple:"bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",red:"bg-red-100 text-red-700 border-red-300 hover:bg-red-200",gray:"bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"};return a[e.color]||a.gray};/* @__PURE__ */
return a.jsxs("div",{className:"bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx("div",{className:"p-2 bg-white bg-opacity-20 rounded-lg",children:/* @__PURE__ */a.jsx(s,{className:"h-6 w-6"})}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("h3",{className:"text-xl font-bold",children:"Weave Impact Thread"}),
/* @__PURE__ */a.jsx("p",{className:"text-purple-100 text-sm",children:"Help categorize this content to earn essence"})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */a.jsxs("div",{className:"text-2xl font-bold text-yellow-300",children:[c.min,"-",c.max]}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Essence Reward"})]})]}),d&&/* @__PURE__ */a.jsxs("div",{className:"grid grid-cols-3 gap-4 text-center",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-3",children:[
/* @__PURE__ */a.jsx("div",{className:"text-lg font-semibold",children:d.essence_balance}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Current Essence"})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-3",children:[
/* @__PURE__ */a.jsxs("div",{className:"text-lg font-semibold",children:[d.daily_weaves_completed,"/",d.daily_weaves_limit]}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Daily Weaves"})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-3",children:[
/* @__PURE__ */a.jsx("div",{className:"text-lg font-semibold",children:d.streak||0}),
/* @__PURE__ */a.jsx("div",{className:"text-xs text-purple-100",children:"Streak"})]})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"p-6 space-y-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gray-50 rounded-xl p-5 border border-gray-200",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-start justify-between mb-3",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsx("h4",{className:"font-semibold text-gray-900 mb-2 leading-relaxed",children:t.title||(null==(x=t.meta_data)?void 0:x.title)||"Impact Thread Content"}),t.summary&&/* @__PURE__ */a.jsx("p",{className:"text-gray-600 text-sm mb-3 leading-relaxed",children:t.summary})]}),t.quality_score&&/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full",children:[
/* @__PURE__ */a.jsx(v,{className:"h-3 w-3"}),
/* @__PURE__ */a.jsx("span",{children:t.quality_score.toFixed(1)})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */a.jsxs("a",{href:t.content,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors",children:[
/* @__PURE__ */a.jsxs("span",{children:["Read on ",(e=>{try{return new URL(e).hostname.replace("www.","")}catch{return"External Link"}})(t.content)]}),
/* @__PURE__ */a.jsx(j,{className:"h-4 w-4"})]}),
/* @__PURE__ */a.jsx("button",{onClick:()=>S(!_),className:"text-sm text-gray-500 hover:text-gray-700 transition-colors",children:_?"Hide Details":"Show Details"})]}),_&&/* @__PURE__ */a.jsxs("div",{className:"mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm",children:[
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("span",{className:"text-gray-500",children:"Source:"}),
/* @__PURE__ */a.jsx("span",{className:"ml-2 text-gray-900",children:t.source||"Web"})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("span",{className:"text-gray-500",children:"Type:"}),
/* @__PURE__ */a.jsx("span",{className:"ml-2 text-gray-900",children:t.data_type||"URL"})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("span",{className:"text-gray-500",children:"Created:"}),
/* @__PURE__ */a.jsx("span",{className:"ml-2 text-gray-900",children:new Date(t.created_at).toLocaleDateString()})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("span",{className:"text-gray-500",children:"Weaving Count:"}),
/* @__PURE__ */a.jsx("span",{className:"ml-2 text-gray-900",children:t.weaving_count||0})]})]})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsxs("h5",{className:"font-semibold text-gray-900 mb-3 flex items-center space-x-2",children:[
/* @__PURE__ */a.jsx("span",{children:"What category best describes this content?"}),
/* @__PURE__ */a.jsx(p,{className:"h-4 w-4 text-gray-400"})]}),
/* @__PURE__ */a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-3",children:I.map(e=>{const s=m===e.id?e.solidIcon:e.icon,t=m===e.id;/* @__PURE__ */
return a.jsxs("button",{onClick:()=>g(e.id),disabled:i,className:`\n                                        p-4 rounded-xl border-2 transition-all duration-200 text-left\n                                        ${t?R(e)+" border-current shadow-md transform scale-105":"bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"}\n                                        disabled:opacity-50 disabled:cursor-not-allowed\n                                    `,title:e.description,children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3 mb-2",children:[
/* @__PURE__ */a.jsx(s,{className:"h-5 w-5"}),
/* @__PURE__ */a.jsx("span",{className:"font-medium",children:e.name})]}),
/* @__PURE__ */a.jsx("p",{className:"text-xs opacity-75",children:e.description}),t&&/* @__PURE__ */a.jsxs("div",{className:"mt-2 text-xs opacity-75",children:["Examples: ",e.examples.join(", ")]})]},e.id)})})]}),o&&m&&/* @__PURE__ */a.jsxs("div",{className:"bg-blue-50 rounded-xl p-5 border border-blue-200 space-y-4",children:[
/* @__PURE__ */a.jsx("h6",{className:"font-semibold text-blue-900 mb-3",children:"Advanced Weaving Options"}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:['Why does this belong in "',m,'"? (min 20 characters)']}),
/* @__PURE__ */a.jsx("textarea",{value:h,onChange:e=>u(e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",rows:3,placeholder:"Explain your reasoning for this categorization...",disabled:i}),
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mt-1 text-xs",children:[
/* @__PURE__ */a.jsxs("span",{className:20>h.length?"text-gray-500":"text-green-600",children:[h.length,"/20 minimum"]}),
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */a.jsx("span",{className:"text-gray-500",children:"Quality:"}),
/* @__PURE__ */a.jsx("div",{className:"flex space-x-1",children:[...[,,,,,]].map((e,s)=>/* @__PURE__ */a.jsx(v,{className:"h-3 w-3 "+(C>s?"text-yellow-500":"text-gray-300")},s))})]})]})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Suggested action plan (optional)"}),
/* @__PURE__ */a.jsx("textarea",{value:b,onChange:e=>y(e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",rows:2,placeholder:"What actions could maximize the impact of this content?",disabled:i})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Difficulty to implement (1-5)"}),
/* @__PURE__ */a.jsx("div",{className:"flex space-x-2",children:[1,2,3,4,5].map(e=>/* @__PURE__ */a.jsx("button",{onClick:()=>N(e),className:"w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors "+(w===e?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-300 hover:border-blue-400"),disabled:i,children:e},e))}),
/* @__PURE__ */a.jsx("p",{className:"text-xs text-gray-500 mt-1",children:"1 = Very Easy, 5 = Very Difficult"})]})]}),!o&&/* @__PURE__ */a.jsxs("div",{className:"bg-yellow-50 rounded-xl p-4 border border-yellow-200",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[
/* @__PURE__ */a.jsx(r,{className:"h-4 w-4 text-yellow-600"}),
/* @__PURE__ */a.jsx("span",{className:"text-sm font-medium text-yellow-800",children:"Quick Weaving"})]}),
/* @__PURE__ */a.jsx("p",{className:"text-xs text-yellow-700 mb-3",children:"Select a category and submit quickly for reduced but immediate rewards."}),m&&/* @__PURE__ */a.jsx("button",{onClick:()=>q(m,!0),disabled:i,className:"bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",children:i?"Submitting...":"Quick Weave as "+m})]}),
/* @__PURE__ */a.jsx("div",{className:"flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200",children:o?/* @__PURE__ */a.jsxs(a.Fragment,{children:[
/* @__PURE__ */a.jsx("button",{onClick:()=>q(m,!1),disabled:i||!m||20>h.length,className:"flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",children:i?/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white"}),
/* @__PURE__ */a.jsx("span",{children:"Weaving..."})]}):/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx(s,{className:"h-4 w-4"}),
/* @__PURE__ */a.jsx("span",{children:"Submit Weaving"})]})}),
/* @__PURE__ */a.jsx("button",{onClick:()=>setShowAdvanced(!1),disabled:i,className:"px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50",children:"Quick Mode"})]}):/* @__PURE__ */a.jsx(a.Fragment,{children:/* @__PURE__ */a.jsx("button",{onClick:()=>setShowAdvanced(!0),disabled:i,className:"flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50",children:/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx(f,{className:"h-4 w-4"}),
/* @__PURE__ */a.jsx("span",{children:"Advanced Mode"})]})})})}),
/* @__PURE__ */a.jsxs("div",{className:"text-center text-xs text-gray-500 flex items-center justify-center space-x-2",children:[
/* @__PURE__ */a.jsx(n,{className:"h-3 w-3"}),
/* @__PURE__ */a.jsxs("span",{children:["Time spent: ",(e=>{const a=Math.floor(e/1e3),s=Math.floor(a/60),t=a%60;return s>0?`${s}m ${t}s`:t+"s"})(E)]})]})]})]})}const $=async()=>{try{const{data:e}=await R.get("/api/weaving/status");return e}catch(e){throw Error("Failed to fetch weaving status")}},K=async e=>{try{const{data:a}=await R.post("/api/weaving/claim/"+e);return a}catch(a){throw a}},Q=async e=>{const{thread_id:a,category:s,reasoning:t,action_plan:r,difficulty_rating:l}=e;if(!s||!t)throw Error("Category and reasoning are required");if(20>t.length)throw Error("Reasoning must be at least 20 characters long");try{const{data:e}=await R.post("/api/weaving/submit/"+a,{category:s,reasoning:t,action_plan:r,difficulty_rating:l});return e}catch(i){throw i}},H=async()=>{try{const{data:e}=await R.get("/api/users/me");return e}catch(e){throw e}},z=async()=>{try{const{data:e}=await R.get("/api/weaving/analytics");return e}catch(e){return null}},O=[{id:"Environment",name:"Environment",icon:o,color:"green",emoji:"🌱"},{id:"Social Good",name:"Social Good",icon:E,color:"pink",emoji:"🤝"},{id:"Technology",name:"Technology",icon:W,color:"blue",emoji:"💻"},{id:"Education",name:"Education",icon:L,color:"purple",emoji:"📚"},{id:"Health",name:"Health",icon:b,color:"red",emoji:"❤️"},{id:"Other",name:"Other",icon:v,color:"gray",emoji:"✨"}],B={quick:{label:"Quick Mode",description:"Fast categorization with standard rewards",minChars:20,baseReward:{min:3,max:8}},advanced:{label:"Advanced Mode",description:"Detailed analysis with bonus rewards",minChars:50,baseReward:{min:8,max:15}}};class G extends q.Component{constructor(e){super(e),this.state={hasError:!1,error:null}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,a){}render(){return this.state.hasError?/* @__PURE__ */a.jsxs("div",{className:"max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center",children:[
/* @__PURE__ */a.jsx(T,{className:"h-12 w-12 text-red-500 mx-auto mb-4"}),
/* @__PURE__ */a.jsx("h3",{className:"text-lg font-semibold text-red-900 mb-2",children:"Weaving Error"}),
/* @__PURE__ */a.jsx("p",{className:"text-red-700 mb-4",children:"Something went wrong with the weaving experience."}),
/* @__PURE__ */a.jsx("button",{onClick:()=>window.location.reload(),className:"bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Reload Page"})]}):this.props.children}}function U(){const t=_(),[n,d]=e.useState(null),[m,g]=e.useState(null),[h,u]=e.useState(null),[b,v]=e.useState("loom"),[j,w]=e.useState(!1),[N,f]=e.useState("weekly"),[E,W]=e.useState(!0),{data:q,isLoading:P,isError:D,error:I,refetch:U}=S({queryKey:["weavingStatus"],queryFn:$,refetchInterval:!!E&&3e4,staleTime:1e4,retry:3,retryDelay:e=>Math.min(1e3*2**e,3e4),onError:e=>{}}),{data:Y=[],isLoading:V,refetch:X,isFetching:J}=S({queryKey:["availableThreads",m,h],queryFn:()=>(async({category:e=null,limit:a=5,quality_min:s=null}={})=>{const t=new URLSearchParams;e&&t.append("category",e),s&&t.append("quality_min",s.toString()),t.append("limit",a.toString());try{const{data:e}=await R.get("/api/weaving/available-threads?"+t.toString());return e}catch(r){throw Error("Failed to fetch available threads")}})({category:m,limit:10,quality_min:h}),enabled:!0===(null==q?void 0:q.is_ready),staleTime:12e4,onError:e=>{}}),{data:Z}=S({queryKey:["userProfile"],queryFn:H,staleTime:3e5,retry:2}),{data:ee=[],isLoading:ae}=S({queryKey:["weavingLeaderboard",N],queryFn:()=>(async({period:e="weekly",limit:a=10}={})=>{try{const{data:s}=await R.get(`/api/weaving/leaderboard?period=${e}&limit=${a}`);return s}catch(s){return[]}})({period:N,limit:20}),staleTime:3e5,retry:2}),{data:se}=S({queryKey:["weavingAnalytics"],queryFn:z,staleTime:6e5,enabled:"analytics"===b}),{mutate:te,isPending:re}=C({mutationFn:K,onSuccess:e=>{d(e),v("weaving"),k.success("Thread claimed! Start weaving your impact.",{icon:"🧵",duration:3e3,style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"white"}}),window.gtag&&window.gtag("event","thread_claimed",{event_category:"weaving",event_label:e.category||"unknown"})},onError:e=>{var a,s,t,r;const l=(null==(s=null==(a=e.response)?void 0:a.data)?void 0:s.detail)||"Failed to claim thread. Please try again.";k.error(l,{icon:"❌",duration:4e3}),429===(null==(t=e.response)?void 0:t.status)?(U(),k.info("Cooldown active. Please wait before claiming another thread.",{icon:"⏳",duration:3e3})):404===(null==(r=e.response)?void 0:r.status)&&(X(),k.info("Thread no longer available. Refreshing available threads...",{icon:"🔄",duration:3e3}))},onSettled:()=>{setTimeout(()=>X(),1e3)}}),{mutate:le,isPending:ie}=C({mutationFn:Q,onSuccess:e=>{const a=`🎉 Weaving Complete! +${e.essence_earned} Essence`,s=e.xp_earned?`, +${e.xp_earned} XP`:"",r=e.streak>1?` (${e.streak} day streak!)`:"";k.success(a+s+r,{duration:6e3,style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"white",fontWeight:"bold",fontSize:"14px"}}),e.quality_bonus&&setTimeout(()=>{k.success("Quality Bonus Earned! Excellent categorization! 🌟",{icon:"⭐",duration:4e3,style:{background:"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",color:"white"}})},1500),e.streak&&[7,30,100].includes(e.streak)&&setTimeout(()=>{k.success(`🔥 ${e.streak} Day Streak Milestone! You're on fire!`,{icon:"🔥",duration:5e3,style:{background:"linear-gradient(135deg, #fa709a 0%, #fee140 100%)",color:"white"}})},2500),t.invalidateQueries({queryKey:["weavingStatus"]}),t.invalidateQueries({queryKey:["userProfile"]}),t.invalidateQueries({queryKey:["availableThreads"]}),t.invalidateQueries({queryKey:["weavingLeaderboard"]}),t.invalidateQueries({queryKey:["weavingAnalytics"]}),t.invalidateQueries({queryKey:["userDashboard"]}),window.gtag&&window.gtag("event","weaving_completed",{event_category:"weaving",event_label:e.category||"unknown",value:e.essence_earned}),setTimeout(()=>{d(null),v("loom")},1e3)},onError:e=>{var a,s;const t=(null==(s=null==(a=e.response)?void 0:a.data)?void 0:s.detail)||e.message||"Failed to submit weaving. Please try again.";k.error(t,{icon:"❌",duration:5e3}),e.message.includes("characters long")&&k.info("💡 Tip: Provide more detailed reasoning for better rewards!",{duration:4e3})}});e.useEffect(()=>{if(q&&!q.is_ready&&q.time_remaining_seconds>0){const e=q.time_remaining_seconds,a=setTimeout(()=>{U()},1e3*(e+2));return()=>clearTimeout(a)}},[q,U]);const ne=e.useCallback(()=>q&&Z?{essence_balance:q.essence_balance||0,daily_weaves_completed:q.daily_weaves_completed||0,daily_weaves_limit:q.daily_weaves_limit||10,streak:q.streak||0,level:Z.level||1,total_weaves:Z.total_weaves||0,best_streak:Z.best_weaving_streak||0,essence_earned_today:q.essence_earned_today||0,next_level_xp:Z.next_level_xp||1e3,current_xp:Z.xp||0}:null,[q,Z]),de=e.useCallback(()=>{var e;if(!D)return null;const s=(null==(e=null==I?void 0:I.message)?void 0:e.includes("Network Error"))||"NETWORK_ERROR"===(null==I?void 0:I.code);/* @__PURE__ */
return a.jsxs("div",{className:"max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center",children:[
/* @__PURE__ */a.jsx(T,{className:"h-12 w-12 text-red-500 mx-auto mb-4"}),
/* @__PURE__ */a.jsx("h3",{className:"text-lg font-semibold text-red-900 dark:text-red-200 mb-2",children:s?"Connection Error":"Weaving Loom Error"}),
/* @__PURE__ */a.jsx("p",{className:"text-red-700 dark:text-red-300 mb-4",children:s?"Unable to connect to the Impact Weaving Loom. Please check your internet connection.":(null==I?void 0:I.message)||"Could not load the weaving experience."}),
/* @__PURE__ */a.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */a.jsxs("button",{onClick:()=>U(),className:"w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500",children:[
/* @__PURE__ */a.jsx(x,{className:"h-4 w-4 inline mr-2"}),"Try Again"]}),s&&/* @__PURE__ */a.jsx("button",{onClick:()=>window.location.reload(),className:"w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors",children:"Reload Page"})]})]})},[D,I,U]),oe=e.useCallback(()=>/* @__PURE__ */a.jsxs("div",{className:"max-w-md mx-auto text-center py-12",children:[
/* @__PURE__ */a.jsxs("div",{className:"relative",children:[
/* @__PURE__ */a.jsx("div",{className:"animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"}),
/* @__PURE__ */a.jsx(s,{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600"})]}),
/* @__PURE__ */a.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2",children:"Connecting to the Loom"}),
/* @__PURE__ */a.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Preparing your weaving experience..."}),
/* @__PURE__ */a.jsx("div",{className:"mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */a.jsx("div",{className:"bg-purple-600 h-2 rounded-full animate-pulse",style:{width:"70%"}})})]}),[]),ce=e.useCallback(()=>{if(P)return oe();if(D)return de();const e=ne();switch(b){case"weaving":return n?/* @__PURE__ */a.jsx(M,{thread:n,onSubmit:le,submitting:ie,userStats:e,showAdvanced:j,estimatedReward:B[j?"advanced":"quick"].baseReward,categories:O,onBack:()=>v("loom")}):(v("loom"),null);case"leaderboard":return xe();case"stats":return me();case"analytics":return ge();default:/* @__PURE__ */
return a.jsx(A,{status:q,onClaim:te,claiming:re,availableThreads:Y,threadsLoading:V||J,userStats:e,leaderboard:ee.slice(0,5),onCategoryFilter:g,selectedCategory:m,onQualityFilter:u,qualityFilter:h,onRefreshThreads:X,categories:O,autoRefresh:E,onAutoRefreshToggle:W})}},[P,D,b,n,j,le,ie,ne,te,re,Y,V,J,ee,m,h,X,E,oe,de]),xe=e.useCallback(()=>/* @__PURE__ */a.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */a.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx(i,{className:"h-8 w-8 text-yellow-500"}),
/* @__PURE__ */a.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:"Weaving Leaderboard"})]}),
/* @__PURE__ */a.jsx("button",{onClick:()=>v("loom"),className:"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1",children:"← Back to Loom"})]}),
/* @__PURE__ */a.jsx("div",{className:"flex space-x-2 mb-6",children:["daily","weekly","monthly","all_time"].map(e=>/* @__PURE__ */a.jsx("button",{onClick:()=>f(e),className:"px-3 py-1 text-sm font-medium rounded-md transition-colors "+(N===e?"bg-blue-600 text-white":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"),children:e.replace("_"," ").replace(/\b\w/g,e=>e.toUpperCase())},e))}),
/* @__PURE__ */a.jsx("div",{className:"space-y-3",children:ae?/* @__PURE__ */a.jsx("div",{className:"space-y-3",children:[1,2,3,4,5].map(e=>/* @__PURE__ */a.jsxs("div",{className:"animate-pulse flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg",children:[
/* @__PURE__ */a.jsx("div",{className:"w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"}),
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsx("div",{className:"h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"}),
/* @__PURE__ */a.jsx("div",{className:"h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"})]})]},e))}):ee.length>0?ee.map((e,s)=>/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors",children:[
/* @__PURE__ */a.jsx("div",{className:"w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm "+(0===s?"bg-gradient-to-br from-yellow-400 to-yellow-600":1===s?"bg-gradient-to-br from-gray-400 to-gray-600":2===s?"bg-gradient-to-br from-amber-600 to-amber-800":"bg-gradient-to-br from-blue-500 to-blue-700"),children:0===s?"👑":s+1}),
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100",children:[e.username,3>s&&/* @__PURE__ */a.jsxs("span",{className:"ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",children:["Top ",s+1]})]}),
/* @__PURE__ */a.jsxs("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:[e.weave_count," weaves • ",e.total_essence," essence earned"]})]}),
/* @__PURE__ */a.jsx("div",{className:"text-right",children:/* @__PURE__ */a.jsxs("div",{className:"text-lg font-bold text-gray-900 dark:text-gray-100",children:["#",e.rank||s+1]})})]},e.username)):/* @__PURE__ */a.jsxs("div",{className:"text-center py-8",children:[
/* @__PURE__ */a.jsx(c,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),
/* @__PURE__ */a.jsx("p",{className:"text-gray-500 dark:text-gray-400",children:"No leaderboard data available for this period."})]})})]})}),[ee,ae,N]),me=e.useCallback(()=>{const e=ne();/* @__PURE__ */
return a.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */a.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx(y,{className:"h-8 w-8 text-blue-500"}),
/* @__PURE__ */a.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:"Your Weaving Journey"})]}),
/* @__PURE__ */a.jsx("button",{onClick:()=>v("loom"),className:"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1",children:"← Back to Loom"})]}),e?/* @__PURE__ */a.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 text-center border border-purple-200 dark:border-purple-700",children:[
/* @__PURE__ */a.jsx(s,{className:"h-10 w-10 text-purple-600 mx-auto mb-3"}),
/* @__PURE__ */a.jsx("div",{className:"text-3xl font-bold text-purple-900 dark:text-purple-100",children:e.essence_balance.toLocaleString()}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-purple-600 dark:text-purple-300",children:"Total Essence"}),e.essence_earned_today>0&&/* @__PURE__ */a.jsxs("div",{className:"text-xs text-purple-500 dark:text-purple-400 mt-1",children:["+",e.essence_earned_today," today"]})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 text-center border border-blue-200 dark:border-blue-700",children:[
/* @__PURE__ */a.jsx(r,{className:"h-10 w-10 text-blue-600 mx-auto mb-3"}),
/* @__PURE__ */a.jsx("div",{className:"text-3xl font-bold text-blue-900 dark:text-blue-100",children:e.total_weaves.toLocaleString()}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-blue-600 dark:text-blue-300",children:"Total Weaves"}),
/* @__PURE__ */a.jsxs("div",{className:"text-xs text-blue-500 dark:text-blue-400 mt-1",children:[e.daily_weaves_completed,"/",e.daily_weaves_limit," today"]})]}),
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 text-center border border-red-200 dark:border-red-700",children:[
/* @__PURE__ */a.jsx(l,{className:"h-10 w-10 text-red-600 mx-auto mb-3"}),
/* @__PURE__ */a.jsx("div",{className:"text-3xl font-bold text-red-900 dark:text-red-100",children:e.streak}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-red-600 dark:text-red-300",children:"Current Streak"}),
/* @__PURE__ */a.jsxs("div",{className:"text-xs text-red-500 dark:text-red-400 mt-1",children:["Best: ",e.best_streak," days"]})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsxs("div",{className:"flex justify-between items-center mb-2",children:[
/* @__PURE__ */a.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Daily Weaving Progress"}),
/* @__PURE__ */a.jsxs("span",{className:"text-sm text-gray-500 dark:text-gray-400",children:[e.daily_weaves_completed,"/",e.daily_weaves_limit]})]}),
/* @__PURE__ */a.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3",children:/* @__PURE__ */a.jsx("div",{className:"bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500",style:{width:Math.min(e.daily_weaves_completed/e.daily_weaves_limit*100,100)+"%"}})})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsxs("div",{className:"flex justify-between items-center mb-2",children:[
/* @__PURE__ */a.jsxs("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:["Level ",e.level," Progress"]}),
/* @__PURE__ */a.jsxs("span",{className:"text-sm text-gray-500 dark:text-gray-400",children:[e.current_xp,"/",e.next_level_xp," XP"]})]}),
/* @__PURE__ */a.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3",children:/* @__PURE__ */a.jsx("div",{className:"bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500",style:{width:Math.min(e.current_xp/e.next_level_xp*100,100)+"%"}})})]})]}),
/* @__PURE__ */a.jsxs("div",{className:"border-t border-gray-200 dark:border-gray-700 pt-6",children:[
/* @__PURE__ */a.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4",children:"Recent Achievements"}),
/* @__PURE__ */a.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[{milestone:10,achieved:e.total_weaves>=10,label:"First 10 Weaves"},{milestone:50,achieved:e.total_weaves>=50,label:"50 Weaves"},{milestone:7,achieved:e.streak>=7,label:"7-Day Streak"},{milestone:1e3,achieved:e.essence_balance>=1e3,label:"1K Essence"}].map((e,s)=>/* @__PURE__ */a.jsxs("div",{className:"p-3 rounded-lg text-center border "+(e.achieved?"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700":"bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"),children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl mb-1 "+(e.achieved?"text-green-600":"text-gray-400"),children:e.achieved?"✅":"⏳"}),
/* @__PURE__ */a.jsx("div",{className:"text-xs font-medium "+(e.achieved?"text-green-700 dark:text-green-300":"text-gray-500 dark:text-gray-400"),children:e.label})]},s))})]})]}):/* @__PURE__ */a.jsxs("div",{className:"text-center py-8",children:[
/* @__PURE__ */a.jsx(y,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),
/* @__PURE__ */a.jsx("p",{className:"text-gray-500 dark:text-gray-400",children:"Loading your weaving statistics..."})]})]})})},[ne]),ge=e.useCallback(()=>/* @__PURE__ */a.jsx("div",{className:"max-w-6xl mx-auto",children:/* @__PURE__ */a.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */a.jsx(L,{className:"h-8 w-8 text-indigo-500"}),
/* @__PURE__ */a.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:"Weaving Analytics"})]}),
/* @__PURE__ */a.jsx("button",{onClick:()=>v("loom"),className:"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors",children:"← Back to Loom"})]}),se?/* @__PURE__ */a.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6",children:[
/* @__PURE__ */a.jsx("h3",{className:"font-semibold text-indigo-900 dark:text-indigo-100 mb-4",children:"Platform Impact"}),
/* @__PURE__ */a.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-indigo-600",children:se.total_threads_woven||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-indigo-500",children:"Total Threads Woven"})]}),
/* @__PURE__ */a.jsxs("div",{children:[
/* @__PURE__ */a.jsx("div",{className:"text-2xl font-bold text-indigo-600",children:se.active_weavers||0}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-indigo-500",children:"Active Weavers"})]})]})]})}):/* @__PURE__ */a.jsx("div",{className:"text-center py-8",children:/* @__PURE__ */a.jsx("p",{className:"text-gray-500 dark:text-gray-400",children:"Loading analytics..."})})]})}),[se]),he=e.useMemo(()=>[{key:"loom",label:"Weaving Loom",icon:o,description:"Claim and weave threads"},{key:"leaderboard",label:"Leaderboard",icon:c,description:"Top weavers rankings"},{key:"stats",label:"My Stats",icon:y,description:"Your weaving progress"},{key:"analytics",label:"Analytics",icon:L,description:"Platform insights"}],[]),ue=e.useMemo(()=>[{name:"Dashboard",href:"/dashboard"},{name:"Weaving Loom",href:"/weaving"}],[]);/* @__PURE__ */
return a.jsx(G,{children:/* @__PURE__ */a.jsx(F,{showBreadcrumbs:!0,breadcrumbItems:ue,children:/* @__PURE__ */a.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */a.jsxs("div",{className:"bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */a.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */a.jsxs("h1",{className:"text-3xl font-bold mb-2 flex items-center",children:[
/* @__PURE__ */a.jsx(s,{className:"h-8 w-8 mr-3 text-yellow-300"}),"Impact Weaving Loom"]}),
/* @__PURE__ */a.jsx("p",{className:"text-purple-100 text-lg",children:"Transform raw impact threads into meaningful categorizations and earn essence"})]}),
/* @__PURE__ */a.jsx("div",{className:"text-right hidden md:block",children:/* @__PURE__ */a.jsxs("div",{className:"bg-white bg-opacity-20 rounded-lg p-4",children:[
/* @__PURE__ */a.jsx(s,{className:"h-12 w-12 mx-auto mb-2 text-yellow-300"}),
/* @__PURE__ */a.jsx("div",{className:"text-sm text-purple-100",children:"Earn Essence"}),
/* @__PURE__ */a.jsxs("div",{className:"text-xs text-purple-200 mt-1",children:[(null==q?void 0:q.essence_balance)||0," current"]})]})})]}),
/* @__PURE__ */a.jsx("div",{className:"flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1",children:he.map(e=>{const s=e.icon,t=b===e.key,r="weaving"===b&&"weaving"!==e.key;/* @__PURE__ */
return a.jsxs("button",{onClick:()=>!r&&v(e.key),disabled:r,className:"flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 "+(t?"bg-white text-purple-600 shadow-sm":r?"text-purple-300 cursor-not-allowed opacity-50":"text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10"),title:r?"Finish weaving to access":e.description,children:[
/* @__PURE__ */a.jsx(s,{className:"h-4 w-4"}),
/* @__PURE__ */a.jsx("span",{children:e.label})]},e.key)})})]}),"loom"===b&&(null==q?void 0:q.is_ready)&&/* @__PURE__ */a.jsx("div",{className:"flex justify-center",children:/* @__PURE__ */a.jsx("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4",children:/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-4",children:[
/* @__PURE__ */a.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Weaving Mode:"}),
/* @__PURE__ */a.jsx("div",{className:"flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1",children:Object.entries(B).map(([e,s])=>/* @__PURE__ */a.jsx("button",{onClick:()=>w("advanced"===e),className:"px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 "+(j&&"advanced"===e||!j&&"quick"===e?"bg-blue-600 text-white shadow-sm":"text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"),children:s.label},e))}),
/* @__PURE__ */a.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */a.jsx(p,{className:"h-4 w-4 text-gray-400"}),
/* @__PURE__ */a.jsx("span",{className:"text-xs text-gray-500 dark:text-gray-400 max-w-xs",children:B[j?"advanced":"quick"].description})]})]})})}),
/* @__PURE__ */a.jsx("div",{className:"min-h-[500px]",children:ce()})]})})})}export{U as default};
