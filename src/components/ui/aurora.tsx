'use client';

import { useEffect, useRef } from 'react';

export interface AuroraProps {
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
  opacity?: number;
  className?: string;
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uOpacity;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 colorRamp(vec3 c0, vec3 c1, vec3 c2, float factor) {
  if (factor < 0.5) {
    return mix(c0, c1, factor * 2.0);
  }
  return mix(c1, c2, (factor - 0.5) * 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 rampColor = colorRamp(uColorStops[0], uColorStops[1], uColorStops[2], uv.x);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  float alpha = clamp(auroraAlpha * uOpacity, 0.0, 1.0);

  fragColor = vec4(rampColor * alpha, alpha);
}
`;

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

export default function Aurora({
  colorStops = ['#E6CFA0', '#9AA484', '#D4B66A'],
  amplitude = 1.05,
  blend = 0.55,
  speed = 0.8,
  opacity = 0.58,
  className = '',
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Solo inicializar WebGL en mobile/tablet (< 1024px) para no gastar recursos en desktop
    const mobileQuery = window.matchMedia('(max-width: 1023px)');
    if (!mobileQuery.matches) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });

    if (!gl) {
      canvas.remove();
      return;
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.remove();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      canvas.remove();
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      canvas.remove();
      return;
    }

    gl.useProgram(program);

    // Triángulo fullscreen
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uAmpLoc = gl.getUniformLocation(program, 'uAmplitude');
    const uColorsLoc = gl.getUniformLocation(program, 'uColorStops');
    const uResLoc = gl.getUniformLocation(program, 'uResolution');
    const uBlendLoc = gl.getUniformLocation(program, 'uBlend');
    const uOpacityLoc = gl.getUniformLocation(program, 'uOpacity');

    const flatColors = new Float32Array([
      ...hexToRgbTuple(colorStops[0]),
      ...hexToRgbTuple(colorStops[1]),
      ...hexToRgbTuple(colorStops[2]),
    ]);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const elapsed = reduceMotion ? 0 : ((now - start) * 0.001) * speed;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1f(uAmpLoc, amplitude);
      gl.uniform3fv(uColorsLoc, flatColors);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uBlendLoc, blend);
      gl.uniform1f(uOpacityLoc, opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduceMotion) {
        raf = requestAnimationFrame(render);
      }
    };

    raf = requestAnimationFrame(render);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      canvas.remove();
    };
  }, [colorStops, amplitude, blend, speed, opacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    />
  );
}
