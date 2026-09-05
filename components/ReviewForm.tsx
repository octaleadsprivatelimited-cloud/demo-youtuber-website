'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { submitOwnerReview } from '@/services/phase-three';

export function ReviewForm({ tractorId, tractorName }: { tractorId: string; tractorName: string }) {
  const { user } = useAuth();
  const [rating,setRating] = useState(5); const [title,setTitle] = useState(''); const [comment,setComment] = useState('');
  const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) { window.location.href='/login'; return; }
    setBusy(true); setMessage('');
    try {
      await submitOwnerReview({tractorId,tractorName,userId:user.uid,userName:user.displayName ?? 'RJ Tractor Techs member',rating,title,comment});
      setTitle(''); setComment(''); setMessage('Review submitted for moderation.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to submit review.'); }
    finally { setBusy(false); }
  }
  return <form className="review-form" onSubmit={submit}><LocalizedElement as="p">OWNER REVIEW</LocalizedElement><LocalizedElement as="h3">Share your experience</LocalizedElement><LocalizedElement as="label">Rating<LocalizedElement as="select" value={rating} onChange={event => setRating(Number(event.target.value))}>{[5,4,3,2,1].map(value => <LocalizedElement as="option" value={value} key={value}>{value} star{value>1?'s':''}</LocalizedElement>)}</LocalizedElement></LocalizedElement><LocalizedElement as="label">Review title<LocalizedElement as="input" required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} /></LocalizedElement><LocalizedElement as="label">Your review<LocalizedElement as="textarea" required minLength={30} maxLength={1500} value={comment} onChange={event => setComment(event.target.value)} /></LocalizedElement>{message && <LocalizedElement as="span">{message}</LocalizedElement>}<LocalizedElement as="button" disabled={busy}>{busy?'Submitting…':'Submit review →'}</LocalizedElement></form>;
}

