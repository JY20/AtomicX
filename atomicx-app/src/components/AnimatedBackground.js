import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let w = canvas.width = window.innerWidth,
        h = canvas.height = window.innerHeight,
        
        opts = {
          len: 30,
          count: 30,
          baseTime: 15,
          addedTime: 15,
          dieChance: .05,
          spawnChance: 0.8,
          sparkChance: .05,
          sparkDist: 15,
          sparkSize: 2,
          
          color: 'hsl(hue,100%,light%)',
          baseLight: 50,
          addedLight: 10, // [50-10,50+10]
          shadowToTimePropMult: 6,
          baseLightInputMultiplier: .01,
          addedLightInputMultiplier: .02,
          
          cx: w / 2,
          cy: h / 2,
          repaintAlpha: .04,
          hueChange: .1
        },
        
        tick = 0,
        lines = [],
        dieX = w / 2 / opts.len,
        dieY = h / 2 / opts.len,
        
        baseRad = Math.PI * 2 / 6;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    function loop() {
      window.requestAnimationFrame(loop);
      
      ++tick;
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,alp)'.replace('alp', opts.repaintAlpha);
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      
      if (lines.length < opts.count && Math.random() < opts.spawnChance)
        lines.push(new Line());
      
      lines.map(function(line) { line.step(); });
    }

    function Line() {
      this.reset();
    }

    Line.prototype.reset = function() {
      this.x = 0;
      this.y = 0;
      this.addedX = 0;
      this.addedY = 0;
      
      this.rad = 0;
      
      this.lightInputMultiplier = opts.baseLightInputMultiplier + opts.addedLightInputMultiplier * Math.random();
      
      this.color = opts.color.replace('hue', tick * opts.hueChange);
      this.cumulativeTime = 0;
      
      this.beginPhase();
    };

    Line.prototype.beginPhase = function() {
      this.x += this.addedX;
      this.y += this.addedY;
      
      this.time = 0;
      this.targetTime = (opts.baseTime + opts.addedTime * Math.random()) | 0;
      
      this.rad += baseRad * (Math.random() < .5 ? 1 : -1);
      this.addedX = Math.cos(this.rad);
      this.addedY = Math.sin(this.rad);
      
      if (Math.random() < opts.dieChance || this.x > dieX || this.x < -dieX || this.y > dieY || this.y < -dieY)
        this.reset();
    };

    Line.prototype.step = function() {
      ++this.time;
      ++this.cumulativeTime;
      
      if (this.time >= this.targetTime)
        this.beginPhase();
      
      var prop = this.time / this.targetTime,
          wave = Math.sin(prop * Math.PI / 2),
          x = this.addedX * wave,
          y = this.addedY * wave;
      
      ctx.shadowBlur = prop * opts.shadowToTimePropMult;
      ctx.fillStyle = ctx.shadowColor = this.color.replace('light', opts.baseLight + opts.addedLight * Math.sin(this.cumulativeTime * this.lightInputMultiplier));
      ctx.fillRect(opts.cx + (this.x + x) * opts.len, opts.cy + (this.y + y) * opts.len, 2, 2);
      
      if (Math.random() < opts.sparkChance)
        ctx.fillRect(opts.cx + (this.x + x) * opts.len + Math.random() * opts.sparkDist * (Math.random() < .5 ? 1 : -1) - opts.sparkSize / 2, opts.cy + (this.y + y) * opts.len + Math.random() * opts.sparkDist * (Math.random() < .5 ? 1 : -1) - opts.sparkSize / 2, opts.sparkSize, opts.sparkSize);
    };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);
      
      opts.cx = w / 2;
      opts.cy = h / 2;
      
      dieX = w / 2 / opts.len;
      dieY = h / 2 / opts.len;
    }

    // Setup
    loop();
    window.addEventListener('resize', resize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} />
      <div className="hero-text">
        <h1>AtomicX : The Decentralized<br />ETH&lt;&gt; STRK Swap Aggregator</h1>
      </div>
    </div>
  );
};

export default AnimatedBackground; 