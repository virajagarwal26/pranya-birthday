(() => {
  'use strict';
  const C = window.PRANYA_CONTENT;
  const app = document.querySelector('#app');
  const nav = document.querySelector('#bottom-nav');
  const photoDialog = document.querySelector('#photo-dialog');
  const state = {
    visited: new Set(JSON.parse(localStorage.getItem('pranya-visited') || '[]')),
    hearts: new Set(JSON.parse(localStorage.getItem('pranya-hearts') || '[]')),
    reasonsFound: new Set(JSON.parse(localStorage.getItem('pranya-reasons') || '[]')),
    openedLetter: localStorage.getItem('pranya-letter') === 'yes',
    quizDone: localStorage.getItem('pranya-quiz') === 'yes',
    quizIndex: 0, score: 0, moonTaps: 0
  };
  let toastTimer;

  const esc = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const save = () => { localStorage.setItem('pranya-visited', JSON.stringify([...state.visited])); localStorage.setItem('pranya-hearts', JSON.stringify([...state.hearts])); localStorage.setItem('pranya-reasons', JSON.stringify([...state.reasonsFound])); };
  const showToast = (message, love=false) => { const el = document.querySelector('#toast'); el.textContent = message; el.classList.toggle('love-pop',love); el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show','love-pop'), 2600); };
  const progress = () => [state.visited.has('memories'), state.openedLetter, state.quizDone, state.visited.has('reasons'), state.visited.has('essay')].filter(Boolean).length;
  const isUnlocked = () => progress() === 5;
  const celebrate = (amount=32) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { showToast('Happy Birthday, Pranya 💜', true); return; }
    document.querySelector('.celebration-layer')?.remove();
    const layer=document.createElement('div'); layer.className='celebration-layer'; layer.setAttribute('aria-hidden','true');
    const pieces=['♥','✦','♡','•','💜'];
    for(let i=0;i<amount;i++){const piece=document.createElement('span');piece.textContent=pieces[i%pieces.length];piece.style.setProperty('--x',`${Math.random()*100}vw`);piece.style.setProperty('--drift',`${(Math.random()-.5)*180}px`);piece.style.setProperty('--delay',`${Math.random()*.55}s`);piece.style.setProperty('--duration',`${2.2+Math.random()*1.4}s`);piece.style.setProperty('--size',`${.7+Math.random()*1.15}rem`);layer.append(piece);}
    document.body.append(layer); setTimeout(()=>layer.remove(),4200);
  };
  const hiddenHeart = id => `<button class="hidden-heart ${id === 'corner-heart' ? 'corner' : 'lower'}" data-hidden-heart="${id}" aria-label="Hidden heart">♡</button>`;
  const header = (eyebrow, title, lede='') => `<header class="page-header"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 class="page-title">${esc(title)}</h1>${lede ? `<p class="page-lede">${esc(lede)}</p>` : ''}</div><button class="moon-button" type="button" data-moon aria-label="Show another love message">☾</button></header>`;
  const footer = () => `<p class="footer-note">${esc(C.site.footerNote)}</p>`;
  const starLayout = [[12,20],[28,10],[45,24],[67,12],[84,28],[75,48],[91,65],[64,73],[48,55],[35,76],[16,64],[9,43]];

  const contiguousReasons = new Set();
  for (let i = 0; i < C.reasons.items.length; i += 1) {
    if (!state.reasonsFound.has(String(i))) break;
    contiguousReasons.add(String(i));
  }
  state.reasonsFound = contiguousReasons;

  const reasonStar = (i) => {
    const found = state.reasonsFound.has(String(i));
    const available = i === state.reasonsFound.size;
    const locked = !found && !available;
    return `<button type="button" class="reason-star ${found ? 'found' : available ? 'available' : 'locked'}" style="left:${starLayout[i%starLayout.length][0]}%;top:${starLayout[i%starLayout.length][1]}%" data-reason="${i}" ${locked ? 'disabled' : ''} aria-label="${found ? 'Review' : available ? 'Reveal' : 'Locked'} reason ${i+1}">${i+1}</button>`;
  };

  const refreshReasonStars = () => {
    const next = state.reasonsFound.size;
    document.querySelectorAll('[data-reason]').forEach((button) => {
      const i = Number(button.dataset.reason);
      const found = state.reasonsFound.has(String(i));
      const available = i === next;
      button.disabled = !found && !available;
      button.classList.toggle('found', found);
      button.classList.toggle('available', available);
      button.classList.toggle('locked', !found && !available);
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', `${found ? 'Review' : available ? 'Reveal' : 'Locked'} reason ${i+1}`);
    });
  };

  const pages = {
    home: () => `<section class="page home-page"><div class="hero"><div class="love-stickers" aria-hidden="true"><span>🥰</span><span>💜</span><span>🌷</span><span>✨</span><span>❤️</span></div><p class="eyebrow">${esc(C.site.openingEyebrow)}</p><h1>${esc(C.site.openingTitle)}</h1><p class="home-message">${esc(C.site.openingMessage)}</p><button class="primary-button" type="button" data-route="menu">${esc(C.site.enterButton)} &nbsp;→</button></div></section>`,
    menu: () => { const p = progress(); const cards = [
      ['memories','💜','Memories','Here lie some of my most cherished memories with you, moments which made me love you more and which marked the best time of my life. 💜💜'],
      ['letters','💌','Letters','Heartfelt letters for you to open and read to make u feel better.'],
      ['quiz','💕','The us quiz','A quiz to make sure you know the answer to these questions.'],
      ['reasons','✨','Reasons I Love You','A constellation of little reasons, waiting to be discovered one star at a time.'],
      ['essay','📝',C.longLetter.title,'Everything I never manage to say all at once.']
    ]; const ready=p===5; return `<section class="page">${header(C.site.birthday, 'Our little universe', C.site.menuIntro)}<div class="progress-card ${ready?'complete':''}" aria-label="Exploration progress"><div class="progress-track"><div class="progress-fill" style="width:${p*20}%"></div></div><strong>${p}/5</strong></div><div class="menu-grid">${cards.map(([route,icon,title,desc]) => `<button class="menu-card" type="button" data-route="${route}"><span class="arrow">↗</span><span class="icon" aria-hidden="true">${icon}</span><h2>${title}</h2><p>${desc}</p><span class="card-state">${state.visited.has(route) ? 'visited ✓' : 'explore'}</span></button>`).join('')}</div><section class="finale-card ${ready?'ready':'waiting'}" aria-label="Birthday finale"><div class="finale-stars" aria-hidden="true"><span>✦</span><span>♡</span><span>✦</span><span>♥</span><span>✦</span></div><div><p class="eyebrow">${ready?'Your final constellation is glowing':'One final surprise'}</p><h2>${ready?'The birthday finale is ready':'Complete your little universe'}</h2><p>${ready?'You found every constellation. There is one last thing waiting just for you.':`${5-p} constellation${5-p===1?'':'s'} left before the final surprise appears.`}</p></div><button class="${ready?'primary-button':'secondary-button'}" type="button" data-route="gift">${ready?'Open the finale ✦':'See what remains'}</button></section>${footer()}</section>`; },
    memories: () => `<section class="page">${header('A pocket photo album','Memories','Tap a photo to hold it a little closer.')}<div class="gallery">${C.memories.map((m,i) => `<button class="photo-card" type="button" data-photo="${i}"><img src="${esc(m.image)}" alt="${esc(m.title)}" loading="lazy"><div><h3>${esc(m.title)}</h3><p>${esc(m.caption)}</p></div></button>`).join('')}</div>${hiddenHeart('corner-heart')}${footer()}</section>`,
    letters: () => `<section class="page letters-page">${header('Words for every weather','Letters','Six little envelopes, each holding the words you might need. Tap one to break its seal.')}<div class="letters-list">${C.letters.map((l,i) => `<article class="letter-card" style="--letter-index:${i}"><button class="envelope" type="button" data-letter="${i}" aria-expanded="false" aria-label="Open letter: ${esc(l.title)}"><div class="envelope-scene"><div class="letter-peek" aria-hidden="true"><span>to my favourite girl</span><i>♡</i></div><div class="envelope-front"><span class="letter-number">0${i+1}</span><span class="stamp">${esc(l.stamp)}</span><span class="envelope-sparkle sparkle-one" aria-hidden="true">✦</span><span class="envelope-sparkle sparkle-two" aria-hidden="true">·</span><h2>${esc(l.title)}</h2>${l.preview ? `<p>${esc(l.preview)}</p>` : ''}<span class="tap-hint">tap to break the seal</span><span class="envelope-flap" aria-hidden="true"></span><span class="wax-seal" aria-hidden="true">V</span></div></div></button><div class="letter-body"><div class="letter-paper-top"><span>✦ a letter just for you</span><button type="button" class="letter-close" data-letter-close="${i}">Fold letter ↑</button></div><p>${esc(l.body)}</p><p class="signoff">${esc(l.signoff)}</p><span class="paper-heart" aria-hidden="true">♡</span></div></article>`).join('')}</div>${hiddenHeart('lower-heart')}${footer()}</section>`,
    quiz: () => `<section class="page">${header('No studying allowed','The us quiz',C.quiz.intro)}<div id="quiz-area"></div>${footer()}</section>`,
    reasons: () => `<section class="page">${header('A sky full of little truths',C.reasons.title,C.reasons.intro)}<div class="reasons-shell"><div class="constellation-map" aria-label="Interactive constellation of reasons"><svg viewBox="0 0 100 86" preserveAspectRatio="none" aria-hidden="true"><polyline points="12,20 28,10 45,24 67,12 84,28 75,48 91,65 64,73 48,55 35,76 16,64 9,43 12,20" /></svg>${C.reasons.items.map((_,i)=>reasonStar(i)).join('')}</div><div class="reason-reveal" id="reason-reveal"><p class="eyebrow">Discovered <span id="reason-count">${state.reasonsFound.size}</span> of ${C.reasons.items.length}</p><h2>${state.reasonsFound.size ? (state.reasonsFound.size === C.reasons.items.length ? 'Constellation complete' : `Continue with star ${state.reasonsFound.size + 1}`) : 'Start with star 1'}</h2><p>${state.reasonsFound.size === C.reasons.items.length ? 'Every reason is now glowing in your constellation.' : 'Reveal each reason in order to unlock the next star.'}</p></div></div>${footer()}</section>`,
    essay: () => `<section class="page">${header('For everything too big for an envelope',C.longLetter.title,C.longLetter.intro)}<div class="essay-wrap"><div class="essay-cover"><span aria-hidden="true">💌</span><p class="eyebrow">A very, very long love letter</p><h2>${esc(C.longLetter.title)}</h2><button class="primary-button" type="button" data-unfold-letter aria-expanded="false">Unfold the letter</button></div><article class="essay-paper" hidden>${C.longLetter.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="essay-signoff">${esc(C.longLetter.signoff)}</p></article></div>${footer()}</section>`,
    secrets: () => `<section class="page">${header('A tiny scavenger hunt','Hidden secrets',C.secrets.intro)}<div class="secret-panel"><p class="eyebrow">Found ${state.hearts.size} of ${C.secrets.messages.length}</p><div class="hearts-field">${C.secrets.messages.map((_,i) => `<button type="button" class="secret-heart ${state.hearts.has(String(i)) ? 'found' : ''}" data-secret="${i}" aria-label="${state.hearts.has(String(i)) ? 'Found heart' : 'Find hidden heart'}">${state.hearts.has(String(i)) ? '♥' : '♡'}</button>`).join('')}</div><div class="secret-message" id="secret-message">${state.hearts.size ? 'Tap a heart to read its secret again.' : 'They’re shy, but not very good at hiding.'}</div></div>${footer()}</section>`,
    gift: () => { const unlocked = isUnlocked(); const reqs = [['Memories',state.visited.has('memories')],['Letters',state.openedLetter],['Quiz',state.quizDone],['Reasons',state.visited.has('reasons')],['Thoughts',state.visited.has('essay')]]; return `<section class="page finale-page">${header('The final constellation','Birthday finale',unlocked ? 'You found your way all around this little universe.' : 'A little more exploring, then this is yours.')}<div class="gift-box ${unlocked?'unlocked':'locked'}"><div class="gift-stars" aria-hidden="true"><span>✦</span><span>♡</span><span>✦</span><span>♡</span></div><div class="finale-orbit" aria-hidden="true"><span>💜</span><span>✨</span><span>🌷</span><div class="gift-icon">${unlocked?'🎂':'🔒'}</div></div><div class="gift-copy"><p class="eyebrow">${unlocked?'Made for the birthday girl':'Almost there'}</p><h2>${esc(unlocked?C.gift.unlockedTitle:C.gift.lockedTitle)}</h2><p>${esc(unlocked?C.gift.message:C.gift.lockedMessage)}</p>${unlocked?`<button class="primary-button" type="button" data-celebrate>${esc(C.gift.buttonLabel)} ✦</button>`:`<button class="secondary-button" type="button" data-route="menu">Return to the universe</button>`}</div><div class="requirements">${reqs.map(([label,done])=>`<span class="requirement ${done?'done':''}">${done?'✓':'○'} ${label}</span>`).join('')}</div></div>${footer()}</section>`; }
  };

  function routeTo(route, push=true) {
    if (!pages[route]) route='home';
    if (route !== 'home' && route !== 'menu') { state.visited.add(route); save(); }
    if (push && location.hash !== `#${route}`) history.pushState({route},'',`#${route}`);
    app.innerHTML = pages[route](); nav.hidden = route === 'home'; const pageName=route==='essay'?C.longLetter.title:route==='gift'?'Birthday Finale':route[0].toUpperCase()+route.slice(1); document.title = route === 'home' ? C.site.title : `${pageName} · ${C.site.title}`;
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    if (route === 'quiz') renderQuiz();
    if (route === 'gift' && isUnlocked()) setTimeout(()=>celebrate(42),180);
    app.focus({preventScroll:true});
  }

  function renderQuiz() {
    const area = document.querySelector('#quiz-area');
    if (!area) return;
    if (state.quizIndex >= C.quiz.questions.length) { const result=[...C.quiz.results].reverse().find(r=>state.score>=r.min) || C.quiz.results[0]; state.quizDone=true; localStorage.setItem('pranya-quiz','yes'); area.innerHTML=`<div class="quiz-shell quiz-result"><p class="eyebrow">Final result</p><div class="result-score">${state.score}/${C.quiz.questions.length}</div><h2>${esc(result.title)}</h2><p>${esc(result.message)}</p><button class="primary-button" type="button" data-quiz-restart>Play again</button></div>`; if(!state.quizCelebrated){state.quizCelebrated=true;setTimeout(()=>celebrate(26),120);} return; }
    const q=C.quiz.questions[state.quizIndex]; area.innerHTML=`<div class="quiz-shell"><div class="quiz-top"><span>Question ${state.quizIndex+1} of ${C.quiz.questions.length}</span><span>${state.score} correct</span></div><h2>${esc(q.question)}</h2><div class="answers">${q.options.map((o,i)=>`<button type="button" class="answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p><button class="primary-button" type="button" data-quiz-next hidden>${state.quizIndex === C.quiz.questions.length-1 ? 'See my result' : 'Next question'} →</button></div>`;
  }

  document.addEventListener('click', e => {
    const route=e.target.closest('[data-route]'); if(route){routeTo(route.dataset.route);return;}
    if(e.target.closest('[data-nav="back"]')){ history.length>1?history.back():routeTo('menu');return; }
    const photo=e.target.closest('[data-photo]'); if(photo){const m=C.memories[+photo.dataset.photo];document.querySelector('#dialog-image').src=m.image;document.querySelector('#dialog-image').alt=m.title;document.querySelector('#photo-dialog-title').textContent=m.title;document.querySelector('#dialog-caption').textContent=m.caption;photoDialog.showModal();return;}
    if(e.target.closest('.dialog-close')){photoDialog.close();return;}
    const letterClose=e.target.closest('[data-letter-close]'); if(letterClose){const card=letterClose.closest('.letter-card'),envelope=card.querySelector('[data-letter]');card.classList.remove('open');envelope.setAttribute('aria-expanded','false');envelope.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});return;}
    const letter=e.target.closest('[data-letter]'); if(letter){const card=letter.closest('.letter-card'),willOpen=!card.classList.contains('open');document.querySelectorAll('.letter-card.open').forEach(openCard=>{openCard.classList.remove('open');openCard.querySelector('[data-letter]').setAttribute('aria-expanded','false');});card.classList.toggle('open',willOpen);letter.setAttribute('aria-expanded',String(willOpen));if(willOpen){state.openedLetter=true;localStorage.setItem('pranya-letter','yes');showToast('The seal is broken — this letter is yours ✦');setTimeout(()=>card.querySelector('.letter-body').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'}),180);}return;}
    const answer=e.target.closest('[data-answer]'); if(answer && !answer.parentElement.dataset.done){const q=C.quiz.questions[state.quizIndex],picked=+answer.dataset.answer,correctAnswers=Array.isArray(q.correct)?q.correct:[q.correct],isCorrect=correctAnswers.includes(picked);answer.parentElement.dataset.done='yes';answer.parentElement.querySelectorAll('.answer').forEach((b,i)=>{b.disabled=true;if(correctAnswers.includes(i))b.classList.add('correct');});if(isCorrect)state.score++;else answer.classList.add('wrong');document.querySelector('.quiz-feedback').textContent=q.alwaysFeedback||(isCorrect?q.correctFeedback:q.wrongFeedback);document.querySelector('[data-quiz-next]').hidden=false;return;}
    if(e.target.closest('[data-quiz-next]')){state.quizIndex++;renderQuiz();return;}
    if(e.target.closest('[data-quiz-restart]')){state.quizIndex=0;state.score=0;renderQuiz();return;}
    const reason=e.target.closest('[data-reason]'); if(reason){const id=reason.dataset.reason,index=Number(id),alreadyFound=state.reasonsFound.has(id);if(!alreadyFound&&index!==state.reasonsFound.size)return;if(!alreadyFound)state.reasonsFound.add(id);save();refreshReasonStars();const reveal=document.querySelector('#reason-reveal');reveal.querySelector('#reason-count').textContent=state.reasonsFound.size;reveal.querySelector('h2').textContent=`Reason ${index+1}`;reveal.querySelector(':scope > p:last-child').textContent=C.reasons.items[index];if(!alreadyFound&&state.reasonsFound.size===C.reasons.items.length){celebrate(34);showToast('All 12 reasons are glowing ✦',true);}return;}
    const unfold=e.target.closest('[data-unfold-letter]'); if(unfold){const paper=document.querySelector('.essay-paper'),open=paper.hidden;paper.hidden=!open;unfold.setAttribute('aria-expanded',String(open));unfold.textContent=open?'Fold the letter':'Unfold the letter';if(open)paper.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
    if(e.target.closest('[data-celebrate]')){celebrate(52);showToast('Happy Birthday, Pranya 💜',true);return;}
    const secret=e.target.closest('[data-secret]'); if(secret){const id=secret.dataset.secret;state.hearts.add(id);secret.classList.add('found');secret.textContent='♥';save();document.querySelector('#secret-message').textContent=C.secrets.messages[+id];showToast(`Heart found · ${state.hearts.size}/${C.secrets.messages.length}`);return;}
    const hidden=e.target.closest('[data-hidden-heart]'); if(hidden){const id=hidden.dataset.hiddenHeart;const map={'corner-heart':0,'lower-heart':1};state.hearts.add(String(map[id]));save();hidden.textContent='♥';showToast(C.secrets.messages[map[id]]);return;}
    if(e.target.closest('[data-moon]')){const messages=C.site.loveMessages||[];if(messages.length){const message=state.moonTaps===2&&C.secrets?.easterEgg?C.secrets.easterEgg:messages[state.moonTaps%messages.length];showToast(message,true);state.moonTaps++;}return;}
  });
  photoDialog.addEventListener('click', e => { if(e.target===photoDialog) photoDialog.close(); });
  window.addEventListener('popstate',()=>routeTo(location.hash.slice(1)||'home',false));
  routeTo(location.hash.slice(1)||'home',false);
})();
