import{a as F,C as N,m as P,D as G,j as q}from"./index-CxVjfpkL.js";const W=`
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`,X=`
  attribute vec2 aPos;
  void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`,$=`
  #extension GL_OES_standard_derivatives : enable
  precision highp float;

  uniform vec2  uRes;      // drawing buffer size in device px
  uniform float uScale;    // device px per CSS px
  uniform float uTime;
  uniform float uDarkMix;  // 0 = light/mint, 1 = dark/slate, eased on a switch
  uniform vec2  uMouse;    // CSS px, origin bottom-left
  uniform float uHill;     // 0..1, eased in while the mouse is on the page
  ${W}

  // Theme colours (the site tokens --cream and --accent-ink per theme).
  const vec3 BG_LIGHT   = vec3(0.918, 0.949, 0.933); // #EAF2EE mint mist
  const vec3 LINE_LIGHT = vec3(0.122, 0.435, 0.361); // #1F6F5C teal
  const vec3 BG_DARK    = vec3(0.094, 0.157, 0.200); // #182833 slate
  const vec3 LINE_DARK  = vec3(0.435, 0.843, 0.718); // #6FD7B7 mint

  const float SCALE             = 0.72;  // LOWER = bigger, fewer shapes
  const float DISTORT_SCALE     = 0.55;  // size of the slow warping layer
  const float DISTORT_INTENSITY = 0.50;  // how hard it bends the contours
  const vec2  STRETCH           = vec2(0.62, 1.45); // lines run left to right
  const float LINES             = 8.0;   // lines per noise cycle; every 4th is an index line
  const float HILL_RADIUS       = 150.0; // CSS px
  const float HILL_HEIGHT       = 0.6;   // in noise units (about one ring)

  void main(){
    vec2 p  = gl_FragCoord.xy / uScale;   // CSS px
    vec2 uv = p / (uRes.y / uScale);      // viewport heights: shapes keep their size at any aspect

    float warp = 0.5 + snoise(vec3(uv * DISTORT_SCALE, uTime * 0.1)) * 0.5;
    vec2 d = p - uMouse;
    float hill = uHill * HILL_HEIGHT * exp(-dot(d, d) / (HILL_RADIUS * HILL_RADIUS));
    float h = snoise(vec3((uv + warp * DISTORT_INTENSITY) * SCALE * STRETCH, uTime)) + hill;

    // Distance to the nearest line in line units; fwidth keeps every line
    // the same pixel width wherever the slope changes.
    float b = (h * 0.5 + 0.5) * LINES;
    float m = floor(b + 0.5);
    float index = 1.0 - step(0.5, mod(m, 4.0));
    float line = 1.0 - smoothstep(0.0, fwidth(b) * mix(1.0, 1.9, index), abs(b - m));
    float shade = mod(floor(b / 4.0), 2.0);

    vec3 bg  = mix(BG_LIGHT, BG_DARK, uDarkMix);
    vec3 ink = mix(LINE_LIGHT, LINE_DARK, uDarkMix);
    vec3 col = mix(bg, ink, shade * mix(0.035, 0.05, uDarkMix));
    col = mix(col, ink, line * mix(mix(0.13, 0.15, uDarkMix), mix(0.40, 0.44, uDarkMix), index));
    gl_FragColor = vec4(col, 1.0);
  }
`;function Q(){const L=F.useRef(null);return F.useEffect(()=>{const S=L.current;if(!S)return;const U=window.matchMedia("(prefers-reduced-motion: reduce)").matches,O="ontouchstart"in window||window.matchMedia&&window.matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0;if(U||O)return;const o=document.createElement("canvas");o.style.cssText="display:block;width:100%;height:100%";const e=o.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e||!e.getExtension("OES_standard_derivatives"))return;let r={};const T=()=>{e.getExtension("OES_standard_derivatives");const i=(Y,K)=>{const x=e.createShader(Y);return x?(e.shaderSource(x,K),e.compileShader(x),e.getShaderParameter(x,e.COMPILE_STATUS)?x:null):null},s=i(e.VERTEX_SHADER,X),d=i(e.FRAGMENT_SHADER,$),n=e.createProgram();if(!s||!d||!n||(e.attachShader(n,s),e.attachShader(n,d),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)))return!1;e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const k=e.getAttribLocation(n,"aPos");return e.enableVertexAttribArray(k),e.vertexAttribPointer(k,2,e.FLOAT,!1,0,0),r={uRes:e.getUniformLocation(n,"uRes"),uScale:e.getUniformLocation(n,"uScale"),uTime:e.getUniformLocation(n,"uTime"),uDarkMix:e.getUniformLocation(n,"uDarkMix"),uMouse:e.getUniformLocation(n,"uMouse"),uHill:e.getUniformLocation(n,"uHill")},!0};if(!T())return;S.appendChild(o);const B=1;let u=1;const w=()=>{u=Math.min(window.devicePixelRatio||1,B),o.width=Math.round(window.innerWidth*u),o.height=Math.round(window.innerHeight*u),e.viewport(0,0,o.width,o.height)};let a=N()==="dark"?1:0,m=a,_=0;const t={x:0,y:0,tx:0,ty:0,seen:!1};let f=0,h=0;const c=()=>{e.isContextLost()||(e.uniform2f(r.uRes,o.width,o.height),e.uniform1f(r.uScale,u),e.uniform1f(r.uTime,_),e.uniform1f(r.uDarkMix,a),e.uniform2f(r.uMouse,t.x,window.innerHeight-t.y),e.uniform1f(r.uHill,f),e.drawArrays(e.TRIANGLES,0,6))},j=1e3/30,V=.09;let E=0,v=!1,l=0,g=P();const R=i=>{if(!v||(E=requestAnimationFrame(R),l&&i-l<j-1))return;const s=l?Math.min(.05,(i-l)/1e3):0;l=i,_+=V*s;const d=1-Math.exp(-4*s);t.x+=(t.tx-t.x)*d,t.y+=(t.ty-t.y)*d,f+=(h-f)*(1-Math.exp(-2.5*s)),a+=(m-a)*(1-Math.exp(-7*s)),c()},p=()=>{v||g||document.visibilityState==="hidden"||e.isContextLost()||(v=!0,l=0,E=requestAnimationFrame(R))},y=()=>{v=!1,cancelAnimationFrame(E)};w(),c(),p();const b=()=>{w(),c()},A=()=>{m=N()==="dark"?1:0,v||(a=m,c())},D=()=>{g=P(),g?(y(),f=h=0,a=m,c()):p()},I=()=>document.visibilityState==="hidden"?y():p(),z=i=>{i.pointerType==="mouse"&&(t.tx=i.clientX,t.ty=i.clientY,t.seen||(t.x=t.tx,t.y=t.ty,t.seen=!0),h=1)},C=()=>{h=0},M=i=>{i.preventDefault(),y()},H=()=>{T()&&(w(),c(),p())};return window.addEventListener("resize",b),window.addEventListener("themechange",A),window.addEventListener(G,D),document.addEventListener("visibilitychange",I),window.addEventListener("pointermove",z),document.documentElement.addEventListener("mouseleave",C),o.addEventListener("webglcontextlost",M),o.addEventListener("webglcontextrestored",H),()=>{y(),window.removeEventListener("resize",b),window.removeEventListener("themechange",A),window.removeEventListener(G,D),document.removeEventListener("visibilitychange",I),window.removeEventListener("pointermove",z),document.documentElement.removeEventListener("mouseleave",C),o.removeEventListener("webglcontextlost",M),o.removeEventListener("webglcontextrestored",H),e.getExtension("WEBGL_lose_context")?.loseContext(),o.remove()}},[]),q.jsx("div",{ref:L,className:"hero-canvas","aria-hidden":"true"})}export{Q as default};
