import{a as e,j as s,F as a,a4 as r,M as t,a5 as l,N as d,a6 as i,Z as n,f as c,K as x,C as o,h as m,q as g,V as h}from"./react-vendor-JLH1r332.js";import{u as b}from"./auth-chunk-CmjlQMUy.js";import{L as y,T as j}from"./tasks-chunk-BIljiLKS.js";import{B as u,L as p}from"./gamification-chunk-BIB9JNYa.js";import{a as N}from"./utils-chunk-CyH00Vps.js";import"./vendor-D5qaWewk.js";import"./http-vendor-CIEU9v4G.js";const f=async()=>{const{data:e}=await N.get("/api/dashboard");return e},v=async()=>{const{data:e}=await N.get("/api/users/achievements/recent",{params:{limit:3}});return e},k=({dashboardData:e})=>{var a,o;const{user:m}=b();if(!m)return null;const g=(h=m.xp||0,1e3*(Math.floor(h/1e3)+1));var h;const y=(e=>(e-1e3*Math.floor(e/1e3))/1e3*100)(m.xp||0),j=Math.floor((m.xp||0)/1e3)+1;/* @__PURE__ */
return s.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center space-x-4 mb-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"relative",children:[
/* @__PURE__ */s.jsx("div",{className:"h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center",children:/* @__PURE__ */s.jsx("span",{className:"text-white font-bold text-xl",children:(null==(o=null==(a=m.username)?void 0:a.charAt(0))?void 0:o.toUpperCase())||"U"})}),m.is_verified&&/* @__PURE__ */s.jsx("div",{className:"absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center",children:/* @__PURE__ */s.jsx(t,{className:"h-4 w-4 text-white"})})]}),
/* @__PURE__ */s.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */s.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100 truncate",children:m.username}),
/* @__PURE__ */s.jsxs("span",{className:"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",children:["Level ",j]})]}),
/* @__PURE__ */s.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400 truncate",children:m.email}),m.streak>0&&/* @__PURE__ */s.jsxs("div",{className:"flex items-center mt-1",children:[
/* @__PURE__ */s.jsx(l,{className:"h-4 w-4 text-orange-500 mr-1"}),
/* @__PURE__ */s.jsxs("span",{className:"text-sm font-medium text-orange-600 dark:text-orange-400",children:[m.streak," day streak!"]})]})]})]}),
/* @__PURE__ */s.jsxs("div",{className:"mb-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */s.jsxs("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:["Level ",j," Progress"]}),
/* @__PURE__ */s.jsxs("span",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(m.xp||0).toLocaleString()," / ",g.toLocaleString()," XP"]})]}),
/* @__PURE__ */s.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3",children:/* @__PURE__ */s.jsx("div",{className:"bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500",style:{width:y+"%"}})}),
/* @__PURE__ */s.jsxs("p",{className:"text-xs text-gray-500 dark:text-gray-400 mt-1",children:[(g-(m.xp||0)).toLocaleString()," XP to next level"]})]}),
/* @__PURE__ */s.jsxs("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-center mb-1",children:[
/* @__PURE__ */s.jsx(t,{className:"h-5 w-5 text-blue-600 dark:text-blue-400 mr-1"}),
/* @__PURE__ */s.jsx("div",{className:"text-xl font-bold text-blue-600 dark:text-blue-400",children:m.task_count||0})]}),
/* @__PURE__ */s.jsx("div",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Tasks Completed"})]}),
/* @__PURE__ */s.jsxs("div",{className:"text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-center mb-1",children:[
/* @__PURE__ */s.jsx(r,{className:"h-5 w-5 text-purple-600 dark:text-purple-400 mr-1"}),
/* @__PURE__ */s.jsx("div",{className:"text-xl font-bold text-purple-600 dark:text-purple-400",children:m.essence_balance||0})]}),
/* @__PURE__ */s.jsx("div",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Essence"})]}),
/* @__PURE__ */s.jsxs("div",{className:"text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-center mb-1",children:[
/* @__PURE__ */s.jsx(i,{className:"h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-1"}),
/* @__PURE__ */s.jsx("div",{className:"text-xl font-bold text-yellow-600 dark:text-yellow-400",children:m.badge_count||0})]}),
/* @__PURE__ */s.jsx("div",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Badges"})]}),
/* @__PURE__ */s.jsxs("div",{className:"text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-center mb-1",children:[
/* @__PURE__ */s.jsx(d,{className:"h-5 w-5 text-green-600 dark:text-green-400 mr-1"}),
/* @__PURE__ */s.jsx("div",{className:"text-xl font-bold text-green-600 dark:text-green-400",children:m.xp||0})]}),
/* @__PURE__ */s.jsx("div",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Total XP"})]})]}),
/* @__PURE__ */s.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
/* @__PURE__ */s.jsxs(n,{to:"/profile",className:"flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors",children:[
/* @__PURE__ */s.jsx(c,{className:"h-4 w-4"}),
/* @__PURE__ */s.jsx("span",{children:"Profile"})]}),
/* @__PURE__ */s.jsxs(n,{to:"/leaderboard",className:"flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors",children:[
/* @__PURE__ */s.jsx(x,{className:"h-4 w-4"}),
/* @__PURE__ */s.jsx("span",{children:"Rankings"})]})]})]})},w=({dashboardData:e})=>{if(!(null==e?void 0:e.daily_goals))return null;const{daily_goals:a}=e;/* @__PURE__ */
return s.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */s.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100",children:"Daily Goals"}),
/* @__PURE__ */s.jsx(o,{className:"h-5 w-5 text-gray-400"})]}),
/* @__PURE__ */s.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */s.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Complete Tasks"}),
/* @__PURE__ */s.jsxs("span",{className:"text-sm text-gray-600 dark:text-gray-400",children:[a.tasks_completed||0," / ",a.tasks_target||3]})]}),
/* @__PURE__ */s.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */s.jsx("div",{className:"bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500",style:{width:Math.min((a.tasks_completed||0)/(a.tasks_target||3)*100,100)+"%"}})})]}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */s.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Earn XP"}),
/* @__PURE__ */s.jsxs("span",{className:"text-sm text-gray-600 dark:text-gray-400",children:[a.xp_earned||0," / ",a.xp_target||100]})]}),
/* @__PURE__ */s.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */s.jsx("div",{className:"bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500",style:{width:Math.min((a.xp_earned||0)/(a.xp_target||100)*100,100)+"%"}})})]}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */s.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Maintain Streak"}),
/* @__PURE__ */s.jsx("span",{className:"text-sm text-gray-600 dark:text-gray-400",children:a.streak_maintained?"Maintained":"Pending"})]}),
/* @__PURE__ */s.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */s.jsx("div",{className:"h-2 rounded-full transition-all duration-500 "+(a.streak_maintained?"bg-gradient-to-r from-orange-500 to-red-500 w-full":"bg-gray-300 dark:bg-gray-600 w-0")})})]})]}),a.all_completed&&/* @__PURE__ */s.jsx("div",{className:"mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */s.jsx(t,{className:"h-5 w-5 text-green-600 dark:text-green-400 mr-2"}),
/* @__PURE__ */s.jsx("span",{className:"text-sm font-medium text-green-800 dark:text-green-200",children:"All daily goals completed! 🎉"})]})})]})},_=()=>{const{data:a,isLoading:r}=e({queryKey:["recentAchievements"],queryFn:v,onError:e=>{}});return r?/* @__PURE__ */s.jsx("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:/* @__PURE__ */s.jsxs("div",{className:"animate-pulse space-y-4",children:[
/* @__PURE__ */s.jsx("div",{className:"h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"}),
/* @__PURE__ */s.jsx("div",{className:"space-y-3",children:[...[,,,]].map((e,a)=>/* @__PURE__ */s.jsx("div",{className:"h-16 bg-gray-200 dark:bg-gray-700 rounded"},a))})]})}):a&&0!==a.length?/* @__PURE__ */s.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */s.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100",children:"Recent Achievements"}),
/* @__PURE__ */s.jsx(n,{to:"/badges",className:"text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",children:"View All"})]}),
/* @__PURE__ */s.jsx("div",{className:"space-y-3",children:a.map((e,a)=>/* @__PURE__ */s.jsxs("div",{className:"flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800",children:[
/* @__PURE__ */s.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */s.jsx("div",{className:"h-10 w-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center",children:/* @__PURE__ */s.jsx(d,{className:"h-6 w-6 text-white"})})}),
/* @__PURE__ */s.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */s.jsx("p",{className:"text-sm font-medium text-gray-900 dark:text-gray-100",children:e.badge_title||e.title}),
/* @__PURE__ */s.jsxs("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:["Earned ",new Date(e.awarded_at||e.created_at).toLocaleDateString()]})]}),e.xp_reward&&/* @__PURE__ */s.jsxs("div",{className:"text-sm font-medium text-yellow-600 dark:text-yellow-400",children:["+",e.xp_reward," XP"]})]},a))})]}):/* @__PURE__ */s.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */s.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4",children:"Recent Achievements"}),
/* @__PURE__ */s.jsxs("div",{className:"text-center py-6",children:[
/* @__PURE__ */s.jsx(g,{className:"h-12 w-12 text-gray-300 mx-auto mb-3"}),
/* @__PURE__ */s.jsx("p",{className:"text-gray-500 dark:text-gray-400 text-sm",children:"Complete tasks to earn your first achievement!"})]})]})},D=({dashboardData:e})=>{var a,r;if(!e)return null;const t=[{label:"This Week",value:(null==(a=e.this_week_stats)?void 0:a.tasks_completed)||0,icon:m,color:"text-green-600 dark:text-green-400",bgColor:"bg-green-50 dark:bg-green-900/20"},{label:"This Month",value:(null==(r=e.this_month_stats)?void 0:r.xp_earned)||0,icon:g,color:"text-blue-600 dark:text-blue-400",bgColor:"bg-blue-50 dark:bg-blue-900/20",suffix:" XP"},{label:"Global Rank",value:e.global_rank||"Unranked",icon:x,color:"text-purple-600 dark:text-purple-400",bgColor:"bg-purple-50 dark:bg-purple-900/20",prefix:"#"}];/* @__PURE__ */
return s.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */s.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4",children:"Activity Summary"}),
/* @__PURE__ */s.jsx("div",{className:"grid grid-cols-1 gap-4",children:t.map((e,a)=>{const r=e.icon;/* @__PURE__ */
return s.jsx("div",{className:e.bgColor+" p-4 rounded-lg",children:/* @__PURE__ */s.jsx("div",{className:"flex items-center justify-between",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */s.jsx(r,{className:"h-6 w-6 "+e.color}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsx("p",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:e.label}),
/* @__PURE__ */s.jsxs("p",{className:"text-lg font-bold "+e.color,children:[e.prefix,e.value,e.suffix]})]})]})})},a)})})]})};function L(){const{user:i,loading:n}=b(),{data:c,isLoading:x}=e({queryKey:["userDashboard"],queryFn:f,enabled:!!i,refetchInterval:6e4,onError:e=>{h.error("Failed to load dashboard data")}});return n||x?/* @__PURE__ */s.jsx(y,{children:/* @__PURE__ */s.jsx("div",{className:"flex items-center justify-center min-h-[60vh]",children:/* @__PURE__ */s.jsxs("div",{className:"flex flex-col items-center space-y-4",children:[
/* @__PURE__ */s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"}),
/* @__PURE__ */s.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Loading your dashboard..."})]})})}):i?/* @__PURE__ */s.jsx(y,{children:/* @__PURE__ */s.jsx("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900",children:/* @__PURE__ */s.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[
/* @__PURE__ */s.jsxs("div",{className:"mb-8",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsxs("h1",{className:"text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight",children:["Welcome back, ",i.username,"! 👋"]}),
/* @__PURE__ */s.jsx("p",{className:"mt-1 text-lg text-gray-600 dark:text-gray-400",children:"Ready to make an impact today?"})]}),(null==c?void 0:c.is_new_user)&&/* @__PURE__ */s.jsx("div",{className:"hidden lg:block",children:/* @__PURE__ */s.jsxs("div",{className:"bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg",children:[
/* @__PURE__ */s.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */s.jsx(r,{className:"h-5 w-5"}),
/* @__PURE__ */s.jsx("span",{className:"font-medium",children:"New to Impact ID?"})]}),
/* @__PURE__ */s.jsx("p",{className:"text-sm mt-1 opacity-90",children:"Complete your first task to get started!"})]})})]}),c&&/* @__PURE__ */s.jsxs("div",{className:"mt-6 grid grid-cols-2 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */s.jsx("div",{className:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */s.jsx(t,{className:"h-8 w-8 text-green-500 mr-3"}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsx("p",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:c.tasks_completed_today||0}),
/* @__PURE__ */s.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Today"})]})]})}),
/* @__PURE__ */s.jsx("div",{className:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */s.jsx(l,{className:"h-8 w-8 text-orange-500 mr-3"}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsx("p",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:i.streak||0}),
/* @__PURE__ */s.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Streak"})]})]})}),
/* @__PURE__ */s.jsx("div",{className:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */s.jsx(d,{className:"h-8 w-8 text-yellow-500 mr-3"}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsx("p",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:Math.floor((i.xp||0)/1e3)+1}),
/* @__PURE__ */s.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Level"})]})]})}),
/* @__PURE__ */s.jsx("div",{className:"bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",children:/* @__PURE__ */s.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */s.jsx(r,{className:"h-8 w-8 text-purple-500 mr-3"}),
/* @__PURE__ */s.jsxs("div",{children:[
/* @__PURE__ */s.jsx("p",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100",children:i.essence_balance||0}),
/* @__PURE__ */s.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Essence"})]})]})})]})]}),
/* @__PURE__ */s.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-4 gap-8 items-start",children:[
/* @__PURE__ */s.jsx("div",{className:"xl:col-span-2 space-y-8",children:/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"task-list-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"task-list-title",className:"sr-only",children:"Your Daily Tasks"}),
/* @__PURE__ */s.jsx(j,{})]})}),
/* @__PURE__ */s.jsxs("div",{className:"xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-8",children:[
/* @__PURE__ */s.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"profile-summary-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"profile-summary-title",className:"sr-only",children:"Profile Summary"}),
/* @__PURE__ */s.jsx(k,{dashboardData:c})]}),
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"daily-goals-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"daily-goals-title",className:"sr-only",children:"Daily Goals"}),
/* @__PURE__ */s.jsx(w,{dashboardData:c})]}),
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"activity-summary-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"activity-summary-title",className:"sr-only",children:"Activity Summary"}),
/* @__PURE__ */s.jsx(D,{dashboardData:c})]})]}),
/* @__PURE__ */s.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"achievements-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"achievements-title",className:"sr-only",children:"Recent Achievements"}),
/* @__PURE__ */s.jsx(_,{})]}),
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"badges-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"badges-title",className:"sr-only",children:"Your Badges"}),
/* @__PURE__ */s.jsx(u,{})]}),
/* @__PURE__ */s.jsxs("section",{"aria-labelledby":"leaderboard-title",children:[
/* @__PURE__ */s.jsx("h2",{id:"leaderboard-title",className:"sr-only",children:"Leaderboard"}),
/* @__PURE__ */s.jsx(p,{})]})]})]})]})]})})}):/* @__PURE__ */s.jsx(y,{children:/* @__PURE__ */s.jsx("div",{className:"flex items-center justify-center min-h-[60vh]",children:/* @__PURE__ */s.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */s.jsx(a,{className:"mx-auto h-12 w-12 text-red-400 mb-4"}),
/* @__PURE__ */s.jsx("h2",{className:"text-xl font-semibold text-gray-900 dark:text-gray-100",children:"Unable to load dashboard"}),
/* @__PURE__ */s.jsx("p",{className:"text-gray-600 dark:text-gray-400 mt-2",children:"Please try refreshing the page or logging in again"}),
/* @__PURE__ */s.jsx("button",{onClick:()=>window.location.reload(),className:"mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700",children:"Refresh Page"})]})})})}export{L as default};
