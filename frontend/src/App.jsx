import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, Bone, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Download, Filter, Heart, ImagePlus, Menu, PawPrint, Plus, RotateCcw,
  Search, ShieldCheck, Sparkles, Star, UploadCloud, X, SlidersHorizontal,
  Stethoscope, Palette, WandSparkles, Bookmark, Camera, Flower2, Smile, Sun,
  Moon, Dog, Instagram, Mail, Github, ExternalLink, AlertCircle, LoaderCircle
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const stickers = [
  {id:1,name:'Corgi Cloud Nine',breed:'Corgi',mood:'Happy',category:'Feel-good',emoji:'🐶',art:'corgi',tag:'Bestseller',tone:'peach'},
  {id:2,name:'Sleepy Shiba',breed:'Shiba Inu',mood:'Sleepy',category:'Everyday',emoji:'🐕',art:'shiba',tag:'Cozy pick',tone:'lilac'},
  {id:3,name:'Golden Hour',breed:'Golden Retriever',mood:'Love',category:'Feel-good',emoji:'🐕‍🦺',art:'golden',tag:'Fan favourite',tone:'butter'},
  {id:4,name:'Tiny Woof Energy',breed:'Frenchie',mood:'Sassy',category:'Reactions',emoji:'🐾',art:'frenchie',tag:'New',tone:'mint'},
  {id:5,name:'Pawsitive Vibes',breed:'Dachshund',mood:'Happy',category:'Feel-good',emoji:'🐕',art:'dachshund',tag:'',tone:'sky'},
  {id:6,name:'Do Not Disturb',breed:'Pomeranian',mood:'Sleepy',category:'Reactions',emoji:'🐩',art:'pomeranian',tag:'',tone:'rose'},
  {id:7,name:'Treat Inspector',breed:'Beagle',mood:'Hungry',category:'Everyday',emoji:'🦴',art:'beagle',tag:'',tone:'butter'},
  {id:8,name:'Main Character',breed:'Samoyed',mood:'Sassy',category:'Reactions',emoji:'🐻‍❄️',art:'samoyed',tag:'',tone:'lilac'},
  {id:9,name:'Sending Hugs',breed:'Labrador',mood:'Love',category:'Feel-good',emoji:'💗',art:'lab',tag:'',tone:'peach'},
  {id:10,name:'Walkies Please',breed:'Border Collie',mood:'Excited',category:'Everyday',emoji:'🎾',art:'collie',tag:'',tone:'mint'},
  {id:11,name:'Little Daydreamer',breed:'Pug',mood:'Sleepy',category:'Everyday',emoji:'☁️',art:'pug',tag:'',tone:'sky'},
  {id:12,name:'Goodest Student',breed:'Poodle',mood:'Happy',category:'Feel-good',emoji:'🎀',art:'poodle',tag:'',tone:'rose'}
]
const categories = ['All stickers','Feel-good','Reactions','Everyday']
const breeds = ['All breeds', ...new Set(stickers.map(s=>s.breed))]
const moods = ['All moods','Happy','Sleepy','Love','Sassy','Hungry','Excited']
const palette = ['#F5A98E','#A99BD8','#9BC7B3','#F2D58D','#A8C9DD','#E7A6B9','#2C3340','#FFFFFF']

function readSaved() {
  try { return JSON.parse(localStorage.getItem('pawfect-favs') || '[]') } catch { return [] }
}
function DogArt({item, large=false}) {
  return <div className={`dog-art art-${item.tone} ${large?'dog-art-large':''}`}>
    <span className="spark spark-a">✦</span><span className="spark spark-b">✧</span>
    <span className="art-emoji">{item.emoji}</span>
    <span className="art-caption">{item.name}</span>
    <span className="art-paw">♡</span>
  </div>
}
function Header({page,setPage,favs}) {
  const [open,setOpen] = useState(false)
  const nav = [['Home','home'],['Explore','explore'],['Sticker studio','studio'],['Dog health AI','health']]
  return <header className="site-header">
    <div className="header-inner">
      <button className="brand" onClick={()=>setPage('home')} aria-label="PAWFECT home">
        <span className="brand-mark"><PawPrint size={22}/></span>
        <span>pawfect<span className="brand-dot">.</span><small>THE GOOD DOG CLUB</small></span>
      </button>
      <nav className={`main-nav ${open?'nav-open':''}`}>
        {nav.map(([label,key])=><button key={key} className={page===key?'nav-link active':'nav-link'} onClick={()=>{setPage(key);setOpen(false)}}>{label}{key==='health'&&<span className="nav-new">AI</span>}</button>)}
      </nav>
      <div className="header-actions">
        <button className="icon-btn fav-top" onClick={()=>setPage('collection')} aria-label="My collection"><Heart size={18}/><span>{favs.length}</span></button>
        <button className="header-cta" onClick={()=>setPage('studio')}>Make a sticker <ArrowUpRight size={16}/></button>
        <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">{open?<X/>:<Menu/>}</button>
      </div>
    </div>
  </header>
}
function Footer({setPage}) {
  return <footer className="footer"><div className="footer-top">
    <div><button className="brand footer-brand" onClick={()=>setPage('home')}><span className="brand-mark"><PawPrint size={20}/></span><span>pawfect<span className="brand-dot">.</span><small>THE GOOD DOG CLUB</small></span></button><p>A little more joy, one paw at a time.</p></div>
    <div className="footer-links"><button onClick={()=>setPage('explore')}>Sticker library</button><button onClick={()=>setPage('studio')}>Sticker studio</button><button onClick={()=>setPage('health')}>Dog health AI</button></div>
    <div className="footer-note"><span className="footer-heart">♥</span> Made for the love of dogs.</div>
  </div><div className="footer-bottom"><span>© 2026 PAWFECT Studio</span><span>Playful by nature. Pawsitive by design.</span></div></footer>
}
function StickerCard({item,fav,onFav,onUse}) {
  return <article className="sticker-card">
    <div className="sticker-visual" onClick={()=>onUse(item)} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&onUse(item)}>
      {item.tag&&<span className="sticker-tag">{item.tag}</span>}
      <DogArt item={item}/>
      <button className={`heart-float ${fav?'is-fav':''}`} onClick={e=>{e.stopPropagation();onFav(item.id)}} aria-label="Save sticker"><Heart size={17} fill={fav?'currentColor':'none'}/></button>
      <span className="quick-use">Use sticker <ArrowUpRight size={14}/></span>
    </div>
    <div className="sticker-meta"><div><h3>{item.name}</h3><p>{item.breed} <span>·</span> {item.mood}</p></div><button className="mini-arrow" onClick={()=>onUse(item)}><ArrowUpRight size={17}/></button></div>
  </article>
}
function Home({setPage,onUse}) {
  const [email,setEmail]=useState('')
  const [joined,setJoined]=useState(false)
  return <main>
    <section className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot"></span> YOUR NEW HAPPY PLACE</div>
        <h1>Big love.<br/><em>Tiny paws.</em><br/>Endless <span className="underline-word">stickers.</span></h1>
        <p className="hero-lede">A little corner of the internet for people who think every dog deserves their own sticker pack.</p>
        <div className="hero-buttons"><button className="btn-primary" onClick={()=>setPage('explore')}>Explore stickers <ArrowRight size={17}/></button><button className="btn-text" onClick={()=>setPage('studio')}><span className="play-dot"><WandSparkles size={14}/></span> Make your own</button></div>
        <div className="hero-social"><div className="avatar-stack"><span>🐶</span><span>🐕</span><span>🐩</span><span>🐾</span></div><div><strong>Made for dog people</strong><small>Good vibes, zero judgement.</small></div></div>
      </div>
      <div className="hero-art">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-note note-left"><span>✦</span> certified good boy</div>
        <div className="hero-main-dog"><div className="hero-sun"></div><span className="hero-dog-emoji">🐕</span><span className="hero-bow">✿</span></div>
        <div className="floating-sticker float-one"><span>🐶</span><small>HI FRIEND!</small></div>
        <div className="floating-sticker float-two"><span>🦴</span><small>TREAT?</small></div>
        <div className="floating-sticker float-three"><span>💗</span><small>SO LOVED</small></div>
        <div className="hero-note note-right">100% good dog energy <span>♡</span></div>
      </div>
    </section>
    <section className="trust-strip"><div className="wrap trust-inner"><span><Sparkles size={16}/> Made with extra love</span><i></i><span><PawPrint size={16}/> 12+ original sticker designs</span><i></i><span><Heart size={16}/> Free to explore</span></div></section>
    <section className="section wrap">
      <div className="section-heading"><div><div className="eyebrow">THE CROWD PLEASERS</div><h2>Little stickers.<br/><em>Big personalities.</em></h2></div><button className="btn-outline" onClick={()=>setPage('explore')}>See all stickers <ArrowRight size={16}/></button></div>
      <div className="sticker-grid home-grid">{stickers.slice(0,4).map(s=><StickerCard key={s.id} item={s} onFav={()=>{}} fav={false} onUse={onUse}/>)}</div>
    </section>
    <section className="feature-band wrap">
      <div className="feature-copy"><div className="eyebrow light-eyebrow">A LITTLE EXTRA MAGIC</div><h2>Your dog.<br/><em>Your art.</em></h2><p>Turn your favourite photo into a keepsake-worthy sticker. Your dog is already a work of art — we're just making it official.</p><button className="btn-light" onClick={()=>setPage('studio')}>Visit the sticker studio <ArrowRight size={16}/></button></div>
      <div className="feature-art"><div className="feature-photo"><span>🐕</span><small>THE ORIGINAL</small></div><div className="feature-arrow">↗</div><div className="feature-sticker"><span>🐶</span><small>THE STICKER</small><b>GOOD<br/>DOG!</b></div><span className="feature-spark">✳</span></div>
    </section>
    <section className="health-teaser wrap"><div className="health-icon"><Stethoscope size={26}/></div><div><div className="eyebrow">A CAREFUL LITTLE HELPER</div><h2>Because good dogs deserve <em>good care.</em></h2><p>Explore our experimental AI image-screening demo for dog eye and skin conditions. Always alongside your vet, never instead of one.</p></div><button className="btn-outline" onClick={()=>setPage('health')}>Explore health AI <ArrowRight size={16}/></button></section>
    <section className="newsletter wrap"><div className="newsletter-paw">🐾</div><div><div className="eyebrow">THE GOOD DOG POST</div><h2>A little joy in your inbox.</h2><p>New sticker drops, happy tails and all things pawsitive.</p></div><form onSubmit={e=>{e.preventDefault();if(email.includes('@'))setJoined(true)}} className="newsletter-form">{joined?<span className="joined"><Check size={17}/> You're on the list. Woof!</span>:<><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" required/><button className="btn-primary">Count me in <ArrowRight size={15}/></button></>}</form></section>
  </main>
}
function Explore({favs,toggleFav,onUse}) {
  const [query,setQuery]=useState('')
  const [cat,setCat]=useState('All stickers')
  const [breed,setBreed]=useState('All breeds')
  const [mood,setMood]=useState('All moods')
  const [sort,setSort]=useState('featured')
  const filtered=useMemo(()=>stickers.filter(s=>(cat==='All stickers'||s.category===cat)&&(breed==='All breeds'||s.breed===breed)&&(mood==='All moods'||s.mood===mood)&&(s.name+' '+s.breed+' '+s.mood).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='az'?a.name.localeCompare(b.name):a.id-b.id),[query,cat,breed,mood,sort])
  return <main className="page wrap">
    <div className="page-intro"><div className="eyebrow">THE STICKER LIBRARY</div><h1>Find your <em>favourite</em><br/>little floof.</h1><p>Meet the pack. Save the ones you love. Make them yours.</p></div>
    <div className="explore-toolbar"><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dogs, moods, good vibes..."/>{query&&<button onClick={()=>setQuery('')}><X size={15}/></button>}</div><label className="sort-select"><SlidersHorizontal size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="az">Name A–Z</option></select><ChevronDown size={15}/></label></div>
    <div className="filter-row"><div className="filter-pills">{categories.map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'filter-pill selected':'filter-pill'}>{c}</button>)}</div><div className="filter-selects"><label><span>Breed</span><select value={breed} onChange={e=>setBreed(e.target.value)}>{breeds.map(x=><option>{x}</option>)}</select></label><label><span>Mood</span><select value={mood} onChange={e=>setMood(e.target.value)}>{moods.map(x=><option>{x}</option>)}</select></label></div></div>
    <div className="results-line"><span><strong>{filtered.length}</strong> happy little finds</span><span>♡ Save your favourites</span></div>
    {filtered.length?<div className="sticker-grid">{filtered.map(s=><StickerCard key={s.id} item={s} fav={favs.includes(s.id)} onFav={toggleFav} onUse={onUse}/>)}</div>:<div className="empty-state"><span>🐶</span><h3>No pups found!</h3><p>Try another search or clear a filter.</p><button className="btn-outline" onClick={()=>{setQuery('');setCat('All stickers');setBreed('All breeds');setMood('All moods')}}>Clear filters</button></div>}
  </main>
}
function Studio({selected,onSelect}) {
  const [text,setText]=useState('GOOD DOG!')
  const [bg,setBg]=useState('#F8E3D7')
  const [size,setSize]=useState(44)
  const [rotation,setRotation]=useState(-5)
  const [outline,setOutline]=useState(true)
  const [tab,setTab]=useState('text')
  const [saved,setSaved]=useState(false)
  const canvasRef=useRef(null)
  const current=selected||stickers[0]
  function exportPng(){
    const canvas=document.createElement('canvas');canvas.width=900;canvas.height=900
    const ctx=canvas.getContext('2d')
    ctx.clearRect(0,0,900,900)
    ctx.save();ctx.translate(450,420);ctx.rotate(rotation*Math.PI/180)
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,0,315,0,Math.PI*2);ctx.fill()
    ctx.font='260px serif';ctx.textAlign='center';ctx.textBaseline='middle'
    if(outline){ctx.lineWidth=24;ctx.strokeStyle='white';ctx.strokeText(current.emoji,0,-55)}
    ctx.fillText(current.emoji,0,-55)
    ctx.font=`900 ${size}px Nunito`;ctx.fillStyle='#3B3531';ctx.textAlign='center'
    if(outline){ctx.lineWidth=12;ctx.strokeStyle='white';ctx.strokeText(text.toUpperCase(),0,225)}
    ctx.fillText(text.toUpperCase(),0,225)
    ctx.restore()
    const a=document.createElement('a');a.download=`pawfect-${current.name.toLowerCase().replaceAll(' ','-')}.png`;a.href=canvas.toDataURL('image/png');a.click()
    setSaved(true);setTimeout(()=>setSaved(false),2500)
  }
  return <main className="page wrap studio-page">
    <div className="page-intro studio-intro"><div className="eyebrow"><Sparkles size={13}/> YOUR CREATIVE CORNER</div><h1>The sticker <em>studio.</em></h1><p>A few clicks, a little imagination, and one very good dog.</p></div>
    <div className="studio-layout">
      <section className="studio-preview-panel">
        <div className="preview-top"><span><span className="live-dot"></span> LIVE PREVIEW</span><button className="reset-btn" onClick={()=>{setText('GOOD DOG!');setBg('#F8E3D7');setSize(44);setRotation(-5);setOutline(true)}}><RotateCcw size={14}/> Reset</button></div>
        <div className="preview-stage" ref={canvasRef} style={{'--preview-bg':bg}}>
          <div className="preview-sticker" style={{transform:`rotate(${rotation}deg)`}}>
            <div className="preview-circle" style={{background:bg}}></div>
            <span className="preview-emoji" style={{textShadow:outline?'0 5px 0 white, 5px 0 0 white, -5px 0 0 white, 0 -5px 0 white':'none'}}>{current.emoji}</span>
            <span className="preview-word" style={{fontSize:`${Math.max(20,size*.58)}px`,textShadow:outline?'2px 2px 0 white,-2px -2px 0 white,2px -2px 0 white,-2px 2px 0 white':'none'}}>{text||'YOUR TEXT'}</span>
            <span className="preview-tiny">✦ PAWFECT ✦</span>
          </div>
          <span className="stage-hint">Your masterpiece, in progress</span>
        </div>
        <div className="preview-bottom"><span><Check size={14}/> Changes update live</span><span>PNG · Transparent-ready export</span></div>
      </section>
      <section className="editor-panel">
        <div className="editor-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Sticker editor</h2></div><span className="step-count">01 <i>/</i> 03</span></div>
        <div className="editor-tabs"><button className={tab==='text'?'active':''} onClick={()=>setTab('text')}><Smile size={15}/> Text</button><button className={tab==='colour'?'active':''} onClick={()=>setTab('colour')}><Palette size={15}/> Colour</button><button className={tab==='style'?'active':''} onClick={()=>setTab('style')}><Sparkles size={15}/> Style</button></div>
        {tab==='text'&&<div className="editor-content"><label className="field-label">YOUR MESSAGE</label><input className="editor-input" maxLength={18} value={text} onChange={e=>setText(e.target.value.toUpperCase())} placeholder="Type something cute..."/><div className="suggestions"><span>Try a little phrase</span>{['GOOD DOG!','OH, HI!','WOOF YOU','NAP QUEEN'].map(x=><button onClick={()=>setText(x)}>{x}</button>)}</div><label className="field-label spaced">CHOOSE YOUR DOG</label><div className="dog-picker">{stickers.slice(0,6).map(s=><button className={current.id===s.id?'picked':''} onClick={()=>onSelect(s)} title={s.name}>{s.emoji}</button>)}</div></div>}
        {tab==='colour'&&<div className="editor-content"><label className="field-label">STICKER BACKGROUND</label><div className="colour-swatches">{palette.map(c=><button className={bg===c?'swatch selected':''} style={{background:c}} onClick={()=>setBg(c)} aria-label={`Choose ${c}`}/>)}</div><div className="custom-colour"><span>Custom colour</span><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/><code>{bg.toUpperCase()}</code></div><div className="colour-tip"><Flower2 size={17}/> Soft colours make the cutest stickers.</div></div>}
        {tab==='style'&&<div className="editor-content"><label className="field-label">TEXT SIZE <b>{size}px</b></label><input className="range-input" type="range" min="28" max="64" value={size} onChange={e=>setSize(+e.target.value)}/><label className="field-label spaced">ROTATION <b>{rotation}°</b></label><input className="range-input" type="range" min="-20" max="20" value={rotation} onChange={e=>setRotation(+e.target.value)}/><label className="toggle-row"><span><strong>White sticker border</strong><small>Add a die-cut sticker edge</small></span><input type="checkbox" checked={outline} onChange={e=>setOutline(e.target.checked)}/></label></div>}
        <div className="editor-footer"><button className="btn-primary full-btn" onClick={exportPng}><Download size={17}/> {saved?'Downloaded!':'Download sticker PNG'}</button><p><ShieldCheck size={13}/> Your design stays in this browser.</p></div>
      </section>
    </div>
    <div className="studio-bottom-note"><Sparkles size={18}/><span><strong>Coming soon:</strong> turn a photo of your own dog into a custom cartoon sticker with an image-generation model.</span></div>
  </main>
}
function Health({}) {
  const [kind,setKind]=useState('eye')
  const [file,setFile]=useState(null)
  const [preview,setPreview]=useState('')
  const [result,setResult]=useState(null)
  const [loading,setLoading]=useState(false)
  const [apiMode,setApiMode]=useState('demo')
  const inputRef=useRef(null)
  const labels={eye:'Dog eye screening',skin:'Dog skin screening'}
  function choose(f){if(!f)return;if(!f.type.startsWith('image/')){alert('Please choose an image file.');return}setFile(f);setPreview(URL.createObjectURL(f));setResult(null)}
  async function analyze(){
    if(!file)return
    setLoading(true);setResult(null)
    try {
      const fd=new FormData();fd.append('file',file)
      const res=await fetch(`${API}/api/predict/${kind}`,{method:'POST',body:fd})
      const data=await res.json()
      if(!res.ok)throw new Error(data.detail || `API error ${res.status}`)
      setResult({...data,mode:'model'});setApiMode('model')
    } catch (error) {
      console.error('PAWFECT prediction error:',error)
      setResult({error:error.message || 'Could not reach the prediction API.'})
      setApiMode('error')
    } finally {setLoading(false)}
  }
  const pretty=s=>s.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())
  return <main className="page wrap health-page">
    <div className="page-intro"><div className="eyebrow"><Stethoscope size={14}/> THE CARE CORNER</div><h1>A little help for<br/><em>your best friend.</em></h1><p>Explore an experimental image-screening demo powered by your dog eye and skin classification projects.</p></div>
    <div className="health-warning"><ShieldCheck size={20}/><div><strong>Made to inform, never diagnose.</strong><p>This prototype is not a veterinary diagnostic tool. Always consult a qualified veterinarian about symptoms or concerns.</p></div></div>
    <div className="health-layout">
      <section className="health-upload-card">
        <div className="health-tabs"><button className={kind==='eye'?'active':''} onClick={()=>{setKind('eye');setResult(null)}}><span>👁️</span> Eye screening</button><button className={kind==='skin'?'active':''} onClick={()=>{setKind('skin');setResult(null)}}><span>🐾</span> Skin screening</button></div>
        <div className="upload-body">
          <div className="upload-title"><div><span className="eyebrow">STEP 01 · UPLOAD</span><h2>{labels[kind]}</h2><p>Choose a clear, well-lit photo of the area you want to screen.</p></div><span className="upload-illustration">{kind==='eye'?'👀':'🐕'}</span></div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>choose(e.target.files?.[0])}/>
          {!preview?<button className="dropzone" onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files?.[0])}}><span className="upload-icon"><UploadCloud size={25}/></span><strong>Drop your photo here</strong><span>or <u>browse files</u></span><small>JPG, PNG or WEBP · Up to 10 MB recommended</small></button>:<div className="uploaded-preview"><img src={preview} alt="Uploaded dog for screening"/><div><strong>{file?.name}</strong><small>{(file?.size/1024/1024).toFixed(2)} MB · Ready to screen</small><button onClick={()=>{setFile(null);setPreview('');setResult(null)}}><X size={14}/> Remove photo</button></div></div>}
          <div className="upload-actions"><button className="btn-primary full-btn" disabled={!file||loading} onClick={analyze}>{loading?<><LoaderCircle className="spin" size={17}/> Analysing image...</>:<><Sparkles size={17}/> Analyse image</>}</button><span><LockIcon/> Images are processed for this demo only.</span></div>
        </div>
      </section>
      <section className="result-card">
        <div className="result-head"><span className="eyebrow">STEP 02 · INSIGHT</span><span className="result-status">{result?'RESULT READY':'AWAITING IMAGE'}</span></div>
        {!result?<div className="result-empty"><div className="result-orbit">✦<span>🐶</span>♡</div><h3>Your results will<br/>show up here.</h3><p>Upload a photo to run your trained EfficientNet-B0 model and review its class probabilities.</p><div className="result-steps"><span><b>1</b> Upload photo</span><span><b>2</b> Run screening</span><span><b>3</b> Review insight</span></div></div>:result.error?<div className="result-error"><AlertCircle size={30}/><h3>We couldn't run the model.</h3><p>{result.error}</p><small>Check http://localhost:8000/api/health and confirm the checkpoint is loaded.</small><button className="btn-outline" onClick={analyze} disabled={loading}>Try again</button></div>:<div className="result-content"><div className="result-mode"><span className={result.mode==='model'?'mode-real':'mode-demo'}>{result.mode==='model'?'LIVE MODEL':'DEMO RESULT'}</span><span>{result.uncertain?'Low confidence':'Top class'}</span></div><div className="prediction-name">{pretty(result.prediction)}</div><div className="confidence-line"><span>Model confidence</span><strong>{Math.round(result.confidence*100)}%</strong></div><div className="confidence-track"><span style={{width:`${result.confidence*100}%`}}/></div><div className="prob-title">CLASS PROBABILITIES</div>{Object.entries(result.all_probs||{}).sort((a,b)=>b[1]-a[1]).map(([name,val])=><div className="prob-row"><span>{pretty(name)}</span><div><i style={{width:`${val*100}%`}}/></div><b>{Math.round(val*100)}%</b></div>)}<div className="result-advice"><AlertCircle size={17}/><span>{result.uncertain?'The model confidence is below its notebook screening threshold. This is not a diagnosis; arrange a veterinary assessment.':'This is only a model prediction, not a diagnosis. Discuss any concerns with your veterinarian.'}</span></div></div>}
      </section>
    </div>
    <div className="health-footnote"><div><h3>When in doubt, call your vet.</h3><p>Seek prompt veterinary care for pain, swelling, discharge, bleeding, vision changes, rapid worsening or persistent symptoms.</p></div><span>🐾</span></div>
  </main>
}
function LockIcon(){return <ShieldCheck size={13}/>}
function Collection({favs,toggleFav,onUse}) {
  const saved=stickers.filter(s=>favs.includes(s.id))
  return <main className="page wrap"><div className="page-intro"><div className="eyebrow">YOUR LITTLE HAPPY PLACE</div><h1>My <em>collection.</em></h1><p>All your saved good dogs, together in one place.</p></div>{saved.length?<><div className="results-line"><span><strong>{saved.length}</strong> saved stickers</span><button className="btn-text" onClick={()=>{if(confirm('Remove all saved stickers?'))saved.forEach(s=>toggleFav(s.id))}}>Clear collection</button></div><div className="sticker-grid">{saved.map(s=><StickerCard key={s.id} item={s} fav onFav={toggleFav} onUse={onUse}/>)}</div></>:<div className="empty-state"><span>💌</span><h3>Your collection is waiting.</h3><p>Tap the heart on any sticker to keep it close.</p><button className="btn-primary" onClick={()=>onUse(stickers[0])}>Make a sticker <ArrowRight size={16}/></button></div>}</main>
}
function About({setPage}) {
  return <main className="page wrap"><div className="page-intro"><div className="eyebrow">A NOTE FROM THE PACK</div><h1>Good dogs.<br/><em>Good humans.</em></h1><p>PAWFECT is a playful concept studio celebrating the tiny things that make life with dogs feel huge.</p></div><div className="about-grid"><div className="about-card about-peach"><span>🐕</span><h2>Made for the dog-obsessed.</h2><p>Sticker packs, little creative tools and joyful details for people who know that dogs are family.</p></div><div className="about-card about-lilac"><span>🩺</span><h2>Care with curiosity.</h2><p>Our experimental image-screening area explores how computer vision can support conversations with vets — not replace them.</p></div></div><button className="btn-primary" onClick={()=>setPage('explore')}>Meet the sticker pack <ArrowRight size={16}/></button></main>
}

function PawPal(){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(''),[messages,setMessages]=useState([{from:'bot',text:"Hi! I'm PawPal 🐶 Your AI dog-care companion. Ask me about everyday care, routines, grooming, enrichment or common concerns. I'm not a vet, but I can help you find a sensible next step."}]),[busy,setBusy]=useState(false),end=useRef(null)
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'})},[messages,open])
 async function send(value=draft){
  const msg=value.trim();if(!msg||busy)return
  const history=messages.filter(m=>m.from==='user'||m.from==='bot').slice(-8).map(m=>({role:m.from==='bot'?'assistant':'user',content:m.text}))
  setMessages(old=>[...old,{from:'user',text:msg}]);setDraft('');setBusy(true)
  try{
   const res=await fetch(`${API}/api/pawpal/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history})})
   const data=await res.json()
   if(!res.ok)throw new Error(data.detail||'PawPal is temporarily unavailable. Please try again.')
   setMessages(old=>[...old,{from:'bot',text:data.answer,sources:data.sources||[],mode:data.mode}])
  }catch(err){setMessages(old=>[...old,{from:'bot',text:`I couldn't connect to my AI service. ${err.message} Check that the FastAPI server is running and GEMINI_API_KEY is configured in backend/.env.`}])}
  finally{setBusy(false)}
 }
 return <div className="pawpal-root">{open&&<section className="pawpal-panel" aria-label="PawPal dog-care chat"><header className="pawpal-head"><span className="pawpal-avatar">🐾</span><div><strong>PawPal</strong><small>AI dog-care buddy · RAG knowledge assistant</small></div><button onClick={()=>setOpen(false)} aria-label="Close chat"><X size={18}/></button></header><div className="pawpal-messages">{messages.map((m,i)=><div key={i} className={`pawpal-message ${m.from}`}><span>{m.text}</span>{m.sources?.length>0&&<small className="pawpal-sources">Knowledge: {[...new Set(m.sources.map(s=>s.section))].join(' · ')}</small>}</div>)}{busy&&<div className="pawpal-message bot">PawPal is checking its care notes…</div>}<div ref={end}/></div><div className="pawpal-prompts">{['Daily care routine','My dog is itchy','Fun enrichment ideas'].map(x=><button key={x} onClick={()=>send(x)} disabled={busy}>{x}</button>)}</div><form className="pawpal-compose" onSubmit={e=>{e.preventDefault();send()}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask PawPal..." aria-label="Message PawPal"/><button type="submit" disabled={!draft.trim()||busy} aria-label="Send message"><ArrowRight size={17}/></button></form><p className="pawpal-disclaimer">AI education only, not veterinary diagnosis. For urgent symptoms, contact a vet immediately.</p></section>}<button className={`pawpal-launch ${open?'is-open':''}`} onClick={()=>setOpen(v=>!v)} aria-label={open?'Close PawPal':'Chat with PawPal'}>{open?<X size={23}/>:<>🐶 <b>Ask PawPal</b><Sparkles size={16}/></>}</button></div>
}

export default function App(){
  const [page,setPage]=useState('home')
  const [favs,setFavs]=useState(readSaved)
  const [selected,setSelected]=useState(stickers[0])
  useEffect(()=>{localStorage.setItem('pawfect-favs',JSON.stringify(favs))},[favs])
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'})},[page])
  function toggleFav(id){setFavs(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id])}
  function useSticker(item){setSelected(item);setPage('studio')}
  return <div className="app-shell"><Header page={page} setPage={setPage} favs={favs}/>{page==='home'?<Home setPage={setPage} onUse={useSticker}/>:page==='explore'?<Explore favs={favs} toggleFav={toggleFav} onUse={useSticker}/>:page==='studio'?<Studio selected={selected} onSelect={setSelected}/>:page==='health'?<Health/>:page==='collection'?<Collection favs={favs} toggleFav={toggleFav} onUse={useSticker}/>:<About setPage={setPage}/>}<Footer setPage={setPage}/><PawPal/></div>
}
