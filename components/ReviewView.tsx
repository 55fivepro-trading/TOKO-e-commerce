'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Send, User } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function ReviewView() {
  const { reviews, submitRating } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const averageRating = reviews.averageRating;
  const totalReview = reviews.totalReview;
  
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.list.forEach(r => {
    const rVal = Math.floor(Number(r.rating));
    if (rVal >= 1 && rVal <= 5) ratingCounts[rVal - 1]++;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Pilih rating bintang terlebih dahulu');
    await submitRating({ user: 'User ' + Math.floor(Math.random() * 1000), rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Main Rating Summary */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-black text-navy-900 mb-2">{averageRating}</h2>
          <div className="flex justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={20} className={s <= Math.round(Number(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
            ))}
          </div>
          <p className="text-sm text-gray-500">Berdasarkan {totalReview} ulasan</p>
        </div>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(num => (
            <div key={num} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-3">{num}</span>
              <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full" 
                  style={{ width: `${totalReview > 0 ? (ratingCounts[num-1] / totalReview) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-4">{ratingCounts[num-1]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* User Action: Add Review */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-navy-900 mb-4">Beri Ulasan Anda</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-125"
              >
                <Star 
                  size={32} 
                  className={(hoverRating || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} 
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis komentar Anda di sini..."
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 min-h-[100px]"
          />
          <button 
            type="submit"
            className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy-800 transition-all shadow-lg shadow-navy-100"
          >
            <Send size={18} />
            Kirim Review
          </button>
        </form>
      </section>

      {/* Review List */}
      <section className="space-y-4">
        <h3 className="font-bold text-navy-900 px-2">Daftar Review</h3>
        {reviews.list.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Belum ada ulasan.</p>
        ) : (
          reviews.list.map((review) => (
            <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-navy-50 flex-shrink-0">
                  <Image 
                    src={review.avatar || `https://picsum.photos/seed/${review.user}/100/100`} 
                    alt={review.user} 
                    fill
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-navy-900 text-sm">{review.user}</h4>
                    <span className="text-[10px] text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={12} className={s <= Number(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
