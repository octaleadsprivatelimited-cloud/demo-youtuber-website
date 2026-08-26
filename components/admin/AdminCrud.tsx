'use client';
import {useEffect,useState} from 'react';
import type {AdminSection} from '@/config/admin-sections';
import {listAdminRecords,removeAdminRecord,saveAdminRecord,uploadAdminImage,type AdminRecord} from '@/services/admin';

function RichEditor({value,onChange}:{value:string;onChange:(v:string)=>void}){const add=(before:string,after='')=>onChange(value+`\n${before}Text${after}`);return <div className="rich-editor"><div>{[['Heading','## ',''],['Bold','**','**'],['Italic','*','*'],['List','- ',''],['Quote','> ',''],['Link','[Link](',')']].map(([label,before,after])=><button key={label} type="button" onClick={()=>add(before,after)}>{label}</button>)}</div><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder="Write the article body…"/></div>}

export function AdminCrud({section}:{section:AdminSection}){
  const [items,setItems]=useState<AdminRecord[]>([]);
  const [editing,setEditing]=useState<AdminRecord|null>(null);
  const [form,setForm]=useState<Record<string,unknown>>({status:'draft'});
  const [modalOpen,setModalOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  async function load(){setBusy(true);setError('');try{setItems(await listAdminRecords(section.collection));}catch(e){setError(e instanceof Error?e.message:'Unable to load records.');}finally{setBusy(false);}}
  useEffect(()=>{load();},[section.collection]);
  function open(item?:AdminRecord){setEditing(item??null);setForm(item?{...item}:{status:'draft'});setError('');setNotice('');setModalOpen(true);}
  function close(){setModalOpen(false);setEditing(null);setForm({status:'draft'});}
  function change(key:string,value:unknown){const next={...form,[key]:value};if((key==='title'||key==='model')&&!form.slug)next.slug=String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');setForm(next);}
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await saveAdminRecord(section.collection,editing?.id,form);close();await load();setNotice(`${section.label} record saved. ${form.status==='published'||form.status==='approved'?'It is now available on the public website.':'Publish it when it is ready for the public website.'}`);}catch(e){setError(e instanceof Error?e.message:'Unable to save.');}finally{setBusy(false);}}
  async function remove(item:AdminRecord){if(!confirm(`Delete ${String(item.title??item.model??item.id)}?`))return;try{await removeAdminRecord(section.collection,item.id);await load();setNotice('Record deleted.');}catch(e){setError(e instanceof Error?e.message:'Unable to delete.');}}

  return <>
    <header className="admin-heading"><div><p>CONTENT MANAGEMENT</p><h1>{section.label}</h1><span>{section.description}</span></div><button type="button" onClick={()=>open()}>+ New record</button></header>
    {notice&&<div className="admin-success">{notice}</div>}{error&&<div className="admin-error">{error}</div>}
    <div className="admin-panel"><div className="admin-table-head"><strong>{items.length} records</strong><button onClick={load}>Refresh</button></div>{busy&&!modalOpen?<div className="detail-loading">Loading…</div>:!items.length?<div className="empty-state"><h3>No records yet.</h3><p>Use “New record” to create the first one.</p></div>:<div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Name</th><th>Status</th><th>Identifier</th><th>Actions</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{String(item.title??item.model??item.name??item.email??'Untitled')}</strong></td><td>{String(item.status??'draft')}</td><td><small>{String(item.slug??item.path??item.id)}</small></td><td><button onClick={()=>open(item)}>Edit</button> <button className="danger-link" onClick={()=>remove(item)}>Delete</button></td></tr>)}</tbody></table></div>}</div>
    {modalOpen&&<div className="admin-modal" role="dialog" aria-modal="true"><form className="admin-form" onSubmit={submit}><button type="button" className="admin-close" onClick={close} aria-label="Close">×</button><p>{editing?'EDIT RECORD':'NEW RECORD'}</p><h2>{section.label}</h2>{section.fields.map(field=><label key={field.key}>{field.label}{section.collection==='articles'&&field.key==='content'?<RichEditor value={String(form[field.key]??'')} onChange={value=>change(field.key,value)}/>:field.type==='textarea'?<textarea required={field.required} value={String(form[field.key]??'')} onChange={e=>change(field.key,e.target.value)}/>:field.type==='boolean'?<input type="checkbox" checked={Boolean(form[field.key])} onChange={e=>change(field.key,e.target.checked)}/>:field.type==='status'?<select value={String(form[field.key]??'draft')} onChange={e=>change(field.key,e.target.value)}><option value="draft">Draft</option><option value="review">Review</option><option value="pending">Pending</option><option value="published">Published</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="archived">Archived</option></select>:field.type==='image'?<><input value={String(form[field.key]??'')} placeholder="Image URL" onChange={e=>change(field.key,e.target.value)}/><input type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(file)change(field.key,await uploadAdminImage(file,section.collection));}}/></>:<input required={field.required} type={field.type==='number'?'number':'text'} value={String(form[field.key]??'')} onChange={e=>change(field.key,field.type==='number'?Number(e.target.value):e.target.value)}/>}</label>)}<button className="cta-primary" disabled={busy}>{busy?'Saving…':'Save record'}</button></form></div>}
  </>;
}
