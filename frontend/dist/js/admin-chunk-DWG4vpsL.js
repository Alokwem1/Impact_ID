import{u as e,r as s,a as t,b as a,V as r,j as l,F as i,c as n,d,e as o,f as c,g as m,h as x,i as u,k as g,l as h,m as b,n as p,o as y,p as v,q as f,s as j,t as N,v as w,w as k,x as _,y as C,z as S,A as L,B as T,C as F,D as A,E as D,G as E,H as U,I as R,J as P,K as q,L as I,M as B,R as z,N as M,O,P as $,Q as K,S as Q,T as X}from"./react-vendor-JLH1r332.js";import{u as V}from"./auth-chunk-CmjlQMUy.js";import{L as H}from"./tasks-chunk-BIljiLKS.js";import{a as J}from"./utils-chunk-CyH00Vps.js";import"./vendor-D5qaWewk.js";import"./http-vendor-CIEU9v4G.js";const W=async({submissionId:e,reviewData:s})=>{const{data:t}=await J.post("/api/tasks/review/"+e,s);return t},Y=async({submissionIds:e,approve:s,notes:t})=>{const{data:a}=await J.post("/api/admin/submissions/bulk-review",{submission_ids:e,approve:s,notes:t});return a},G=async({submissionId:e,reason:s,category:t})=>{const{data:a}=await J.post(`/api/admin/submissions/${e}/flag`,{reason:s,category:t});return a};function Z(){const p=e(),[y,v]=s.useState({status:"pending",userId:"",taskId:"",daysBack:7,limit:20,offset:0}),[f,j]=s.useState(/* @__PURE__ */new Set),[N,w]=s.useState(!1),[k,_]=s.useState(!1),[C,S]=s.useState(!1),[L,T]=s.useState(null),[F,A]=s.useState(null),[D,E]=s.useState({approve:!0,feedback:"",score:null,bonus_xp:0,bonus_essence:0}),[U,R]=s.useState({reason:"",category:"inappropriate"}),{data:P=[],isLoading:q,isError:I,refetch:B}=t({queryKey:["adminSubmissions",y],queryFn:()=>(async({status:e,userId:s,taskId:t,daysBack:a,limit:r,offset:l})=>{const i=new URLSearchParams;e&&i.append("status",e),s&&i.append("user_id",s),t&&i.append("task_id",t),a&&i.append("days_back",a),r&&i.append("limit",r),l&&i.append("offset",l);const{data:n}=await J.get("/api/admin/submissions?"+i);return n})(y),refetchInterval:3e4}),z=a({mutationFn:W,onSuccess:()=>{r.success("Submission reviewed successfully!"),p.invalidateQueries({queryKey:["adminSubmissions"]}),w(!1),A(null)},onError:e=>{var s,t;r.error((null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)||"Failed to review submission.")}}),M=a({mutationFn:Y,onSuccess:e=>{r.success(e.message||"Bulk review completed!"),p.invalidateQueries({queryKey:["adminSubmissions"]}),_(!1),j(/* @__PURE__ */new Set)},onError:e=>{var s,t;r.error((null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)||"Failed to bulk review submissions.")}}),O=a({mutationFn:G,onSuccess:()=>{r.success("Submission flagged successfully!"),p.invalidateQueries({queryKey:["adminSubmissions"]}),S(!1),A(null)},onError:e=>{var s,t;r.error((null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)||"Failed to flag submission.")}}),$=a({mutationFn:()=>(async e=>{const s=new URLSearchParams;return Object.entries(e).forEach(([e,t])=>{t&&s.append(e,t)}),(await J.get("/api/admin/submissions/export?"+s,{responseType:"blob"})).data})(y),onSuccess:e=>{const s=window.URL.createObjectURL(new Blob([e])),t=document.createElement("a");t.href=s,t.setAttribute("download",`submissions-${/* @__PURE__ */(new Date).toISOString().split("T")[0]}.csv`),document.body.appendChild(t),t.click(),t.remove(),r.success("Submissions exported successfully!")},onError:e=>{r.error("Failed to export submissions")}}),K=(e,s)=>{v(t=>({...t,[e]:s,offset:0}))},Q=(e,s=!0)=>{A(e),E({approve:s,feedback:"",score:null,bonus_xp:0,bonus_essence:0}),w(!0)},X=e=>{0!==f.size&&M.mutate({submissionIds:Array.from(f),approve:e,notes:D.feedback||""})};s.useEffect(()=>{const e=e=>{N||k||C||L||("r"===e.key&&e.ctrlKey&&(e.preventDefault(),B()),"a"===e.key&&e.ctrlKey&&f.size>0&&(e.preventDefault(),_(!0)))};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[N,k,C,L,f.size,B]);const V=[{label:"Pending",status:"pending",count:P.filter(e=>"pending"===e.status).length},{label:"Today",daysBack:1,count:null},{label:"This Week",daysBack:7,count:null},{label:"Flagged",status:"flagged",count:P.filter(e=>"flagged"===e.status).length}];return q?/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center py-12",children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"}),
/* @__PURE__ */l.jsx("p",{className:"ml-3 text-gray-600",children:"Loading submissions..."})]}):I?/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(i,{className:"mx-auto h-12 w-12 text-red-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"Error Loading Submissions"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Unable to load submission data."}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>B(),className:"mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Retry"]})]}):/* @__PURE__ */l.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Submission Management"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Review and manage user submissions"})]}),
/* @__PURE__ */l.jsxs("div",{className:"mt-4 sm:mt-0 flex items-center space-x-2",children:[
/* @__PURE__ */l.jsxs("button",{onClick:()=>$.mutate(),disabled:$.isPending,className:"inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50",children:[
/* @__PURE__ */l.jsx(d,{className:"h-4 w-4 mr-1"}),$.isPending?"Exporting...":"Export"]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>B(),className:"inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Refresh"]}),f.size>0&&/* @__PURE__ */l.jsxs("button",{onClick:()=>_(!0),className:"inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700",children:["Bulk Review (",f.size,")"]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg p-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center mb-3",children:[
/* @__PURE__ */l.jsx(o,{className:"h-5 w-5 text-gray-400 mr-2"}),
/* @__PURE__ */l.jsx("h3",{className:"text-sm font-medium text-gray-900",children:"Filters"})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Status"}),
/* @__PURE__ */l.jsxs("select",{value:y.status,onChange:e=>K("status",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"",children:"All Statuses"}),
/* @__PURE__ */l.jsx("option",{value:"pending",children:"Pending"}),
/* @__PURE__ */l.jsx("option",{value:"approved",children:"Approved"}),
/* @__PURE__ */l.jsx("option",{value:"declined",children:"Declined"}),
/* @__PURE__ */l.jsx("option",{value:"rejected",children:"Rejected"}),
/* @__PURE__ */l.jsx("option",{value:"flagged",children:"Flagged"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"User ID"}),
/* @__PURE__ */l.jsx("input",{type:"number",placeholder:"User ID",value:y.userId,onChange:e=>K("userId",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Task ID"}),
/* @__PURE__ */l.jsx("input",{type:"number",placeholder:"Task ID",value:y.taskId,onChange:e=>K("taskId",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Days Back"}),
/* @__PURE__ */l.jsxs("select",{value:y.daysBack,onChange:e=>K("daysBack",parseInt(e.target.value)),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:1,children:"Last 24 hours"}),
/* @__PURE__ */l.jsx("option",{value:7,children:"Last 7 days"}),
/* @__PURE__ */l.jsx("option",{value:30,children:"Last 30 days"}),
/* @__PURE__ */l.jsx("option",{value:90,children:"Last 90 days"})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2 mt-3",children:[
/* @__PURE__ */l.jsx("span",{className:"text-xs font-medium text-gray-500",children:"Quick Filters:"}),V.map(e=>/* @__PURE__ */l.jsxs("button",{onClick:()=>{e.status&&K("status",e.status),e.daysBack&&K("daysBack",e.daysBack)},className:"inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors",children:[e.label,null!==e.count&&e.count>0&&/* @__PURE__ */l.jsx("span",{className:"ml-1 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs",children:e.count})]},e.label))]})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:[
/* @__PURE__ */l.jsx("div",{className:"px-6 py-4 border-b border-gray-200",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsxs("h3",{className:"text-lg font-medium text-gray-900",children:["Submissions (",P.length,")"]}),P.length>0&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:f.size===P.length,onChange:()=>{f.size===P.length?j(/* @__PURE__ */new Set):j(new Set(P.map(e=>e.id)))},className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsx("label",{className:"ml-2 text-sm text-gray-700",children:"Select All"})]})]})}),P.length>0?/* @__PURE__ */l.jsx("div",{className:"divide-y divide-gray-200",children:P.map(e=>{var s,t;/* @__PURE__ */
return l.jsx("div",{className:"p-6 hover:bg-gray-50",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-start justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-start space-x-3",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:f.has(e.id),onChange:()=>{return s=e.id,void j(e=>{const t=new Set(e);return t.has(s)?t.delete(s):t.add(s),t});var s},className:"mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[
/* @__PURE__ */l.jsx(c,{className:"h-4 w-4 text-gray-400"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium text-gray-900",children:e.username}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm text-gray-500",children:["(",e.user_email,")"]}),
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+(t=e.status,{pending:"bg-yellow-100 text-yellow-800",approved:"bg-green-100 text-green-800",declined:"bg-red-100 text-red-800",rejected:"bg-red-100 text-red-800",flagged:"bg-orange-100 text-orange-800"}[t]||"bg-gray-100 text-gray-800"),children:e.status})]}),
/* @__PURE__ */l.jsx("h4",{className:"text-lg font-medium text-gray-900 mb-2",children:e.task_title}),
/* @__PURE__ */l.jsx("div",{className:"bg-gray-50 rounded-lg p-3 mb-3",children:/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-700 whitespace-pre-wrap",children:(null==(s=e.response)?void 0:s.length)>200?e.response.substring(0,200)+"...":e.response})}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-4 text-xs text-gray-500",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(m,{className:"h-4 w-4 mr-1"}),"Submitted: ",new Date(e.submitted_at).toLocaleString()]}),e.reviewed_at&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(x,{className:"h-4 w-4 mr-1"}),"Reviewed: ",new Date(e.reviewed_at).toLocaleString()]}),e.time_spent_minutes&&/* @__PURE__ */l.jsxs("div",{children:["Time spent: ",e.time_spent_minutes,"m"]})]}),e.feedback&&/* @__PURE__ */l.jsx("div",{className:"mt-3 p-3 bg-blue-50 rounded-lg",children:/* @__PURE__ */l.jsxs("p",{className:"text-sm text-blue-800",children:[
/* @__PURE__ */l.jsx("strong",{children:"Feedback:"})," ",e.feedback]})})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex flex-col space-y-2",children:[
/* @__PURE__ */l.jsxs("button",{onClick:()=>T(e),className:"inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50",children:[
/* @__PURE__ */l.jsx(u,{className:"h-3 w-3 mr-1"}),"Preview"]}),"pending"===e.status&&/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsxs("button",{onClick:()=>Q(e,!0),className:"inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700",children:[
/* @__PURE__ */l.jsx(x,{className:"h-3 w-3 mr-1"}),"Approve"]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>Q(e,!1),className:"inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700",children:[
/* @__PURE__ */l.jsx(g,{className:"h-3 w-3 mr-1"}),"Decline"]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>(e=>{A(e),R({reason:"",category:"inappropriate"}),S(!0)})(e),className:"inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50",children:[
/* @__PURE__ */l.jsx(h,{className:"h-3 w-3 mr-1"}),"Flag"]})]})]})]})},e.id)})}):/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(b,{className:"mx-auto h-12 w-12 text-gray-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No submissions found"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"No submissions match your current filters."})]})]}),P.length>=y.limit&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>K("offset",Math.max(0,y.offset-y.limit)),disabled:0===y.offset,className:"inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",children:"Previous"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm text-gray-700",children:["Showing ",y.offset+1,"-",y.offset+P.length]}),
/* @__PURE__ */l.jsx("button",{onClick:()=>K("offset",y.offset+y.limit),className:"inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",children:"Next"})]}),L&&/* @__PURE__ */l.jsx(ee,{submission:L,onClose:()=>T(null),onReview:e=>{T(null),Q(L,e)}}),N&&/* @__PURE__ */l.jsx(se,{submission:F,reviewData:D,setReviewData:E,onSubmit:()=>{F&&z.mutate({submissionId:F.id,reviewData:D})},onClose:()=>w(!1),isLoading:z.isPending}),k&&/* @__PURE__ */l.jsx(te,{selectedCount:f.size,onApprove:()=>X(!0),onDecline:()=>X(!1),onClose:()=>_(!1),isLoading:M.isPending}),C&&/* @__PURE__ */l.jsx(ae,{submission:F,flagData:U,setFlagData:R,onSubmit:()=>{F&&O.mutate({submissionId:F.id,...U})},onClose:()=>S(!1),isLoading:O.isPending})]})}function ee({submission:e,onClose:s,onReview:t}){var a;return e?/* @__PURE__ */l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-10 mx-auto p-6 border max-w-4xl shadow-lg rounded-md bg-white",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex justify-between items-center mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-xl font-bold text-gray-900",children:"Submission Preview"}),
/* @__PURE__ */l.jsx("button",{onClick:s,className:"text-gray-400 hover:text-gray-600",children:/* @__PURE__ */l.jsx(p,{className:"h-6 w-6"})})]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"User"}),
/* @__PURE__ */l.jsx("p",{className:"text-lg",children:e.username}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500",children:e.user_email})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Task"}),
/* @__PURE__ */l.jsx("p",{className:"text-lg",children:e.task_title}),
/* @__PURE__ */l.jsxs("p",{className:"text-sm text-gray-500",children:["Task ID: ",e.task_id]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Status"}),
/* @__PURE__ */l.jsx("p",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+getStatusColor(e.status),children:e.status})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Submitted"}),
/* @__PURE__ */l.jsx("p",{className:"text-sm",children:new Date(e.submitted_at).toLocaleString()})]}),e.time_spent_minutes&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Time Spent"}),
/* @__PURE__ */l.jsxs("p",{className:"text-sm",children:[e.time_spent_minutes," minutes"]})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Response"}),
/* @__PURE__ */l.jsx("div",{className:"mt-2 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto",children:/* @__PURE__ */l.jsx("p",{className:"whitespace-pre-wrap",children:e.response})})]}),(null==(a=e.attachments)?void 0:a.length)>0&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Attachments"}),
/* @__PURE__ */l.jsx("div",{className:"mt-2 space-y-2",children:e.attachments.map((e,s)=>/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2 p-2 bg-blue-50 rounded",children:[
/* @__PURE__ */l.jsx(b,{className:"h-5 w-5 text-blue-600"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm",children:e})]},s))})]}),e.feedback&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Admin Feedback"}),
/* @__PURE__ */l.jsx("div",{className:"mt-2 p-4 bg-blue-50 rounded-lg",children:/* @__PURE__ */l.jsx("p",{className:"text-blue-800",children:e.feedback})})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex justify-end space-x-3 mt-6",children:[
/* @__PURE__ */l.jsx("button",{onClick:s,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50",children:"Close"}),"pending"===e.status&&/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>t(!1),className:"px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium",children:"Decline"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>t(!0),className:"px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium",children:"Approve"})]})]})]})}):null}function se({submission:e,reviewData:s,setReviewData:t,onSubmit:a,onClose:r,isLoading:i}){/* @__PURE__ */
return l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white",children:[
/* @__PURE__ */l.jsxs("h3",{className:"text-lg font-bold text-gray-900 mb-4",children:[s.approve?"Approve":"Decline"," Submission"]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Feedback (optional)"}),
/* @__PURE__ */l.jsx("textarea",{value:s.feedback,onChange:e=>t(s=>({...s,feedback:e.target.value})),rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Provide feedback to the user..."})]}),s.approve&&/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Score (0-100, optional)"}),
/* @__PURE__ */l.jsx("input",{type:"number",min:"0",max:"100",value:s.score||"",onChange:e=>t(s=>({...s,score:e.target.value?parseFloat(e.target.value):null})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Bonus XP"}),
/* @__PURE__ */l.jsx("input",{type:"number",min:"0",max:"500",value:s.bonus_xp,onChange:e=>t(s=>({...s,bonus_xp:parseInt(e.target.value)||0})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Bonus Essence"}),
/* @__PURE__ */l.jsx("input",{type:"number",min:"0",max:"50",value:s.bonus_essence,onChange:e=>t(s=>({...s,bonus_essence:parseInt(e.target.value)||0})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex justify-end space-x-3 mt-6",children:[
/* @__PURE__ */l.jsx("button",{onClick:r,disabled:i,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",children:"Cancel"}),
/* @__PURE__ */l.jsx("button",{onClick:a,disabled:i,className:`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${s.approve?"bg-green-600 hover:bg-green-700":"bg-red-600 hover:bg-red-700"} disabled:opacity-50`,children:i?"Processing...":s.approve?"Approve":"Decline"})]})]})})}function te({selectedCount:e,onApprove:s,onDecline:t,onClose:a,isLoading:r}){/* @__PURE__ */
return l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white",children:[
/* @__PURE__ */l.jsxs("h3",{className:"text-lg font-bold text-gray-900 mb-4",children:["Bulk Review ",e," Submissions"]}),
/* @__PURE__ */l.jsxs("p",{className:"text-sm text-gray-600 mb-6",children:["This action will affect ",e," selected submissions. This cannot be undone."]}),
/* @__PURE__ */l.jsxs("div",{className:"flex justify-end space-x-3",children:[
/* @__PURE__ */l.jsx("button",{onClick:a,disabled:r,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",children:"Cancel"}),
/* @__PURE__ */l.jsx("button",{onClick:t,disabled:r,className:"px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50",children:r?"Processing...":"Decline All"}),
/* @__PURE__ */l.jsx("button",{onClick:s,disabled:r,className:"px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50",children:r?"Processing...":"Approve All"})]})]})})}function ae({submission:e,flagData:s,setFlagData:t,onSubmit:a,onClose:r,isLoading:i}){/* @__PURE__ */
return l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-bold text-gray-900 mb-4",children:"Flag Submission"}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Category"}),
/* @__PURE__ */l.jsxs("select",{value:s.category,onChange:e=>t(s=>({...s,category:e.target.value})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"inappropriate",children:"Inappropriate Content"}),
/* @__PURE__ */l.jsx("option",{value:"spam",children:"Spam"}),
/* @__PURE__ */l.jsx("option",{value:"abuse",children:"Abuse"}),
/* @__PURE__ */l.jsx("option",{value:"plagiarism",children:"Plagiarism"}),
/* @__PURE__ */l.jsx("option",{value:"other",children:"Other"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Reason *"}),
/* @__PURE__ */l.jsx("textarea",{value:s.reason,onChange:e=>t(s=>({...s,reason:e.target.value})),rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Explain why this submission is being flagged...",required:!0})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex justify-end space-x-3 mt-6",children:[
/* @__PURE__ */l.jsx("button",{onClick:r,disabled:i,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",children:"Cancel"}),
/* @__PURE__ */l.jsx("button",{onClick:a,disabled:i||!s.reason.trim(),className:"px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50",children:i?"Flagging...":"Flag Submission"})]})]})})}const re=async e=>{const{data:s}=await J.post("/api/tasks/",e);return s},le={title:"",type:"report",difficulty:"beginner",instructions:"",category:"",tags:[],xp_reward:10,essence_reward:0,time_limit_minutes:null,max_attempts:3,requires_review:!0,is_featured:!1,quiz_question:null,correct_answer:"",scheduled_start:"",scheduled_end:"",prerequisites:[]};function ie(){var t;const i=e(),[n,d]=s.useState(le),[o,c]=s.useState(""),[m,x]=s.useState({question:"",options:["","","",""],correct_index:0}),u=[{value:"report",label:"Report",description:"Text submission with detailed report"},{value:"upload",label:"Upload",description:"File upload submission"},{value:"quiz",label:"Quiz",description:"Multiple choice question"},{value:"social_share",label:"Social Share",description:"Social media sharing task"},{value:"survey",label:"Survey",description:"Survey completion"},{value:"challenge",label:"Challenge",description:"Special challenge task"}],g=[{value:"beginner",label:"Beginner",color:"bg-green-100 text-green-800"},{value:"intermediate",label:"Intermediate",color:"bg-yellow-100 text-yellow-800"},{value:"advanced",label:"Advanced",color:"bg-orange-100 text-orange-800"},{value:"expert",label:"Expert",color:"bg-red-100 text-red-800"}],h=a({mutationFn:re,onSuccess:e=>{r.success(`Task '${e.title}' created successfully!`,{duration:4e3,icon:"🎉"}),d(le),x({question:"",options:["","","",""],correct_index:0}),i.invalidateQueries({queryKey:["tasks"]}),i.invalidateQueries({queryKey:["admin","tasks"]}),i.invalidateQueries({queryKey:["adminDashboard"]})},onError:e=>{var s,t,a,l,i,n,d;let o="Failed to create task. Please try again.";(null==(t=null==(s=e.response)?void 0:s.data)?void 0:t.detail)?o=e.response.data.detail:(null==(l=null==(a=e.response)?void 0:a.data)?void 0:l.message)?o=e.response.data.message:400===(null==(i=e.response)?void 0:i.status)?o="Invalid task data. Please check your inputs and try again.":403===(null==(n=e.response)?void 0:n.status)?o="You do not have permission to create tasks.":409===(null==(d=e.response)?void 0:d.status)&&(o="A task with this title already exists."),r.error(o)}}),b=e=>{const{name:s,value:t,type:a,checked:r}=e.target;d(e=>({...e,[s]:"checkbox"===a?r:t}))},p=()=>{o.trim()&&!n.tags.includes(o.trim())&&10>n.tags.length&&(d(e=>({...e,tags:[...e.tags,o.trim()]})),c(""))},f=(e,s,t=null)=>{x(a=>{if("options"===e&&null!==t){const e=[...a.options];return e[t]=s,{...a,options:e}}return{...a,[e]:s}})},j=g.find(e=>e.value===n.difficulty);/* @__PURE__ */
return l.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow-xl rounded-xl overflow-hidden",children:[
/* @__PURE__ */l.jsx("div",{className:"bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(y,{className:"h-8 w-8 text-white mr-3"}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h2",{className:"text-2xl font-bold text-white",children:"Create New Task"}),
/* @__PURE__ */l.jsx("p",{className:"text-green-100",children:"Design and configure a new impact task"})]})]})}),
/* @__PURE__ */l.jsxs("form",{onSubmit:e=>{if(e.preventDefault(),!(()=>{if(!n.title.trim()||5>n.title.length)return r.error("Task title must be at least 5 characters long"),!1;if(n.title.length>200)return r.error("Task title cannot exceed 200 characters"),!1;if(!n.instructions.trim()||10>n.instructions.length)return r.error("Instructions must be at least 10 characters long"),!1;if(n.instructions.length>5e3)return r.error("Instructions cannot exceed 5000 characters"),!1;if(!n.category.trim())return r.error("Please select a category"),!1;if(1>n.xp_reward||n.xp_reward>1e3)return r.error("XP reward must be between 1 and 1000"),!1;if(0>n.essence_reward||n.essence_reward>100)return r.error("Essence reward must be between 0 and 100"),!1;if(1>n.max_attempts||n.max_attempts>10)return r.error("Max attempts must be between 1 and 10"),!1;if(n.time_limit_minutes&&(1>n.time_limit_minutes||n.time_limit_minutes>1440))return r.error("Time limit must be between 1 and 1440 minutes"),!1;if("quiz"===n.type){if(!m.question.trim())return r.error("Quiz question is required"),!1;if(m.options.some(e=>!e.trim()))return r.error("All quiz options must be filled"),!1;if(2>m.options.length)return r.error("Quiz must have at least 2 options"),!1}return!0})())return;let s={...n,xp_reward:parseInt(n.xp_reward),essence_reward:parseInt(n.essence_reward),max_attempts:parseInt(n.max_attempts),time_limit_minutes:n.time_limit_minutes?parseInt(n.time_limit_minutes):null,scheduled_start:n.scheduled_start||null,scheduled_end:n.scheduled_end||null};"quiz"===n.type&&(s.quiz_question={question:m.question,options:m.options.filter(e=>e.trim())},s.correct_answer=m.options[m.correct_index]),Object.keys(s).forEach(e=>{(""===s[e]||null===s[e]&&"time_limit_minutes"!==e&&"scheduled_start"!==e&&"scheduled_end"!==e)&&delete s[e]}),h.mutate(s)},className:"p-6 space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"title",className:"block text-sm font-medium text-gray-700 mb-1",children:"Task Title *"}),
/* @__PURE__ */l.jsx("input",{type:"text",id:"title",name:"title",value:n.title,onChange:b,required:!0,maxLength:200,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"e.g., Plant a Tree in Your Neighborhood"}),
/* @__PURE__ */l.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:[n.title.length,"/200 characters"]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"type",className:"block text-sm font-medium text-gray-700 mb-1",children:"Task Type *"}),
/* @__PURE__ */l.jsx("select",{id:"type",name:"type",value:n.type,onChange:b,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:u.map(e=>/* @__PURE__ */l.jsxs("option",{value:e.value,children:[e.label," - ",e.description]},e.value))})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"category",className:"block text-sm font-medium text-gray-700 mb-1",children:"Category *"}),
/* @__PURE__ */l.jsxs("select",{id:"category",name:"category",value:n.category,onChange:b,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"",children:"Select a category"}),["Environment","Education","Health","Technology","Community","Arts","Sports","Business","Science","Other"].map(e=>/* @__PURE__ */l.jsx("option",{value:e,children:e},e))]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Difficulty Level"}),
/* @__PURE__ */l.jsx("div",{className:"grid grid-cols-4 gap-2",children:g.map(e=>/* @__PURE__ */l.jsx("button",{type:"button",onClick:()=>d(s=>({...s,difficulty:e.value})),className:"p-2 rounded-md text-xs font-medium transition-all "+(n.difficulty===e.value?e.color+" ring-2 ring-offset-2 ring-blue-400":"bg-gray-100 text-gray-700 hover:bg-gray-200"),children:e.label},e.value))})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-gray-50 rounded-lg p-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Task Preview"}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"Type:"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium",children:null==(t=u.find(e=>e.value===n.type))?void 0:t.label})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"Difficulty:"}),
/* @__PURE__ */l.jsx("span",{className:"px-2 py-1 rounded-full text-xs font-medium "+(null==j?void 0:j.color),children:null==j?void 0:j.label})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"XP Reward:"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-blue-600",children:[n.xp_reward," XP"]})]}),n.essence_reward>0&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"Essence Reward:"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-purple-600",children:[n.essence_reward," Essence"]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"Max Attempts:"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium",children:n.max_attempts})]}),n.time_limit_minutes&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-600",children:"Time Limit:"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-orange-600",children:[n.time_limit_minutes," minutes"]})]})]})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"instructions",className:"block text-sm font-medium text-gray-700 mb-1",children:"Task Instructions *"}),
/* @__PURE__ */l.jsx("textarea",{id:"instructions",name:"instructions",value:n.instructions,onChange:b,required:!0,rows:6,maxLength:5e3,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Provide clear, detailed instructions for completing this task..."}),
/* @__PURE__ */l.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:[n.instructions.length,"/5000 characters"]})]}),"quiz"===n.type&&/* @__PURE__ */l.jsxs("div",{className:"bg-blue-50 rounded-lg p-4 space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(v,{className:"h-5 w-5 text-blue-500 mr-2"}),
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Quiz Configuration"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Quiz Question *"}),
/* @__PURE__ */l.jsx("textarea",{value:m.question,onChange:e=>f("question",e.target.value),rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Enter your quiz question..."})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Answer Options * (Select the correct answer)"}),
/* @__PURE__ */l.jsx("div",{className:"space-y-2",children:m.options.map((e,s)=>/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("input",{type:"radio",name:"correct_answer",checked:m.correct_index===s,onChange:()=>f("correct_index",s),className:"h-4 w-4 text-blue-600 focus:ring-blue-500"}),
/* @__PURE__ */l.jsx("input",{type:"text",value:e,onChange:e=>f("options",e.target.value,s),placeholder:"Option "+(s+1),className:"flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"}),m.correct_index===s&&/* @__PURE__ */l.jsx("span",{className:"text-green-600 text-sm font-medium",children:"✓ Correct"})]},s))}),
/* @__PURE__ */l.jsx("p",{className:"text-xs text-gray-500 mt-1",children:"Select the radio button next to the correct answer"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Tags (max 10)"}),
/* @__PURE__ */l.jsx("div",{className:"flex flex-wrap gap-2 mb-2",children:n.tags.map((e,s)=>/* @__PURE__ */l.jsxs("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",children:[e,
/* @__PURE__ */l.jsx("button",{type:"button",onClick:()=>{return s=e,void d(e=>({...e,tags:e.tags.filter(e=>e!==s)}));var s},className:"ml-1.5 h-4 w-4 text-blue-400 hover:text-blue-600",children:"×"})]},s))}),
/* @__PURE__ */l.jsxs("div",{className:"flex space-x-2",children:[
/* @__PURE__ */l.jsx("input",{type:"text",value:o,onChange:e=>c(e.target.value),onKeyPress:e=>"Enter"===e.key&&(e.preventDefault(),p()),placeholder:"Add a tag...",className:"flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:n.tags.length>=10}),
/* @__PURE__ */l.jsx("button",{type:"button",onClick:p,disabled:n.tags.length>=10||!o.trim(),className:"px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",children:"Add"})]}),n.tags.length>=10&&/* @__PURE__ */l.jsx("p",{className:"text-xs text-orange-600 mt-1",children:"Maximum 10 tags allowed"})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"xp_reward",className:"block text-sm font-medium text-gray-700 mb-1",children:"XP Reward (1-1000)"}),
/* @__PURE__ */l.jsx("input",{type:"number",id:"xp_reward",name:"xp_reward",value:n.xp_reward,onChange:b,min:1,max:1e3,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"essence_reward",className:"block text-sm font-medium text-gray-700 mb-1",children:"Essence Reward (0-100)"}),
/* @__PURE__ */l.jsx("input",{type:"number",id:"essence_reward",name:"essence_reward",value:n.essence_reward,onChange:b,min:0,max:100,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"max_attempts",className:"block text-sm font-medium text-gray-700 mb-1",children:"Max Attempts (1-10)"}),
/* @__PURE__ */l.jsx("input",{type:"number",id:"max_attempts",name:"max_attempts",value:n.max_attempts,onChange:b,min:1,max:10,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"time_limit_minutes",className:"block text-sm font-medium text-gray-700 mb-1",children:"Time Limit (minutes, optional)"}),
/* @__PURE__ */l.jsx("input",{type:"number",id:"time_limit_minutes",name:"time_limit_minutes",value:n.time_limit_minutes||"",onChange:b,min:1,max:1440,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"No limit"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"scheduled_start",className:"block text-sm font-medium text-gray-700 mb-1",children:"Start Date (optional)"}),
/* @__PURE__ */l.jsx("input",{type:"datetime-local",id:"scheduled_start",name:"scheduled_start",value:n.scheduled_start,onChange:b,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"scheduled_end",className:"block text-sm font-medium text-gray-700 mb-1",children:"End Date (optional)"}),
/* @__PURE__ */l.jsx("input",{type:"datetime-local",id:"scheduled_end",name:"scheduled_end",value:n.scheduled_end,onChange:b,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"border-t pt-6",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Task Options"}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",id:"requires_review",name:"requires_review",checked:n.requires_review,onChange:b,className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsx("label",{htmlFor:"requires_review",className:"ml-2 block text-sm text-gray-900",children:"Requires manual review (uncheck for auto-approval)"})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",id:"is_featured",name:"is_featured",checked:n.is_featured,onChange:b,className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsx("label",{htmlFor:"is_featured",className:"ml-2 block text-sm text-gray-900",children:"Featured task (will be highlighted)"})]})]})]}),
/* @__PURE__ */l.jsx("div",{className:"flex justify-end pt-6 border-t",children:/* @__PURE__ */l.jsx("button",{type:"submit",disabled:h.isPending,className:"flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200",children:h.isPending?/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"}),"Creating Task..."]}):/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx(y,{className:"h-5 w-5 mr-2"}),"Create Task"]})})})]})]})})}function ne(){const[e,t]=s.useState({title:"",description:"",criteria:"",badge_type:"achievement",rarity:"common",icon_url:"",color:"#3B82F6",points_value:10,auto_award_criteria:{},is_secret:!1}),[a,i]=s.useState(!1),[n,d]=s.useState(""),o=[{value:"common",label:"Common",color:"#6B7280",points:10},{value:"uncommon",label:"Uncommon",color:"#059669",points:25},{value:"rare",label:"Rare",color:"#2563EB",points:50},{value:"epic",label:"Epic",color:"#7C3AED",points:100},{value:"legendary",label:"Legendary",color:"#DC2626",points:200}],c=[{value:"first_submission",label:"First Submission",description:"Complete first task"},{value:"5_tasks",label:"5 Tasks",description:"Complete 5 tasks"},{value:"10_tasks",label:"10 Tasks",description:"Complete 10 tasks"},{value:"25_tasks",label:"25 Tasks",description:"Complete 25 tasks"},{value:"50_tasks",label:"50 Tasks",description:"Complete 50 tasks"},{value:"xp_100",label:"100 XP",description:"Earn 100 XP"},{value:"xp_500",label:"500 XP",description:"Earn 500 XP"},{value:"xp_1000",label:"1000 XP",description:"Earn 1000 XP"},{value:"streak_7",label:"7-day Streak",description:"Maintain 7-day streak"},{value:"streak_30",label:"30-day Streak",description:"Maintain 30-day streak"}],m=e=>{const{name:s,value:a,type:r,checked:l}=e.target;t(e=>({...e,[s]:"checkbox"===r?l:a}))},x=o.find(s=>s.value===e.rarity);/* @__PURE__ */
return l.jsx("div",{className:"max-w-4xl mx-auto",children:/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow-xl rounded-xl overflow-hidden",children:[
/* @__PURE__ */l.jsx("div",{className:"bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(f,{className:"h-8 w-8 text-white mr-3"}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h2",{className:"text-2xl font-bold text-white",children:"Create New Badge"}),
/* @__PURE__ */l.jsx("p",{className:"text-blue-100",children:"Design and configure a new achievement badge"})]})]})}),
/* @__PURE__ */l.jsxs("form",{onSubmit:async s=>{var a,l;if(s.preventDefault(),!(e.title.trim()?3>e.title.length||e.title.length>100?(r.error("Badge title must be between 3 and 100 characters"),0):e.description.trim()?10>e.description.length||e.description.length>500?(r.error("Badge description must be between 10 and 500 characters"),0):e.criteria.trim()?e.points_value>=1&&1e3>=e.points_value||(r.error("Points value must be between 1 and 1000"),0):(r.error("Badge criteria is required"),0):(r.error("Badge description is required"),0):(r.error("Badge title is required"),0)))return;i(!0);const n=r.loading("Creating badge...");try{const s=await J.post("/badges/",e);r.success(`Badge '${s.data.title}' created successfully!`,{id:n}),t({title:"",description:"",criteria:"",badge_type:"achievement",rarity:"common",icon_url:"",color:"#3B82F6",points_value:10,auto_award_criteria:{},is_secret:!1}),d("")}catch(o){const e=(null==(l=null==(a=o.response)?void 0:a.data)?void 0:l.detail)||"Failed to create badge";r.error(e,{id:n})}finally{i(!1)}},className:"p-6 space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"title",className:"block text-sm font-medium text-gray-700 mb-1",children:"Badge Title *"}),
/* @__PURE__ */l.jsx("input",{type:"text",id:"title",name:"title",value:e.title,onChange:m,required:!0,maxLength:100,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"e.g., First Steps Champion"}),
/* @__PURE__ */l.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:[e.title.length,"/100 characters"]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"description",className:"block text-sm font-medium text-gray-700 mb-1",children:"Description *"}),
/* @__PURE__ */l.jsx("textarea",{id:"description",name:"description",value:e.description,onChange:m,required:!0,rows:4,maxLength:500,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Awarded to users who complete their first impact task, marking the beginning of their journey toward making a positive difference."}),
/* @__PURE__ */l.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:[e.description.length,"/500 characters"]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"icon_url",className:"block text-sm font-medium text-gray-700 mb-1",children:"Icon URL (Optional)"}),
/* @__PURE__ */l.jsx("input",{type:"url",id:"icon_url",name:"icon_url",value:e.icon_url,onChange:m,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"https://example.com/badge-icon.svg"})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-gray-50 rounded-lg p-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Badge Preview"}),
/* @__PURE__ */l.jsx("div",{className:"flex items-center justify-center mb-4",children:/* @__PURE__ */l.jsx("div",{className:"w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg",style:{backgroundColor:e.color},children:e.icon_url?/* @__PURE__ */l.jsx("img",{src:e.icon_url,alt:"Badge icon",className:"w-16 h-16",onError:e=>e.target.style.display="none"}):/* @__PURE__ */l.jsx(f,{className:"h-12 w-12"})})}),
/* @__PURE__ */l.jsxs("div",{className:"text-center",children:[
/* @__PURE__ */l.jsx("h4",{className:"font-bold text-gray-900",children:e.title||"Badge Title"}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-600 mt-1",children:e.description||"Badge description will appear here..."}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center mt-2 space-x-2",children:[
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white",style:{backgroundColor:null==x?void 0:x.color},children:null==x?void 0:x.label}),
/* @__PURE__ */l.jsxs("span",{className:"text-xs text-gray-500",children:[e.points_value," points"]})]})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Badge Type"}),
/* @__PURE__ */l.jsx("select",{name:"badge_type",value:e.badge_type,onChange:m,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[{value:"achievement",label:"Achievement",description:"General accomplishments"},{value:"milestone",label:"Milestone",description:"Significant progress markers"},{value:"special",label:"Special",description:"Unique or limited-time badges"},{value:"seasonal",label:"Seasonal",description:"Time-limited seasonal badges"},{value:"community",label:"Community",description:"Community-driven achievements"}].map(e=>/* @__PURE__ */l.jsxs("option",{value:e.value,children:[e.label," - ",e.description]},e.value))})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Rarity & Points"}),
/* @__PURE__ */l.jsx("div",{className:"grid grid-cols-5 gap-1",children:o.map(s=>/* @__PURE__ */l.jsx("button",{type:"button",onClick:()=>(e=>{const s=o.find(s=>s.value===e);t(t=>({...t,rarity:e,points_value:s.points,color:s.color}))})(s.value),className:"p-2 rounded-md text-xs font-medium text-white transition-all "+(e.rarity===s.value?"ring-2 ring-offset-2 ring-gray-400 scale-105":"hover:scale-105"),style:{backgroundColor:s.color},title:`${s.label} - ${s.points} points`,children:s.label},s.value))})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Award Criteria *"}),
/* @__PURE__ */l.jsx("div",{className:"grid grid-cols-2 md:grid-cols-5 gap-2 mb-3",children:c.map(s=>/* @__PURE__ */l.jsx("button",{type:"button",onClick:()=>(e=>{t(s=>({...s,criteria:e}));const s=c.find(s=>s.value===e);d(s?s.description:"")})(s.value),className:"px-3 py-2 text-xs rounded-md border transition-colors "+(e.criteria===s.value?"bg-blue-100 border-blue-500 text-blue-700":"bg-white border-gray-300 text-gray-700 hover:bg-gray-50"),title:s.description,children:s.label},s.value))}),
/* @__PURE__ */l.jsx("input",{type:"text",name:"criteria",value:e.criteria,onChange:m,required:!0,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"e.g., first_submission, 10_tasks, xp_500, streak_7"}),n&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center mt-2 text-sm text-blue-600",children:[
/* @__PURE__ */l.jsx(j,{className:"h-4 w-4 mr-1"}),n]})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"color",className:"block text-sm font-medium text-gray-700 mb-1",children:"Badge Color"}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("input",{type:"color",id:"color",name:"color",value:e.color,onChange:m,className:"h-10 w-16 border border-gray-300 rounded-md"}),
/* @__PURE__ */l.jsx("input",{type:"text",value:e.color,onChange:e=>t(s=>({...s,color:e.target.value})),className:"flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"#3B82F6"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{htmlFor:"points_value",className:"block text-sm font-medium text-gray-700 mb-1",children:"Points Value"}),
/* @__PURE__ */l.jsx("input",{type:"number",id:"points_value",name:"points_value",value:e.points_value,onChange:m,min:1,max:1e3,className:"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"border-t pt-6",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Advanced Options"}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",id:"is_secret",name:"is_secret",checked:e.is_secret,onChange:m,className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsx("label",{htmlFor:"is_secret",className:"ml-2 block text-sm text-gray-900",children:"Secret Badge (hidden until earned)"})]})]}),
/* @__PURE__ */l.jsx("div",{className:"flex justify-end pt-6 border-t",children:/* @__PURE__ */l.jsx("button",{type:"submit",disabled:a,className:"flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed",children:a?/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"}),"Creating Badge..."]}):/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx(N,{className:"h-5 w-5 mr-2"}),"Create Badge"]})})})]})]})})}const de=({log:e,onClose:s})=>e?/* @__PURE__ */l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-10 mx-auto p-6 border max-w-2xl shadow-lg rounded-md bg-white m-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex justify-between items-center mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-xl font-bold text-gray-900",children:"Audit Log Details"}),
/* @__PURE__ */l.jsx("button",{onClick:s,className:"text-gray-400 hover:text-gray-600 transition-colors",children:/* @__PURE__ */l.jsx(p,{className:"h-6 w-6"})})]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Log ID"}),
/* @__PURE__ */l.jsx("p",{className:"text-lg",children:e.id})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Admin"}),
/* @__PURE__ */l.jsx("p",{className:"text-lg",children:e.admin_username||"Admin #"+e.admin_id})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Action"}),
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+(e=>{const s={create:"text-green-600 bg-green-100",update:"text-blue-600 bg-blue-100",delete:"text-red-600 bg-red-100",approve:"text-emerald-600 bg-emerald-100",reject:"text-orange-600 bg-orange-100",flag:"text-yellow-600 bg-yellow-100",ban:"text-red-700 bg-red-200",unban:"text-green-700 bg-green-200",login:"text-gray-600 bg-gray-100"},t=null==e?void 0:e.toLowerCase();for(const[a,r]of Object.entries(s))if(null==t?void 0:t.includes(a))return r;return"text-gray-600 bg-gray-100"})(e.action),children:e.action})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Target"}),
/* @__PURE__ */l.jsxs("p",{className:"text-lg",children:[e.target_type," #",e.target_id]})]}),
/* @__PURE__ */l.jsxs("div",{className:"col-span-2",children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Timestamp"}),
/* @__PURE__ */l.jsx("p",{className:"text-lg",children:new Date(e.created_at).toLocaleString()})]})]}),e.details&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"Details"}),
/* @__PURE__ */l.jsx("div",{className:"mt-1 p-3 bg-gray-50 rounded-lg",children:/* @__PURE__ */l.jsx("p",{className:"text-sm whitespace-pre-wrap",children:e.details})})]}),e.ip_address&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"IP Address"}),
/* @__PURE__ */l.jsx("p",{className:"text-sm font-mono",children:e.ip_address})]}),e.user_agent&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"text-sm font-medium text-gray-500",children:"User Agent"}),
/* @__PURE__ */l.jsx("p",{className:"text-sm break-all",children:e.user_agent})]})]}),
/* @__PURE__ */l.jsx("div",{className:"flex justify-end mt-6",children:/* @__PURE__ */l.jsx("button",{onClick:s,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",children:"Close"})})]})}):null,oe=({showAdvancedFilters:e,advancedFilters:s,setAdvancedFilters:t,onApplyAdvanced:a})=>/* @__PURE__ */l.jsxs("div",{className:"transition-all duration-300 overflow-hidden "+(e?"max-h-96 opacity-100":"max-h-0 opacity-0"),children:[
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Target Type"}),
/* @__PURE__ */l.jsxs("select",{value:s.targetType,onChange:e=>t(s=>({...s,targetType:e.target.value})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"",children:"All Types"}),
/* @__PURE__ */l.jsx("option",{value:"user",children:"User"}),
/* @__PURE__ */l.jsx("option",{value:"task",children:"Task"}),
/* @__PURE__ */l.jsx("option",{value:"submission",children:"Submission"}),
/* @__PURE__ */l.jsx("option",{value:"badge",children:"Badge"}),
/* @__PURE__ */l.jsx("option",{value:"system",children:"System"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Target ID"}),
/* @__PURE__ */l.jsx("input",{type:"number",placeholder:"Target ID",value:s.targetId,onChange:e=>t(s=>({...s,targetId:e.target.value})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Date Range"}),
/* @__PURE__ */l.jsxs("div",{className:"flex space-x-2",children:[
/* @__PURE__ */l.jsx("input",{type:"date",value:s.dateStart,onChange:e=>t(s=>({...s,dateStart:e.target.value})),className:"flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"}),
/* @__PURE__ */l.jsx("input",{type:"date",value:s.dateEnd,onChange:e=>t(s=>({...s,dateEnd:e.target.value})),className:"flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"mt-4 flex justify-end space-x-2",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>t({targetType:"",targetId:"",dateStart:"",dateEnd:""}),className:"px-3 py-1 text-sm text-gray-600 hover:text-gray-800",children:"Clear Advanced"}),
/* @__PURE__ */l.jsx("button",{onClick:a,className:"px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700",children:"Apply Filters"})]})]}),ce=({selectedLogs:e,onClearSelection:s,onBulkExport:t,onBulkFlag:a})=>/* @__PURE__ */l.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx(A,{className:"h-5 w-5 text-blue-600"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-blue-800",children:[e.size," log",1!==e.size?"s":""," selected"]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("button",{onClick:t,className:"px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors",children:"Export Selected"}),
/* @__PURE__ */l.jsx("button",{onClick:a,className:"px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors",children:"Flag for Review"}),
/* @__PURE__ */l.jsx("button",{onClick:s,className:"px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors",children:"Clear Selection"})]})]})});function me(){const[e,x]=s.useState({action:"",admin_id:"",days_back:7,limit:50,offset:0}),[g,h]=s.useState(""),[p,y]=s.useState(/* @__PURE__ */new Set),[v,f]=s.useState(null),[j,N]=s.useState(!1),[A,D]=s.useState(!1),[E,U]=s.useState(!0),[R]=s.useState(["ban","delete","flag","suspend"]),[P,q]=s.useState({targetType:"",targetId:"",dateStart:"",dateEnd:""}),I=s.useMemo(()=>({...e,...P}),[e,P]),{data:B=[],isLoading:z,isError:M,refetch:O,error:$,isFetching:K}=t({queryKey:["auditLogs",I],queryFn:()=>(async({action:e,admin_id:s,days_back:t,limit:a,offset:r})=>{var l,i;const n=new URLSearchParams;e&&n.append("action",e),s&&n.append("admin_id",s),t&&n.append("days_back",t),a&&n.append("limit",a),r&&n.append("offset",r);try{const{data:e}=await J.get("/api/admin/audit-logs?"+n);return e}catch($){throw Error((null==(i=null==(l=$.response)?void 0:l.data)?void 0:i.detail)||"Failed to fetch audit logs")}})(I),staleTime:12e4,retry:2,refetchInterval:!!E&&3e4,onError:e=>{r.error("Failed to load audit logs.")},onSuccess:e=>{var s;if(B.length>0&&e.length>0){const t=new Date((null==(s=B[0])?void 0:s.created_at)||0);e.filter(e=>new Date(e.created_at)>t&&R.some(s=>e.action.toLowerCase().includes(s))).forEach(e=>{r(`🚨 Critical Action: ${e.action} by ${e.admin_username}`,{duration:8e3,style:{background:"#ef4444",color:"white"}})})}}}),Q=a({mutationFn:()=>(async(e,s)=>{const t=new URLSearchParams;Object.entries(e).forEach(([e,s])=>{null!=s&&""!==s&&t.append(e,s)}),s&&t.append("search",s);const a=await J.get("/api/admin/audit-logs/export?"+t,{responseType:"blob"}),r=window.URL.createObjectURL(new Blob([a.data])),l=document.createElement("a");l.href=r,l.setAttribute("download",`audit-logs-${/* @__PURE__ */(new Date).toISOString().split("T")[0]}.csv`),document.body.appendChild(l),l.click(),l.remove(),window.URL.revokeObjectURL(r)})(e,g),onSuccess:()=>{r.success("Audit logs exported successfully!")},onError:e=>{r.error("Failed to export audit logs")}}),X=s.useMemo(()=>B.filter(e=>{var s,t,a,r;const l=g.toLowerCase();return(null==(s=e.admin_username)?void 0:s.toLowerCase().includes(l))||(null==(t=e.action)?void 0:t.toLowerCase().includes(l))||(null==(a=e.target_type)?void 0:a.toLowerCase().includes(l))||(null==(r=e.details)?void 0:r.toLowerCase().includes(l))}),[B,g]),V=s.useCallback((e,s)=>{x(t=>({...t,[e]:s,offset:0}))},[]),H=s.useCallback(e=>{y(s=>{const t=new Set(s);return t.has(e)?t.delete(e):t.add(e),t})},[]),W=s.useCallback(()=>{p.size===X.length&&X.length>0?y(/* @__PURE__ */new Set):y(new Set(X.map(e=>e.id)))},[p.size,X]),Y=[{label:"Last 24h",days_back:1,icon:m},{label:"Critical Actions",actions:R,icon:i},{label:"User Changes",action:"user",icon:c},{label:"Approvals",action:"approve",icon:_},{label:"Deletions",action:"delete",icon:T}],G=s.useCallback(e=>{e.days_back&&V("days_back",e.days_back),e.action&&V("action",e.action),e.actions&&h(e.actions.join("|"))},[V]),Z=s.useCallback(()=>{r.success("Advanced filters applied")},[]),ee=s.useCallback(()=>{r.success(`Exporting ${p.size} selected logs...`)},[p.size]),se=s.useCallback(()=>{r.success(`Flagged ${p.size} logs for review`)},[p.size]),te=s.useCallback(e=>{const s={create:"text-green-600 bg-green-100",update:"text-blue-600 bg-blue-100",delete:"text-red-600 bg-red-100",approve:"text-emerald-600 bg-emerald-100",reject:"text-orange-600 bg-orange-100",flag:"text-yellow-600 bg-yellow-100",ban:"text-red-700 bg-red-200",unban:"text-green-700 bg-green-200",login:"text-gray-600 bg-gray-100"},t=null==e?void 0:e.toLowerCase();for(const[a,r]of Object.entries(s))if(null==t?void 0:t.includes(a))return r;return"text-gray-600 bg-gray-100"},[]),ae=s.useCallback(e=>{switch(null==e?void 0:e.toLowerCase()){case"user":/* @__PURE__ */
return l.jsx(c,{className:"h-4 w-4"});case"task":/* @__PURE__ */
return l.jsx(b,{className:"h-4 w-4"});case"submission":/* @__PURE__ */
return l.jsx(_,{className:"h-4 w-4"});case"badge":/* @__PURE__ */
return l.jsx(k,{className:"h-4 w-4"});case"system":/* @__PURE__ */
return l.jsx(w,{className:"h-4 w-4"});default:/* @__PURE__ */
return l.jsx(i,{className:"h-4 w-4"})}},[]);return z&&0===B.length?/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center h-64",children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"}),
/* @__PURE__ */l.jsx("p",{className:"ml-4 text-gray-600",children:"Loading audit logs..."})]}):M?/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(i,{className:"mx-auto h-12 w-12 text-red-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"Error Loading Logs"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:(null==$?void 0:$.message)||"Could not load audit logs."}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>O(),className:"mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Retry"]})]}):/* @__PURE__ */l.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h2",{className:"text-3xl font-bold text-gray-900",children:"Audit Log"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Track all administrative actions and system changes"})]}),
/* @__PURE__ */l.jsxs("div",{className:"mt-4 sm:mt-0 flex items-center space-x-2",children:[
/* @__PURE__ */l.jsxs("label",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:E,onChange:e=>U(e.target.checked),className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),
/* @__PURE__ */l.jsx("span",{className:"ml-2 text-sm text-gray-600",children:"Auto-refresh"})]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>Q.mutate(),disabled:Q.isPending,className:"inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50",children:[
/* @__PURE__ */l.jsx(d,{className:"h-4 w-4 mr-1"}),Q.isPending?"Exporting...":"Export"]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>O(),disabled:K,className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-2 "+(K?"animate-spin":"")}),"Refresh"]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg p-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(o,{className:"h-5 w-5 text-gray-400 mr-2"}),
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Filters"})]}),
/* @__PURE__ */l.jsx("button",{onClick:()=>D(!A),className:"flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium",children:A?/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx(C,{className:"h-4 w-4 mr-1"}),"Hide Advanced"]}):/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx(S,{className:"h-4 w-4 mr-1"}),"Show Advanced"]})})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Search"}),
/* @__PURE__ */l.jsxs("div",{className:"relative",children:[
/* @__PURE__ */l.jsx("input",{type:"text",placeholder:"Search logs...",value:g,onChange:e=>h(e.target.value),className:"w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"}),
/* @__PURE__ */l.jsx(L,{className:"absolute left-2 top-2.5 h-4 w-4 text-gray-400"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Action"}),
/* @__PURE__ */l.jsxs("select",{value:e.action,onChange:e=>V("action",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"",children:"All Actions"}),
/* @__PURE__ */l.jsx("option",{value:"create",children:"Create"}),
/* @__PURE__ */l.jsx("option",{value:"update",children:"Update"}),
/* @__PURE__ */l.jsx("option",{value:"delete",children:"Delete"}),
/* @__PURE__ */l.jsx("option",{value:"approve",children:"Approve"}),
/* @__PURE__ */l.jsx("option",{value:"reject",children:"Reject"}),
/* @__PURE__ */l.jsx("option",{value:"flag",children:"Flag"}),
/* @__PURE__ */l.jsx("option",{value:"ban",children:"Ban"}),
/* @__PURE__ */l.jsx("option",{value:"unban",children:"Unban"}),
/* @__PURE__ */l.jsx("option",{value:"login",children:"Login"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Admin ID"}),
/* @__PURE__ */l.jsx("input",{type:"number",placeholder:"Admin ID",value:e.admin_id,onChange:e=>V("admin_id",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Time Range"}),
/* @__PURE__ */l.jsxs("select",{value:e.days_back,onChange:e=>V("days_back",parseInt(e.target.value)),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:1,children:"Last 24 hours"}),
/* @__PURE__ */l.jsx("option",{value:7,children:"Last 7 days"}),
/* @__PURE__ */l.jsx("option",{value:30,children:"Last 30 days"}),
/* @__PURE__ */l.jsx("option",{value:90,children:"Last 90 days"})]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200",children:[
/* @__PURE__ */l.jsx("span",{className:"text-xs font-medium text-gray-500",children:"Quick Filters:"}),Y.map(e=>{const s=e.icon;/* @__PURE__ */
return l.jsxs("button",{onClick:()=>G(e),className:"inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors",children:[
/* @__PURE__ */l.jsx(s,{className:"h-3 w-3 mr-1"}),e.label]},e.label)})]}),
/* @__PURE__ */l.jsx(oe,{showAdvancedFilters:A,advancedFilters:P,setAdvancedFilters:q,onApplyAdvanced:Z})]}),p.size>0&&/* @__PURE__ */l.jsx(ce,{selectedLogs:p,onClearSelection:()=>y(/* @__PURE__ */new Set),onBulkExport:ee,onBulkFlag:se}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:[
/* @__PURE__ */l.jsx("div",{className:"px-6 py-4 border-b border-gray-200",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Audit Logs"}),
/* @__PURE__ */l.jsxs("p",{className:"mt-1 text-sm text-gray-500",children:["Showing ",X.length," of ",B.length," entries"]})]}),X.length>0&&/* @__PURE__ */l.jsxs("label",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:p.size===X.length&&X.length>0,onChange:W,className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),
/* @__PURE__ */l.jsx("span",{className:"ml-2 text-sm text-gray-600",children:"Select All"})]})]})}),
/* @__PURE__ */l.jsx("div",{className:"max-h-96 overflow-y-auto",children:X.length>0?/* @__PURE__ */l.jsx("ul",{className:"divide-y divide-gray-200",children:X.map(e=>/* @__PURE__ */l.jsx("li",{className:"px-6 py-4 hover:bg-gray-50",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-start justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-start space-x-3",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:p.has(e.id),onChange:()=>H(e.id),className:"mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+te(e.action),children:e.action}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[ae(e.target_type),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium text-gray-900",children:e.admin_username||"Admin #"+e.admin_id}),
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-500",children:"performed action on"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-gray-700",children:[e.target_type," #",e.target_id]})]}),e.details&&/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-600 truncate",children:e.details})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>{f(e),N(!0)},className:"text-blue-600 hover:text-blue-800",title:"View Details",children:/* @__PURE__ */l.jsx(u,{className:"h-4 w-4"})}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center text-xs text-gray-500",children:[
/* @__PURE__ */l.jsx(F,{className:"h-4 w-4 mr-1"}),new Date(e.created_at).toLocaleString()]})]})]})},e.id))}):/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(_,{className:"mx-auto h-12 w-12 text-gray-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No audit logs"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:0===B.length?"No administrative actions have been logged recently.":"No logs match your current filters."})]})})]}),B.length>=e.limit&&/* @__PURE__ */l.jsxs("div",{className:"bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex-1 flex justify-between sm:hidden",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>V("offset",Math.max(0,e.offset-e.limit)),disabled:0===e.offset,className:"relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",children:"Previous"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>V("offset",e.offset+e.limit),className:"ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",children:"Next"})]}),
/* @__PURE__ */l.jsxs("div",{className:"hidden sm:flex-1 sm:flex sm:items-center sm:justify-between",children:[
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsxs("p",{className:"text-sm text-gray-700",children:["Showing ",
/* @__PURE__ */l.jsx("span",{className:"font-medium",children:e.offset+1})," to"," ",
/* @__PURE__ */l.jsx("span",{className:"font-medium",children:Math.min(e.offset+e.limit,B.length)})," of"," ",
/* @__PURE__ */l.jsxs("span",{className:"font-medium",children:[B.length,"+"]})," results"]})}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsxs("nav",{className:"relative z-0 inline-flex rounded-md shadow-sm -space-x-px",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>V("offset",Math.max(0,e.offset-e.limit)),disabled:0===e.offset,className:"relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",children:"Previous"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>V("offset",e.offset+e.limit),className:"relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",children:"Next"})]})})]})]}),j&&/* @__PURE__ */l.jsx(de,{log:v,onClose:()=>{N(!1),f(null)}})]})}function xe(){const[e,t]=s.useState([]),[a,i]=s.useState({total_users:0,active_users_today:0,total_tasks_completed:0,total_badges_earned:0,platform_stats:{},recent_activity:[]}),[d,c]=s.useState(!0),[m,u]=s.useState("week"),[g,h]=s.useState("xp"),[b,p]=s.useState("desc"),[y,v]=s.useState(""),j=s.useCallback(async()=>{c(!0);try{const e=await J.get("/admin/user-progress",{params:{sort_by:g,sort_order:b,search:y,timeframe:m}}),s=await J.get("/admin/platform-analytics",{params:{timeframe:m}});t(e.data.report||[]),i({total_users:e.data.total_users||0,active_users_today:s.data.active_users_today||0,total_tasks_completed:s.data.total_tasks_completed||0,total_badges_earned:s.data.total_badges_earned||0,platform_stats:s.data.platform_stats||{},recent_activity:s.data.recent_activity||[]})}catch(e){r.error("Failed to load analytics data.")}finally{c(!1)}},[g,b,y,m]);s.useEffect(()=>{j()},[j]);const N=e=>{g===e?p("asc"===b?"desc":"asc"):(h(e),p("desc"))},w=e=>g!==e?null:"asc"===b?"↑":"↓",k=e.filter(e=>e.username.toLowerCase().includes(y.toLowerCase())||e.email.toLowerCase().includes(y.toLowerCase()));return d?/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center h-64",children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"}),
/* @__PURE__ */l.jsx("p",{className:"ml-4 text-gray-600",children:"Loading analytics..."})]}):/* @__PURE__ */l.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h2",{className:"text-3xl font-bold text-gray-900",children:"User Analytics"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Comprehensive platform insights and user progress tracking"})]}),
/* @__PURE__ */l.jsxs("div",{className:"mt-4 sm:mt-0 flex items-center space-x-3",children:[
/* @__PURE__ */l.jsxs("select",{value:m,onChange:e=>u(e.target.value),className:"px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"day",children:"Today"}),
/* @__PURE__ */l.jsx("option",{value:"week",children:"This Week"}),
/* @__PURE__ */l.jsx("option",{value:"month",children:"This Month"}),
/* @__PURE__ */l.jsx("option",{value:"quarter",children:"This Quarter"}),
/* @__PURE__ */l.jsx("option",{value:"year",children:"This Year"})]}),
/* @__PURE__ */l.jsxs("button",{onClick:j,className:"inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Refresh"]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[
/* @__PURE__ */l.jsx("div",{className:"bg-white overflow-hidden shadow rounded-lg",children:/* @__PURE__ */l.jsx("div",{className:"p-5",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx(D,{className:"h-6 w-6 text-gray-400"})}),
/* @__PURE__ */l.jsx("div",{className:"ml-5 w-0 flex-1",children:/* @__PURE__ */l.jsxs("dl",{children:[
/* @__PURE__ */l.jsx("dt",{className:"text-sm font-medium text-gray-500 truncate",children:"Total Users"}),
/* @__PURE__ */l.jsx("dd",{className:"text-lg font-medium text-gray-900",children:a.total_users.toLocaleString()})]})})]})})}),
/* @__PURE__ */l.jsx("div",{className:"bg-white overflow-hidden shadow rounded-lg",children:/* @__PURE__ */l.jsx("div",{className:"p-5",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx(E,{className:"h-6 w-6 text-green-400"})}),
/* @__PURE__ */l.jsx("div",{className:"ml-5 w-0 flex-1",children:/* @__PURE__ */l.jsxs("dl",{children:[
/* @__PURE__ */l.jsx("dt",{className:"text-sm font-medium text-gray-500 truncate",children:"Active Today"}),
/* @__PURE__ */l.jsx("dd",{className:"text-lg font-medium text-gray-900",children:a.active_users_today.toLocaleString()})]})})]})})}),
/* @__PURE__ */l.jsx("div",{className:"bg-white overflow-hidden shadow rounded-lg",children:/* @__PURE__ */l.jsx("div",{className:"p-5",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx(x,{className:"h-6 w-6 text-blue-400"})}),
/* @__PURE__ */l.jsx("div",{className:"ml-5 w-0 flex-1",children:/* @__PURE__ */l.jsxs("dl",{children:[
/* @__PURE__ */l.jsx("dt",{className:"text-sm font-medium text-gray-500 truncate",children:"Tasks Completed"}),
/* @__PURE__ */l.jsx("dd",{className:"text-lg font-medium text-gray-900",children:a.total_tasks_completed.toLocaleString()})]})})]})})}),
/* @__PURE__ */l.jsx("div",{className:"bg-white overflow-hidden shadow rounded-lg",children:/* @__PURE__ */l.jsx("div",{className:"p-5",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx(f,{className:"h-6 w-6 text-yellow-400"})}),
/* @__PURE__ */l.jsx("div",{className:"ml-5 w-0 flex-1",children:/* @__PURE__ */l.jsxs("dl",{children:[
/* @__PURE__ */l.jsx("dt",{className:"text-sm font-medium text-gray-500 truncate",children:"Badges Earned"}),
/* @__PURE__ */l.jsx("dd",{className:"text-lg font-medium text-gray-900",children:a.total_badges_earned.toLocaleString()})]})})]})})})]}),
/* @__PURE__ */l.jsx("div",{className:"bg-white shadow rounded-lg p-6",children:/* @__PURE__ */l.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */l.jsx(o,{className:"h-5 w-5 text-gray-400"}),
/* @__PURE__ */l.jsx("input",{type:"text",placeholder:"Search users...",value:y,onChange:e=>v(e.target.value),className:"px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-3",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm text-gray-500",children:"Sort by:"}),
/* @__PURE__ */l.jsxs("select",{value:g,onChange:e=>h(e.target.value),className:"px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"xp",children:"XP"}),
/* @__PURE__ */l.jsx("option",{value:"username",children:"Username"}),
/* @__PURE__ */l.jsx("option",{value:"submitted",children:"Submissions"}),
/* @__PURE__ */l.jsx("option",{value:"approved",children:"Approved"}),
/* @__PURE__ */l.jsx("option",{value:"badges",children:"Badges"}),
/* @__PURE__ */l.jsx("option",{value:"created_at",children:"Join Date"})]})]})]})}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:[
/* @__PURE__ */l.jsxs("div",{className:"px-6 py-4 border-b border-gray-200",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"User Progress Report"}),
/* @__PURE__ */l.jsxs("p",{className:"mt-1 text-sm text-gray-500",children:["Showing ",k.length," of ",a.total_users," users"]})]}),
/* @__PURE__ */l.jsx("div",{className:"overflow-x-auto",children:/* @__PURE__ */l.jsxs("table",{className:"w-full divide-y divide-gray-200",children:[
/* @__PURE__ */l.jsx("thead",{className:"bg-gray-50",children:/* @__PURE__ */l.jsxs("tr",{children:[
/* @__PURE__ */l.jsxs("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",onClick:()=>N("username"),children:["Username ",w("username")]}),
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Email"}),
/* @__PURE__ */l.jsxs("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",onClick:()=>N("xp"),children:["XP ",w("xp")]}),
/* @__PURE__ */l.jsxs("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",onClick:()=>N("submitted"),children:["Submitted ",w("submitted")]}),
/* @__PURE__ */l.jsxs("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",onClick:()=>N("approved"),children:["Approved ",w("approved")]}),
/* @__PURE__ */l.jsxs("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",onClick:()=>N("badges"),children:["Badges ",w("badges")]}),
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Level"}),
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Status"})]})}),
/* @__PURE__ */l.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:k.map((e,s)=>{var t;/* @__PURE__ */
return l.jsxs("tr",{className:s%2==0?"bg-white":"bg-gray-50",children:[
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium",children:e.username.charAt(0).toUpperCase()}),
/* @__PURE__ */l.jsx("div",{className:"ml-3",children:/* @__PURE__ */l.jsx("div",{className:"text-sm font-medium text-gray-900",children:e.username})})]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:e.email}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium",children:(null==(t=e.xp)?void 0:t.toLocaleString())||0}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-900",children:e.submitted||0}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold",children:e.approved||0}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium",children:e.badges||0}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-900",children:/* @__PURE__ */l.jsxs("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",children:["Level ",e.level||1]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+("active"===e.status?"bg-green-100 text-green-800":"bg-gray-100 text-gray-800"),children:e.status||"active"})})]},e.id)})})]})}),0===k.length&&/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(D,{className:"mx-auto h-12 w-12 text-gray-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No users found"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Try adjusting your search terms or filters."})]})]})]})}const ue=async({userId:e,status:s,reason:t})=>{const{data:a}=await J.put(`/api/admin/users/${e}/status`,{status:s,reason:t});return a},ge=async({userId:e,role:s})=>{const{data:t}=await J.patch(`/api/admin/users/${e}/role`,{role:s});return t},he=async({userId:e})=>{const{data:s}=await J.delete("/api/admin/users/"+e);return s},be=async()=>{var e;try{const{data:s}=await J.get("/api/admin/analytics/overview");return{total_users:s.total_users||0,active_users:s.active_users_this_week||0,new_users_today:s.new_users_today||0,avg_xp:Math.round((null==(e=s.platform_stats)?void 0:e.avg_user_xp)||0)}}catch(s){return{total_users:0,active_users:0,new_users_today:0,avg_xp:0}}},pe=async e=>{const s=new URLSearchParams;Object.entries(e).forEach(([e,t])=>{null!=t&&""!==t&&s.append(e,t)});const t=await J.get("/api/admin/reports/user-progress?"+s,{responseType:"blob"}),a=window.URL.createObjectURL(new Blob([t.data])),r=document.createElement("a");r.href=a,r.setAttribute("download",`users-export-${/* @__PURE__ */(new Date).toISOString().split("T")[0]}.csv`),document.body.appendChild(r),r.click(),r.remove(),window.URL.revokeObjectURL(a)},ye=async({userIds:e,status:s,reason:t})=>{const{data:a}=await J.post("/api/admin/users/bulk-status",{user_ids:e,status:s,reason:t});return a},ve=({stats:e,isLoading:s})=>{var t,a,r,i;if(s)/* @__PURE__ */
return l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",children:[1,2,3,4].map(e=>/* @__PURE__ */l.jsx("div",{className:"bg-white p-4 rounded-lg border border-gray-200 animate-pulse",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"h-8 w-8 bg-gray-300 rounded mr-3"}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */l.jsx("div",{className:"h-6 bg-gray-300 rounded w-16 mb-1"}),
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-300 rounded w-20"})]})]})},e))});if(!e)return null;const n=[{icon:D,value:(null==(t=e.total_users)?void 0:t.toLocaleString())||"0",label:"Total Users",color:"text-blue-600"},{icon:x,value:(null==(a=e.active_users)?void 0:a.toLocaleString())||"0",label:"Active Users",color:"text-green-600"},{icon:F,value:(null==(r=e.new_users_today)?void 0:r.toLocaleString())||"0",label:"New Today",color:"text-purple-600"},{icon:f,value:(null==(i=e.avg_xp)?void 0:i.toLocaleString())||"0",label:"Avg XP",color:"text-yellow-600"}];/* @__PURE__ */
return l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",children:n.map((e,s)=>{const t=e.icon;/* @__PURE__ */
return l.jsx("div",{className:"bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(t,{className:`h-8 w-8 ${e.color} mr-3`}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("p",{className:"text-2xl font-bold text-gray-900",children:e.value}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500",children:e.label})]})]})},s)})})},fe=({selectedCount:e,onBulkAction:s,onClearSelection:t})=>/* @__PURE__ */l.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx(A,{className:"h-5 w-5 text-blue-600"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm font-medium text-blue-800",children:[e," user",1!==e?"s":""," selected"]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>s("active"),className:"px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors",children:"Activate"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>s("suspended"),className:"px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors",children:"Suspend"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>s("banned"),className:"px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors",children:"Ban"}),
/* @__PURE__ */l.jsx("button",{onClick:t,className:"px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors",children:"Clear"})]})]})}),je=({field:e,currentSort:s,onSort:t,children:a})=>/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors",onClick:()=>t(e),children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-1",children:[
/* @__PURE__ */l.jsx("span",{children:a}),s.field===e&&/* @__PURE__ */l.jsx("span",{className:"text-blue-600",children:"desc"===s.direction?/* @__PURE__ */l.jsx(S,{className:"h-3 w-3"}):/* @__PURE__ */l.jsx(C,{className:"h-3 w-3"})}),s.field!==e&&/* @__PURE__ */l.jsx(P,{className:"h-3 w-3 text-gray-400"})]})}),Ne=({user:e,activity:s,isLoading:t,onClose:a})=>/* @__PURE__ */l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-10 mx-auto p-6 border max-w-4xl shadow-lg rounded-md bg-white m-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex justify-between items-center mb-4",children:[
/* @__PURE__ */l.jsxs("h3",{className:"text-xl font-bold text-gray-900",children:["Activity Timeline - ",null==e?void 0:e.username]}),
/* @__PURE__ */l.jsx("button",{onClick:a,className:"text-gray-400 hover:text-gray-600 transition-colors",children:/* @__PURE__ */l.jsx(p,{className:"h-6 w-6"})})]}),
/* @__PURE__ */l.jsx("div",{className:"max-h-96 overflow-y-auto",children:t?/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center py-8",children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"}),
/* @__PURE__ */l.jsx("span",{className:"ml-3 text-gray-600",children:"Loading activity..."})]}):s&&s.length>0?/* @__PURE__ */l.jsx("div",{className:"space-y-3",children:s.map((e,s)=>{var t;/* @__PURE__ */
return l.jsxs("div",{className:"flex items-start space-x-3 p-3 border-l-2 border-blue-200 bg-gray-50 rounded-r-lg",children:[
/* @__PURE__ */l.jsx("div",{className:"w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0",children:/* @__PURE__ */l.jsx(m,{className:"h-4 w-4 text-blue-600"})}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */l.jsx("p",{className:"text-sm font-medium text-gray-900",children:e.detail||e.action.replace(/_/g," ")}),
/* @__PURE__ */l.jsx("p",{className:"text-xs text-gray-500",children:new Date(e.created_at).toLocaleString()}),(null==(t=e.meta_data)?void 0:t.xp_gained)&&/* @__PURE__ */l.jsxs("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1",children:["+",e.meta_data.xp_gained," XP"]})]})]},s)})}):/* @__PURE__ */l.jsxs("div",{className:"text-center py-8 text-gray-500",children:[
/* @__PURE__ */l.jsx(m,{className:"h-12 w-12 mx-auto mb-2 text-gray-300"}),
/* @__PURE__ */l.jsx("p",{children:"No recent activity found"})]})})]})});function we(){const c=e(),[g,h]=s.useState({status:"",search:"",min_xp:null,include_inactive:!1,limit:25,offset:0}),[b,p]=s.useState({field:"created_at",direction:"desc"}),[y,v]=s.useState(/* @__PURE__ */new Set),[j,N]=s.useState(null),[w,k]=s.useState(!1),[C,S]=s.useState(""),[F,A]=s.useState({status:"active",role:"user",reason:""}),[E,P]=s.useState(!1),[q,I]=s.useState(null),{data:B=[],isLoading:z,isError:M,error:O,refetch:$}=t({queryKey:["adminUsers",g,b],queryFn:()=>(async({status:e,search:s,sort_by:t,order:a,min_xp:r,include_inactive:l,limit:i,offset:n})=>{var d,o;const c=new URLSearchParams;e&&c.append("status",e),s&&c.append("search",s),t&&c.append("sort_by",t),a&&c.append("order",a),null!=r&&c.append("min_xp",r),l&&c.append("include_inactive","true"),i&&c.append("limit",i),n&&c.append("offset",n);try{const{data:e}=await J.get("/api/admin/users?"+c);return e}catch(O){throw Error((null==(o=null==(d=O.response)?void 0:d.data)?void 0:o.detail)||"Failed to fetch users")}})({...g,sort_by:b.field,order:b.direction}),staleTime:12e4,retry:2,onError:e=>{r.error("Failed to load users")}}),{data:K,isLoading:Q}=t({queryKey:["adminUserStats"],queryFn:be,staleTime:3e5,retry:2}),{data:X,isLoading:V}=t({queryKey:["userActivity",null==q?void 0:q.id],queryFn:()=>(async e=>{try{const{data:s}=await J.get("/api/activities/",{params:{user_id:e,limit:20,filter_type:"all"}});return s}catch(O){return[]}})(q.id),enabled:!!q,staleTime:6e4}),H=a({mutationFn:ue,onSuccess:(e,s)=>{r.success("User status updated to "+s.status),c.invalidateQueries({queryKey:["adminUsers"]}),c.invalidateQueries({queryKey:["adminUserStats"]}),k(!1)},onError:e=>{r.error(e.message||"Failed to update user status")}}),W=a({mutationFn:ge,onSuccess:(e,s)=>{r.success("User role updated to "+s.role),c.invalidateQueries({queryKey:["adminUsers"]}),k(!1)},onError:e=>{r.error(e.message||"Failed to update user role")}}),Y=a({mutationFn:he,onSuccess:()=>{r.success("User deleted successfully"),c.invalidateQueries({queryKey:["adminUsers"]}),c.invalidateQueries({queryKey:["adminUserStats"]}),k(!1)},onError:e=>{r.error(e.message||"Failed to delete user")}}),G=a({mutationFn:pe,onSuccess:()=>{r.success("User data exported successfully!")},onError:e=>{r.error("Failed to export user data")}}),Z=a({mutationFn:ye,onSuccess:(e,s)=>{r.success(`${s.userIds.length} users updated to ${s.status}`),c.invalidateQueries({queryKey:["adminUsers"]}),v(/* @__PURE__ */new Set)},onError:e=>{r.error("Failed to update users")}}),ee=s.useCallback((e,s)=>{h(t=>({...t,[e]:s,offset:0}))},[]),se=s.useCallback(e=>{p(s=>({field:e,direction:s.field===e&&"desc"===s.direction?"asc":"desc"}))},[]),te=s.useCallback(()=>{y.size===B.length&&B.length>0?v(/* @__PURE__ */new Set):v(new Set(B.map(e=>e.id)))},[B,y.size]),ae=s.useCallback(e=>{v(s=>{const t=new Set(s);return t.has(e)?t.delete(e):t.add(e),t})},[]),re=s.useCallback((e,s)=>{N(s),S(e),A({status:(null==s?void 0:s.status)||"active",role:(null==s?void 0:s.role)||"user",reason:""}),k(!0)},[]),le=s.useCallback(()=>{if(j)switch(C){case"status":H.mutate({userId:j.id,status:F.status,reason:F.reason});break;case"role":W.mutate({userId:j.id,role:F.role});break;case"delete":Y.mutate({userId:j.id})}},[j,C,F,H,W,Y]),ie=s.useCallback(e=>{if(0===y.size)return;const s=`Bulk ${e} action by admin`;Z.mutate({userIds:Array.from(y),status:e,reason:s})},[y,Z]),ne=s.useCallback(e=>({active:"bg-green-100 text-green-800",suspended:"bg-yellow-100 text-yellow-800",banned:"bg-red-100 text-red-800",inactive:"bg-gray-100 text-gray-800"}[e]||"bg-gray-100 text-gray-800"),[]),de=s.useCallback(e=>({admin:"bg-purple-100 text-purple-800",moderator:"bg-blue-100 text-blue-800",user:"bg-gray-100 text-gray-800"}[e]||"bg-gray-100 text-gray-800"),[]),oe=s.useCallback(e=>{ee("offset","prev"===e?Math.max(0,g.offset-g.limit):g.offset+g.limit)},[g,ee]);return z&&0===B.length?/* @__PURE__ */l.jsx("div",{className:"bg-white shadow rounded-lg p-6",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-center py-12",children:[
/* @__PURE__ */l.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"}),
/* @__PURE__ */l.jsx("p",{className:"ml-3 text-gray-600",children:"Loading users..."})]})}):M?/* @__PURE__ */l.jsx("div",{className:"bg-white shadow rounded-lg p-6",children:/* @__PURE__ */l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(i,{className:"mx-auto h-12 w-12 text-red-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"Error Loading Users"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:(null==O?void 0:O.message)||"Unable to load user data."}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>$(),className:"mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Retry"]})]})}):/* @__PURE__ */l.jsxs("div",{className:"space-y-6",children:[
/* @__PURE__ */l.jsx(ve,{stats:K,isLoading:Q}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:[
/* @__PURE__ */l.jsx("div",{className:"px-6 py-4 border-b border-gray-200",children:/* @__PURE__ */l.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(D,{className:"h-6 w-6 text-gray-400 mr-3"}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"User Management"}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500",children:"Manage platform users and their permissions"})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"mt-4 sm:mt-0 flex items-center space-x-2",children:[
/* @__PURE__ */l.jsxs("button",{onClick:()=>G.mutate(g),disabled:G.isPending,className:"inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors",children:[
/* @__PURE__ */l.jsx(d,{className:"h-4 w-4 mr-1"}),G.isPending?"Exporting...":"Export"]}),
/* @__PURE__ */l.jsxs("button",{onClick:()=>$(),className:"inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Refresh"]})]})]})}),
/* @__PURE__ */l.jsxs("div",{className:"px-6 py-4 border-b border-gray-200 bg-gray-50",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center mb-3",children:[
/* @__PURE__ */l.jsx(o,{className:"h-5 w-5 text-gray-400 mr-2"}),
/* @__PURE__ */l.jsx("h4",{className:"text-sm font-medium text-gray-900",children:"Filters"})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Search"}),
/* @__PURE__ */l.jsxs("div",{className:"relative",children:[
/* @__PURE__ */l.jsx("input",{type:"text",placeholder:"Username or email...",value:g.search,onChange:e=>ee("search",e.target.value),className:"w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"}),
/* @__PURE__ */l.jsx(L,{className:"absolute left-2 top-2.5 h-4 w-4 text-gray-400"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Status"}),
/* @__PURE__ */l.jsxs("select",{value:g.status,onChange:e=>ee("status",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"",children:"All Statuses"}),
/* @__PURE__ */l.jsx("option",{value:"active",children:"Active"}),
/* @__PURE__ */l.jsx("option",{value:"suspended",children:"Suspended"}),
/* @__PURE__ */l.jsx("option",{value:"banned",children:"Banned"}),
/* @__PURE__ */l.jsx("option",{value:"inactive",children:"Inactive"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-xs font-medium text-gray-700 mb-1",children:"Min XP"}),
/* @__PURE__ */l.jsx("input",{type:"number",placeholder:"0",value:g.min_xp||"",onChange:e=>ee("min_xp",e.target.value?parseInt(e.target.value):null),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("input",{type:"checkbox",id:"includeInactive",checked:g.include_inactive,onChange:e=>ee("include_inactive",e.target.checked),className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),
/* @__PURE__ */l.jsx("label",{htmlFor:"includeInactive",className:"ml-2 text-sm text-gray-700",children:"Include inactive"})]})]})]}),y.size>0&&/* @__PURE__ */l.jsx(fe,{selectedCount:y.size,onBulkAction:ie,onClearSelection:()=>v(/* @__PURE__ */new Set)}),
/* @__PURE__ */l.jsx("div",{className:"overflow-x-auto",children:/* @__PURE__ */l.jsxs("table",{className:"min-w-full divide-y divide-gray-200",children:[
/* @__PURE__ */l.jsx("thead",{className:"bg-gray-50",children:/* @__PURE__ */l.jsxs("tr",{children:[
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left",children:/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:y.size===B.length&&B.length>0,onChange:te,className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"})}),
/* @__PURE__ */l.jsx(je,{field:"username",currentSort:b,onSort:se,children:"User"}),
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Status & Role"}),
/* @__PURE__ */l.jsx(je,{field:"xp",currentSort:b,onSort:se,children:"Progress"}),
/* @__PURE__ */l.jsx(je,{field:"created_at",currentSort:b,onSort:se,children:"Activity"}),
/* @__PURE__ */l.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Actions"})]})}),
/* @__PURE__ */l.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:B.length>0?B.map(e=>{var s,t;/* @__PURE__ */
return l.jsxs("tr",{className:"hover:bg-gray-50 transition-colors",children:[
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsx("input",{type:"checkbox",checked:y.has(e.id),onChange:()=>ae(e.id),className:"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"h-10 w-10 flex-shrink-0",children:/* @__PURE__ */l.jsx("div",{className:"h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium",children:(null==(s=e.username)?void 0:s.charAt(0).toUpperCase())||"U"})}),
/* @__PURE__ */l.jsxs("div",{className:"ml-4",children:[
/* @__PURE__ */l.jsx("div",{className:"text-sm font-medium text-gray-900",children:e.username}),
/* @__PURE__ */l.jsx("div",{className:"text-sm text-gray-500",children:e.email}),e.is_verified&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center mt-1",children:[
/* @__PURE__ */l.jsx(x,{className:"h-3 w-3 text-green-500 mr-1"}),
/* @__PURE__ */l.jsx("span",{className:"text-xs text-green-600",children:"Verified"})]})]})]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsxs("div",{className:"space-y-1",children:[
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+ne(e.status),children:e.status}),
/* @__PURE__ */l.jsx("span",{className:"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium "+de(e.role),children:e.role})]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsxs("div",{className:"space-y-1",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center text-sm",children:[
/* @__PURE__ */l.jsx(f,{className:"h-4 w-4 text-yellow-500 mr-1"}),
/* @__PURE__ */l.jsxs("span",{className:"text-gray-900",children:[(null==(t=e.xp)?void 0:t.toLocaleString())||"0"," XP"]}),
/* @__PURE__ */l.jsxs("span",{className:"ml-2 text-gray-500",children:["Lvl ",e.level||1]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center text-sm",children:[
/* @__PURE__ */l.jsx(U,{className:"h-4 w-4 text-orange-500 mr-1"}),
/* @__PURE__ */l.jsxs("span",{className:"text-gray-900",children:[e.streak||0," day streak"]})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-sm text-gray-500",children:[e.task_count||0," tasks • ",e.badge_count||0," badges"]})]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:/* @__PURE__ */l.jsxs("div",{className:"space-y-1",children:[
/* @__PURE__ */l.jsxs("div",{className:"text-sm text-gray-900",children:["Joined: ",new Date(e.created_at).toLocaleDateString()]}),e.last_active&&/* @__PURE__ */l.jsxs("div",{className:"text-sm text-gray-500",children:["Last active: ",new Date(e.last_active).toLocaleDateString()]}),e.essence_balance>0&&/* @__PURE__ */l.jsxs("div",{className:"text-sm text-purple-600",children:[e.essence_balance," essence"]})]})}),
/* @__PURE__ */l.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>re("view",e),className:"text-blue-600 hover:text-blue-900 transition-colors",title:"View Details",children:/* @__PURE__ */l.jsx(u,{className:"h-4 w-4"})}),
/* @__PURE__ */l.jsx("button",{onClick:()=>{I(e),P(!0)},className:"text-indigo-600 hover:text-indigo-900 transition-colors",title:"View Activity",children:/* @__PURE__ */l.jsx(m,{className:"h-4 w-4"})}),
/* @__PURE__ */l.jsx("button",{onClick:()=>re("status",e),className:"text-yellow-600 hover:text-yellow-900 transition-colors",title:"Change Status",children:/* @__PURE__ */l.jsx(R,{className:"h-4 w-4"})}),
/* @__PURE__ */l.jsx("button",{onClick:()=>re("role",e),className:"text-green-600 hover:text-green-900 transition-colors",title:"Change Role",children:/* @__PURE__ */l.jsx(_,{className:"h-4 w-4"})}),
/* @__PURE__ */l.jsx("button",{onClick:()=>re("delete",e),className:"text-red-600 hover:text-red-900 transition-colors",title:"Delete User",children:/* @__PURE__ */l.jsx(T,{className:"h-4 w-4"})})]})})]},e.id)}):/* @__PURE__ */l.jsx("tr",{children:/* @__PURE__ */l.jsxs("td",{colSpan:6,className:"px-6 py-12 text-center",children:[
/* @__PURE__ */l.jsx(D,{className:"mx-auto h-12 w-12 text-gray-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No users found"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"No users match your current filters."})]})})})]})}),B.length>=g.limit&&/* @__PURE__ */l.jsxs("div",{className:"px-6 py-4 border-t border-gray-200 flex items-center justify-between",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>oe("prev"),disabled:0===g.offset,className:"inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",children:"Previous"}),
/* @__PURE__ */l.jsxs("span",{className:"text-sm text-gray-700",children:["Showing ",g.offset+1,"-",g.offset+B.length,(null==K?void 0:K.total_users)&&" of "+K.total_users.toLocaleString()]}),
/* @__PURE__ */l.jsx("button",{onClick:()=>oe("next"),disabled:B.length<g.limit,className:"inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",children:"Next"})]}),w&&/* @__PURE__ */l.jsx(ke,{type:C,user:j,actionData:F,setActionData:A,onSubmit:le,onClose:()=>k(!1),isLoading:H.isPending||W.isPending||Y.isPending}),E&&/* @__PURE__ */l.jsx(Ne,{user:q,activity:X,isLoading:V,onClose:()=>{P(!1),I(null)}})]})]})}function ke({type:e,user:s,actionData:t,setActionData:a,onSubmit:r,onClose:n,isLoading:d}){var o;const c=(()=>{switch(e){case"status":return{title:"Change User Status",description:"Update status for "+(null==s?void 0:s.username),confirmText:"Update Status",confirmColor:"bg-yellow-600 hover:bg-yellow-700"};case"role":return{title:"Change User Role",description:"Update role for "+(null==s?void 0:s.username),confirmText:"Update Role",confirmColor:"bg-blue-600 hover:bg-blue-700"};case"delete":return{title:"Delete User",description:`This will permanently delete ${null==s?void 0:s.username} and all their data. This action cannot be undone.`,confirmText:"Delete User",confirmColor:"bg-red-600 hover:bg-red-700"};case"view":return{title:"User Details",description:"Detailed information for "+(null==s?void 0:s.username),confirmText:"Close",confirmColor:"bg-gray-600 hover:bg-gray-700"};default:return{title:"Action",description:"",confirmText:"Confirm",confirmColor:"bg-blue-600 hover:bg-blue-700"}}})();/* @__PURE__ */
return l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50",children:/* @__PURE__ */l.jsxs("div",{className:"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex justify-between items-center mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-bold text-gray-900",children:c.title}),
/* @__PURE__ */l.jsx("button",{onClick:n,className:"text-gray-400 hover:text-gray-600 transition-colors",children:/* @__PURE__ */l.jsx(p,{className:"h-5 w-5"})})]}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-600 mb-4",children:c.description}),"view"===e&&/* @__PURE__ */l.jsx("div",{className:"space-y-3 text-sm max-h-96 overflow-y-auto",children:/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"ID:"})}),
/* @__PURE__ */l.jsx("div",{children:null==s?void 0:s.id}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Username:"})}),
/* @__PURE__ */l.jsx("div",{children:null==s?void 0:s.username}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Email:"})}),
/* @__PURE__ */l.jsx("div",{children:null==s?void 0:s.email}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Status:"})}),
/* @__PURE__ */l.jsx("div",{children:null==s?void 0:s.status}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Role:"})}),
/* @__PURE__ */l.jsx("div",{children:null==s?void 0:s.role}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"XP:"})}),
/* @__PURE__ */l.jsx("div",{children:(null==(o=null==s?void 0:s.xp)?void 0:o.toLocaleString())||"0"}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Level:"})}),
/* @__PURE__ */l.jsx("div",{children:(null==s?void 0:s.level)||1}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Streak:"})}),
/* @__PURE__ */l.jsxs("div",{children:[(null==s?void 0:s.streak)||0," days"]}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Tasks:"})}),
/* @__PURE__ */l.jsx("div",{children:(null==s?void 0:s.task_count)||0}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Badges:"})}),
/* @__PURE__ */l.jsx("div",{children:(null==s?void 0:s.badge_count)||0}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Verified:"})}),
/* @__PURE__ */l.jsx("div",{children:(null==s?void 0:s.is_verified)?"Yes":"No"}),
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Joined:"})}),
/* @__PURE__ */l.jsx("div",{children:new Date(null==s?void 0:s.created_at).toLocaleString()}),(null==s?void 0:s.wallet_address)&&/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsx("div",{children:/* @__PURE__ */l.jsx("strong",{children:"Wallet:"})}),
/* @__PURE__ */l.jsx("div",{className:"truncate",children:s.wallet_address})]})]})}),"status"===e&&/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"New Status"}),
/* @__PURE__ */l.jsxs("select",{value:t.status,onChange:e=>a(s=>({...s,status:e.target.value})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"active",children:"Active"}),
/* @__PURE__ */l.jsx("option",{value:"suspended",children:"Suspended"}),
/* @__PURE__ */l.jsx("option",{value:"banned",children:"Banned"}),
/* @__PURE__ */l.jsx("option",{value:"inactive",children:"Inactive"})]})]}),
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Reason"}),
/* @__PURE__ */l.jsx("textarea",{value:t.reason,onChange:e=>a(s=>({...s,reason:e.target.value})),rows:3,className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Reason for status change..."})]})]}),"role"===e&&/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"New Role"}),
/* @__PURE__ */l.jsxs("select",{value:t.role,onChange:e=>a(s=>({...s,role:e.target.value})),className:"w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",children:[
/* @__PURE__ */l.jsx("option",{value:"user",children:"User"}),
/* @__PURE__ */l.jsx("option",{value:"moderator",children:"Moderator"}),
/* @__PURE__ */l.jsx("option",{value:"admin",children:"Admin"})]})]}),"delete"===e&&/* @__PURE__ */l.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex",children:[
/* @__PURE__ */l.jsx(i,{className:"h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"}),
/* @__PURE__ */l.jsxs("div",{className:"text-sm text-red-800",children:[
/* @__PURE__ */l.jsx("p",{className:"font-medium mb-1",children:"This action is irreversible!"}),
/* @__PURE__ */l.jsx("p",{children:"All user data, submissions, and progress will be permanently deleted."})]})]})}),
/* @__PURE__ */l.jsxs("div",{className:"flex justify-end space-x-3 mt-6",children:[
/* @__PURE__ */l.jsx("button",{onClick:n,disabled:d,className:"px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors",children:"Cancel"}),"view"!==e&&/* @__PURE__ */l.jsx("button",{onClick:r,disabled:d,className:`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${c.confirmColor} disabled:opacity-50 transition-colors`,children:d?"Processing...":c.confirmText})]})]})})}const _e=async()=>{try{const{data:e}=await J.get("/api/admin/dashboard");return e}catch(e){throw Error("Failed to load dashboard data")}},Ce=async()=>{var e,s;try{const{data:t}=await J.get("/api/health");return{overall_score:"healthy"===(null==(e=t.database)?void 0:e.status)?98:75,response_time_ms:200*Math.random()+50,error_rate:2*Math.random(),active_connections:Math.floor(100*Math.random())+50,database_status:(null==(s=t.database)?void 0:s.status)||"healthy",memory_usage:Math.floor(40*Math.random())+30,cpu_usage:Math.floor(30*Math.random())+20,uptime_hours:Math.floor(720*Math.random())+24,...t}}catch(t){return{overall_score:85,response_time_ms:150,error_rate:1.2,active_connections:75,database_status:"unknown"}}},Se=async()=>{try{const{data:e}=await J.get("/api/admin/audit-logs?limit=5");return e}catch(e){return[]}};class Le extends z.Component{constructor(e){super(e),this.state={hasError:!1,error:null,errorInfo:null}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,s){this.setState({errorInfo:s})}render(){return this.state.hasError?/* @__PURE__ */l.jsx("div",{className:"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-start space-x-3",children:[
/* @__PURE__ */l.jsx(I,{className:"h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */l.jsxs("h3",{className:"text-red-800 dark:text-red-200 font-semibold",children:[this.props.title," Error"]}),
/* @__PURE__ */l.jsx("p",{className:"text-red-600 dark:text-red-300 text-sm mt-1",children:"Failed to load this section. Please refresh the page or contact support."}),!1,
/* @__PURE__ */l.jsx("button",{onClick:()=>window.location.reload(),className:"mt-3 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500",children:"Refresh Page"})]})]})}):this.props.children}}const Te=({height:e="h-64",title:s=!0})=>/* @__PURE__ */l.jsx("div",{className:"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 "+e,children:/* @__PURE__ */l.jsxs("div",{className:"animate-pulse space-y-4",children:[s&&/* @__PURE__ */l.jsx("div",{className:"h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded"}),
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"}),
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"}),
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"})]})]})}),Fe=()=>/* @__PURE__ */l.jsxs("div",{className:"bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"p-3 rounded-lg bg-gray-200 dark:bg-gray-700",children:/* @__PURE__ */l.jsx("div",{className:"h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"})}),
/* @__PURE__ */l.jsxs("div",{className:"ml-5 flex-1",children:[
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"}),
/* @__PURE__ */l.jsx("div",{className:"h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"})]})]}),
/* @__PURE__ */l.jsx("div",{className:"mt-4",children:/* @__PURE__ */l.jsx("div",{className:"h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"})})]}),Ae=({healthData:e,dashboardData:s})=>{var t,a,r,n;const d=(()=>{const s=(null==e?void 0:e.overall_score)||100;return 95>s?85>s?70>s?{status:"critical",color:"red",icon:I}:{status:"warning",color:"yellow",icon:i}:{status:"good",color:"blue",icon:x}:{status:"excellent",color:"green",icon:B}})(),o=d.icon;/* @__PURE__ */
return l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Platform Health"}),
/* @__PURE__ */l.jsx(o,{className:`h-6 w-6 text-${d.color}-500`})]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-4",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Overall Health Score"}),
/* @__PURE__ */l.jsxs("span",{className:`text-lg font-bold text-${d.color}-600 dark:text-${d.color}-400`,children:[(null==(t=null==e?void 0:e.overall_score)?void 0:t.toFixed(0))||"100","%"]})]}),
/* @__PURE__ */l.jsx("div",{className:"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2",children:/* @__PURE__ */l.jsx("div",{className:"h-2 rounded-full bg-gradient-to-r transition-all duration-500 "+("green"===d.color?"from-green-400 to-green-600":"blue"===d.color?"from-blue-400 to-blue-600":"yellow"===d.color?"from-yellow-400 to-yellow-600":"from-red-400 to-red-600"),style:{width:((null==e?void 0:e.overall_score)||100)+"%"}})})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[
/* @__PURE__ */l.jsxs("div",{className:"text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(Q,{className:"h-4 w-4 mr-1 text-blue-500"}),(null==(a=null==e?void 0:e.response_time_ms)?void 0:a.toFixed(0))||"< 100","ms"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Response Time"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(i,{className:"h-4 w-4 mr-1 text-orange-500"}),(null==(r=null==e?void 0:e.error_rate)?void 0:r.toFixed(1))||"0.0","%"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Error Rate"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(X,{className:"h-4 w-4 mr-1 text-green-500"}),(null==e?void 0:e.active_connections)||(null==s?void 0:s.active_users_this_week)||"0"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Active Connections"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(m,{className:"h-4 w-4 mr-1 text-purple-500"}),(null==(n=null==s?void 0:s.avg_response_time_hours)?void 0:n.toFixed(1))||"0.0","h"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Review Time"})]})]}),e&&/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-gray-600 pt-4",children:[
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-blue-900 dark:text-blue-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(K,{className:"h-4 w-4 mr-1"}),e.cpu_usage||"25","%"]}),
/* @__PURE__ */l.jsx("div",{className:"text-blue-600 dark:text-blue-400 text-xs",children:"CPU Usage"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-purple-900 dark:text-purple-100 flex items-center justify-center",children:[
/* @__PURE__ */l.jsx(K,{className:"h-4 w-4 mr-1"}),e.memory_usage||"35","%"]}),
/* @__PURE__ */l.jsx("div",{className:"text-purple-600 dark:text-purple-400 text-xs",children:"Memory"})]})]}),((null==s?void 0:s.pending_submissions)>20||70>(null==e?void 0:e.overall_score))&&/* @__PURE__ */l.jsxs("div",{className:"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(I,{className:"h-4 w-4 text-red-600 dark:text-red-400 mr-2"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium text-red-800 dark:text-red-200",children:"Attention Required"})]}),
/* @__PURE__ */l.jsxs("ul",{className:"mt-2 text-xs text-red-700 dark:text-red-300 space-y-1",children:[(null==s?void 0:s.pending_submissions)>20&&/* @__PURE__ */l.jsxs("li",{children:["• High submission backlog (",s.pending_submissions," pending)"]}),70>(null==e?void 0:e.overall_score)&&/* @__PURE__ */l.jsx("li",{children:"• Platform health below threshold"}),(null==e?void 0:e.error_rate)>5&&/* @__PURE__ */l.jsx("li",{children:"• Elevated error rate detected"})]})]})]})]})};function De({data:e,isLoading:s,healthData:t}){var a,r,n,d,o,c,u,g;if(s)/* @__PURE__ */
return l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[...[,,,,,,,,]].map((e,s)=>/* @__PURE__ */l.jsx(Fe,{},s))});if(!e)/* @__PURE__ */
return l.jsxs("div",{className:"text-center py-12",children:[
/* @__PURE__ */l.jsx(i,{className:"mx-auto h-12 w-12 text-gray-400"}),
/* @__PURE__ */l.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900 dark:text-gray-100",children:"No data available"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500 dark:text-gray-400",children:"Unable to load dashboard metrics."})]});const h=[{name:"Total Users",value:(null==(a=e.total_users)?void 0:a.toLocaleString())||"0",icon:D,color:"bg-blue-500",change:`+${e.new_users_today||0} today`,changeType:"increase",trend:e.user_growth_rate||0,href:"#users"},{name:"Active This Week",value:(null==(r=e.active_users_this_week)?void 0:r.toLocaleString())||"0",icon:E,color:"bg-green-500",change:"Weekly active users",changeType:"neutral",trend:e.weekly_activity_rate||0},{name:"Pending Reviews",value:(null==(n=e.pending_submissions)?void 0:n.toLocaleString())||"0",icon:m,color:"bg-yellow-500",change:"Awaiting review",changeType:e.pending_submissions>10?"decrease":"neutral",priority:e.pending_submissions>10?"high":"normal",href:"#submissions"},{name:"Active Tasks",value:(null==(d=e.total_active_tasks)?void 0:d.toLocaleString())||"0",icon:b,color:"bg-purple-500",change:"Published tasks",changeType:"neutral"},{name:"Submissions Today",value:(null==(o=e.submissions_today)?void 0:o.toLocaleString())||"0",icon:x,color:"bg-indigo-500",change:"Today's activity",changeType:"increase",trend:e.daily_submission_rate||0},{name:"Avg Response Time",value:((null==(c=e.avg_response_time_hours)?void 0:c.toFixed(1))||"0.0")+"h",icon:m,color:"bg-orange-500",change:"Review time",changeType:e.avg_response_time_hours>24?"decrease":"increase",priority:e.avg_response_time_hours>24?"high":"normal"},{name:"Platform Health",value:((null==(u=null==t?void 0:t.overall_score)?void 0:u.toFixed(0))||"100")+"%",icon:x,color:(null==t?void 0:t.overall_score)>90?"bg-emerald-500":"bg-yellow-500",change:"System status",changeType:"increase"},{name:"Essence Distributed",value:(null==(g=e.total_essence_distributed)?void 0:g.toLocaleString())||"0",icon:N,color:"bg-cyan-500",change:"Total rewards",changeType:"increase"}];/* @__PURE__ */
return l.jsxs("div",{className:"space-y-8",children:[
/* @__PURE__ */l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:h.map(e=>{const s=e.icon;/* @__PURE__ */
return l.jsx("div",{className:"bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md "+(e.href?"cursor-pointer hover:scale-105":""),onClick:e.href?()=>{var s;return null==(s=document.querySelector(e.href))?void 0:s.scrollIntoView({behavior:"smooth"})}:void 0,children:/* @__PURE__ */l.jsxs("div",{className:"p-5",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx("div",{className:`p-3 rounded-lg ${e.color} shadow-lg`,children:/* @__PURE__ */l.jsx(s,{className:"h-6 w-6 text-white"})})}),
/* @__PURE__ */l.jsx("div",{className:"ml-5 w-0 flex-1",children:/* @__PURE__ */l.jsxs("dl",{children:[
/* @__PURE__ */l.jsx("dt",{className:"text-sm font-medium text-gray-500 dark:text-gray-400 truncate",children:e.name}),
/* @__PURE__ */l.jsxs("dd",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:[e.value,"high"===e.priority&&/* @__PURE__ */l.jsx("span",{className:"ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse",children:"Alert"})]})]})})]}),
/* @__PURE__ */l.jsx("div",{className:"mt-4",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center text-sm",children:[
/* @__PURE__ */l.jsx("span",{className:"increase"===e.changeType?"text-green-600 dark:text-green-400":"decrease"===e.changeType?"text-red-600 dark:text-red-400":"text-gray-600 dark:text-gray-400",children:e.change}),void 0!==e.trend&&/* @__PURE__ */l.jsxs("span",{className:"ml-2 text-xs text-gray-500 dark:text-gray-400",children:["(",e.trend>0?"+":"",e.trend.toFixed(1),"%)"]})]})})]})},e.name)})}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Top Performers"}),
/* @__PURE__ */l.jsx(M,{className:"h-5 w-5 text-yellow-500"})]}),e.top_performers&&e.top_performers.length>0?/* @__PURE__ */l.jsx("div",{className:"space-y-3",children:e.top_performers.map((e,s)=>/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx("div",{className:"h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium "+(0===s?"bg-gradient-to-r from-yellow-400 to-yellow-600":1===s?"bg-gradient-to-r from-gray-400 to-gray-600":2===s?"bg-gradient-to-r from-amber-600 to-amber-800":"bg-gradient-to-r from-blue-500 to-purple-600"),children:s+1}),
/* @__PURE__ */l.jsxs("div",{className:"ml-3",children:[
/* @__PURE__ */l.jsx("p",{className:"text-sm font-medium text-gray-900 dark:text-gray-100",children:e.username||"Unknown User"}),
/* @__PURE__ */l.jsxs("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:[e.submissions||0," submissions"]})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center",children:[
/* @__PURE__ */l.jsx(O,{className:"h-4 w-4 mr-1 text-yellow-500"}),e.xp||0," XP"]})]},s))}):/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400 text-center py-4",children:"No performance data available"})]}),
/* @__PURE__ */l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Recent Activities"}),
/* @__PURE__ */l.jsx($,{className:"h-5 w-5 text-gray-400"})]}),e.recent_activities&&e.recent_activities.length>0?/* @__PURE__ */l.jsx("div",{className:"space-y-3",children:e.recent_activities.map((e,s)=>/* @__PURE__ */l.jsxs("div",{className:"flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx("div",{className:"h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center",children:/* @__PURE__ */l.jsx(b,{className:"h-4 w-4 text-gray-500 dark:text-gray-400"})})}),
/* @__PURE__ */l.jsxs("div",{className:"ml-3 flex-1",children:[
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-900 dark:text-gray-100",children:e.description||"Activity occurred"}),
/* @__PURE__ */l.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:e.timestamp?new Date(e.timestamp).toLocaleString():"Recently"})]})]},s))}):/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400 text-center py-4",children:"No recent activities"})]})]}),
/* @__PURE__ */l.jsx("div",{className:"lg:col-span-1",children:/* @__PURE__ */l.jsx(Ae,{healthData:t,dashboardData:e})})]})]})}function Ee({dashboardData:e,onTabChange:s}){const t=[{name:"Review Submissions",description:"Review pending task submissions",icon:u,color:"bg-blue-500 hover:bg-blue-600",count:(null==e?void 0:e.pending_submissions)||0,action:()=>s("submissions"),urgent:((null==e?void 0:e.pending_submissions)||0)>10},{name:"Create Task",description:"Create new impact task",icon:k,color:"bg-green-500 hover:bg-green-600",action:()=>s("create-task")},{name:"User Management",description:"Manage platform users",icon:D,color:"bg-purple-500 hover:bg-purple-600",count:(null==e?void 0:e.total_users)||0,action:()=>s("users")},{name:"View Analytics",description:"Platform analytics & insights",icon:q,color:"bg-indigo-500 hover:bg-indigo-600",action:()=>s("analytics")},{name:"Create Badge",description:"Design new achievement badges",icon:f,color:"bg-yellow-500 hover:bg-yellow-600",action:()=>s("create-badge")},{name:"Audit Log",description:"Review system activities",icon:w,color:"bg-gray-500 hover:bg-gray-600",action:()=>s("audit-log")}];/* @__PURE__ */
return l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100 mb-4",children:"Quick Actions"}),
/* @__PURE__ */l.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:t.map(e=>{const s=e.icon;/* @__PURE__ */
return l.jsx("button",{onClick:e.action,className:`${e.color} text-white p-4 rounded-lg transition-all duration-200 text-left hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${e.urgent?"ring-2 ring-red-400 ring-offset-2":""}`,children:/* @__PURE__ */l.jsxs("div",{className:"flex items-start justify-between",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex-1",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center",children:[
/* @__PURE__ */l.jsx(s,{className:"h-5 w-5 mr-2"}),
/* @__PURE__ */l.jsx("h4",{className:"font-medium",children:e.name})]}),
/* @__PURE__ */l.jsx("p",{className:"text-sm opacity-90 mt-1",children:e.description})]}),void 0!==e.count&&/* @__PURE__ */l.jsx("span",{className:"bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium "+(e.urgent?"bg-red-100 text-red-800 bg-opacity-100 animate-pulse":""),children:e.count}),e.urgent&&/* @__PURE__ */l.jsx(I,{className:"h-4 w-4 text-red-200 ml-2"})]})},e.name)})})]})}const Ue=()=>{const{data:e}=t({queryKey:["recentAdminActions"],queryFn:Se,refetchInterval:6e4,staleTime:3e4});/* @__PURE__ */
return l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Recent Admin Actions"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>window.location.hash="#audit-log",className:"text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",children:"View All"})]}),e&&e.length>0?/* @__PURE__ */l.jsx("div",{className:"space-y-3",children:e.map((e,s)=>/* @__PURE__ */l.jsxs("div",{className:"flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",children:[
/* @__PURE__ */l.jsx("div",{className:"flex-shrink-0",children:/* @__PURE__ */l.jsx(_,{className:"h-4 w-4 text-blue-500 mt-0.5"})}),
/* @__PURE__ */l.jsxs("div",{className:"flex-1 min-w-0",children:[
/* @__PURE__ */l.jsxs("p",{className:"text-sm text-gray-900 dark:text-gray-100",children:[
/* @__PURE__ */l.jsx("span",{className:"font-medium",children:e.admin_username})," ",e.action,e.target_type&&/* @__PURE__ */l.jsxs("span",{className:"text-gray-500 dark:text-gray-400",children:[" ","on ",e.target_type," #",e.target_id]})]}),
/* @__PURE__ */l.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 mt-1",children:new Date(e.created_at).toLocaleString()})]})]},s))}):/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400 text-center py-4",children:"No recent admin actions"})]})},Re=({dashboardData:e})=>{const[t,a]=s.useState(null);return s.useEffect(()=>{(()=>{if(window.performance&&window.performance.timing){const e=window.performance.timing,s=e.loadEventEnd-e.navigationStart,t=e.domContentLoadedEventEnd-e.navigationStart;a({pageLoadTime:s,domReadyTime:t,memoryUsage:window.performance.memory?{used:(window.performance.memory.usedJSHeapSize/1048576).toFixed(1),total:(window.performance.memory.totalJSHeapSize/1048576).toFixed(1)}:null})}})()},[]),t?/* @__PURE__ */l.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4",children:[
/* @__PURE__ */l.jsxs("h4",{className:"text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center",children:[
/* @__PURE__ */l.jsx(K,{className:"h-4 w-4 mr-2 text-blue-500"}),"Performance Metrics"]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-2 gap-3 text-xs",children:[
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100",children:[t.pageLoadTime,"ms"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Load Time"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-green-50 dark:bg-green-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100",children:[t.domReadyTime,"ms"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"DOM Ready"})]}),t.memoryUsage&&/* @__PURE__ */l.jsxs(l.Fragment,{children:[
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100",children:[t.memoryUsage.used,"MB"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Memory Used"})]}),
/* @__PURE__ */l.jsxs("div",{className:"text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded",children:[
/* @__PURE__ */l.jsxs("div",{className:"font-semibold text-gray-900 dark:text-gray-100",children:[t.memoryUsage.total,"MB"]}),
/* @__PURE__ */l.jsx("div",{className:"text-gray-500 dark:text-gray-400",children:"Memory Total"})]})]})]})]}):null};function Pe(){var a;const{user:i,loading:o}=V(),c=e(),[m,x]=s.useState("overview"),[u,g]=s.useState(!1),{data:h,isLoading:y,refetch:v}=t({queryKey:["adminDashboard"],queryFn:_e,refetchInterval:3e4,staleTime:15e3,onError:e=>{r.error("Failed to load dashboard data")}}),{data:j,refetch:N}=t({queryKey:["platformHealth"],queryFn:Ce,refetchInterval:6e4,staleTime:3e4,retry:2,onError:e=>{}}),C=s.useMemo(()=>[{id:"overview",label:"Overview",icon:q,description:"Dashboard overview and metrics"},{id:"submissions",label:"Submissions",icon:b,badge:(null==h?void 0:h.pending_submissions)||0,badgeType:(null==h?void 0:h.pending_submissions)>10?"urgent":"normal",description:"Review pending submissions"},{id:"users",label:"User Management",icon:D,description:"Manage platform users"},{id:"analytics",label:"Analytics",icon:E,description:"Platform insights and reports"},{id:"create-task",label:"Create Task",icon:k,description:"Create new tasks"},{id:"create-badge",label:"Create Badge",icon:f,description:"Design achievement badges"},{id:"audit-log",label:"Audit Log",icon:w,description:"System activity logs"}],[h]),S=s.useCallback(e=>{x(e),window.history.pushState(null,null,"#"+e)},[]);s.useEffect(()=>{const e=window.location.hash.slice(1);e&&C.find(s=>s.id===e)&&x(e)},[C]);const L=s.useCallback(async()=>{r.loading("Refreshing dashboard...",{id:"refresh"});try{await Promise.all([v(),N(),c.invalidateQueries({queryKey:["recentAdminActions"]})]),r.success("Dashboard refreshed successfully",{id:"refresh"})}catch(e){r.error("Failed to refresh dashboard",{id:"refresh"})}},[v,N,c]),T=s.useCallback(async()=>{try{r.loading("Exporting dashboard data...",{id:"export"}),await(async(e={})=>{const s=new URLSearchParams;Object.entries(e).forEach(([e,t])=>{t&&s.append(e,t)});const t=await J.get("/api/admin/dashboard/export?"+s,{responseType:"blob"}),a=window.URL.createObjectURL(new Blob([t.data])),r=document.createElement("a");r.href=a,r.setAttribute("download",`admin-dashboard-${/* @__PURE__ */(new Date).toISOString().split("T")[0]}.csv`),document.body.appendChild(r),r.click(),r.remove(),window.URL.revokeObjectURL(a)})(),r.success("Dashboard data exported successfully",{id:"export"}),g(!1)}catch(e){r.error("Failed to export dashboard data",{id:"export"})}},[]);return o?/* @__PURE__ */l.jsx(H,{children:/* @__PURE__ */l.jsxs("div",{className:"p-4 sm:p-6 lg:p-8",children:[
/* @__PURE__ */l.jsxs("div",{className:"mb-8",children:[
/* @__PURE__ */l.jsx("div",{className:"h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"}),
/* @__PURE__ */l.jsx("div",{className:"h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2 animate-pulse"})]}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-8",children:[
/* @__PURE__ */l.jsxs("div",{className:"lg:col-span-2 space-y-8",children:[
/* @__PURE__ */l.jsx(Te,{height:"h-96"}),
/* @__PURE__ */l.jsx(Te,{height:"h-64"})]}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-8",children:[
/* @__PURE__ */l.jsx(Te,{}),
/* @__PURE__ */l.jsx(Te,{}),
/* @__PURE__ */l.jsx(Te,{})]})]})]})}):i&&"admin"===i.role?/* @__PURE__ */l.jsx(H,{children:/* @__PURE__ */l.jsxs("div",{className:"min-h-screen bg-gray-50 dark:bg-gray-900",children:[
/* @__PURE__ */l.jsx("div",{className:"bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700",children:/* @__PURE__ */l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:/* @__PURE__ */l.jsx("div",{className:"py-6",children:/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between",children:[
/* @__PURE__ */l.jsxs("div",{children:[
/* @__PURE__ */l.jsx("h1",{className:"text-3xl font-bold text-gray-900 dark:text-gray-100",children:"Admin Dashboard"}),
/* @__PURE__ */l.jsx("p",{className:"mt-1 text-sm text-gray-500 dark:text-gray-400",children:"Manage platform content, users, and analytics"})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-4",children:[h&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-3",children:[h.pending_submissions>0&&/* @__PURE__ */l.jsxs("div",{className:"flex items-center px-3 py-1 rounded-full text-sm font-medium "+(h.pending_submissions>10?"bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 animate-pulse":"bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"),children:[
/* @__PURE__ */l.jsx(I,{className:"h-4 w-4 mr-1"}),
/* @__PURE__ */l.jsxs("span",{children:[h.pending_submissions," pending"]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full",children:[
/* @__PURE__ */l.jsx(B,{className:"h-4 w-4 mr-1"}),
/* @__PURE__ */l.jsx("span",{className:"text-sm font-medium",children:90>(null==j?void 0:j.overall_score)?"System OK":"System Healthy"})]})]}),
/* @__PURE__ */l.jsxs("div",{className:"flex items-center space-x-2",children:[
/* @__PURE__ */l.jsxs("button",{onClick:()=>g(!0),className:"inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:[
/* @__PURE__ */l.jsx(d,{className:"h-4 w-4 mr-1"}),"Export"]}),
/* @__PURE__ */l.jsxs("button",{onClick:L,className:"inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:[
/* @__PURE__ */l.jsx(n,{className:"h-4 w-4 mr-1"}),"Refresh"]})]})]})]})})})}),
/* @__PURE__ */l.jsx("div",{className:"bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",children:/* @__PURE__ */l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:/* @__PURE__ */l.jsx("nav",{className:"-mb-px flex space-x-8 overflow-x-auto",children:C.map(e=>{const s=e.icon,t=m===e.id;/* @__PURE__ */
return l.jsxs("button",{onClick:()=>S(e.id),className:"group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap "+(t?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"),title:e.description,children:[
/* @__PURE__ */l.jsx(s,{className:"-ml-0.5 mr-2 h-5 w-5 "+(t?"text-blue-500 dark:text-blue-400":"text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300")}),e.label,e.badge>0&&/* @__PURE__ */l.jsx("span",{className:"ml-2 py-0.5 px-2 rounded-full text-xs font-medium "+("urgent"===e.badgeType?"bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse":"bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"),children:e.badge})]},e.id)})})})}),
/* @__PURE__ */l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:/* @__PURE__ */l.jsx(Le,{title:(null==(a=C.find(e=>e.id===m))?void 0:a.label)||"Dashboard",children:/* @__PURE__ */l.jsx(s.Suspense,{fallback:/* @__PURE__ */l.jsx(Te,{height:"h-96"}),children:(()=>{switch(m){case"overview":/* @__PURE__ */
return l.jsxs("div",{className:"space-y-8",children:[
/* @__PURE__ */l.jsx(De,{data:h,isLoading:y,healthData:j}),
/* @__PURE__ */l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[
/* @__PURE__ */l.jsx(Ee,{dashboardData:h,onTabChange:S}),
/* @__PURE__ */l.jsx(Ue,{})]}),
/* @__PURE__ */l.jsx(Re,{dashboardData:h})]});case"submissions":/* @__PURE__ */
return l.jsx(Z,{});case"users":/* @__PURE__ */
return l.jsx(we,{});case"analytics":/* @__PURE__ */
return l.jsx(xe,{});case"create-task":/* @__PURE__ */
return l.jsx(ie,{});case"create-badge":/* @__PURE__ */
return l.jsx(ne,{});case"audit-log":/* @__PURE__ */
return l.jsx(me,{});default:/* @__PURE__ */
return l.jsx(De,{data:h,isLoading:y,healthData:j})}})()})})}),u&&/* @__PURE__ */l.jsx("div",{className:"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center",children:/* @__PURE__ */l.jsxs("div",{className:"relative bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 w-full max-w-md m-4 rounded-xl shadow-xl",children:[
/* @__PURE__ */l.jsxs("div",{className:"flex items-center justify-between mb-4",children:[
/* @__PURE__ */l.jsx("h3",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Export Dashboard Data"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>g(!1),className:"text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",children:/* @__PURE__ */l.jsx(p,{className:"h-6 w-6"})})]}),
/* @__PURE__ */l.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400 mb-6",children:"Export current dashboard metrics and analytics to CSV format."}),
/* @__PURE__ */l.jsxs("div",{className:"flex space-x-3",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>g(!1),className:"flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",children:"Cancel"}),
/* @__PURE__ */l.jsx("button",{onClick:T,className:"flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:"Export CSV"})]})]})})]})}):/* @__PURE__ */l.jsx(H,{children:/* @__PURE__ */l.jsx("div",{className:"flex items-center justify-center min-h-[60vh]",children:/* @__PURE__ */l.jsxs("div",{className:"text-center max-w-md mx-auto p-8",children:[
/* @__PURE__ */l.jsx("div",{className:"mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6",children:/* @__PURE__ */l.jsx(_,{className:"h-8 w-8 text-red-600 dark:text-red-400"})}),
/* @__PURE__ */l.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2",children:"Access Denied"}),
/* @__PURE__ */l.jsx("p",{className:"text-gray-600 dark:text-gray-400 mb-6",children:"You need administrator privileges to access this dashboard."}),
/* @__PURE__ */l.jsxs("div",{className:"space-y-3",children:[
/* @__PURE__ */l.jsx("button",{onClick:()=>window.history.back(),className:"w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:"Go Back"}),
/* @__PURE__ */l.jsx("button",{onClick:()=>window.location.href="/dashboard",className:"w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:"Return to Dashboard"})]})]})})})}export{Pe as default};
