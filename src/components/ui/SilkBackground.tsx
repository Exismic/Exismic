"use client";

import React, { useEffect, useRef, useState } from "react";

interface SilkBackgroundProps {
  color?: string; // Hex color, e.g. '#5227FF'
  speed?: number;
  scale?: number;
  noiseIntensity?: number;
  rotation?: number;
  lightMode?: boolean;
  className?: string;
  showVignette?: boolean;
}

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [isNaN(r) ? 0.32 : r, isNaN(g) ? 0.15 : g, isNaN(b) ? 1.0 : b];
};

const VERTEX_SHADER_SOURCE = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
uniform float uLightMode;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.025 * sin(7.0 * tex.x - tOffset);

  float pattern = 0.5 +
                  0.5 * sin(4.5 * (tex.x + tex.y +
                                   cos(2.8 * tex.x + 4.2 * tex.y) +
                                   0.02 * tOffset) +
                           sin(16.0 * (tex.x + tex.y - 0.1 * tOffset)));

  // Obsidian Silk Lighting Model:
  // Folds: Deep shadow to rich dark velvet
  float fold = smoothstep(0.18, 0.88, pattern);
  float specular = smoothstep(0.72, 0.98, pattern);

  // Deep obsidian shadows - deep space black with faint cool undertone
  vec3 deepObsidian = vec3(0.008, 0.008, 0.012);

  // Velvet body: dark obsidian tinted with royal purple
  vec3 velvetBody = mix(deepObsidian, uColor * 0.75, fold);

  // Subtle metallic specular rim lighting: refined violet-graphite sheen (NOT blown-out white)
  vec3 rimSheen = mix(uColor * 1.3, vec3(0.42, 0.38, 0.52), 0.45);
  vec3 result = mix(deepObsidian, velvetBody, fold);
  result = mix(result, rimSheen, specular * 0.42);

  // Micro film grain for authentic analog texture
  float fineNoise = noise(gl_FragCoord.xy * 0.7 + vec2(19.0, 43.0));
  float grainSignal = (rnd + fineNoise - 1.0);
  result += grainSignal * (uNoiseIntensity * 0.014);

  // Center Stage Falloff: Fades center into pure deep obsidian black so the login card floats cleanly
  vec2 centerUv = vUv - vec2(0.5);
  float dist = length(centerUv * vec2(1.25, 1.0));
  float centerDarken = smoothstep(0.18, 0.72, dist);
  result *= mix(0.04, 1.0, centerDarken);

  gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}
`;

export function SilkBackground({
  color = "#6d28d9",
  speed = 1.1,
  scale = 1.0,
  noiseIntensity = 1.1,
  rotation = 0.12,
  lightMode = true,
  className = "",
  showVignette = true,
}: SilkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    // Compile shader helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Silk shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) {
      setWebGlSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Silk program link error:", gl.getProgramInfoLog(program));
      setWebGlSupported(false);
      return;
    }

    gl.useProgram(program);

    // Full screen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uColorLoc = gl.getUniformLocation(program, "uColor");
    const uSpeedLoc = gl.getUniformLocation(program, "uSpeed");
    const uScaleLoc = gl.getUniformLocation(program, "uScale");
    const uRotationLoc = gl.getUniformLocation(program, "uRotation");
    const uNoiseIntensityLoc = gl.getUniformLocation(program, "uNoiseIntensity");
    const uLightModeLoc = gl.getUniformLocation(program, "uLightMode");

    const rgb = hexToNormalizedRGB(color);
    if (uColorLoc) gl.uniform3f(uColorLoc, rgb[0], rgb[1], rgb[2]);
    if (uSpeedLoc) gl.uniform1f(uSpeedLoc, speed);
    if (uScaleLoc) gl.uniform1f(uScaleLoc, scale);
    if (uRotationLoc) gl.uniform1f(uRotationLoc, rotation);
    if (uNoiseIntensityLoc) gl.uniform1f(uNoiseIntensityLoc, noiseIntensity);
    if (uLightModeLoc) gl.uniform1f(uLightModeLoc, lightMode ? 1.0 : 0.0);

    let animationFrameId: number;
    let startTime = performance.now();
    let isVisible = true;

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        startTime = performance.now() - (lastElapsed || 0) * 1000;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastElapsed = 0;
    const render = (now: number) => {
      if (isVisible) {
        const elapsed = (now - startTime) / 1000;
        lastElapsed = elapsed;
        if (uTimeLoc) {
          gl.uniform1f(uTimeLoc, elapsed * 0.1);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (gl) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, [color, speed, scale, noiseIntensity, rotation, lightMode]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {webGlSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block opacity-75 transition-opacity duration-700"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        /* Graceful Fallback if WebGL disabled */
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c051a] via-[#05020a] to-[#020204]" />
      )}

      {/* Resend Center Radial Vignette: Guarantees 100% pure pitch-black center stage */}
      {showVignette && (
        <>
          {/* Solid obsidian center mask */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#030305_30%,rgba(3,3,5,0.85)_58%,transparent_92%)] pointer-events-none" />
          {/* Deep edge shadows */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/85 via-transparent to-[#030305]/90 pointer-events-none" />
        </>
      )}

      {/* Subtle organic film grain texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [bg-size:24px_24px] pointer-events-none opacity-50" />
    </div>
  );
}
