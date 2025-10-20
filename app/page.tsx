'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image' // Import Image component

interface HiddenQuestion {
  question: string
  answer: string
  digit: string
  place: number
}

interface Envelope {
  id: number
  title: string
  message: string
}

interface Song {
  id: number
  title: string
  artist: string
  youtubeId: string // Just the ID from the YouTube URL
  thumbnail: string // Path to a local thumbnail or URL
}

// Define types for confetti pieces
interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  col: string
  type: 'confetti' | 'flower'
}

// Define types for heart particles
interface Heart {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  rotation: number
  color: string
}

export default function Page() {
  const SECRET = '15625'
  const CODE_LENGTH = 5
  const [code, setCode] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [unlocked, setUnlocked] = useState<boolean>(false)
  const [showTabs, setShowTabs] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [openedEnvelopes, setOpenedEnvelopes] = useState<number[]>([])
  const [modal, setModal] = useState<{ open: boolean; index?: number }>({ open: false })
  const [userAnswer, setUserAnswer] = useState<string>('')
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const welcomeCanvasRef = useRef<HTMLCanvasElement | null>(null); // For welcome screen heart burst
  const hiddenQuestions: HiddenQuestion[] = [
    { question: "What&apos;s my fav football club?", answer: 'barcelona', digit: '1', place: 1 },
    { question: "What&apos;s my fav nickname that u call me?", answer: 'karruma', digit: '5', place: 2 },
    { question: "What&apos;s my fav thing about u? (text me if u need a hint)", answer: 'everything', digit: '6', place: 3 },
    { question: "Who&apos;s my future wife?", answer: 'dana', digit: '2', place: 4 },
    { question: "Text me for the last digit 💜", answer: '', digit: '5', place: 5 },
  ]

  const envelopes: Envelope[] = [
    { id: 1, title: "open it if you are sad", message: "Even on gray days, you&apos;re my sunshine. ☀️ Let me be yours for a little while. I wish I could hug all the sadness away. Imagine me squeezing you super tight. 🤗" },
    { id: 2, title: "Need a laugh?", message: "Ofc bta3rfe shu rah ykun fi hon. NEKTE SARI3AAAA" },
    { id: 3, title: "open it if you are happy", message: "Seeing you happy is my favorite hobby. Keep smiling, baby" },
    { id: 4, title: "open it if you are feeling insecure", message: "Hey love, you&apos;re beautiful in every way… and don&apos;t let anyone (including your brain) tell you otherwise, w ma tense enek ahla w azka w a2wa w ashtar benet bl dene ya albe" },
    { id: 5, title: "open it if you are angry", message: "Ya3ne ma bkazeb 3layke u look extra hot when ur angry. bas its gonna be alright ya habibe if you are angry we face it together even if im the problem... hihi" },
    { id: 6, title: "open it if you are haivng a bad day", message: "Nothing is gonna be perfect ya albe ull have a bad day but all i can say is ull never face this bad day alone ya habibe whenever u need ill be here no matter when or where" },
  ]

  const songs: Song[] = [
    {
      id: 1,
      title: "heatwaves",
      artist: "glass animals",
      youtubeId: "mRD0-GxqHVo",
      thumbnail: "/perfect-edsheeran.jpeg", // Make sure you have this image in your public folder
    },
    {
      id: 2,
      title: "The first time",
      artist: "Damiano David",
      youtubeId: "zKEKXCLT6yg",
      thumbnail: "/all-of-me-johnlegend.jpeg", // Make sure you have this image
    },
    {
      id: 3,
      title: "Teenage Dream ",
      artist: "Stephen Dawes",
      youtubeId: "pVi9W3OThVw",
      thumbnail: "/thousand-years-christinaperri.jpeg", // Make sure you have this image
    },
    {
      id: 4,
      title: "NUEVAYoL ",
      artist: "BAD BUNNY",
      youtubeId: "zAfrPjTvSNs",
      thumbnail: "/conversations-in-the-dark.jpeg", // Make sure you have this image
    },
    {
     id: 5,
      title: "Fe eineh ",
      artist: "Tul8te",
      youtubeId: "voa8jFUA7Q4",
      thumbnail: "/conversations-in-the-dark.jpeg", // Make sure you have this image
    },
    {
     id: 6,
      title: "Diva ",
      artist: "Saint Levant",
      youtubeId: "wg5mkauPa58",
      thumbnail: "/conversations-in-the-dark.jpeg", // Make sure you have this image
    },
    // Add more songs here
  ]

  // Numpad logic
  const pressNumpad = (n: string) => {
    if (n === 'back') return setCode(prev => prev.slice(0, -1))
    if (n === 'enter') {
      if (code.length !== CODE_LENGTH) return setMessage('Please enter all 5 digits 💜')
      if (code === SECRET) {
        setUnlocked(true)
        setMessage('Welcome my love ❤️')
        audioRef.current?.play().catch(() => {})
        setTimeout(() => setShowTabs(true), 4000)
      } else {
        setMessage('Try again my love 💜')
      }
      return
    }
    if (code.length >= CODE_LENGTH) return
    setCode(prev => prev + n)
  }

  // Question modal logic
  const openQuestion = (index: number) => {
    setModal({ open: true, index })
    setUserAnswer('')
  }

  const submitAnswer = () => {
    if (modal.index === undefined) return
    const q = hiddenQuestions[modal.index]
    if (userAnswer.trim().toLowerCase() === q.answer.toLowerCase()) {
      setCode(prev => {
        const arr = prev.split('')
        arr[q.place - 1] = q.digit
        return arr.join('')
      })
      setMessage(`Correct! Digit ${q.digit} in position ${q.place} 💜`)
      setModal({ open: false })
    } else {
      setMessage('Try again baby 💜 Text me if u need a hint')
    }
  }

  const toggleEnvelope = (id: number) => {
    setOpenedEnvelopes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Confetti
  useEffect(() => {
    if (!unlocked || !confettiRef.current) return
    const canvas = confettiRef.current
    const ctx = canvas.getContext('2d')!
    const w = canvas.width = window.innerWidth
    const h = canvas.height = window.innerHeight
    const pieces: ConfettiPiece[] = [] // Changed to const and explicitly typed

    for (let i = 0; i < 400; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -Math.random() * h,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        r: Math.random() * 8 + 4,
        rot: Math.random() * 360,
        col: `hsl(${260 + Math.random() * 80},70%,60%)`,
        type: Math.random() < 0.5 ? 'confetti' : 'flower',
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.rot += 2
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.type === 'confetti' ? p.col : 'pink'
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.2)
        ctx.restore()
        if (p.y > h + 100) pieces.splice(i, 1)
      }
      requestAnimationFrame(draw)
    }
    draw()
  }, [unlocked])

  // Welcome screen heart burst effect
  useEffect(() => {
    if (unlocked && !showTabs && welcomeCanvasRef.current) {
      const canvas = welcomeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const hearts: Heart[] = []; // Changed to const and explicitly typed
      const createHeart = () => {
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const size = Math.random() * 15 + 10;
        const speed = Math.random() * 2 + 1;
        const angle = Math.random() * Math.PI * 2;
        hearts.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: size,
          opacity: 1,
          rotation: Math.random() * 360,
          color: `hsl(${Math.random() * 30 + 330}, 80%, 70%)`, // Pinks and reds
        });
      };

      const drawHeart = (heart: Heart) => { // Explicitly typed heart parameter
        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate(heart.rotation * Math.PI / 180);
        // Note: The color parsing logic for rgba might be off if hsl is directly passed.
        // For simplicity, let's keep it in hsl/string format if ctx.fillStyle supports it,
        // or convert it properly to rgba. For now, assuming direct color string works.
        ctx.fillStyle = heart.color;
        ctx.globalAlpha = heart.opacity; // Use globalAlpha for opacity

        ctx.beginPath();
        ctx.moveTo(0, heart.size / 2);
        ctx.bezierCurveTo(heart.size / 2, heart.size / 2, heart.size / 2, 0, 0, -heart.size / 2);
        ctx.bezierCurveTo(-heart.size / 2, 0, -heart.size / 2, heart.size / 2, 0, heart.size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      let animationFrameId: number;
      const heartInterval = setInterval(createHeart, 100); // Changed to const

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = hearts.length - 1; i >= 0; i--) {
          const heart = hearts[i];
          heart.x += heart.vx;
          heart.y += heart.vy;
          heart.vy += 0.05; // Gravity
          heart.opacity -= 0.01;
          heart.rotation += 1; // Spin

          if (heart.opacity <= 0) {
            hearts.splice(i, 1);
          } else {
            drawHeart(heart);
          }
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      // Create initial burst
      for (let i = 0; i < 50; i++) {
        createHeart();
      }

      // Keep creating some hearts for a short duration
      setTimeout(() => clearInterval(heartInterval), 2000); // Stop creating hearts after 2 seconds

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        clearInterval(heartInterval);
      };
    }
  }, [unlocked, showTabs]);


  return (
    <main className='min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 flex flex-col items-center justify-center p-6 relative font-poppins overflow-hidden'> {/* Added overflow-hidden */}
      {/*
        Warning: Custom fonts not added in `pages/_document.js` will only load for a single page.
        This is discouraged. For global custom fonts, consider moving this to pages/_document.js.
        See: https://nextjs.org/docs/messages/no-page-custom-font
      */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Pacifico&display=swap" rel="stylesheet" />
      <canvas ref={confettiRef} className='pointer-events-none fixed inset-0 z-50' />
      <audio ref={audioRef} src='/music.mp3' preload='auto' />

      {/* NEW: Background energy elements */}
      <div className='background-energy-container'>
        <div className='background-orb pink-orb'></div>
        <div className='background-orb blue-orb'></div>
        <div className='background-shape shape-1'></div>
        <div className='background-shape shape-2'></div>
        <div className='background-shape shape-3'></div>
        <div className='background-shape shape-4'></div>
      </div>
      {/* END NEW */}

      {/* Safe / Numpad Section */}
      {!unlocked && (
        <section className='w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center z-10 animate-safe-entrance'> {/* Added z-10 and animate-safe-entrance */}
          <div className='flex flex-col items-center'>
            <h2 className='text-xl font-semibold text-purple-800'>Open my little safe</h2>
            <p className='text-sm text-purple-600'>Type the 5-digit code using the numpad below.</p>
            <div className='mt-4 flex justify-center gap-2'>
              {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
                <div key={idx} className='w-10 h-12 bg-purple-50 border border-purple-200 rounded-md flex items-center justify-center text-lg font-medium text-purple-800'>
                  {code[idx] ?? '—'}
                </div>
              ))}
            </div>
            <p className='mt-2 text-center text-sm text-purple-600 min-h-[1.25rem]'>{message}</p>

            <div className='mt-6 grid grid-cols-3 gap-3 w-64'>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => pressNumpad(String(n))} className='py-3 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform'>{n}</button>
              ))}
              <button onClick={() => pressNumpad('back')} className='py-3 rounded-lg bg-white/90 text-purple-700 font-semibold shadow'>⌫</button>
              <button onClick={() => pressNumpad('0')} className='py-3 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-semibold shadow'>0</button>
              <button onClick={() => pressNumpad('enter')} className='py-3 rounded-lg bg-purple-700 text-white font-semibold shadow'>Enter</button>
            </div>

            <div className='mt-4 flex flex-col gap-2'>
              {hiddenQuestions.map((_, idx) => (
                <button key={idx} onClick={() => openQuestion(idx)} className='px-4 py-2 rounded-lg bg-purple-200 hover:bg-purple-300 text-purple-800 font-semibold shadow'>Question {idx + 1}</button>
              ))}
            </div>
          </div>

          <div className='flex flex-col items-center justify-center'>
            <div className='w-72 h-72 rounded-2xl overflow-hidden shadow-lg border-2 border-white animate-pulse-slow-image'> {/* Added animate-pulse-slow-image */}
              <Image src='/us.jpeg' alt='us' width={288} height={288} className='w-full h-full object-cover opacity-80' /> {/* Replaced <img> with <Image /> */}
            </div>
            <p className='mt-4 text-center text-sm text-purple-700 animate-fade-in-delay'>I love you sattoul</p> {/* Added animate-fade-in-delay */}
          </div>
        </section>
      )}

      {/* Modal */}
      {modal.open && modal.index !== undefined && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 animate-modal-fade-in'>
          <div className='max-w-sm w-full bg-white rounded-2xl p-6 text-center shadow-2xl animate-modal-zoom-in'>
            <h3 className='text-lg font-bold text-purple-800 font-pacifico'>Question {modal.index + 1}</h3>
            <p className='mt-2 text-sm text-purple-600'>{hiddenQuestions[modal.index].question}</p>
            <input type='text' value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder='Your answer...' className='mt-4 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-purple-700'/>
            <div className='mt-4 flex justify-center gap-3'>
              <button onClick={submitAnswer} className='px-4 py-2 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors'>Submit</button>
              <button onClick={() => setModal({ open: false })} className='px-4 py-2 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors'>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome screen - ONLY show if unlocked AND tabs are NOT yet shown */}
      {unlocked && !showTabs && (
        <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 animate-welcome-bg-transition'>
          <h1 className='text-5xl md:text-7xl font-bold text-purple-800 mb-6 relative welcome-text-container font-pacifico'> {/* Applied Pacifico here */}
            <span className='letter-animate' style={{animationDelay: '0s'}}>W</span>
            <span className='letter-animate' style={{animationDelay: '0.1s'}}>e</span>
            <span className='letter-animate' style={{animationDelay: '0.2s'}}>l</span>
            <span className='letter-animate' style={{animationDelay: '0.3s'}}>c</span>
            <span className='letter-animate' style={{animationDelay: '0.4s'}}>o</span>
            <span className='letter-animate' style={{animationDelay: '0.5s'}}>m</span>
            <span className='letter-animate' style={{animationDelay: '0.6s'}}>e</span>
            <span className='letter-animate' style={{animationDelay: '0.7s'}}> &nbsp;</span> {/* ADDED &nbsp; */}
            <span className='letter-animate' style={{animationDelay: '0.8s'}}>m</span>
            <span className='letter-animate' style={{animationDelay: '0.9s'}}>y</span>
            <span className='letter-animate' style={{animationDelay: '1.0s'}}> &nbsp;</span> {/* ADDED &nbsp; */}
            <span className='letter-animate' style={{animationDelay: '1.1s'}}>l</span>
            <span className='letter-animate' style={{animationDelay: '1.2s'}}>o</span>
            <span className='letter-animate' style={{animationDelay: '1.3s'}}>v</span>
            <span className='letter-animate' style={{animationDelay: '1.4s'}}>e</span>
            <span className='letter-animate' style={{animationDelay: '1.5s'}}> ❤️</span>
          </h1>
          <canvas ref={welcomeCanvasRef} className='absolute inset-0 pointer-events-none' />
        </div>
      )}

      {/* Tabs section (Visible only if showTabs is true) */}
      {showTabs && (
        <section className='w-full max-w-5xl p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mt-6 animate-tabs-entrance z-10'>
          <div className='flex flex-wrap justify-center gap-6 mb-6'>
            <div onClick={() => setActiveTab(0)} className='tab-square group'>
              <Image src='/about-icon.png' alt='About' width={72} height={72} className='w-full h-full object-cover rounded-lg p-2'/> {/* Replaced <img> with <Image /> */}
              <span className='tab-label'>About</span>
            </div>
            <div onClick={() => setActiveTab(1)} className='tab-square group'>
              <Image src='/message-icon.png' alt='Messages' width={72} height={72} className='w-full h-full object-cover rounded-lg p-2'/> {/* Replaced <img> with <Image /> */}
              <span className='tab-label'>Messages</span>
            </div>
            <div onClick={() => setActiveTab(2)} className='tab-square group'>
              <Image src='/music-icon.png' alt='Songs' width={72} height={72} className='w-full h-full object-cover rounded-lg p-2'/> {/* Replaced <img> with <Image /> */}
              <span className='tab-label'>Songs</span>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 0 && (
            <div className='p-4 text-purple-700 animate-tab-content-fade-in'>
              <h3 className="text-2xl font-semibold mb-4 font-pacifico">Welcome to our website</h3>
              <p className="mb-4">This space is dedicated to our beautiful memories and the special moments we&apos;ve shared. Every laugh, every conversation, every adventure—they all mean the world to me. I&apos;m so grateful for you.</p>
              <p className="mb-4">Even on my free time everything im thinking about is you and trying my best to do something to put a smile on ur beautiful face my love and i hope im doing enought cause u desrve the whole world baby</p>
              <p className="mb-4">Keep this website cause ull never know when i might add something new to it or a surpise might pop up in it i love you</p>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Image src="/memory1.jpeg" alt="Memory 1" width={400} height={300} className="rounded-lg shadow-md w-full h-full object-cover"/> {/* Replaced <img> with <Image /> */}
                <Image src="/memory2.jpeg" alt="Memory 2" width={400} height={300} className="rounded-lg shadow-md w-full h-full object-cover"/> {/* Replaced <img> with <Image /> */}
              </div>
              <p className="mt-4">Here&apos;s to many more unforgettable moments together! 🥂</p>
            </div>
          )}

          {activeTab === 1 && (
            <div className='flex flex-col md:flex-row flex-wrap justify-center gap-6 animate-tab-content-fade-in'>
              <p className=" text-purple-600 mb-10">so i decided to keep some messages for u here cause what if u were outside and u don&apos;t have the messages with u and u needed them ull have them everywhere maybe it won&apos;t feel the same but better than nothing baby</p>
              {envelopes.map(env => (
                <div key={env.id} className='envelope-container' onClick={() => toggleEnvelope(env.id)}>
                  <div className={`envelope ${openedEnvelopes.includes(env.id) ? 'opened' : ''}`}>
                    <div className='envelope-flap'></div>
                    <div className='envelope-body'>
                      <div className='envelope-letter'>
                        <p className='text-[12px]'>{env.message}</p>
                      </div>
                      <span className='envelope-title'>{env.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 2 && (
            <div className='animate-tab-content-fade-in flex flex-wrap justify-center gap-6 py-4'>
              <h3 className="text-2xl font-semibold mb-4 w-full text-center text-purple-800 font-pacifico">Our Favorite Songs</h3>
              <p className="text-purple-600 mb-6 text-center w-full max-w-2xl">These are some of the songs that remind me of us, or just songs I love and want to share with you, my darling. Enjoy listening! 💖</p>
              {songs.map(song => (
                <div key={song.id} className='song-card w-full sm:w-64 lg:w-72'>
                  <Image src={song.thumbnail} alt={song.title} width={80} height={80} className='song-thumbnail'/> {/* Replaced <img> with <Image /> */}
                  <h4 className='font-semibold text-purple-800 text-lg mt-2'>{song.title}</h4>
                  <p className='text-sm text-purple-600 mb-3'>{song.artist}</p>
                  <iframe
                    width="100%"
                    height="180" // Adjust height for a good fit in the card
                    src={`https://www.youtube.com/embed/${song.youtubeId}?rel=0`}
                    title={`${song.title} by ${song.artist}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg mt-2 shadow-inner"
                  ></iframe>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        /* --- Base Styles & Fonts --- */
        body {
          font-family: 'Poppins', sans-serif;
        }
        .font-pacifico {
            font-family: 'Pacifico', cursive;
        }

        /* --- General Animations --- */
        /* Removed animate-background-pan from main as it's not explicitly defined here, but if you had it working elsewhere, you can re-add it or add the CSS for it. */
        /* The existing main background gradient is static. For animation, you'd need keyframes for background-position. */

        /* NEW: Background energy container (holds all energetic elements) */
        .background-energy-container {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0; /* Ensures it stays behind main content */
        }

        /* NEW: Soft, Pulsating Light Orbs */
        .background-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px); /* Heavy blur for soft glow */
            opacity: 0.3;
            animation: orbFloat 20s infinite ease-in-out alternate, orbPulse 5s infinite ease-in-out;
            pointer-events: none;
        }

        .pink-orb {
            width: 300px;
            height: 300px;
            background: rgba(255, 150, 200, 0.7); /* Soft pink */
            top: 10%;
            left: 5%;
            animation-delay: 0s;
        }

        .blue-orb {
            width: 350px;
            height: 350px;
            background: rgba(150, 200, 255, 0.7); /* Soft blue */
            bottom: 15%;
            right: 8%;
            animation-delay: 10s;
        }

        @keyframes orbFloat {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, -30px) scale(1.05); }
            100% { transform: translate(0, 0) scale(1); }
        }

        @keyframes orbPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }

        /* NEW: Floating Geometric Shapes (updated from your original .main-background-extra-elements concept) */
        .background-shape {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.1); /* Very subtle white for transparency */
            border-radius: 4px; /* Default to square, or can be changed to 50% for circles */
            filter: blur(2px);
            opacity: 0.15;
            animation: shapeFloatAndRotate 25s infinite ease-in-out alternate;
            pointer-events: none;
        }

        .shape-1 {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 15%;
            transform: rotate(0deg);
            animation-delay: 0s;
        }
        .shape-2 {
            width: 100px;
            height: 100px;
            bottom: 25%;
            right: 20%;
            border-radius: 50%; /* Circle */
            animation-delay: 8s;
        }
        .shape-3 {
            width: 60px;
            height: 60px;
            top: 50%;
            right: 10%;
            transform: rotate(30deg);
            animation-delay: 4s;
            background-color: rgba(200, 150, 255, 0.1); /* Subtle purple tint */
        }
        .shape-4 {
            width: 70px;
            height: 70px;
            bottom: 10%;
            left: 10%;
            transform: rotate(-20deg);
            animation-delay: 12s;
            border-radius: 50%; /* Circle */
        }

        @keyframes shapeFloatAndRotate {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 0.15; }
            33% { transform: translate(40px, 60px) rotate(90deg); opacity: 0.2; }
            66% { transform: translate(-30px, -50px) rotate(180deg); opacity: 0.1; }
            100% { transform: translate(0, 0) rotate(270deg); opacity: 0.15; }
        }


        /* --- Safe Section Entrance --- */
        .animate-safe-entrance {
          animation: safeEntrance 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
          transform: translateY(50px) scale(0.9);
        }
        @keyframes safeEntrance {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          80% { opacity: 1; transform: translateY(-5px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* --- Numpad Button Press Feedback --- */
        button.active\\:scale-95:active {
            transform: scale(0.95);
        }

        /* --- Code Digit Pop --- */
        .animate-digit-pop {
            animation: digitPop 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }
        @keyframes digitPop {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }

        /* --- Message Shake (for errors) --- */
        .code-input-display.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        /* --- Hidden Digit Burst --- */
        .animate-digit-burst {
            animation: digitBurst 0.5s ease-out forwards;
        }
        @keyframes digitBurst {
            0% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
            50% { transform: scale(1.5) translate(-50%, -50%); opacity: 0.8; filter: brightness(1.5); }
            100% { transform: scale(0.5) translate(-50%, -50%); opacity: 0; filter: brightness(1); }
        }
        .animate-pulse-digit {
            animation: pulseDigit 2s infinite ease-in-out;
        }
        @keyframes pulseDigit {
            0%, 100% { transform: scale(1) translate(-50%, -50%); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            50% { transform: scale(1.05) translate(-50%, -50%); box-shadow: 0 6px 15px rgba(0,0,0,0.2); }
        }

        /* --- Image pulse (subtle) --- */
        .animate-pulse-slow-image {
            animation: pulseSlow 4s infinite ease-in-out;
        }
        @keyframes pulseSlow {
            0%, 100% { transform: scale(1); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            50% { transform: scale(1.02); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
        }
        .animate-fade-in-delay {
            animation: fadeIn 1s ease forwards;
            animation-delay: 1s; /* Delay after safe entrance */
            opacity: 0;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }


        /* --- Welcome Screen Animations --- */
        .animate-welcome-bg-transition {
            animation: welcomeBgFadeIn 1s ease forwards;
            opacity: 0;
        }
        @keyframes welcomeBgFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .welcome-text-container {
            display: inline-block; /* Essential for letter-by-letter animation */
            animation: welcomeTextGlow 3s infinite alternate; /* Pulsing glow for the whole text */
            text-shadow: 0 0 10px rgba(255,100,200,0.6), 0 0 20px rgba(255,100,200,0.4);
        }

        .letter-animate {
            display: inline-block;
            opacity: 0;
            transform: scale(0.5) translateY(20px);
            animation: letterPop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
            font-weight: 700; /* Ensure bold */
            text-shadow: 0 0 5px rgba(255,255,255,0.7); /* Subtle individual letter glow */
        }
        @keyframes letterPop {
            0% { opacity: 0; transform: scale(0.5) translateY(20px); }
            70% { opacity: 1; transform: scale(1.1) translateY(-5px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes welcomeTextGlow {
            0%, 100% { text-shadow: 0 0 10px rgba(255,100,200,0.6), 0 0 20px rgba(255,100,200,0.4); }
            50% { text-shadow: 0 0 15px rgba(255,120,220,0.8), 0 0 30px rgba(255,120,220,0.6); }
        }

        /* --- Tabs Section Entrance --- */
        .animate-tabs-entrance {
            animation: tabsEntrance 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
            animation-delay: 0.5s; /* Delay after welcome text */
        }
        @keyframes tabsEntrance {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* --- Tab Squares with Images --- */
        .tab-square {
            width: 120px; /* Slightly smaller for better fit */
            height: 120px;
            background-color: #e0e7ff; /* light indigo */
            border-radius: 12px;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease-out;
            transform: translateY(0) scale(1); /* Initial state for animation */
            opacity: 0; /* Hidden initially for staggered entrance */
        }
        .tab-square:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
        }
        /* The Image component itself won't have a direct width/height style applied from here.
           It's best to control its size via the width/height props directly on <Image>
           or by wrapping it in a div with defined dimensions.
           The .tab-square img rule will apply to the actual rendered <img> element inside <Image>.
           So max-width/height here are still useful.
        */
        .tab-square img {
            max-width: 60%; /* Adjust image size */
            max-height: 60%;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            transition: transform 0.3s ease-out;
        }
        .tab-square:hover img {
            transform: scale(1.1);
        }
        .tab-square .tab-label {
            position: absolute;
            bottom: 10px;
            font-weight: 600;
            color: #6d28d9; /* purple-700 */
            font-size: 0.9rem;
            opacity: 1;
            transition: opacity 0.3s ease-out;
        }
        /* Staggered tab entrance */
        .tab-square:nth-child(1) { animation: tabSquareEntry 0.5s ease-out forwards 0.2s; }
        .tab-square:nth-child(2) { animation: tabSquareEntry 0.5s ease-out forwards 0.3s; }
        .tab-square:nth-child(3) { animation: tabSquareEntry 0.5s ease-out forwards 0.4s; }

        @keyframes tabSquareEntry {
            from { opacity: 0; transform: translateY(20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }


        /* --- Tab Content Fade In --- */
        .animate-tab-content-fade-in {
            animation: tabContentFadeIn 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(10px);
        }
        @keyframes tabContentFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* --- Realistic Envelopes --- */
        .envelope-container {
            width: 280px; /* Adjust size as needed */
            height: 180px;
            perspective: 1000px; /* For 3D effect */
            cursor: pointer;
            margin: 1rem;
            transition: transform 0.3s ease-out;
        }
        .envelope-container:hover {
            transform: translateY(-8px) scale(1.02);
        }

        .envelope {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transition: transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1); /* Slower, smoother transition */
        }

        .envelope-flap {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 30%; /* Flap covers top part */
            background: linear-gradient(135deg, #a78bfa, #8b5cf6); /* Purple/Indigo gradient */
            border-radius: 8px 8px 0 0;
            z-index: 2;
            transform-origin: top;
            transition: transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .envelope-body {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 80%; /* Body takes most of the height */
            background: linear-gradient(135deg, #d8b4fe, #c4b5fd); /* Lighter purple/indigo */
            border-radius: 0 0 8px 8px;
            z-index: 1;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden; /* Hide letter initially */
            backface-visibility: hidden; /* Hide backface of body */
        }

        .envelope-title {
            color: #6d28d9;
            font-weight: 600;
            font-size: 1.1rem;
            position: absolute;
            z-index: 3; /* Above the letter, below flap */
            transition: opacity 0.3s ease-out;
        }

        .envelope.opened .envelope-flap {
            transform: rotateX(180deg);
            z-index: 0; /* Move flap behind when open */
        }

        .envelope-letter {
            position: absolute;
            width: 80%;
            height: 80%;
            background-color: #fffde0; /* Creamy paper color */
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 1rem;
            color: #3f003f; /* Dark purple text */
            font-family: 'Poppins', sans-serif; /* Poppins for readability */
            font-size: 1rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateY(100%); /* Start off-screen at bottom */
            transition: transform 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.3s, opacity 0.3s ease-out 0.3s; /* Delay slide after flap opens */
            opacity: 0;
            z-index: 1; /* Below flap when closed, above when open */
            pointer-events: none; /* Not interactive when hidden */
        }

        .envelope.opened .envelope-letter {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all; /* Make interactive when visible */
        }
        .envelope.opened .envelope-title {
            opacity: 0; /* Hide title when opened */
        }


        /* --- Song Card --- */
        .song-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.25rem;
            background: linear-gradient(145deg, #f3e8ff, #ede9fe);
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease-out;
            text-decoration: none;
            position: relative;
            overflow: hidden;
        }
        .song-card:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            background: linear-gradient(145deg, #e9d8fd, #ddccfb);
        }
        .song-card:hover::after { /* Floating music note */
            content: '🎶';
            position: absolute;
            top: 10%;
            right: 10%;
            font-size: 2rem;
            opacity: 0;
            animation: floatAndFade 1s forwards ease-out;
        }
        @keyframes floatAndFade {
            0% { transform: translateY(0); opacity: 0; }
            50% { transform: translateY(-20px); opacity: 1; }
            100% { transform: translateY(-40px); opacity: 0; }
        }
        .song-thumbnail {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
            margin-bottom: 0.75rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }


        /* --- Modal Animations --- */
        .animate-modal-fade-in {
            animation: modalFadeIn 0.3s ease-out forwards;
            opacity: 0;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-modal-zoom-in {
            animation: modalZoomIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
            transform: scale(0.8);
            opacity: 0;
        }
        @keyframes modalZoomIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-emoji {
            animation: pulseEmoji 1s infinite alternate;
        }
        @keyframes pulseEmoji {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
        }
        .animate-fade-in-delay-sm {
            animation: fadeIn 0.5s ease forwards;
            animation-delay: 0.1s;
            opacity: 0;
        }
      `}</style>
    </main>
  )
}