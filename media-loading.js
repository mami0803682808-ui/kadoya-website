// Video is loaded only near the viewport, then paused off-screen.
(() => {
  const videos=[...document.querySelectorAll('video source[data-src]')].map(source=>source.parentElement);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
  const load=video=>{
    if(!video.dataset.loaded){video.querySelectorAll('source[data-src]').forEach(source=>{source.src=source.dataset.src;});video.load();video.dataset.loaded='true';}
  };
  if(reduced){videos.forEach(video=>{video.controls=true;video.addEventListener('pointerdown',()=>load(video),{once:true});video.addEventListener('keydown',()=>load(video),{once:true});});return;}
  if(!('IntersectionObserver' in window)){videos.forEach(video=>{video.controls=true;load(video);});return;}
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(({target:video,isIntersecting})=>{
      if(isIntersecting && !document.hidden){load(video);video.play().catch(()=>{video.controls=true;});}
      else video.pause();
    });
  },{rootMargin:'100px 0px',threshold:0});
  videos.forEach(video=>observer.observe(video));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause());});
})();
