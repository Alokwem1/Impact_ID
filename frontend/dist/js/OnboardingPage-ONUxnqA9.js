import{r as e,U as a,j as t,a8 as s,_ as r,q as l,V as n,aO as i,n as c,f as d,t as o}from"./react-vendor-JLH1r332.js";import{u as m}from"./auth-chunk-CmjlQMUy.js";import{u as x}from"./impact-id-wGSLtG8j.js";import{a as u}from"./utils-chunk-CyH00Vps.js";import"./vendor-D5qaWewk.js";import"./http-vendor-CIEU9v4G.js";function h({isOpen:e,onClose:a,userData:s}){return x(),e?/* @__PURE__ */t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm",children:/* @__PURE__ */t.jsxs("div",{className:"bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 transform animate-fadeInUp",children:[
/* @__PURE__ */t.jsxs("div",{className:"relative mb-6",children:[
/* @__PURE__ */t.jsx("div",{className:"w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 animate-bounceGentle",children:/* @__PURE__ */t.jsx(o,{className:"w-10 h-10 text-white"})}),
/* @__PURE__ */t.jsx("div",{className:"absolute -top-2 -right-2 text-4xl animate-bounce",children:"🎉"}),
/* @__PURE__ */t.jsx("div",{className:"absolute -top-2 -left-2 text-4xl animate-bounce delay-300",children:"✨"})]}),
/* @__PURE__ */t.jsx("h2",{className:"text-3xl font-bold text-gradient-brand mb-2",children:"Welcome to Impact ID!"}),
/* @__PURE__ */t.jsxs("p",{className:"text-lg font-medium text-gray-800 dark:text-gray-200 mb-2",children:["Hey ",(null==s?void 0:s.fullName)||"there","! 👋"]}),
/* @__PURE__ */t.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:"Your journey to making a positive impact starts now. Let's change the world together!"}),
/* @__PURE__ */t.jsxs("div",{className:"grid grid-cols-3 gap-4 mb-6",children:[
/* @__PURE__ */t.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */t.jsx("div",{className:"w-12 h-12 bg-xp-100 dark:bg-xp-900/30 rounded-lg flex items-center justify-center mx-auto mb-2",children:/* @__PURE__ */t.jsx("span",{className:"text-xl",children:"🎯"})}),
/* @__PURE__ */t.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Start with"}),
/* @__PURE__ */t.jsx("p",{className:"font-bold text-xp-600",children:"0 XP"})]}),
/* @__PURE__ */t.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */t.jsx("div",{className:"w-12 h-12 bg-streak-100 dark:bg-streak-900/30 rounded-lg flex items-center justify-center mx-auto mb-2",children:/* @__PURE__ */t.jsx("span",{className:"text-xl",children:"🔥"})}),
/* @__PURE__ */t.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Streak"}),
/* @__PURE__ */t.jsx("p",{className:"font-bold text-streak-600",children:"0 days"})]}),
/* @__PURE__ */t.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */t.jsx("div",{className:"w-12 h-12 bg-essence-100 dark:bg-essence-900/30 rounded-lg flex items-center justify-center mx-auto mb-2",children:/* @__PURE__ */t.jsx("span",{className:"text-xl",children:"💎"})}),
/* @__PURE__ */t.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Essence"}),
/* @__PURE__ */t.jsx("p",{className:"font-bold text-essence-600",children:"0"})]})]}),
/* @__PURE__ */t.jsxs("button",{onClick:a,className:"w-full btn-impact bg-gradient-brand text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2",children:[
/* @__PURE__ */t.jsx("span",{children:"Start My Journey"}),
/* @__PURE__ */t.jsx(r,{className:"w-5 h-5"})]})]})}):null}function g({selectedCategories:e,onCategoryToggle:a}){/* @__PURE__ */
return t.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */t.jsxs("div",{className:"text-center mb-6",children:[
/* @__PURE__ */t.jsx("h3",{className:"text-xl font-bold text-gray-800 dark:text-gray-200 mb-2",children:"What impact areas interest you?"}),
/* @__PURE__ */t.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Choose one or more areas where you'd like to make a difference"})]}),
/* @__PURE__ */t.jsx("div",{className:"grid grid-cols-2 gap-3",children:[{id:"environment",name:"Environment",icon:"🌱",color:"bg-impact-environment",description:"Climate action & sustainability"},{id:"social",name:"Social Impact",icon:"🤝",color:"bg-impact-social",description:"Community & social justice"},{id:"technology",name:"Technology",icon:"💻",color:"bg-impact-technology",description:"Innovation & digital access"},{id:"education",name:"Education",icon:"📚",color:"bg-impact-education",description:"Learning & knowledge sharing"},{id:"health",name:"Health",icon:"❤️",color:"bg-impact-health",description:"Wellness & healthcare"},{id:"community",name:"Community",icon:"🏘️",color:"bg-impact-community",description:"Local & global communities"}].map(s=>/* @__PURE__ */t.jsxs("button",{onClick:()=>a(s.id),className:`\n                            p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden\n                            ${e.includes(s.id)?"border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20":"border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}\n                        `,children:[e.includes(s.id)&&/* @__PURE__ */t.jsx("div",{className:"absolute top-2 right-2",children:/* @__PURE__ */t.jsx(i,{className:"w-5 h-5 text-brand-blue"})}),
/* @__PURE__ */t.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */t.jsx("div",{className:`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white`,children:/* @__PURE__ */t.jsx("span",{className:"text-lg",children:s.icon})}),
/* @__PURE__ */t.jsxs("div",{children:[
/* @__PURE__ */t.jsx("p",{className:"font-semibold text-gray-800 dark:text-gray-200 text-sm",children:s.name}),
/* @__PURE__ */t.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:s.description})]})]})]},s.id))})]})}function b(){const[o,b]=e.useState(1),[p,j]=e.useState({fullName:"",username:"",bio:"",impactCategories:[]}),[y,f]=e.useState(!1),[N,v]=e.useState(!1),[w,k]=e.useState(null),[C,S]=e.useState(!1),{refetchUser:I}=m();x();const F=a();e.useEffect(()=>{const e=setTimeout(async()=>{if(3>p.username.length)k(null);else{S(!0);try{const e=await u.get("/users/check-username/"+p.username);k(e.data.available)}catch(e){k(!1)}finally{S(!1)}}},500);return()=>clearTimeout(e)},[p.username]);const U=e=>{j(a=>({...a,[e.target.name]:e.target.value}))},D=e=>{j(a=>({...a,impactCategories:a.impactCategories.includes(e)?a.impactCategories.filter(a=>a!==e):[...a.impactCategories,e]}))},T=()=>{switch(o){case 1:return p.fullName.trim().length>0;case 2:return p.username.trim().length>=3&&w;case 3:return!0;default:return!1}},E=()=>p.fullName.trim().length>0&&p.username.trim().length>=3&&w;/* @__PURE__ */
return t.jsxs(t.Fragment,{children:[
/* @__PURE__ */t.jsx("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8",children:/* @__PURE__ */t.jsxs("div",{className:"max-w-md w-full space-y-8",children:[
/* @__PURE__ */t.jsxs("div",{className:"mb-8",children:[
/* @__PURE__ */t.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */t.jsxs("span",{className:"text-sm font-medium text-gray-600 dark:text-gray-400",children:["Step ",o," of ",3]}),
/* @__PURE__ */t.jsxs("span",{className:"text-sm font-medium text-brand-blue",children:[Math.round(o/3*100),"%"]})]}),
/* @__PURE__ */t.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */t.jsx("div",{className:"bg-gradient-brand h-2 rounded-full transition-all duration-300 ease-out",style:{width:o/3*100+"%"}})})]}),
/* @__PURE__ */t.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */t.jsxs("div",{className:"flex items-center justify-center space-x-2 mb-4",children:[
/* @__PURE__ */t.jsx(s,{className:"w-8 h-8 text-brand-blue"}),
/* @__PURE__ */t.jsx("h1",{className:"text-2xl font-bold text-gradient-brand",children:"Impact ID"})]}),
/* @__PURE__ */t.jsx("h2",{className:"text-3xl font-bold text-gray-800 dark:text-gray-200",children:"Complete Your Profile"}),
/* @__PURE__ */t.jsx("p",{className:"text-gray-600 dark:text-gray-400 mt-2",children:"Let's set up your account to start making an impact"})]}),
/* @__PURE__ */t.jsx("div",{className:"card-impact",children:/* @__PURE__ */t.jsxs("form",{onSubmit:async e=>{var a,t;if(e.preventDefault(),!p.fullName||!p.username)return n.error("Full Name and Username are required.");if(!w)return n.error("Please choose an available username.");f(!0);try{await u.post("/users/onboarding",p),await I(),n.success("Welcome to Impact ID! 🎉"),v(!0)}catch(s){n.error((null==(t=null==(a=s.response)?void 0:a.data)?void 0:t.detail)||"Onboarding failed.")}finally{f(!1)}},className:"space-y-6",children:[(()=>{switch(o){case 1:/* @__PURE__ */
return t.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */t.jsxs("div",{className:"text-center mb-6",children:[
/* @__PURE__ */t.jsx("div",{className:"w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4",children:/* @__PURE__ */t.jsx(d,{className:"w-8 h-8 text-white"})}),
/* @__PURE__ */t.jsx("h3",{className:"text-xl font-bold text-gray-800 dark:text-gray-200 mb-2",children:"What should we call you?"}),
/* @__PURE__ */t.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Let's start with your name"})]}),
/* @__PURE__ */t.jsxs("div",{children:[
/* @__PURE__ */t.jsx("label",{htmlFor:"fullName",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Full Name"}),
/* @__PURE__ */t.jsx("input",{type:"text",id:"fullName",name:"fullName",value:p.fullName,onChange:U,placeholder:"Enter your full name",className:"input w-full",required:!0})]})]});case 2:/* @__PURE__ */
return t.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */t.jsxs("div",{className:"text-center mb-6",children:[
/* @__PURE__ */t.jsx("div",{className:"w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4",children:/* @__PURE__ */t.jsx("span",{className:"text-2xl",children:"@"})}),
/* @__PURE__ */t.jsx("h3",{className:"text-xl font-bold text-gray-800 dark:text-gray-200 mb-2",children:"Choose your username"}),
/* @__PURE__ */t.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"This is how others will find you on Impact ID"})]}),
/* @__PURE__ */t.jsxs("div",{children:[
/* @__PURE__ */t.jsx("label",{htmlFor:"username",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Username"}),
/* @__PURE__ */t.jsxs("div",{className:"relative",children:[
/* @__PURE__ */t.jsx("input",{type:"text",id:"username",name:"username",value:p.username,onChange:U,placeholder:"@your_username",className:"input w-full pr-10 "+(3>p.username.length?"":!0===w?"border-green-500 focus:ring-green-500":!1===w?"border-red-500 focus:ring-red-500":""),required:!0}),
/* @__PURE__ */t.jsx("div",{className:"absolute inset-y-0 right-0 pr-3 flex items-center",children:C?/* @__PURE__ */t.jsx("div",{className:"animate-spin h-4 w-4 border-2 border-gray-300 border-t-brand-blue rounded-full"}):3>p.username.length?null:!0===w?/* @__PURE__ */t.jsx(i,{className:"h-5 w-5 text-green-500"}):!1===w?/* @__PURE__ */t.jsx(c,{className:"h-5 w-5 text-red-500"}):null})]}),p.username.length>=3&&/* @__PURE__ */t.jsx("p",{className:"text-sm mt-2 "+(!0===w?"text-green-600":!1===w?"text-red-600":"text-gray-500"),children:C?"Checking availability...":!0===w?"✓ Username is available!":!1===w?"✗ Username is taken":"Checking..."}),p.username.length>0&&3>p.username.length&&/* @__PURE__ */t.jsx("p",{className:"text-sm text-gray-500 mt-2",children:"Username must be at least 3 characters"})]}),
/* @__PURE__ */t.jsxs("div",{children:[
/* @__PURE__ */t.jsx("label",{htmlFor:"bio",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Bio (Optional)"}),
/* @__PURE__ */t.jsx("textarea",{id:"bio",name:"bio",value:p.bio,onChange:U,placeholder:"Tell us a bit about yourself...",rows:3,className:"input w-full resize-none"})]})]});case 3:/* @__PURE__ */
return t.jsx(g,{selectedCategories:p.impactCategories,onCategoryToggle:D});default:return null}})(),
/* @__PURE__ */t.jsxs("div",{className:"flex justify-between pt-6",children:[
/* @__PURE__ */t.jsx("button",{type:"button",onClick:()=>{o>1&&b(o-1)},disabled:1===o,className:`\n                                        px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200\n                                        ${1===o?"text-gray-400 cursor-not-allowed":"text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}\n                                    `,children:"Back"}),3>o?/* @__PURE__ */t.jsxs("button",{type:"button",onClick:()=>{3>o&&b(o+1)},disabled:!T(),className:`\n                                            px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2\n                                            ${T()?"bg-brand-blue text-white hover:bg-brand-blue-dark":"bg-gray-300 text-gray-500 cursor-not-allowed"}\n                                        `,children:[
/* @__PURE__ */t.jsx("span",{children:"Next"}),
/* @__PURE__ */t.jsx(r,{className:"w-4 h-4"})]}):/* @__PURE__ */t.jsx("button",{type:"submit",disabled:y||!E(),className:`\n                                            px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2\n                                            ${E()&&!y?"bg-gradient-brand text-white hover:scale-105":"bg-gray-300 text-gray-500 cursor-not-allowed"}\n                                        `,children:y?/* @__PURE__ */t.jsxs(t.Fragment,{children:[
/* @__PURE__ */t.jsx("div",{className:"animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"}),
/* @__PURE__ */t.jsx("span",{children:"Setting up..."})]}):/* @__PURE__ */t.jsxs(t.Fragment,{children:[
/* @__PURE__ */t.jsx("span",{children:"Complete Setup"}),
/* @__PURE__ */t.jsx(l,{className:"w-4 h-4"})]})})]})]})})]})}),
/* @__PURE__ */t.jsx(h,{isOpen:N,onClose:()=>{v(!1),F("/dashboard")},userData:p})]})}export{b as default};
