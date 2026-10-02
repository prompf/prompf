import{A as e,C as t,D as n,E as r,T as i,_ as a,b as o,f as s,g as c,h as l,k as u,l as d,r as f,v as p,w as m,y as h}from"./index-D7i5NhJg.js";var g=a(`<style id="style-scroll">.button-scroll {
        position: fixed;
        bottom: 1rem;
        z-index: 100;
        font-size: smaller;

        button {
          background-color: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          transition: opacity 150ms;
          opacity: 0.3;
          font-family: monospace;
          font-size: inherit;

          &:hover {
            opacity: 0.6;
          }

          .symbol {
            font-size: inherit;
            line-height: 1rem;
            display: block;
          }
        }
      }</style>`);function _(e){d(`1oalzf9`,e=>{var n=c(),r=t(n),i=e=>{var t=g();l(e,t)};s(r,e=>{document.getElementById(`style-scroll`)||e(i)}),l(e,n)})}var v=a(`<div class="button-scroll toc svelte-bwfonw"><button title="Jump to the prompfs menu" type="button"><span class="symbol">▛</span></button></div>`),y=a(`<!> <!>`,1);function b(a,c){e(c,!0);function d(e){if(!e)return!1;let t=e.getBoundingClientRect(),n=e.querySelector(`.title`)?.getBoundingClientRect();if(!n)return!1;let r=window.innerHeight||document.documentElement.clientHeight,i=window.innerWidth||document.documentElement.clientWidth,a=i<=1200?0:t.top;return e.style.setProperty(`--scroll-toc-top`,`${a}px`),!(n.top-a>=-30&&n.left>=0&&n.bottom<=r+30&&n.right<=i)}let p=()=>{r(b,d(document.querySelector(`.container-toc`)),!0)},g=()=>{window.dispatchEvent(new Event(`scroll`))},b=n(!1);f(()=>(window.addEventListener(`scroll`,p),window.addEventListener(`resize`,p),document.querySelector(`.container-toc`)?.addEventListener(`scroll`,g),()=>{window.removeEventListener(`scroll`,p),window.removeEventListener(`resize`,p),document.querySelector(`.container-toc`)?.removeEventListener(`scroll`,g)}));var x=y(),S=t(x);_(S,{});var C=i(S,2),w=e=>{var t=v(),n=m(t);h(`pointerdown`,n,()=>{window.history.replaceState(null,``,window.location.pathname+window.location.search),document.querySelector(`.container-toc .title`)?.scrollIntoView()}),l(e,t)};s(C,e=>{o(b)&&e(w)}),l(a,x),u()}p([`pointerdown`]);var x=a(`<div class="button-scroll top svelte-18cms81"><button title="Jump to the top of the page" type="button"><span class="symbol">█</span></button></div>`),S=a(`<!> <!>`,1);function C(a,c){e(c,!0);function d(){return document.body.scrollTop>30||document.documentElement.scrollTop>30}let p=()=>{r(g,d(),!0)},g=n(!1);f(()=>(window.addEventListener(`scroll`,p),()=>{window.removeEventListener(`scroll`,p)}));var v=S(),y=t(v);_(y,{});var b=i(y,2),C=e=>{var t=x(),n=m(t);h(`pointerdown`,n,()=>{window.history.replaceState(null,``,window.location.pathname+window.location.search),document.body.scrollTop=0,document.documentElement.scrollTop=0}),l(e,t)};s(b,e=>{o(g)&&e(C)}),l(a,v),u()}p([`pointerdown`]);var w=a(`<!> <!>`,1);function T(e){var n=w(),r=t(n);b(r,{}),C(i(r,2),{}),l(e,n)}export{T as default};