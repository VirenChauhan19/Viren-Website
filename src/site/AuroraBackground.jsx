import { useEffect, useRef } from 'react'

// Live WebGL aurora: a slow, flowing gradient (cyan / violet / amber) that
// warps toward the cursor. Renders at reduced resolution because it is a soft,
// blurry field, so the cost stays low. Falls back to a CSS gradient if WebGL
// is unavailable, and freezes its motion when the user prefers reduced motion.

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.0 + vec2(13.1, 7.3); a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv; p.x *= aspect;
  float t = u_time * 0.05;

  vec2 m = u_mouse; m.x *= aspect;
  float md = distance(p, m);
  float glow = exp(-md * 2.3);

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
  vec2 r = vec2(fbm(p * 1.4 + q * 1.8 + t * 1.2 + m * 0.5), fbm(p * 1.4 + q * 1.5 - t * 1.0));
  float f = fbm(p * 1.3 + r * 1.4 + glow * 0.8);

  vec3 cyan   = vec3(0.22, 0.74, 0.97);
  vec3 violet = vec3(0.45, 0.55, 0.98);
  vec3 amber  = vec3(0.30, 0.88, 0.95);

  vec3 col = vec3(0.022, 0.030, 0.050);
  col = mix(col, cyan * 0.55, smoothstep(0.25, 0.95, f));
  col = mix(col, violet * 0.55, smoothstep(0.30, 1.05, r.x));
  col += amber * 0.16 * smoothstep(0.55, 1.05, f * r.y);
  col += cyan * glow * 0.55;

  col *= 0.55 + 0.65 * (1.0 - uv.y);
  float vig = smoothstep(1.35, 0.25, distance(uv, vec2(0.5)));
  col *= 0.55 + 0.45 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function AuroraBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl =
      canvas.getContext('webgl', { antialias: false, depth: false, alpha: false, powerPreference: 'low-power' }) ||
      canvas.getContext('experimental-webgl')
    if (!gl) {
      canvas.classList.add('no-webgl')
      return undefined
    }

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const vert = compile(gl, gl.VERTEX_SHADER, VERT)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) { canvas.classList.add('no-webgl'); return undefined }

    const prog = gl.createProgram()
    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.classList.add('no-webgl'); return undefined }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    let w = 0
    let h = 0
    const resize = () => {
      const q = window.innerWidth > 1600 ? 0.45 : 0.6
      let cw = window.innerWidth * q
      let ch = window.innerHeight * q
      const cap = 1100
      const longest = Math.max(cw, ch)
      if (longest > cap) { const s = cap / longest; cw *= s; ch *= s }
      w = Math.max(2, Math.round(cw))
      h = Math.max(2, Math.round(ch))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55 }
    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let hidden = false
    const onVis = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const start = performance.now()
    const render = (now) => {
      raf = requestAnimationFrame(render)
      if (hidden) return
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      const t = reduce ? 12.0 : (now - start) / 1000
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(render)

    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf) }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', onLost)
    }
  }, [])

  return <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />
}
