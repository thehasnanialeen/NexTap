import { useState, useEffect } from "react";
import {
  Phone, Mail, Globe, Download, Settings,
  Save, CreditCard, ChevronRight, User, Check, Building2,
  FileText, Image, Lock, ArrowLeft, Plus, Copy,
  Trash2, AlertCircle, Search,
} from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";

// const firebaseConfig = {
//   apiKey: "AIzaSyDgIn2W4iso2YhPsyq4qcANOc2l8SyTinI",
//   authDomain: "nfc-cards-25232.firebaseapp.com",
//   projectId: "nfc-cards-25232",
//   storageBucket: "nfc-cards-25232.firebasestorage.app",
//   messagingSenderId: "234178935276",
//   appId: "1:234178935276:web:c2aa6d069d4c1a8e98a8c9",
//   measurementId: "G-NFP9DLKWGT"
// };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// async function dbGet(key) {
//   const snap = await getDoc(doc(db, "cards", key));
//   return snap.exists() ? snap.data() : null;
// }
// async function dbSet(key, value) {
//   await setDoc(doc(db, "cards", key), value);
//   return true;
// }

const DEMO = {
  data: {
    name: "Alexandra Chen",
    title: "Creative Director",
    company: "Luminary Studio",
    bio: "Award-winning creative director with 10+ years crafting bold visual stories that move people.",
    phone: "+1 (555) 234-5678",
    email: "alex@luminarystudio.com",
    website: "luminarystudio.com",
    instagram: "alexchen.studio",
    linkedin: "in/alexandrachen",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  visibility: { photo:true, bio:true, phone:true, email:true, website:true, instagram:true, linkedin:true },
  pin: "1234",
};

async function dbGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function dbSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); return true; } catch { return false; }
}


const DEFAULT_DATA = { name:"", title:"", company:"", bio:"", phone:"", email:"", website:"", instagram:"", linkedin:"", photo:"" };
const DEFAULT_VIS  = { photo:true, bio:true, phone:true, email:true, website:true, instagram:true, linkedin:true };

function downloadVCard(data, vis) {
  const lines = [
    "BEGIN:VCARD","VERSION:3.0",`FN:${data.name}`,
    data.title?`TITLE:${data.title}`:"", data.company?`ORG:${data.company}`:"",
    vis.phone&&data.phone?`TEL;TYPE=CELL:${data.phone}`:"",
    vis.email&&data.email?`EMAIL:${data.email}`:"",
    vis.website&&data.website?`URL:https://${data.website}`:"",
    vis.instagram&&data.instagram?`X-SOCIALPROFILE;type=instagram:https://instagram.com/${data.instagram}`:"",
    vis.linkedin&&data.linkedin?`X-SOCIALPROFILE;type=linkedin:https://linkedin.com/${data.linkedin}`:"",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([lines],{type:"text/vcard;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"),{href:url,download:`${(data.name||"contact").replace(/\s+/g,"_")}.vcf`});
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:12,flexShrink:0,cursor:"pointer",background:checked?GOLD:"#CBD0D8",position:"relative",transition:"background .25s"}}>
      <div style={{position:"absolute",top:3,left:checked?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.25)"}}/>
    </div>
  );
}

function CardInfoRow({ icon:Icon, value, href }) {
  const inner = (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:".5px solid rgba(255,255,255,.07)"}}>
      <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:"rgba(201,168,76,.13)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon size={16} color={GOLD}/>
      </div>
      <span style={{fontSize:14,color:"#CCC9DA",letterSpacing:.2,wordBreak:"break-all",flex:1}}>{value}</span>
      <ChevronRight size={13} color="rgba(255,255,255,.18)" style={{flexShrink:0}}/>
    </div>
  );
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block"}}>{inner}</a>
    : inner;
}

function CardView({ data, vis, username, onAdmin }) {
  const [imgErr,setImgErr] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"100vh",background:"#080810",fontFamily:"Georgia,serif",padding:"2.5rem 1rem 5rem",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.05)}}
        @keyframes rotateBorder{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .6s ease both}
        .fu2{animation:fadeUp .6s .15s ease both}
        .fu3{animation:fadeUp .6s .3s ease both}
        .add-btn:hover{transform:translateY(-2px)!important;box-shadow:0 12px 40px rgba(201,168,76,.45)!important}
        .add-btn:active{transform:translateY(0)!important}
        .sp:hover{background:rgba(201,168,76,.2)!important;border-color:rgba(201,168,76,.5)!important;color:rgba(255,255,255,.9)!important}
        .adm-btn:hover{border-color:rgba(255,255,255,.25)!important;color:rgba(255,255,255,.5)!important}
        .row-wrap a:hover .row-inner{background:rgba(201,168,76,.04)}
      `}</style>

      {/* Ambient blobs */}
      <div style={{position:"fixed",top:"-10%",left:"30%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-5%",right:"20%",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(100,80,200,.06) 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {/* Label */}
        <div className="fu" style={{display:"flex",alignItems:"center",gap:8,marginBottom:"2rem",color:"rgba(255,255,255,.22)",fontSize:10,letterSpacing:3.5,textTransform:"uppercase",fontFamily:"sans-serif"}}>
          <div style={{width:28,height:.5,background:"rgba(255,255,255,.12)"}}/>
          Digital Business Card
          <div style={{width:28,height:.5,background:"rgba(255,255,255,.12)"}}/>
        </div>

        {/* Card */}
        <div className="fu2" style={{width:"100%",maxWidth:400,borderRadius:28,background:"linear-gradient(150deg,#1C1C2E 0%,#12121E 55%,#1A1608 100%)",border:".5px solid rgba(201,168,76,.2)",boxShadow:"0 40px 100px rgba(0,0,0,.8),0 0 0 .5px rgba(201,168,76,.08) inset,0 1px 0 rgba(201,168,76,.3) inset",overflow:"hidden",position:"relative"}}>

          {/* Top shimmer line */}
          <div style={{height:1.5,background:"linear-gradient(90deg,transparent 0%,rgba(201,168,76,.6) 30%,rgba(232,201,122,.9) 50%,rgba(201,168,76,.6) 70%,transparent 100%)"}}/>

          {/* Decorative corner ornament */}
          <div style={{position:"absolute",top:18,right:18,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:28,height:28,borderRadius:"50%",border:".5px solid rgba(201,168,76,.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:GOLD,opacity:.6,animation:"pulse 3s ease-in-out infinite"}}/>
            </div>
          </div>

          {/* Username chip */}
          <div style={{position:"absolute",top:20,left:18}}>
            <div style={{background:"rgba(201,168,76,.1)",border:".5px solid rgba(201,168,76,.2)",borderRadius:100,padding:"3px 10px",display:"inline-flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:10,color:"rgba(201,168,76,.7)",fontFamily:"sans-serif",letterSpacing:1}}>@{username}</span>
            </div>
          </div>

          <div style={{padding:"3.25rem 2rem 1.5rem"}}>
            {/* Photo */}
            {vis.photo && data.photo && !imgErr && (
              <div style={{display:"flex",justifyContent:"center",marginBottom:"1.5rem"}}>
                <div style={{position:"relative"}}>
                  <div style={{width:96,height:96,borderRadius:"50%",padding:2.5,background:`conic-gradient(${GOLD} 0deg,${GOLD_LIGHT} 90deg,rgba(255,255,255,.3) 180deg,${GOLD_LIGHT} 270deg,${GOLD} 360deg)`}}>
                    <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#12121E",padding:2}}>
                      <img src={data.photo} alt={data.name} onError={()=>setImgErr(true)}
                        style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",display:"block"}}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Name block */}
            <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
              <h1 style={{margin:"0 0 6px",fontSize:28,fontWeight:400,color:"#F2EDE0",letterSpacing:.3,lineHeight:1.15,fontFamily:"Georgia,serif"}}>{data.name||"Your Name"}</h1>
              {data.title && (
                <p style={{margin:"0 0 3px",fontSize:11,color:GOLD,letterSpacing:3,textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:500}}>{data.title}</p>
              )}
              {data.company && (
                <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.35)",fontFamily:"sans-serif"}}>{data.company}</p>
              )}
            </div>

            {/* Divider */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1.5rem"}}>
              <div style={{flex:1,height:.5,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.25))"}}/>
              <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(201,168,76,.4)"}}/>
              <div style={{flex:1,height:.5,background:"linear-gradient(90deg,rgba(201,168,76,.25),transparent)"}}/>
            </div>

            {/* Bio */}
            {vis.bio && data.bio && (
              <div style={{marginBottom:"1.5rem",paddingLeft:12,borderLeft:`1.5px solid rgba(201,168,76,.35)`}}>
                <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.7,fontStyle:"italic",fontFamily:"Georgia,serif"}}>"{data.bio}"</p>
              </div>
            )}

            {/* Contact rows */}
            <div className="row-wrap" style={{fontFamily:"sans-serif"}}>
              {vis.phone&&data.phone&&<CardInfoRow icon={Phone} value={data.phone} href={`tel:${data.phone}`}/>}
              {vis.email&&data.email&&<CardInfoRow icon={Mail} value={data.email} href={`mailto:${data.email}`}/>}
              {vis.website&&data.website&&<CardInfoRow icon={Globe} value={data.website} href={`https://${data.website}`}/>}
            </div>

            {/* Social pills */}
            {((vis.instagram&&data.instagram)||(vis.linkedin&&data.linkedin)) && (
              <div style={{display:"flex",gap:8,marginTop:"1.25rem",flexWrap:"wrap",fontFamily:"sans-serif"}}>
                {vis.instagram&&data.instagram&&(
                  <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                    <div className="sp" style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:100,border:".5px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.5)",fontSize:12,cursor:"pointer",transition:"all .2s"}}>
                      <FaInstagram size={13} color={GOLD}/>@{data.instagram}
                    </div>
                  </a>
                )}
                {vis.linkedin&&data.linkedin&&(
                  <a href={`https://linkedin.com/${data.linkedin}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                    <div className="sp" style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:100,border:".5px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.5)",fontSize:12,cursor:"pointer",transition:"all .2s"}}>
                      <FaLinkedin size={13} color={GOLD}/>LinkedIn
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Add to contacts */}
          <div style={{padding:"0 2rem 2rem"}}>
            <button className="add-btn" onClick={()=>downloadVCard(data,vis)} style={{width:"100%",padding:"15px 0",borderRadius:16,background:`linear-gradient(135deg,#D4A840 0%,${GOLD} 50%,#A8822A 100%)`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,color:"#0F0B00",fontWeight:700,fontSize:14,letterSpacing:.8,fontFamily:"sans-serif",transition:"all .25s ease",boxShadow:"0 6px 24px rgba(201,168,76,.3)",position:"relative",overflow:"hidden"}}>
              <Download size={16}/>
              Save Contact
            </button>
          </div>

          {/* Bottom shimmer */}
          <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent)"}}/>
        </div>

        {/* Footer */}
        <div className="fu3" style={{marginTop:"1.75rem",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,.12)",fontFamily:"sans-serif",letterSpacing:2,textTransform:"uppercase"}}>NFC Digital Card</span>
          <span style={{color:"rgba(255,255,255,.08)"}}>·</span>
          <button className="adm-btn" onClick={onAdmin} style={{background:"transparent",border:".5px solid rgba(255,255,255,.08)",borderRadius:100,padding:"4px 14px",cursor:"pointer",color:"rgba(255,255,255,.22)",fontSize:10,fontFamily:"sans-serif",letterSpacing:1.5,textTransform:"uppercase",transition:"all .2s"}}>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FIELD ROW ─────────────────────────────────────────────────────────────────
function FieldRow({ label, icon:Icon, fieldKey, data, setData, vis, setVis, inputType="text", placeholder, prefix }) {
  const hasToggle = vis && fieldKey in vis;
  return (
    <div style={{background:"#fff",borderRadius:14,border:".5px solid #EAEAEE",padding:"13px 15px",display:"flex",flexDirection:"column",gap:9,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:9,background:"#F2EFF9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon size={14} color="#7C6DB5"/>
          </div>
          <span style={{fontSize:13,fontWeight:500,color:"#1C1A2E",fontFamily:"sans-serif"}}>{label}</span>
        </div>
        {hasToggle && (
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:vis[fieldKey]?"#8B7DC5":"#C0BFCA",fontFamily:"sans-serif",minWidth:38,textAlign:"right"}}>{vis[fieldKey]?"On":"Off"}</span>
            <Toggle checked={vis[fieldKey]} onChange={v=>setVis(p=>({...p,[fieldKey]:v}))}/>
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"stretch"}}>
        {prefix && (
          <span style={{padding:"9px 10px",background:"#F7F6FB",border:".5px solid #DDD",borderRight:"none",borderRadius:"9px 0 0 9px",fontSize:13,color:"#AAA",fontFamily:"sans-serif",flexShrink:0,display:"flex",alignItems:"center"}}>{prefix}</span>
        )}
        <input type={inputType} value={data[fieldKey]||""} onChange={e=>setData(p=>({...p,[fieldKey]:e.target.value}))}
          placeholder={placeholder||`Enter ${label.toLowerCase()}…`}
          style={{flex:1,padding:"9px 12px",borderRadius:prefix?"0 9px 9px 0":9,border:".5px solid #DDD",fontSize:13,fontFamily:"sans-serif",color:"#1C1A2E",outline:"none",background:"#FAFAFA",boxSizing:"border-box",width:"100%",transition:"border-color .2s"}}/>
      </div>
    </div>
  );
}

function SL({ children }) {
  return <div style={{fontSize:10,letterSpacing:2.5,textTransform:"uppercase",color:"#A89DD5",marginBottom:9,paddingLeft:2,fontFamily:"sans-serif",fontWeight:600,marginTop:6}}>{children}</div>;
}

// ── ADMIN VIEW ────────────────────────────────────────────────────────────────
function AdminView({ username, data, setData, vis, setVis, onSave, saved, onBack, cardUrl }) {
  const [copied,setCopied] = useState(false);
  function copyUrl(){ navigator.clipboard.writeText(cardUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F8F7FD 0%,#F0EEF9 100%)"}}>
      <style>{`
        input:focus{border-color:#9B8DC8!important;background:#fff!important;outline:none}
        .save-btn:hover{background:#6855AF!important;box-shadow:0 8px 28px rgba(104,85,175,.4)!important}
        .save-btn:active{transform:scale(.98)}
        .back-btn:hover{background:rgba(255,255,255,.15)!important}
        .copy-btn:hover{background:rgba(201,168,76,.2)!important}
        .field-row input:focus{border-color:#9B8DC8!important}
      `}</style>

      {/* Sticky header */}
      <div style={{background:"linear-gradient(135deg,#2A1F50 0%,#1C1640 100%)",padding:"1.25rem 1.25rem 1rem",boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>
        <div style={{maxWidth:500,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
            <button className="back-btn" onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:".5px solid rgba(255,255,255,.15)",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
              <ArrowLeft size={16} color="rgba(255,255,255,.7)"/>
            </button>
            <div style={{flex:1}}>
              <h2 style={{margin:0,fontSize:17,color:"#F0EDE0",fontWeight:500,fontFamily:"Georgia,serif"}}>Admin Panel</h2>
              <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"sans-serif",letterSpacing:.5}}>@{username}</p>
            </div>
            {/* Live preview badge */}
            <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(60,200,120,.1)",border:".5px solid rgba(60,200,120,.25)",borderRadius:100,padding:"4px 10px"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#4CD98A",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:10,color:"rgba(60,200,120,.9)",fontFamily:"sans-serif",letterSpacing:1}}>Live</span>
            </div>
          </div>

          {/* Card URL bar */}
          <div style={{background:"rgba(0,0,0,.3)",borderRadius:12,padding:"10px 13px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,overflow:"hidden"}}>
              <p style={{margin:"0 0 2px",fontSize:9,color:"rgba(201,168,76,.55)",letterSpacing:2,textTransform:"uppercase",fontFamily:"sans-serif"}}>Public Card URL</p>
              <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cardUrl}</p>
            </div>
            <button className="copy-btn" onClick={copyUrl} style={{background:"rgba(201,168,76,.1)",border:".5px solid rgba(201,168,76,.25)",borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:GOLD,fontSize:11,fontFamily:"sans-serif",flexShrink:0,transition:"background .2s",whiteSpace:"nowrap"}}>
              {copied?<Check size={12}/>:<Copy size={12}/>}{copied?"Copied!":"Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{maxWidth:500,margin:"0 auto",padding:"0 1rem"}}>
        <div style={{background:"rgba(201,168,76,.08)",border:".5px solid rgba(201,168,76,.2)",borderRadius:10,padding:"9px 13px",margin:"1rem 0",display:"flex",alignItems:"center",gap:8}}>
          <AlertCircle size={13} color="rgba(201,168,76,.8)"/>
          <span style={{fontSize:12,color:"rgba(140,110,40,.9)",fontFamily:"sans-serif"}}>Use the <strong>On/Off toggles</strong> to control what appears on the public card</span>
        </div>

        {/* Fields */}
        <SL>Identity</SL>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:"1rem"}}>
          <FieldRow label="Full Name" icon={User} fieldKey="name" data={data} setData={setData} vis={{}} setVis={setVis} placeholder="Your full name"/>
          <FieldRow label="Job Title" icon={CreditCard} fieldKey="title" data={data} setData={setData} vis={{}} setVis={setVis} placeholder="e.g. Creative Director"/>
          <FieldRow label="Company" icon={Building2} fieldKey="company" data={data} setData={setData} vis={{}} setVis={setVis} placeholder="Your company name"/>
          <FieldRow label="Bio" icon={FileText} fieldKey="bio" data={data} setData={setData} vis={vis} setVis={setVis} placeholder="A short introduction…"/>
        </div>

        <SL>Photo</SL>
        <div style={{marginBottom:"1rem"}}>
          <FieldRow label="Photo URL" icon={Image} fieldKey="photo" data={data} setData={setData} vis={vis} setVis={setVis} placeholder="https://…"/>
          {data.photo&&vis.photo&&(
            <div style={{marginTop:8,display:"flex",alignItems:"center",gap:10,background:"#fff",borderRadius:10,padding:"8px 12px",border:".5px solid #EAEAEE"}}>
              <img src={data.photo} alt="" onError={e=>{e.target.style.display="none"}} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
              <span style={{fontSize:12,color:"#999",fontFamily:"sans-serif"}}>Photo preview</span>
            </div>
          )}
        </div>

        <SL>Contact</SL>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:"1rem"}}>
          <FieldRow label="Phone" icon={Phone} fieldKey="phone" data={data} setData={setData} vis={vis} setVis={setVis} inputType="tel" placeholder="+1 (555) 000-0000"/>
          <FieldRow label="Email" icon={Mail} fieldKey="email" data={data} setData={setData} vis={vis} setVis={setVis} inputType="email" placeholder="you@example.com"/>
          <FieldRow label="Website" icon={Globe} fieldKey="website" data={data} setData={setData} vis={vis} setVis={setVis} placeholder="yourwebsite.com"/>
        </div>

        <SL>Social</SL>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:"2rem"}}>
          <FieldRow label="Instagram" icon={Instagram} fieldKey="instagram" data={data} setData={setData} vis={vis} setVis={setVis} placeholder="username" prefix="@"/>
          <FieldRow label="LinkedIn" icon={Linkedin} fieldKey="linkedin" data={data} setData={setData} vis={vis} setVis={setVis} placeholder="in/yourprofile" prefix="linkedin.com/"/>
        </div>

        <button className="save-btn" onClick={onSave} style={{width:"100%",padding:"15px 0",borderRadius:16,background:saved?"#3A9A62":"#7C6DB5",border:"none",cursor:"pointer",color:"#fff",fontWeight:700,fontSize:15,letterSpacing:.5,display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"sans-serif",transition:"all .25s",boxShadow:"0 6px 24px rgba(124,109,181,.35)",marginBottom:"3rem"}}>
          {saved?<Check size={18}/>:<Save size={18}/>}
          {saved?"Changes Saved!":"Save Card"}
        </button>
      </div>
    </div>
  );
}

// ── PIN GATE ──────────────────────────────────────────────────────────────────
function PinGate({ username, storedPin, onSuccess, onBack }) {
  const [pin,setPin] = useState("");
  const [err,setErr] = useState(false);
  const [shake,setShake] = useState(false);
  function check(){
    if(pin===storedPin){onSuccess();}
    else{setErr(true);setShake(true);setPin("");setTimeout(()=>{setErr(false);setShake(false);},1200);}
  }
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F8F7FD,#F0EEF9)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",fontFamily:"sans-serif"}}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
      <div style={{background:"#fff",borderRadius:24,border:".5px solid #E4E0F0",padding:"2.5rem 2rem",width:"100%",maxWidth:340,boxShadow:"0 12px 50px rgba(124,109,181,.12)",animation:shake?"shake .4s ease":"none"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:56,height:56,borderRadius:18,background:"#F2EFF9",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 4px 14px rgba(124,109,181,.15)"}}>
            <Lock size={24} color="#7C6DB5"/>
          </div>
          <h2 style={{margin:"0 0 5px",fontSize:20,color:"#1C1A2E",fontWeight:500}}>Admin Access</h2>
          <p style={{margin:0,fontSize:13,color:"#9990B8"}}>Enter your PIN for @{username}</p>
        </div>
        <input type="password" maxLength={8} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="• • • •"
          style={{width:"100%",padding:"14px",borderRadius:12,boxSizing:"border-box",border:`.5px solid ${err?"#E86060":"#DDD"}`,fontSize:22,textAlign:"center",letterSpacing:8,fontFamily:"sans-serif",outline:"none",marginBottom:err?8:12,background:err?"#FFF5F5":"#FAFAFA",transition:"all .2s"}}/>
        {err&&<p style={{margin:"0 0 12px",fontSize:12,color:"#D44",textAlign:"center"}}>Incorrect PIN — try again</p>}
        <button onClick={check} style={{width:"100%",padding:"13px",borderRadius:12,background:"#7C6DB5",border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:8,boxShadow:"0 4px 16px rgba(124,109,181,.3)"}}>Unlock</button>
        <button onClick={onBack} style={{width:"100%",padding:"11px",borderRadius:12,background:"transparent",border:".5px solid #E0DCF0",color:"#9990B8",fontSize:13,cursor:"pointer"}}>← Back to Card</button>
        <p style={{textAlign:"center",margin:"14px 0 0",fontSize:11,color:"#C0BFCA"}}>Demo PIN: <strong>1234</strong></p>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen] = useState("loading");
  const [data,setData] = useState(DEMO.data);
  const [vis,setVis] = useState(DEMO.visibility);
  const [saved,setSaved] = useState(false);
  const username = "alexchen";

  useEffect(()=>{
    (async()=>{
      const stored = await dbGet(`card:${username}`);
      if(stored){ setData(stored.data||DEMO.data); setVis(stored.visibility||DEMO.visibility); }
      setScreen("card");
    })();
  },[]);

  async function handleSave(){
    await dbSet(`card:${username}`,{data,visibility:vis,pin:DEMO.pin});
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  }

  const cardUrl = `https://yourcards.com/?u=${username}`;

  if(screen==="loading") return <div style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"rgba(255,255,255,.2)",fontFamily:"sans-serif",fontSize:13}}>Loading…</p></div>;

  return (
    <>
      {screen==="card" && <CardView data={data} vis={vis} username={username} onAdmin={()=>setScreen("pingate")}/>}
      {screen==="pingate" && <PinGate username={username} storedPin={DEMO.pin} onSuccess={()=>setScreen("admin")} onBack={()=>setScreen("card")}/>}
      {screen==="admin" && <AdminView username={username} data={data} setData={setData} vis={vis} setVis={setVis} onSave={handleSave} saved={saved} onBack={()=>setScreen("card")} cardUrl={cardUrl}/>}
    </>
  );
}
